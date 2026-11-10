
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

const getId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value._id || value.id || '');
};

const formatMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `$${amount.toLocaleString()}` : '$0';
};

const formatMetric = (value, suffix = '') => {
  if (value === undefined || value === null || value === '') {
    return 'N/A';
  }

  const number = Number(value);

  return Number.isFinite(number) ? `${number}${suffix}` : 'N/A';
};

export default function BidComparisonPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState('');

  const fetchBids = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get(`/bids/project/${projectId}`);

      if (!res.data?.success) {
        throw new Error('Unable to load proposal comparison.');
      }

      setProject(res.data.project || null);
      setBids(Array.isArray(res.data.bids) ? res.data.bids : []);
    } catch (err) {
      console.error('Failed to load project bids:', err);

      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load proposals. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const handleAcceptBid = async (bidId) => {
    if (
      !window.confirm(
        'Accept this proposal? This will create a contract and reject the other competing bids.'
      )
    ) {
      return;
    }

    try {
      setProcessingId(bidId);

      const res = await api.post(`/bids/${bidId}/accept`);

      if (!res.data?.success) {
        throw new Error('Unable to accept this proposal.');
      }

      const contractId = getId(res.data.contract || res.data.contractId);

      alert('Proposal accepted successfully!');

      if (contractId) {
        navigate(`/contracts/${contractId}`);
      } else {
        navigate('/contracts');
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        'Failed to accept proposal.'
      );
    } finally {
      setProcessingId('');
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!window.confirm('Mark this proposal as rejected?')) {
      return;
    }

    try {
      setProcessingId(bidId);

      const res = await api.post(`/bids/${bidId}/reject`);

      if (!res.data?.success) {
        throw new Error('Unable to reject this proposal.');
      }

      await fetchBids();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        'Failed to reject proposal.'
      );
    } finally {
      setProcessingId('');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading proposal comparison...</span>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
        <p className="text-sm text-rose-600">{error}</p>

        <button
          type="button"
          onClick={fetchBids}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${projectId}`}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                Bid Selection & Evaluation
              </span>

              <StatusBadge status={project?.status || 'Open'} size="xs" />
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {project?.title || 'Project Bid Comparison'}
            </h1>
          </div>
        </div>

        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs flex items-center gap-4 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Client Budget
            </span>

            <p className="font-extrabold text-slate-900 text-sm">
              {formatMoney(project?.budget)}
            </p>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Total Proposals
            </span>

            <p className="font-bold text-primary-600 text-sm">
              {bids.length}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs">
          {error}
        </div>
      )}

      {bids.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No proposals have been submitted for this project yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bids.map((bid) => {
            const bidId = getId(bid);
            const freelancer = bid.freelancer || bid.freelancerId;
            const profile =
              freelancer?.freelancerProfile ||
              bid.freelancerProfile ||
              {};

            const budget = Number(project?.budget);
            const bidAmount = Number(bid.bidAmount);

            const variance =
              Number.isFinite(budget) && budget > 0 &&
              Number.isFinite(bidAmount)
                ? ((bidAmount - budget) / budget) * 100
                : null;

            const isAccepted = bid.status === 'Accepted';
            const isRejected = bid.status === 'Rejected';
            const isProcessing = processingId === bidId;

            const initials = (freelancer?.name || 'F')
              .split(' ')
              .filter(Boolean)
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={bidId}
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isAccepted
                    ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                    : isRejected
                      ? 'border-slate-200 opacity-60'
                      : 'border-slate-200/80 hover:border-primary-300 hover:shadow-sm'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm border border-slate-200 shrink-0">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-xs">
                          {freelancer?.name || 'Unknown Freelancer'}
                        </h3>

                        <p className="text-[11px] text-slate-500 truncate">
                          {profile.title || 'Freelancer'}
                        </p>

                        <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                          <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {formatMetric(profile.rating)}
                          </span>

                          <span className="text-slate-300">•</span>

                          <span className="text-slate-500 text-[11px]">
                            {formatMetric(profile.completedProjectsCount)} completed
                          </span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={bid.status} size="xs" />
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">
                        Proposed Quote:
                      </span>

                      <span className="text-base font-extrabold text-slate-900">
                        {formatMoney(bid.bidAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Budget Variance:
                      </span>

                      <span
                        className={`font-semibold ${
                          variance !== null && variance <= 0
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {variance === null
                          ? 'N/A'
                          : variance <= 0
                            ? `${Math.abs(variance).toFixed(1)}% below budget`
                            : `+${variance.toFixed(1)}% above budget`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400">
                        Est. Timeline:
                      </span>

                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {bid.deliveryDays || 'N/A'} business days
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">
                        On-Time Delivery
                      </span>

                      <span className="font-bold text-slate-800">
                        {formatMetric(profile.onTimeDeliveryRate, '%')}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">
                        Total Reviews
                      </span>

                      <span className="font-bold text-slate-800">
                        {formatMetric(profile.totalReviews)} client reviews
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Cover Letter & Approach
                    </span>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed italic line-clamp-4">
                      {bid.coverLetter
                        ? `"${bid.coverLetter}"`
                        : 'No cover letter provided.'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  {bid.status === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRejectBid(bidId)}
                        className="flex-1 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isProcessing ? 'Processing...' : 'Reject'}
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleAcceptBid(bidId)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isProcessing ? 'Processing...' : 'Accept Proposal'}
                      </button>
                    </div>
                  ) : isAccepted ? (
                    <Link
                      to="/contracts"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      View Active Contract
                    </Link>
                  ) : (
                    <div className="text-center text-xs text-slate-400 py-1 font-medium">
                      Proposal Rejected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
