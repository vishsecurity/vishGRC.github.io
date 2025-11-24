import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';
import { toast } from 'sonner@2.0.3';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4cea2a8f`;
const EVIDENCE_BUCKET = 'make-4cea2a8f-evidence';

export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  category: string;
  description: string;
  entityId?: string;
  storagePath: string;
  url?: string;
}

export interface EvidenceStats {
  totalCount: number;
  totalSize: number;
  categoryCount: number;
  thisMonthCount: number;
}

export function useEvidence(category?: string, entityId?: string) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<EvidenceStats | null>(null);

  // Fetch evidence
  const fetchEvidence = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/evidence/${category || 'all'}`;
      if (entityId) {
        url = `${API_BASE}/evidence/entity/${entityId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setEvidence(data.evidence || []);
      } else {
        console.error('Failed to fetch evidence:', data.error);
        toast.error('Failed to load evidence');
      }
    } catch (error) {
      console.error('Error fetching evidence:', error);
      toast.error('Error loading evidence');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/evidence/stats`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Upload evidence
  const uploadEvidence = async (
    file: File,
    category: string,
    description: string,
    entityId?: string
  ): Promise<Evidence | null> => {
    try {
      // Generate unique path
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 9);
      const storagePath = `${category}/${timestamp}-${randomStr}-${file.name}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(EVIDENCE_BUCKET)
        .upload(storagePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        toast.error(`Failed to upload file: ${uploadError.message}`);
        return null;
      }

      // Save metadata
      const response = await fetch(`${API_BASE}/evidence/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          category,
          description,
          entityId,
          storagePath,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${file.name} uploaded successfully`);
        await fetchEvidence();
        await fetchStats();
        return data.evidence;
      } else {
        console.error('Failed to save evidence metadata:', data.error);
        toast.error('Failed to save evidence metadata');
        return null;
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error('Error uploading evidence');
      return null;
    }
  };

  // Download evidence
  const downloadEvidence = async (evidence: Evidence) => {
    try {
      const response = await fetch(
        `${API_BASE}/evidence/${evidence.category}/${evidence.id.split(':')[2]}/url`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.url) {
        // Download file
        const fileResponse = await fetch(data.url);
        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = evidence.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Download started');
      } else {
        toast.error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading evidence:', error);
      toast.error('Error downloading file');
    }
  };

  // Delete evidence
  const deleteEvidence = async (evidence: Evidence) => {
    try {
      const evidenceId = evidence.id.split(':')[2];
      const response = await fetch(
        `${API_BASE}/evidence/${evidence.category}/${evidenceId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`${evidence.fileName} deleted successfully`);
        await fetchEvidence();
        await fetchStats();
      } else {
        toast.error('Failed to delete evidence');
      }
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast.error('Error deleting evidence');
    }
  };

  useEffect(() => {
    fetchEvidence();
    fetchStats();
  }, [category, entityId]);

  return {
    evidence,
    loading,
    stats,
    uploadEvidence,
    downloadEvidence,
    deleteEvidence,
    refresh: fetchEvidence,
  };
}
