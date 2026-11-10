
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  FileCheck2,
  Layers,
  CreditCard,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const {
    user,
    isAdmin,
    isClient,
    isFreelancer,
    isReviewer
  } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await api.get('/reports/dashboard');

        if (!cancelled && res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            'Unable to load dashboard data. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            Loading dashboard insights...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-6 text-center">
        <p className="text-sm text-rose-600 font-medium">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    overview = {},
    charts = {},
    recentProjects = [],
    recentBids = [],
    pendingApprovals = []
  } = data || {};

  const financialOverview = Array.isArray(charts.financialOverview)
    ? charts.financialOverview
    : [];

  const bidStats = Array.isArray(charts.bidStats)
    ? charts.bidStats
    : [];

  const safeNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const formatMoney = (value) =>
    `$${safeNumber(value).toLocaleString()}`;

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-primary-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-500/30 text-primary-200 border border-primary-400/30">
                {user?.role?.replace('_', ' ')} Dashboard
              </span>

              <span className="text-xs text-slate-300">
                | Project #46 Platform
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight mt-1.5">
              Welcome back, {user?.name}!
            </h1>

            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isAdmin && 'System supervisor view: monitor platform projects, bids, contracts, users and payments.'}
              {isClient && 'Manage your projects, compare proposals, track milestones and review payments.'}
              {isFreelancer && 'Browse projects, submit bids, deliver milestones and track your earnings.'}
              {isReviewer && 'Finance supervisor: review milestone deliverables and authorize payout transactions.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isClient && (
              <Link
                to="/projects/create"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                Post New Project
              </Link>
            )}

            {isFreelancer && (
              <Link
                to="/projects"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Browse Projects
              </Link>
            )}

            {isReviewer && (
              <Link
                to="/payments"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Review Payouts
              </Link>
            )}

            <Link
              to="/reports"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              View Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={safeNumber(overview.totalProjects)}
          icon={FolderGit2}
          color="blue"
          change={`${safeNumber(overview.openProjects)} Open`}
        />

        <StatCard
          title="Active Projects"
          value={safeNumber(overview.activeProjects)}
          icon={Layers}
          color="purple"
          change="In Progress"
        />

        <StatCard
          title="Total Freelancers"
          value={safeNumber(overview.totalFreelancers)}
          icon={Users}
          color="emerald"
          change="Registered"
        />

        <StatCard
          title="Total Clients"
          value={safeNumber(overview.totalClients)}
          icon={Users}
          color="indigo"
          change="Registered"
        />

        <StatCard
          title="Total Proposals"
          value={safeNumber(overview.totalBids)}
          icon={FileCheck2}
          color="amber"
          change="Submitted Bids"
        />

        <StatCard
          title="Active Contracts"
          value={safeNumber(overview.activeContracts)}
          icon={Layers}
          color="blue"
          change="Tracked"
        />

        <StatCard
          title="Completed Contracts"
          value={safeNumber(overview.completedContracts)}
          icon={CheckCircle2}
          color="emerald"
          change="Delivered"
        />

        <StatCard
          title="Pending Payments"
          value={formatMoney(overview.totalPaymentsPending)}
          icon={CreditCard}
          color="rose"
          change={`${safeNumber(overview.pendingPayments)} Pending`}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Financial Overview */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Platform Payout & Volume Trend
              </h3>
              <p className="text-xs text-slate-500">
                Monthly payout and bid volume overview
              </p>
            </div>

            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
              Approved: {formatMoney(overview.totalPaymentsApproved)}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financialOverview}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />

                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(value) => `$${value}`}
                />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  fontSize={11}
                />

                <Tooltip
                  formatter={(value, name) => [
                    name === 'Total Payout ($)'
                      ? formatMoney(value)
                      : value,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingTop: '10px'
                  }}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalPayout"
                  name="Total Payout ($)"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bidsVolume"
                  name="Bids Volume"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bid Statistics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Bid Proposal Statuses
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of proposal decisions
            </p>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bidStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {bidStats.map((entry, index) => (
                    <Cell
                      key={entry.name || index}
                      fill={entry.color || '#64748b'}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around pt-2 border-t border-slate-100">
            {bidStats.map((item, index) => (
              <div key={item.name || index} className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color || '#64748b' }}
                  />
                  <span>{item.name}</span>
                </div>

                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Pending Review Milestones
              </h3>
            </div>

            <Link
              to="/payments"
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingApprovals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No pending payment approvals.
              </div>
            ) : (
              pendingApprovals.map((item) => (
                <div
                  key={item._id || item.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900">
                      {item.milestone?.title || 'Milestone Deliverable'}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Client:{' '}
                      <span className="font-medium text-slate-700">
                        {item.client?.name || 'N/A'}
                      </span>
                      {' → '}
                      Freelancer:{' '}
                      <span className="font-medium text-slate-700">
                        {item.freelancer?.name || 'N/A'}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-slate-900">
                      {formatMoney(item.amount)}
                    </span>

                    <StatusBadge status={item.status} size="xs" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Bids */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-primary-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Recent Proposal Submissions
              </h3>
            </div>

            <Link
              to="/projects"
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
            >
              Browse Projects
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentBids.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent proposals submitted.
              </div>
            ) : (
              recentBids.map((bid) => (
                <div
                  key={bid._id || bid.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-900">
                      {bid.project?.title || 'Project'}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Submitted by{' '}
                      <span className="font-medium text-slate-700">
                        {bid.freelancer?.name || 'Unknown freelancer'}
                      </span>
                      {' '}({bid.deliveryDays || 'N/A'} days)
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-emerald-700">
                      {formatMoney(bid.bidAmount)}
                    </span>

                    <StatusBadge status={bid.status} size="xs" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
