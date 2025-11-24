import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({ origin: '*' }));
app.use('*', logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Initialize storage bucket on startup
const EVIDENCE_BUCKET = 'make-4cea2a8f-evidence';
const initStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === EVIDENCE_BUCKET);
    if (!bucketExists) {
      await supabase.storage.createBucket(EVIDENCE_BUCKET, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
      });
      console.log(`Created bucket: ${EVIDENCE_BUCKET}`);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};
initStorage();

// Health check
app.get('/make-server-4cea2a8f/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// EVIDENCE MANAGEMENT ENDPOINTS
// ============================================================================

// Get evidence by category
app.get('/make-server-4cea2a8f/evidence/:category', async (c) => {
  try {
    const category = c.req.param('category');
    const prefix = category === 'all' ? 'evidence:' : `evidence:${category}:`;
    
    const evidenceList = await kv.getByPrefix(prefix);
    
    return c.json({ success: true, evidence: evidenceList });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return c.json({ success: false, error: 'Failed to fetch evidence' }, 500);
  }
});

// Upload evidence metadata (file itself uploaded via Storage)
app.post('/make-server-4cea2a8f/evidence/upload', async (c) => {
  try {
    const body = await c.req.json();
    const { fileName, fileType, fileSize, category, description, entityId, storagePath } = body;
    
    const evidenceId = `evidence:${category}:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const evidenceData = {
      id: evidenceId,
      fileName,
      fileType,
      fileSize,
      category,
      description,
      entityId,
      storagePath,
      uploadDate: new Date().toISOString(),
      uploadedBy: 'Current User', // Would be replaced with actual user from auth
    };
    
    await kv.set(evidenceId, evidenceData);
    
    return c.json({ success: true, evidence: evidenceData });
  } catch (error) {
    console.error('Error uploading evidence metadata:', error);
    return c.json({ success: false, error: 'Failed to upload evidence metadata' }, 500);
  }
});

// Get signed URL for evidence file
app.get('/make-server-4cea2a8f/evidence/:category/:id/url', async (c) => {
  try {
    const { category, id } = c.req.param();
    const evidenceKey = `evidence:${category}:${id}`;
    
    const evidenceData = await kv.get(evidenceKey);
    if (!evidenceData) {
      return c.json({ success: false, error: 'Evidence not found' }, 404);
    }
    
    const { data, error } = await supabase.storage
      .from(EVIDENCE_BUCKET)
      .createSignedUrl(evidenceData.storagePath, 3600); // 1 hour expiry
    
    if (error) {
      console.error('Error creating signed URL:', error);
      return c.json({ success: false, error: 'Failed to generate download URL' }, 500);
    }
    
    return c.json({ success: true, url: data.signedUrl });
  } catch (error) {
    console.error('Error fetching evidence URL:', error);
    return c.json({ success: false, error: 'Failed to fetch evidence URL' }, 500);
  }
});

// Delete evidence
app.delete('/make-server-4cea2a8f/evidence/:category/:id', async (c) => {
  try {
    const { category, id } = c.req.param();
    const evidenceKey = `evidence:${category}:${id}`;
    
    const evidenceData = await kv.get(evidenceKey);
    if (!evidenceData) {
      return c.json({ success: false, error: 'Evidence not found' }, 404);
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(EVIDENCE_BUCKET)
      .remove([evidenceData.storagePath]);
    
    if (storageError) {
      console.error('Error deleting from storage:', storageError);
    }
    
    // Delete metadata
    await kv.del(evidenceKey);
    
    return c.json({ success: true, message: 'Evidence deleted successfully' });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    return c.json({ success: false, error: 'Failed to delete evidence' }, 500);
  }
});

// Get evidence for specific entity (control, finding, vendor, etc.)
app.get('/make-server-4cea2a8f/evidence/entity/:entityId', async (c) => {
  try {
    const entityId = c.req.param('entityId');
    
    const allEvidence = await kv.getByPrefix('evidence:');
    const entityEvidence = allEvidence.filter((e: any) => e.entityId === entityId);
    
    return c.json({ success: true, evidence: entityEvidence });
  } catch (error) {
    console.error('Error fetching entity evidence:', error);
    return c.json({ success: false, error: 'Failed to fetch entity evidence' }, 500);
  }
});

// Get evidence statistics
app.get('/make-server-4cea2a8f/evidence/stats', async (c) => {
  try {
    const allEvidence = await kv.getByPrefix('evidence:');
    
    const totalSize = allEvidence.reduce((acc: number, e: any) => acc + (e.fileSize || 0), 0);
    const categories = new Set(allEvidence.map((e: any) => e.category));
    
    const now = new Date();
    const thisMonth = allEvidence.filter((e: any) => {
      const uploadDate = new Date(e.uploadDate);
      return uploadDate.getMonth() === now.getMonth() && 
             uploadDate.getFullYear() === now.getFullYear();
    });
    
    return c.json({
      success: true,
      stats: {
        totalCount: allEvidence.length,
        totalSize,
        categoryCount: categories.size,
        thisMonthCount: thisMonth.length,
      }
    });
  } catch (error) {
    console.error('Error fetching evidence stats:', error);
    return c.json({ success: false, error: 'Failed to fetch evidence stats' }, 500);
  }
});

// ============================================================================
// COMPLIANCE CONTROLS ENDPOINTS
// ============================================================================

// Get controls by framework
app.get('/make-server-4cea2a8f/controls/:framework', async (c) => {
  try {
    const framework = c.req.param('framework');
    const controls = await kv.getByPrefix(`control:${framework}:`);
    
    return c.json({ success: true, controls });
  } catch (error) {
    console.error('Error fetching controls:', error);
    return c.json({ success: false, error: 'Failed to fetch controls' }, 500);
  }
});

// Save/update control
app.post('/make-server-4cea2a8f/controls', async (c) => {
  try {
    const body = await c.req.json();
    const { framework, controlId, ...controlData } = body;
    
    const key = `control:${framework}:${controlId}`;
    await kv.set(key, { ...controlData, id: controlId, framework });
    
    return c.json({ success: true, control: { id: controlId, framework, ...controlData } });
  } catch (error) {
    console.error('Error saving control:', error);
    return c.json({ success: false, error: 'Failed to save control' }, 500);
  }
});

// ============================================================================
// VAPT FINDINGS ENDPOINTS
// ============================================================================

// Get VAPT reports
app.get('/make-server-4cea2a8f/vapt/reports', async (c) => {
  try {
    const reports = await kv.getByPrefix('vapt:report:');
    return c.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching VAPT reports:', error);
    return c.json({ success: false, error: 'Failed to fetch reports' }, 500);
  }
});

// Save VAPT report
app.post('/make-server-4cea2a8f/vapt/report', async (c) => {
  try {
    const body = await c.req.json();
    const reportId = `vapt:report:${Date.now()}`;
    
    await kv.set(reportId, { ...body, id: reportId, createdAt: new Date().toISOString() });
    
    return c.json({ success: true, report: { id: reportId, ...body } });
  } catch (error) {
    console.error('Error saving VAPT report:', error);
    return c.json({ success: false, error: 'Failed to save report' }, 500);
  }
});

// ============================================================================
// VENDOR RISK ENDPOINTS
// ============================================================================

// Get vendors
app.get('/make-server-4cea2a8f/vendors', async (c) => {
  try {
    const vendors = await kv.getByPrefix('vendor:');
    return c.json({ success: true, vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return c.json({ success: false, error: 'Failed to fetch vendors' }, 500);
  }
});

// Save vendor
app.post('/make-server-4cea2a8f/vendor', async (c) => {
  try {
    const body = await c.req.json();
    const vendorId = body.id || `vendor:${Date.now()}`;
    
    await kv.set(vendorId, { ...body, id: vendorId });
    
    return c.json({ success: true, vendor: { id: vendorId, ...body } });
  } catch (error) {
    console.error('Error saving vendor:', error);
    return c.json({ success: false, error: 'Failed to save vendor' }, 500);
  }
});

Deno.serve(app.fetch);
