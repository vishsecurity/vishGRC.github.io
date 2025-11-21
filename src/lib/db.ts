// IndexedDB wrapper for offline data storage
const DB_NAME = 'GRC_Suite';
const DB_VERSION = 1;

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'auditor' | 'analyst' | 'viewer';
  permissions: {
    users: { read: boolean; write: boolean; execute: boolean };
    vendors: { read: boolean; write: boolean; execute: boolean };
    compliance: { read: boolean; write: boolean; execute: boolean };
    vapt: { read: boolean; write: boolean; execute: boolean };
    privacy: { read: boolean; write: boolean; execute: boolean };
  };
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
  riskScore: number;
  submittedAt?: string;
  responses: Record<string, any>;
  questionnaire: string;
  companyId: string;
  createdAt: string;
}

export interface ComplianceControl {
  id: string;
  framework: string;
  controlId: string;
  title: string;
  description: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
  evidence: string;
  notes: string;
  companyId: string;
  updatedAt: string;
}

export interface VAPTReport {
  id: string;
  title: string;
  clientName: string;
  summary: string;
  findings: Array<{
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    description: string;
    evidence: string;
    remediation: string;
    cvss: number;
  }>;
  status: 'draft' | 'in-progress' | 'completed';
  companyId: string;
  createdAt: string;
}

export interface PrivacyRecord {
  id: string;
  type: 'ropa' | 'pii' | 'dpia' | 'consent' | 'dsar';
  data: Record<string, any>;
  companyId: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  createdAt: string;
}

export interface Settings {
  id: string;
  clientLogo?: string;
  auditorLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  companyName?: string;
  aiProvider?: 'openai' | 'anthropic' | 'local';
  aiApiKey?: string;
}

class Database {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('vendors')) {
          db.createObjectStore('vendors', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('compliance')) {
          db.createObjectStore('compliance', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('vapt')) {
          db.createObjectStore('vapt', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('privacy')) {
          db.createObjectStore('privacy', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('companies')) {
          db.createObjectStore('companies', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  async add<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const db = new Database();

// Initialize database and create default admin user
export async function initializeDatabase() {
  await db.init();

  // Check if admin user exists
  const users = await db.getAll<User>('users');
  if (users.length === 0) {
    const defaultAdmin: User = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@grc.local',
      password: 'admin123', // In production, this should be hashed
      role: 'admin',
      permissions: {
        users: { read: true, write: true, execute: true },
        vendors: { read: true, write: true, execute: true },
        compliance: { read: true, write: true, execute: true },
        vapt: { read: true, write: true, execute: true },
        privacy: { read: true, write: true, execute: true },
      },
      createdAt: new Date().toISOString(),
    };
    await db.add('users', defaultAdmin);
  }

  // Check if default company exists
  const companies = await db.getAll<Company>('companies');
  if (companies.length === 0) {
    const defaultCompany: Company = {
      id: 'company-001',
      name: 'Default Organization',
      createdAt: new Date().toISOString(),
    };
    await db.add('companies', defaultCompany);
  }

  // Initialize default settings
  const settings = await db.getAll<Settings>('settings');
  if (settings.length === 0) {
    const defaultSettings: Settings = {
      id: 'settings-001',
      companyName: 'GRC Suite',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
    };
    await db.add('settings', defaultSettings);
  }
}
