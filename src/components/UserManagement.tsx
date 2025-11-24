import { useState } from 'react';
import { Users, Plus, Shield, Edit2, Trash2 } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@company.com', role: 'Administrator', permissions: 'Full Access', status: 'Active' },
    { id: 2, name: 'John Auditor', email: 'john@company.com', role: 'Auditor', permissions: 'Read/Write', status: 'Active' },
    { id: 3, name: 'Jane Viewer', email: 'jane@company.com', role: 'Viewer', permissions: 'Read Only', status: 'Active' },
  ]);

  const roles = [
    { name: 'Administrator', permissions: ['Read', 'Write', 'Execute', 'Delete', 'Manage Users'] },
    { name: 'Auditor', permissions: ['Read', 'Write', 'Export'] },
    { name: 'Compliance Manager', permissions: ['Read', 'Write', 'Execute'] },
    { name: 'Viewer', permissions: ['Read', 'Export'] },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl mb-2">User Management</h2>
        <p className="text-cyan-100">
          Manage users, roles, and permissions with Role-Based Access Control (RBAC)
        </p>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-slate-200">
        <button className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-slate-900">User Accounts</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-slate-700">Name</th>
              <th className="px-6 py-4 text-left text-slate-700">Email</th>
              <th className="px-6 py-4 text-left text-slate-700">Role</th>
              <th className="px-6 py-4 text-left text-slate-700">Permissions</th>
              <th className="px-6 py-4 text-left text-slate-700">Status</th>
              <th className="px-6 py-4 text-left text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-800">{user.name}</td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.permissions}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Roles & Permissions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-600" />
          Roles & Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-xl hover:border-cyan-400 transition-colors">
              <h4 className="text-slate-800 mb-3">{role.name}</h4>
              <div className="space-y-1">
                {role.permissions.map((permission, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    {permission}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RBAC Configuration */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
        <h4 className="text-cyan-900 mb-3">Role-Based Access Control (RBAC)</h4>
        <p className="text-cyan-700 text-sm mb-4">
          Configure granular permissions per module and operation for each role. Users inherit permissions from their assigned role.
        </p>
        <button className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
          Configure RBAC Settings
        </button>
      </div>
    </div>
  );
}
