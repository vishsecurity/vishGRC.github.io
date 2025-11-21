import { useState, useEffect } from 'react';
import { db, User } from '../lib/db';
import { AuthService } from '../lib/auth';
import { Users, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const allUsers = await db.getAll<User>('users');
    setUsers(allUsers);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.email) {
      alert('Username and email are required');
      return;
    }

    if (editingUser) {
      await db.put('users', { ...editingUser, ...formData });
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        username: formData.username!,
        email: formData.email!,
        password: formData.password || 'password123',
        role: formData.role || 'viewer',
        permissions: formData.permissions || {
          users: { read: false, write: false, execute: false },
          vendors: { read: true, write: false, execute: false },
          compliance: { read: true, write: false, execute: false },
          vapt: { read: true, write: false, execute: false },
          privacy: { read: true, write: false, execute: false },
        },
        createdAt: new Date().toISOString(),
      };
      await db.add('users', newUser);
    }

    setShowForm(false);
    setEditingUser(null);
    setFormData({});
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (id === 'admin-001') {
      alert('Cannot delete the default admin user');
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      await db.delete('users', id);
      loadUsers();
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData(user);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({});
  };

  const canWrite = AuthService.hasPermission('users', 'write');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage users and their permissions</p>
        </div>
        {canWrite && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 mb-2 text-sm">Username</label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm">Password</label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 text-sm">Role</label>
              <select
                value={formData.role || 'viewer'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="admin">Admin</option>
                <option value="auditor">Auditor</option>
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-gray-900 mb-4">Module Permissions</h3>
            <div className="space-y-4">
              {(['users', 'vendors', 'compliance', 'vapt', 'privacy'] as const).map((module) => (
                <div key={module} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 capitalize">{module}</span>
                  <div className="flex gap-4">
                    {(['read', 'write', 'execute'] as const).map((action) => (
                      <label key={action} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions?.[module]?.[action] || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                [module]: {
                                  ...formData.permissions?.[module],
                                  [action]: e.target.checked,
                                },
                              } as any,
                            })
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 capitalize">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700 text-sm">Username</th>
              <th className="px-6 py-3 text-left text-gray-700 text-sm">Email</th>
              <th className="px-6 py-3 text-left text-gray-700 text-sm">Role</th>
              <th className="px-6 py-3 text-left text-gray-700 text-sm">Created</th>
              {canWrite && <th className="px-6 py-3 text-right text-gray-700 text-sm">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                {canWrite && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        disabled={user.id === 'admin-001'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
