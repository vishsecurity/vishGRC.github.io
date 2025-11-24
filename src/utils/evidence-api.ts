import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4cea2a8f`;

interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  signedUrl?: string;
  uploadDate: string;
  uploadedBy: string;
  category: string;
  entityId?: string;
  description: string;
}

export const evidenceAPI = {
  async uploadEvidence(
    file: File,
    category: string,
    options: {
      entityId?: string;
      description?: string;
      uploadedBy?: string;
    } = {}
  ): Promise<Evidence> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    if (options.entityId) formData.append('entityId', options.entityId);
    if (options.description) formData.append('description', options.description);
    if (options.uploadedBy) formData.append('uploadedBy', options.uploadedBy);

    const response = await fetch(`${API_BASE}/evidence/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload evidence');
    }

    const data = await response.json();
    return data.evidence;
  },

  async getAllEvidence(filters?: {
    category?: string;
    entityId?: string;
  }): Promise<Evidence[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.entityId) params.append('entityId', filters.entityId);

    const response = await fetch(
      `${API_BASE}/evidence?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch evidence');
    }

    const data = await response.json();
    return data.evidence;
  },

  async getEvidenceById(id: string): Promise<Evidence> {
    const response = await fetch(`${API_BASE}/evidence/${id}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch evidence');
    }

    const data = await response.json();
    return data.evidence;
  },

  async deleteEvidence(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/evidence/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete evidence');
    }
  },

  async getStatistics(): Promise<{
    totalCount: number;
    totalSize: number;
    thisMonth: number;
    categories: number;
    categoryCounts: Record<string, number>;
  }> {
    const response = await fetch(`${API_BASE}/evidence/stats`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch statistics');
    }

    const data = await response.json();
    return data.stats;
  }
};
