
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Star
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

const formatDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString();
};

export default function ContractManagementPage() {
  const { user, isClient } = useAuth();

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');

  const [ratingModalContract, setRatingModalContract] = useState(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [commentVal, setCommentVal] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const [updatingContractId, setUpdatingContractId] = useState('');

  const currentUserId = getId(user);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (submittedSearch.trim()) {
        params.append('search', submittedSearch.trim());
      }

      const query = params.toString();
      const res = await api.get(`/contracts${query ? `?${query}` : ''}`);

      if (!res.data?.success) {
        throw new Error('Unable to retrieve contracts.');
      }

      setContracts(
        Array.isArray(res.data.contracts) ? res.data.contracts : []
      );
    } catch (err) {
      console.error('Failed to load contracts:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load contracts. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, submittedSearch]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearch(search.trim());
  };

  const handleMarkCompleted = async (contractId) => {
    if (
      !window.confirm(
        'Mark this contract as completed? All milestone deliverables should be approved.'
      )
    ) {
      return;
    }

    try {
      setUpdatingContractId(contractId);

      const res = await api.patch(`/contracts/${contractId}/status`, {
        status: 'Completed'
      });

      if (!res.data?.success) {
        throw new Error('Unable to update contract status.');
      }

      alert('Contract marked as Completed!');
      await fetchContracts();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        'Failed to update contract status.'
      );
    } finally {
      setUpdatingContractId('');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    const contractId = getId(ratingModalContract);

    if (!contractId) {
      alert('Contract ID is missing.');
      return;
    }

    if (!commentVal.trim()) {
      alert('Please enter your feedback.');
      return;
    }

    try {
      setSubmittingRating(true);

      const res = await api.post('/feedback', {
        contractId,
        rating: ratingVal,
        comment: commentVal.trim()
      });

      if (!res.data?.success) {
        throw new Error('Feedback submission failed.');
      }

      alert('Feedback and rating submitted successfully!');

      setRatingModalContract(null);
      setCommentVal('');
      setRatingVal(5);

      await fetchContracts();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit feedback.'
      );
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-600" />
            Contract Management
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Monitor active agreements, track milestone completion, and manage simulated financial disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <span>Tracked Contracts:</span>
          <span className="text-primary-600 font-bold">
            {contracts.length}
          </span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project title..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium">
            Status:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>

          <button
            type="button"
            onClick={fetchContracts}
            className="text-xs font-semibold underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading contracts...</span>
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No contracts found. Contracts are generated automatically when a client accepts a proposal.
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => {
            const contractId = getId(contract);
            const milestones = Array.isArray(contract.milestones)
              ? contract.milestones
              : [];

            const completedMilestones = milestones.filter(
              (milestone) =>
                milestone.status === 'Approved' ||
                milestone.status === 'Paid'
            ).length;

            const progress =
              milestones.length > 0
                ? Math.round(
                    (completedMilestones / milestones.length) * 100
                  )
                : 0;

            const client = contract.client || contract.clientId;
            const freelancer =
              contract.freelancer || contract.freelancerId;
            const project = contract.project || contract.projectId;

            const isClientOwner =
              isClient && currentUserId === getId(client);

            return (
              <div
                key={contractId}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                        Contract #{contractId.slice(-8)}
                      </span>

                      <StatusBadge status={contract.status} size="xs" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {project?.title || 'Project'}
                    </h3>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Client:{' '}
                      <span className="font-semibold text-slate-700">
                        {client?.name || 'N/A'}
                      </span>
                      {' • '}
                      Freelancer:{' '}
                      <span className="font-semibold text-slate-700">
                        {freelancer?.name || 'N/A'}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-baseline md:items-end justify-between md:justify-start gap-6 bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        Contract Value
                      </span>

                      <p className="text-lg font-black text-slate-900">
                        {formatMoney(contract.contractValue)}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        Timeline
                      </span>

                      <p className="text-xs font-semibold text-slate-700">
                        {formatDate(contract.startDate)}
                        {' → '}
                        {contract.endDate
                          ? formatDate(contract.endDate)
                          : 'Ongoing'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600">
                      Milestones Progress:{' '}
                      <span className="font-bold text-slate-900">
                        {completedMilestones} of {milestones.length} completed
                      </span>
                    </span>

                    <span className="text-primary-600 font-bold">
                      {progress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 text-[11px] truncate max-w-md">
                    Terms:{' '}
                    <span className="text-slate-700 font-medium">
                      {contract.terms || 'Standard freelance terms.'}
                    </span>
                  </span>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    <Link
                      to={`/contracts/${contractId}`}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Manage Milestones ({milestones.length})
                    </Link>

                    {isClientOwner && contract.status === 'Active' && (
                      <button
                        type="button"
                        disabled={updatingContractId === contractId}
                        onClick={() => handleMarkCompleted(contractId)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {updatingContractId === contractId
                          ? 'Updating...'
                          : 'Mark Completed'}
                      </button>
                    )}

                    {isClientOwner && contract.status === 'Completed' && (
                      <button
                        type="button"
                        onClick={() => {
                          setRatingModalContract(contract);
                          setRatingVal(5);
                          setCommentVal('');
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        Rate Freelancer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ratingModalContract && (
        <Modal
          isOpen={!!ratingModalContract}
          onClose={() => setRatingModalContract(null)}
          title={`Rate & Review ${
            (ratingModalContract.freelancer ||
              ratingModalContract.freelancerId)?.name || 'Freelancer'
          }`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Star Rating (1 to 5)
              </label>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingVal(star)}
                    className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingVal
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}

                <span className="text-xs font-bold text-amber-700 ml-2">
                  {ratingVal} of 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Written Feedback & Review *
              </label>

              <textarea
                required
                rows={4}
                value={commentVal}
                onChange={(e) => setCommentVal(e.target.value)}
                placeholder="Share your experience working with this freelancer, code quality, communication, and adherence to deadlines..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRatingModalContract(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submittingRating}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {submittingRating
                  ? 'Submitting...'
                  : 'Post Verified Rating'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
