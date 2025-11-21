import { useEffect, useState } from 'react';
import { db, Vendor, ComplianceControl, VAPTReport, PrivacyRecord } from '../lib/db';
import { 
  Building2, 
  FileCheck, 
  Shield, 
  Lock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    vendors: { total: 0, pending: 0, approved: 0, rejected: 0 },
    compliance: { total: 0, compliant: 0, partial: 0, nonCompliant: 0 },
    vapt: { total: 0, draft: 0, inProgress: 0, completed: 0, critical: 0, high: 0 },
    privacy: { ropa: 0, dpia: 0, dsar: 0 },
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const vendors = await db.getAll<Vendor>('vendors');
    const compliance = await db.getAll<ComplianceControl>('compliance');
    const vapt = await db.getAll<VAPTReport>('vapt');
    const privacy = await db.getAll<PrivacyRecord>('privacy');

    // Calculate critical and high findings across all VAPT reports
    let criticalCount = 0;
    let highCount = 0;
    vapt.forEach(report => {
      criticalCount += report.findings.filter(f => f.severity === 'critical').length;
      highCount += report.findings.filter(f => f.severity === 'high').length;
    });

    setStats({
      vendors: {
        total: vendors.length,
        pending: vendors.filter(v => v.status === 'pending').length,
        approved: vendors.filter(v => v.status === 'approved').length,
        rejected: vendors.filter(v => v.status === 'rejected').length,
      },
      compliance: {
        total: compliance.length,
        compliant: compliance.filter(c => c.status === 'compliant').length,
        partial: compliance.filter(c => c.status === 'partial').length,
        nonCompliant: compliance.filter(c => c.status === 'non-compliant').length,
      },
      vapt: {
        total: vapt.length,
        draft: vapt.filter(v => v.status === 'draft').length,
        inProgress: vapt.filter(v => v.status === 'in-progress').length,
        completed: vapt.filter(v => v.status === 'completed').length,
        critical: criticalCount,
        high: highCount,
      },
      privacy: {
        ropa: privacy.filter(p => p.type === 'ropa').length,
        dpia: privacy.filter(p => p.type === 'dpia').length,
        dsar: privacy.filter(p => p.type === 'dsar').length,
      },
    });
  };

  const complianceRate = stats.compliance.total > 0 
    ? ((stats.compliance.compliant / stats.compliance.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">GRC Dashboard</h1>
        <p className="text-gray-600">Overview of your Governance, Risk, and Compliance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Vendor Risk"
          value={stats.vendors.total}
          icon={Building2}
          color="blue"
          subtitle={`${stats.vendors.pending} pending review`}
        />
        <MetricCard
          title="Compliance Rate"
          value={`${complianceRate}%`}
          icon={FileCheck}
          color="green"
          subtitle={`${stats.compliance.compliant}/${stats.compliance.total} controls`}
        />
        <MetricCard
          title="VAPT Reports"
          value={stats.vapt.total}
          icon={Shield}
          color="purple"
          subtitle={`${stats.vapt.completed} completed`}
        />
        <MetricCard
          title="Privacy Records"
          value={stats.privacy.ropa + stats.privacy.dpia + stats.privacy.dsar}
          icon={Lock}
          color="indigo"
          subtitle={`${stats.privacy.dsar} DSAR requests`}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Risk Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-gray-900">Vendor Risk Assessment</h2>
          </div>
          <div className="space-y-3">
            <StatRow
              label="Pending Review"
              value={stats.vendors.pending}
              icon={Clock}
              color="yellow"
            />
            <StatRow
              label="Approved"
              value={stats.vendors.approved}
              icon={CheckCircle}
              color="green"
            />
            <StatRow
              label="Rejected"
              value={stats.vendors.rejected}
              icon={AlertTriangle}
              color="red"
            />
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileCheck className="w-6 h-6 text-green-600" />
            <h2 className="text-gray-900">Compliance Status</h2>
          </div>
          <div className="space-y-3">
            <StatRow
              label="Compliant"
              value={stats.compliance.compliant}
              icon={CheckCircle}
              color="green"
            />
            <StatRow
              label="Partially Compliant"
              value={stats.compliance.partial}
              icon={TrendingUp}
              color="yellow"
            />
            <StatRow
              label="Non-Compliant"
              value={stats.compliance.nonCompliant}
              icon={AlertTriangle}
              color="red"
            />
          </div>
        </div>

        {/* VAPT Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-gray-900">VAPT Findings</h2>
          </div>
          <div className="space-y-3">
            <StatRow
              label="Critical Severity"
              value={stats.vapt.critical}
              icon={AlertTriangle}
              color="red"
            />
            <StatRow
              label="High Severity"
              value={stats.vapt.high}
              icon={AlertTriangle}
              color="orange"
            />
            <StatRow
              label="Reports Completed"
              value={stats.vapt.completed}
              icon={CheckCircle}
              color="green"
            />
          </div>
        </div>

        {/* Privacy Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-indigo-600" />
            <h2 className="text-gray-900">Privacy Management</h2>
          </div>
          <div className="space-y-3">
            <StatRow
              label="ROPA Records"
              value={stats.privacy.ropa}
              icon={FileCheck}
              color="indigo"
            />
            <StatRow
              label="DPIA Assessments"
              value={stats.privacy.dpia}
              icon={Shield}
              color="indigo"
            />
            <StatRow
              label="DSAR Requests"
              value={stats.privacy.dsar}
              icon={Clock}
              color="indigo"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            icon={Building2}
            label="Add Vendor"
            description="Create new vendor assessment"
          />
          <ActionButton
            icon={Shield}
            label="New VAPT Report"
            description="Start vulnerability assessment"
          />
          <ActionButton
            icon={FileCheck}
            label="Compliance Check"
            description="Review compliance controls"
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'indigo';
  subtitle: string;
}

function MetricCard({ title, value, icon: Icon, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-gray-900 mb-1">{value}</p>
      <p className="text-gray-500 text-xs">{subtitle}</p>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: number;
  icon: any;
  color: 'green' | 'yellow' | 'red' | 'orange' | 'indigo';
}

function StatRow({ label, value, icon: Icon, color }: StatRowProps) {
  const colorClasses = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    indigo: 'text-indigo-600',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
        <span className="text-gray-700 text-sm">{label}</span>
      </div>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

interface ActionButtonProps {
  icon: any;
  label: string;
  description: string;
}

function ActionButton({ icon: Icon, label, description }: ActionButtonProps) {
  return (
    <button className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
      <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-gray-900 text-sm mb-1">{label}</p>
        <p className="text-gray-500 text-xs">{description}</p>
      </div>
    </button>
  );
}
