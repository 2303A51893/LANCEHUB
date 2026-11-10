
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Send,
  Edit,
  Trash2,
  Star,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const getId = (item) => {
  if (!item) return '';
  if (typeof item === 'object') return String(item._id || item.id || '');
  return String(item);
};

const formatAmount = (amount) => {
  const value = Number(amount);
  return Number.isFinite(value) ? value.toLocaleString('en-US') : '0';
};

const formatDate = (date) => {
  if (!date) return 'Not specified';
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? 'Not specified'
    : parsedDate.toLocaleDateString();
};

const formatSkills = (skills) => {
  if (Array.isArray(skills)) return skills;
  if (!skills) return [];

  if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills);
      if (Array.isArray(parsed)) return parsed;
    } catch (error) {
      return skills
        .replace(/[\[\]"*]/g, '')
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
    }
  }

  return [];
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFreelancer, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [hasBidded, setHasBidded] = useState(false);
  const [userBid, setUserBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidForm, setBidForm] = useState({
    bidAmount: '',
    deliveryDays: '14',
    coverLetter: ''
  });

  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');

  const [processingBidId, setProcessingBidId] = useState('');

  const fetchProjectDetails = useCallback(async () => {
    setLoading(true);
    setPageError('');

    try {
      const res = await api.get(`/projects/${id}`);

      if (res.data.success) {
        setProject(res.data.project || null);
        setBids(Array.isArray(res.data.bids) ? res.data.bids : []);
        setHasBidded(Boolean(res.data.hasBidded));
        setUserBid(res.data.userBid || null);
      } else {
        setProject(null);
        setPageError(res.data.message || 'Unable to load project details.');
      }
    } catch (err) {
      console.error('Failed to fetch project details:', err);

      setProject(null);
      setPageError(
        err.response?.data?.message ||
        'Failed to load project details. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidError('');
    setBidSuccess('');

    const bidAmount = Number(bidForm.bidAmount);
    const deliveryDays = Number(bidForm.deliveryDays);

    if (!Number.isFinite(bidAmount) || bidAmount < 10) {
      setBidError('Please enter a valid bid amount of at least $10.');
      return;
    }

    if (!Number.isInteger(deliveryDays) || deliveryDays < 1) {
      setBidError('Please enter a valid delivery period of at least 1 day.');
      return;
    }

    if (!bidForm.coverLetter.trim()) {
      setBidError('Please enter your cover letter.');
      return;
    }

    setSubmittingBid(true);

    try {
      const projectId = getId(project) || id;

      const res = await api.post('/bids', {
        projectId,
        bidAmount,
        deliveryDays,
        coverLetter: bidForm.coverLetter.trim()
      });

      if (res.data.success) {
        setBidSuccess('Proposal submitted successfully!');
        setHasBidded(true);
        setUserBid(res.data.bid || null);

        setTimeout(() => {
          setIsBidModalOpen(false);
          setBidForm({
            bidAmount: '',
            deliveryDays: '14',
            coverLetter: ''
          });
          fetchProjectDetails();
        }, 1000);
      } else {
        setBidError(res.data.message || 'Failed to submit proposal.');
      }
    } catch (err) {
      setBidError(
        err.response?.data?.message ||
        'Failed to submit proposal. Please try again.'
      );
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (!window.confirm(
      'Accept this proposal? This will generate a formal contract and set other bids to Rejected.'
    )) {
      return;
    }

    setProcessingBidId(bidId);

    try {
      const res = await api.post(`/bids/${bidId}/accept`);

      if (res.data.success) {
        alert('Proposal accepted! Contract generated successfully.');

        const contractId = getId(res.data.contract);

        if (contractId) {
          navigate(`/contracts/${contractId}`);
        } else {
          navigate('/contracts');
        }
      } else {
        alert(res.data.message || 'Failed to accept proposal.');
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Failed to accept bid. Please try again.'
      );
    } finally {
      setProcessingBidId('');
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!window.confirm('Reject this proposal?')) {
      return;
    }

    setProcessingBidId(bidId);

    try {
      const res = await api.post(`/bids/${bidId}/reject`);

      if (res.data.success) {
        await fetchProjectDetails();
      } else {
        alert(res.data.message || 'Failed to reject proposal.');
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Failed to reject bid. Please try again.'
      );
    } finally {
      setProcessingBidId('');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(
      'Are you sure you want to delete this project listing?'
    )) {
      return;
    }

    try {
      const projectId = getId(project) || id;
      const res = await api.delete(`/projects/${projectId}`);

      if (res.data.success) {
        navigate('/projects');
      } else {
        alert(res.data.message || 'Failed to delete project.');
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Failed to delete project.'
      );
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />

        <p className="text-sm font-semibold text-slate-800">
          Project not found
        </p>

        <p className="text-xs text-slate-500">
          {pageError || 'This project may have been deleted or is unavailable.'}
        </p>

        <button
          type="button"
          onClick={fetchProjectDetails}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>

        <div>
          <Link
            to="/projects"
            className="text-xs text-primary-600 font-semibold hover:underline"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const projectId = getId(project) || id;
  const client = project.client || project.clientId || {};
  const clientId = getId(client);
  const contract = project.contract || project.contractId;
  const contractId = getId(contract);

  const isOwner = Boolean(user) && getId(user) === clientId;
  const canEditOrDelete = isOwner || isAdmin;

  const skills = formatSkills(project.skillsRequired);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      <div className="flex items-center justify-between gap-3">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project Listings
        </Link>

        {canEditOrDelete && project.status === 'Open' && (
          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${projectId}/edit`}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Link>

            <button
              type="button"
              onClick={handleDeleteProject}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
                {project.category || 'General'}
              </span>

              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Scope: {project.scope || 'Not specified'}
              </span>

              <StatusBadge status={project.status || 'Open'} size="xs" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {project.title || 'Untitled Project'}
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Posted on {formatDate(project.createdAt)} by{' '}
              <span className="text-slate-700 font-semibold">
                {client.name || 'Private Client'}
              </span>
            </p>
          </div>

          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start bg-slate-50 p-4 rounded-xl border border-slate-100 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Project Budget
            </span>

            <span className="text-2xl font-black text-slate-900">
              ${formatAmount(project.budget)}
            </span>

            <span className="text-[11px] text-slate-500 mt-0.5">
              Fixed Price
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Deadline
            </span>

            <p className="font-semibold text-slate-800 mt-0.5">
              {formatDate(project.deadline)}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Client Org
            </span>

            <p className="font-semibold text-slate-800 mt-0.5">
              {client.clientProfile?.companyName ||
                client.companyName ||
                'Private Client'}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Proposals Count
            </span>

            <p className="font-semibold text-primary-600 mt-0.5">
              {project.bidsCount ?? project.bidCount ?? bids.length} bids
            </p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Contract Status
            </span>

            <p className="font-semibold text-slate-800 mt-0.5">
              {contractId ? (
                <Link
                  to={`/contracts/${contractId}`}
                  className="text-primary-600 hover:underline"
                >
                  View Contract
                </Link>
              ) : (
                'None'
              )}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Project Overview & Scope
          </h3>

          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {project.description || 'No project description available.'}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Required Skills & Tech Stack
          </h3>

          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg"
                >
                  {String(skill).trim()}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">
                No specific skills listed.
              </span>
            )}
          </div>
        </div>

        {isFreelancer && project.status === 'Open' && (
          <div className="pt-4 border-t border-slate-100">
            {hasBidded ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                    <span className="text-xs font-bold text-emerald-900">
                      Your Proposal Has Been Submitted
                    </span>

                    <StatusBadge
                      status={userBid?.status || 'Pending'}
                      size="xs"
                    />
                  </div>

                  <p className="text-xs text-emerald-700 mt-1">
                    Bid Amount:{' '}
                    <span className="font-bold">
                      ${formatAmount(userBid?.bidAmount)}
                    </span>
                    {' '}• Delivery in:{' '}
                    <span className="font-bold">
                      {userBid?.deliveryDays || 0} days
                    </span>
                  </p>
                </div>

                <Link
                  to="/bids"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  View My Bids
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-primary-50/60 rounded-xl border border-primary-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Interested in working on this project?
                  </h4>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Submit your custom proposal, quote, and delivery timeframe.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBidError('');
                    setBidSuccess('');
                    setIsBidModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Proposal
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {(isOwner || isAdmin) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Candidate Proposals ({bids.length})
              </h3>

              <p className="text-xs text-slate-500">
                Review, compare, and accept freelancer bids for this project.
              </p>
            </div>

            {bids.length > 1 && (
              <Link
                to={`/projects/${projectId}/compare`}
                className="px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Compare Side-by-Side
              </Link>
            )}
          </div>

          {bids.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No freelancer proposals have been submitted for this project yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bids.map((bid) => {
                const bidId = getId(bid);
                const freelancer = bid.freelancer || bid.freelancerId || {};
                const profile = freelancer.freelancerProfile || {};

                return (
                  <div key={bidId} className="py-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                          {(freelancer.name || 'F').charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-xs">
                              {freelancer.name || 'Freelancer'}
                            </h4>

                            <span className="flex items-center gap-0.5 text-amber-600 font-bold text-xs">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {profile.rating ?? 'N/A'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400">
                            {profile.title || 'Freelancer'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900">
                            ${formatAmount(bid.bidAmount)}
                          </span>

                          <p className="text-[10px] text-slate-400">
                            {bid.deliveryDays || 0} days delivery
                          </p>
                        </div>

                        <StatusBadge status={bid.status} size="xs" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                      {bid.coverLetter || 'No cover letter provided.'}
                    </p>

                    {project.status === 'Open' && bid.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          disabled={processingBidId === bidId}
                          onClick={() => handleRejectBid(bidId)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          disabled={processingBidId === bidId}
                          onClick={() => handleAcceptBid(bidId)}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {processingBidId === bidId
                            ? 'Processing...'
                            : 'Accept Proposal & Create Contract'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isBidModalOpen}
        onClose={() => {
          if (!submittingBid) setIsBidModalOpen(false);
        }}
        title={`Submit Proposal for "${project.title || 'Project'}"`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleBidSubmit} className="space-y-4">

          {bidError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{bidError}</span>
            </div>
          )}

          {bidSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{bidSuccess}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Project Budget Benchmark:
            </span>

            <span className="font-bold text-slate-900">
              ${formatAmount(project.budget)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Bid Amount ($) *
              </label>

              <input
                type="number"
                required
                min="10"
                step="1"
                value={bidForm.bidAmount}
                onChange={(e) =>
                  setBidForm({ ...bidForm, bidAmount: e.target.value })
                }
                placeholder="e.g. 4200"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Est. Delivery Days *
              </label>

              <input
                type="number"
                required
                min="1"
                step="1"
                value={bidForm.deliveryDays}
                onChange={(e) =>
                  setBidForm({ ...bidForm, deliveryDays: e.target.value })
                }
                placeholder="14"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Cover Letter & Technical Approach *
            </label>

            <textarea
              required
              rows={5}
              value={bidForm.coverLetter}
              onChange={(e) =>
                setBidForm({ ...bidForm, coverLetter: e.target.value })
              }
              placeholder="Explain your technical strategy, relevant experience, tools to be used, and why you are the best fit for this project..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary-500 focus:outline-hidden leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={submittingBid}
              onClick={() => setIsBidModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submittingBid || Boolean(bidSuccess)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {submittingBid
                ? 'Submitting Proposal...'
                : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
