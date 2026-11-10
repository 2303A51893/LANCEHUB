
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const getId = (item) => item?._id || item?.id || '';

const formatDate = (date) => {
  if (!date) return 'Date unavailable';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable';
  }

  return parsedDate.toLocaleDateString();
};

const formatAmount = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return '0';

  return value.toLocaleString('en-US', {
    maximumFractionDigits: 2
  });
};

export default function ProposalBiddingPage() {
  const { user } = useAuth();

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchMyBids = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/bids/my');

      if (res.data.success) {
        setBids(
          Array.isArray(res.data.bids)
            ? res.data.bids
            : []
        );
      } else {
        setBids([]);
        setError(res.data.message || 'Unable to load your proposals.');
      }
    } catch (err) {
      console.error('Failed to fetch bids:', err);

      setError(
        err.response?.data?.message ||
        'Failed to load proposals. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyBids();
    } else {
      setBids([]);
      setLoading(false);
    }
  }, [user, fetchMyBids]);

  const filteredBids = statusFilter === 'all'
    ? bids
    : bids.filter((bid) => bid.status === statusFilter);

  const pendingCount = bids.filter(
    (bid) => bid.status === 'Pending'
  ).length;

  const acceptedCount = bids.filter(
    (bid) => bid.status === 'Accepted'
  ).length;

  const rejectedCount = bids.filter(
    (bid) => bid.status === 'Rejected'
  ).length;

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-primary-600" />
            My Proposals & Bids
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Track the status of all your submitted client proposals and active contracts.
          </p>
        </div>

        <Link
          to="/projects"
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
        >
          Browse Open Projects
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
            Pending Decisions
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {pendingCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            Accepted Bids
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {acceptedCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
            Not Selected
          </span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {rejectedCount}
          </p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 flex-wrap">
          {['all', 'Pending', 'Accepted', 'Rejected'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'all' ? 'All Bids' : status}
            </button>
          ))}
        </div>

        <span className="text-slate-400 text-[11px] font-medium">
          Showing {filteredBids.length} proposals
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading your proposals...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />

          <p className="text-sm font-semibold text-slate-800">
            Unable to load proposals
          </p>

          <p className="text-xs text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchMyBids}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      ) : filteredBids.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-3">
          <FileCheck2 className="w-8 h-8 mx-auto text-slate-300" />

          <p>No proposals found in this category.</p>

          <Link
            to="/projects"
            className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold"
          >
            Explore Projects to Bid
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBids.map((bid) => {
            const bidId = getId(bid);
            const project = bid.project || bid.projectId || {};
            const projectId = getId(project);
            const client = project.client || project.clientId || {};

            return (
              <div
                key={bidId || `${projectId}-${bid.createdAt}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                        {project.category || 'Project'}
                      </span>

                      <StatusBadge status={bid.status} size="xs" />
                    </div>

                    {projectId ? (
                      <Link
                        to={`/projects/${projectId}`}
                        className="text-sm font-bold text-slate-900 hover:text-primary-600 transition-colors"
                      >
                        {project.title || 'Untitled Project'}
                      </Link>
                    ) : (
                      <p className="text-sm font-bold text-slate-900">
                        {project.title || 'Project details unavailable'}
                      </p>
                    )}

                    <p className="text-xs text-slate-400 mt-0.5">
                      Client:{' '}
                      <span className="font-semibold text-slate-700">
                        {client.name || 'Not available'}
                      </span>
                      {' '}• Submitted on {formatDate(bid.createdAt)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold text-slate-900">
                      ${formatAmount(bid.bidAmount)}
                    </span>

                    <p className="text-[11px] text-slate-500 font-medium">
                      {bid.deliveryDays || 0} days delivery
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed italic break-words">
                  "{bid.coverLetter || 'No cover letter provided.'}"
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Project Benchmark:{' '}
                    <span className="font-semibold text-slate-700">
                      ${formatAmount(project.budget)}
                    </span>
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {projectId && (
                      <Link
                        to={`/projects/${projectId}`}
                        className="px-3 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium text-xs border border-slate-200"
                      >
                        View Project
                      </Link>
                    )}

                    {bid.status === 'Accepted' && (
                      <Link
                        to="/contracts"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Open Active Contract
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
