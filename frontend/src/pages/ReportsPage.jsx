
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { exportToCSV } from '../services/exportUtils';
import StatusBadge from '../components/StatusBadge';
import {
  BarChart3,
  Download,
  Filter,
  Users,
  CreditCard,
  FolderGit2,
  Layers,
  Star,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const formatDate = (value) => {
  if (!value || value === 'Ongoing' || value === 'N/A') return value || 'N/A';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString();
};

const formatMoney = (value) =>
  `$${(Number(value) || 0).toLocaleString()}`;

const getId = (value) => {
  if (!value) return 'N/A';
  return String(value._id || value.id || value);
};

function EmptyState({ message }) {
  return (
    <div className="py-12 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('project-bids');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [projectBidsData, setProjectBidsData] = useState([]);
  const [freelancerData, setFreelancerData] = useState([]);
  const [contractData, setContractData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);

  const [projectFilterStatus, setProjectFilterStatus] = useState('all');
  const [minRatingFilter, setMinRatingFilter] = useState('');
  const [contractFilterStatus, setContractFilterStatus] = useState('all');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState('all');

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let endpoint = '';
      let params = {};

      if (activeTab === 'project-bids') {
        endpoint = '/reports/project-bids';
        params = { status: projectFilterStatus };
      } else if (activeTab === 'freelancer-perf') {
        endpoint = '/reports/freelancer-performance';
        params = { minRating: minRatingFilter };
      } else if (activeTab === 'contract-status') {
        endpoint = '/reports/contract-status';
        params = { status: contractFilterStatus };
      } else if (activeTab === 'payment-milestones') {
        endpoint = '/reports/payment-milestones';
        params = { status: paymentFilterStatus };
      }

      const response = await api.get(endpoint, { params });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Unable to load report.');
      }

      const data = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      if (activeTab === 'project-bids') {
        setProjectBidsData(data);
      } else if (activeTab === 'freelancer-perf') {
        setFreelancerData(data);
      } else if (activeTab === 'contract-status') {
        setContractData(data);
      } else if (activeTab === 'payment-milestones') {
        setPaymentData(data);
      }
    } catch (err) {
      console.error('Report loading failed:', err);

      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load report data.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    projectFilterStatus,
    minRatingFilter,
    contractFilterStatus,
    paymentFilterStatus
  ]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExportCSV = () => {
    let rows = [];
    let filename = 'LanceHub_Report';

    if (activeTab === 'project-bids') {
      filename = 'Project_Bids_Report';

      rows = projectBidsData.map((project) => ({
        'Project ID': getId(project.projectId),
        'Project Title': project.projectName,
        'Client Name': project.clientName,
        Status: project.projectStatus,
        'Budget ($)': project.budget,
        'Total Bids': project.totalBids,
        'Lowest Bid ($)': project.lowestBid,
        'Highest Bid ($)': project.highestBid,
        'Average Bid ($)': project.averageBid,
        'Accepted Bids': project.acceptedBids,
        'Rejected Bids': project.rejectedBids,
        'Pending Bids': project.pendingBids
      }));
    } else if (activeTab === 'freelancer-perf') {
      filename = 'Freelancer_Performance_Report';

      rows = freelancerData.map((freelancer) => ({
        'Freelancer ID': getId(freelancer.freelancerId),
        'Freelancer Name': freelancer.freelancerName,
        Email: freelancer.email,
        Title: freelancer.title,
        'Hourly Rate ($)': freelancer.hourlyRate,
        'Average Rating': freelancer.averageRating,
        'Total Reviews': freelancer.totalReviews,
        'Completed Projects': freelancer.completedProjects,
        'Active Contracts': freelancer.activeContracts,
        'Bid Win Rate (%)': freelancer.bidWinRate,
        'Total Earnings ($)': freelancer.totalEarnings,
        'On-Time Delivery (%)': freelancer.onTimeDeliveryRate
      }));
    } else if (activeTab === 'contract-status') {
      filename = 'Contract_Status_Report';

      rows = contractData.map((contract) => ({
        'Contract ID': getId(contract.contractId),
        'Project Name': contract.projectName,
        'Client Name': contract.clientName,
        'Freelancer Name': contract.freelancerName,
        'Contract Value ($)': contract.contractValue,
        'Start Date': formatDate(contract.startDate),
        'End Date': formatDate(contract.endDate),
        'Contract Status': contract.contractStatus,
        'Total Milestones': contract.totalMilestones,
        'Completed Milestones': contract.completedMilestones,
        'Progress (%)': contract.progressPercent
      }));
    } else if (activeTab === 'payment-milestones') {
      filename = 'Payment_Milestones_Report';

      rows = paymentData.map((payment) => ({
        'Payment ID': getId(payment.paymentId),
        'Transaction ID': payment.transactionId,
        'Contract ID': getId(payment.contractId),
        'Project Title': payment.projectName,
        'Milestone Title': payment.milestoneName,
        'Amount ($)': payment.amount,
        'Due Date': formatDate(payment.dueDate),
        'Payment Status': payment.paymentStatus,
        'Approval Date': payment.approvalDate,
        'Reviewer Name': payment.reviewerName,
        'Client Name': payment.clientName,
        'Freelancer Name': payment.freelancerName,
        Notes: payment.reviewerNotes
      }));
    }

    if (rows.length === 0) {
      alert('No report data available to export.');
      return;
    }

    exportToCSV(filename, rows);
  };

  const tabs = [
    {
      id: 'project-bids',
      name: 'Report 1: Project Bids',
      icon: FolderGit2
    },
    {
      id: 'freelancer-perf',
      name: 'Report 2: Freelancer Performance',
      icon: Users
    },
    {
      id: 'contract-status',
      name: 'Report 3: Contract Status',
      icon: Layers
    },
    {
      id: 'payment-milestones',
      name: 'Report 4: Payment Milestones',
      icon: CreditCard
    }
  ];

  const activeCount = {
    'project-bids': projectBidsData.length,
    'freelancer-perf': freelancerData.length,
    'contract-status': contractData.length,
    'payment-milestones': paymentData.length
  }[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Mandatory System Reports & Analytics
            </h1>

            <span className="text-[10px] font-bold uppercase bg-primary-50 text-primary-700 border border-primary-200 px-2 py-0.5 rounded-full">
              4 Official Reports
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Analyze project bids, freelancer performance, contracts and payments.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={loading || activeCount === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export CSV Data
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button
            onClick={fetchReportData}
            className="ml-auto font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading report data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'project-bids' && (
            <div className="space-y-6">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Project Status:</span>

                  <select
                    value={projectFilterStatus}
                    onChange={(e) => setProjectFilterStatus(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="all">All Projects</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <span className="text-slate-400">
                  {projectBidsData.length} projects
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase mb-1">
                  Project Bid Quotation Spread
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Lowest, average and highest bids for each project.
                </p>

                {projectBidsData.length === 0 ? (
                  <EmptyState message="No project bid data available." />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={projectBidsData.slice(0, 7)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="projectName"
                          fontSize={10}
                          tickFormatter={(value) =>
                            value?.length > 15
                              ? `${value.substring(0, 15)}...`
                              : value
                          }
                        />
                        <YAxis fontSize={11} tickFormatter={(value) => `$${value}`} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="lowestBid" name="Lowest Bid" fill="#10B981" />
                        <Bar dataKey="averageBid" name="Average Bid" fill="#3B82F6" />
                        <Bar dataKey="highestBid" name="Highest Bid" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Project Title</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Budget</th>
                        <th className="px-4 py-3">Total Bids</th>
                        <th className="px-4 py-3">Lowest Bid</th>
                        <th className="px-4 py-3">Highest Bid</th>
                        <th className="px-4 py-3">Accepted / Rejected</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {projectBidsData.map((project) => (
                        <tr key={getId(project.projectId)}>
                          <td className="px-4 py-3 font-bold">{project.projectName}</td>
                          <td className="px-4 py-3">{project.clientName}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={project.projectStatus} size="xs" />
                          </td>
                          <td className="px-4 py-3">{formatMoney(project.budget)}</td>
                          <td className="px-4 py-3">{project.totalBids}</td>
                          <td className="px-4 py-3 text-emerald-600">
                            {formatMoney(project.lowestBid)}
                          </td>
                          <td className="px-4 py-3">
                            {formatMoney(project.highestBid)}
                          </td>
                          <td className="px-4 py-3">
                            {project.acceptedBids} / {project.rejectedBids}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {projectBidsData.length === 0 && (
                    <EmptyState message="No projects found." />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'freelancer-perf' && (
            <div className="space-y-6">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Minimum Rating:</span>

                  <select
                    value={minRatingFilter}
                    onChange={(e) => setMinRatingFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200"
                  >
                    <option value="">All Ratings</option>
                    <option value="4.8">4.8+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                  </select>
                </div>

                <span className="text-slate-400">
                  {freelancerData.length} freelancers
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase mb-1">
                  Freelancer Earnings
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Earnings reported by the backend for each freelancer.
                </p>

                {freelancerData.length === 0 ? (
                  <EmptyState message="No freelancer data available." />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={freelancerData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="freelancerName" fontSize={10} />
                        <YAxis fontSize={11} tickFormatter={(value) => `$${value}`} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="totalEarnings"
                          name="Total Earnings"
                          fill="#3B82F6"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Freelancer</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Rating</th>
                        <th className="px-4 py-3">Completed Projects</th>
                        <th className="px-4 py-3">Active Contracts</th>
                        <th className="px-4 py-3">On-Time Delivery</th>
                        <th className="px-4 py-3">Total Earnings</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {freelancerData.map((freelancer) => (
                        <tr key={getId(freelancer.freelancerId)}>
                          <td className="px-4 py-3">
                            <p className="font-bold">{freelancer.freelancerName}</p>
                            <span className="text-[10px] text-slate-400">
                              {freelancer.email}
                            </span>
                          </td>
                          <td className="px-4 py-3">{freelancer.title}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-amber-600 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              {freelancer.averageRating}
                            </span>
                          </td>
                          <td className="px-4 py-3">{freelancer.completedProjects}</td>
                          <td className="px-4 py-3">{freelancer.activeContracts}</td>
                          <td className="px-4 py-3">
                            {freelancer.onTimeDeliveryRate}%
                          </td>
                          <td className="px-4 py-3 font-bold">
                            {formatMoney(freelancer.totalEarnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {freelancerData.length === 0 && (
                    <EmptyState message="No freelancers found." />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contract-status' && (
            <div className="space-y-6">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Contract Status:</span>

                  <select
                    value={contractFilterStatus}
                    onChange={(e) => setContractFilterStatus(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200"
                  >
                    <option value="all">All Contracts</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>

                <span className="text-slate-400">
                  {contractData.length} contracts
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Contract ID</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Client</th>
                        <th className="px-4 py-3">Freelancer</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Start Date</th>
                        <th className="px-4 py-3">End Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Progress</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {contractData.map((contract) => (
                        <tr key={getId(contract.contractId)}>
                          <td className="px-4 py-3 font-mono">
                            #{getId(contract.contractId)}
                          </td>
                          <td className="px-4 py-3 font-bold">{contract.projectName}</td>
                          <td className="px-4 py-3">{contract.clientName}</td>
                          <td className="px-4 py-3">{contract.freelancerName}</td>
                          <td className="px-4 py-3 font-bold">
                            {formatMoney(contract.contractValue)}
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(contract.startDate)}
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(contract.endDate)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={contract.contractStatus} size="xs" />
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-primary-600">
                              {contract.progressPercent}%
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {contract.completedMilestones}/{contract.totalMilestones} milestones
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {contractData.length === 0 && (
                    <EmptyState message="No contracts found." />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment-milestones' && (
            <div className="space-y-6">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Payment Status:</span>

                  <select
                    value={paymentFilterStatus}
                    onChange={(e) => setPaymentFilterStatus(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200"
                  >
                    <option value="all">All Payments</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <span className="text-slate-400">
                  {paymentData.length} payments
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Transaction ID</th>
                        <th className="px-4 py-3">Project & Milestone</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Approval Date</th>
                        <th className="px-4 py-3">Reviewer</th>
                        <th className="px-4 py-3">Client / Freelancer</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {paymentData.map((payment) => (
                        <tr key={getId(payment.paymentId)}>
                          <td className="px-4 py-3 font-mono">
                            {payment.transactionId || getId(payment.paymentId)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold">{payment.projectName}</p>
                            <span className="text-[10px] text-slate-500">
                              {payment.milestoneName}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">
                            {formatMoney(payment.amount)}
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(payment.dueDate)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={payment.paymentStatus} size="xs" />
                          </td>
                          <td className="px-4 py-3">
                            {payment.approvalDate}
                          </td>
                          <td className="px-4 py-3">
                            {payment.reviewerName}
                          </td>
                          <td className="px-4 py-3">
                            {payment.clientName} → {payment.freelancerName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {paymentData.length === 0 && (
                    <EmptyState message="No payment records found." />
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
