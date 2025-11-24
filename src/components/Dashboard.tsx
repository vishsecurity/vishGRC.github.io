import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Shield, Users, FileCheck, Bug, Lock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const stats = [
    {
      title: 'Compliance Score',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Vendors',
      value: '42',
      change: '+3',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Open VAPT Findings',
      value: '17',
      change: '-8',
      trend: 'down',
      icon: Bug,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'DSAR Requests',
      value: '5',
      change: '+2',
      trend: 'up',
      icon: Lock,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const complianceData = [
    { name: 'ISO 27001', completed: 145, total: 167 },
    { name: 'ISO 27017', completed: 89, total: 112 },
    { name: 'ISO 27018', completed: 72, total: 95 },
    { name: 'RBI IT', completed: 56, total: 78 },
    { name: 'DL SAR', completed: 34, total: 45 },
  ];

  const riskDistribution = [
    { name: 'Critical', value: 3, color: '#ef4444' },
    { name: 'High', value: 8, color: '#f97316' },
    { name: 'Medium', value: 15, color: '#eab308' },
    { name: 'Low', value: 24, color: '#22c55e' },
  ];

  const trendData = [
    { month: 'Jan', compliance: 65, risk: 45 },
    { month: 'Feb', compliance: 72, risk: 38 },
    { month: 'Mar', compliance: 78, risk: 32 },
    { month: 'Apr', compliance: 81, risk: 28 },
    { month: 'May', compliance: 85, risk: 22 },
    { month: 'Jun', compliance: 87, risk: 17 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl text-slate-900 mb-2">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp
                      className={`w-4 h-4 ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      } ${stat.trend === 'down' ? 'rotate-180' : ''}`}
                    />
                    <span
                      className={`text-sm ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-slate-900 mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            Compliance Framework Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="completed" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              <Bar dataKey="total" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          6-Month Trend Analysis
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="compliance" stroke="#06b6d4" strokeWidth={3} />
            <Line type="monotone" dataKey="risk" stroke="#f97316" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-slate-900 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {[
            { text: 'ISO 27001 audit completed - 12 controls updated', type: 'success', time: '2 hours ago' },
            { text: 'New vendor risk assessment initiated for TechCorp', type: 'info', time: '4 hours ago' },
            { text: 'VAPT report generated for Q2 2025', type: 'info', time: '1 day ago' },
            { text: 'Critical finding in production environment', type: 'warning', time: '2 days ago' },
            { text: 'DSAR request closed - Data deletion confirmed', type: 'success', time: '3 days ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success'
                    ? 'bg-green-500'
                    : activity.type === 'warning'
                    ? 'bg-orange-500'
                    : 'bg-blue-500'
                }`}
              />
              <div className="flex-1">
                <p className="text-slate-800 text-sm">{activity.text}</p>
                <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
              </div>
              <CheckCircle className="w-4 h-4 text-slate-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
