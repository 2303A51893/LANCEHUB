
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  ArrowLeft,
  PlusCircle,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileCheck2,
  DollarSign
} from 'lucide-react';

const getId = (item) => {
  if (!item) return '';
  if (typeof item === 'object') return String(item._id || item.id || '');
  return String(item);
};

const formatMoney = (value) => Number(value || 0).toLocaleString();

const formatDate = (value) => {
  if (!value) return 'Not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const getName = (person) => {
  if (!person) return 'N/A';
  if (typeof person === 'string') return person;
  return person.name || 'N/A';
};

export default function MilestoneDeliverablesPage() {
  const { id } = useParams();
  const { user, isClient, isFreelancer, isAdmin } = useAuth();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreateMilestoneOpen, setIsCreateMilestoneOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: ''
  });
  const [creatingMilestone, setCreatingMilestone] = useState(false);

  const [selectedMilestoneForDeliverable, setSelectedMilestoneForDeliverable] = useState(null);
  const [deliverableForm, setDeliverableForm] = useState({
    submissionNotes: '',
    fileUrl: ''
  });
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);

  const [selectedDeliverableForReview, setSelectedDeliverableForReview] = useState(null);
  const [reviewAction, setReviewAction] = useState('approve');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchContractDetails = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/contracts/${id}`);

      if (res.data.success) {
        setContract(res.data.contract || null);
      } else {
        setContract(null);
        setError(res.data.message || 'Unable to load contract details.');
      }
    } catch (err) {
      console.error('Contract fetch error:', err);
      setContract(null);
      setError(err.response?.data?.message || 'Failed to load contract details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContractDetails();
  }, [fetchContractDetails]);

  const handleCreateMilestone = async (e) => {
    e.preventDefault();

    const contractId = getId(contract);

    if (!contractId) {
      alert('Contract ID is missing.');
      return;
    }

    const amount = Number(milestoneForm.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Enter a valid milestone amount.');
      return;
    }

    setCreatingMilestone(true);

    try {
      const res = await api.post('/milestones', {
        contractId,
        title: milestoneForm.title.trim(),
        description: milestoneForm.description.trim(),
        amount,
        dueDate: milestoneForm.dueDate
      });

      if (res.data.success) {
        alert('Milestone created successfully!');
        setIsCreateMilestoneOpen(false);
        setMilestoneForm({
          title: '',
          description: '',
          amount: '',
          dueDate: ''
        });
        await fetchContractDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create milestone.');
    } finally {
      setCreatingMilestone(false);
    }
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();

    if (!selectedMilestoneForDeliverable) return;

    const milestoneId = getId(selectedMilestoneForDeliverable);

    if (!milestoneId) {
      alert('Milestone ID is missing.');
      return;
    }

    if (!deliverableForm.submissionNotes.trim()) {
      alert('Please enter submission notes.');
      return;
    }

    setSubmittingDeliverable(true);

    try {
      const res = await api.post(
        `/milestones/${milestoneId}/deliverables`,
        {
          submissionNotes: deliverableForm.submissionNotes.trim(),
          fileUrl: deliverableForm.fileUrl.trim()
        }
      );

      if (res.data.success) {
        alert('Deliverables submitted successfully for client review!');
        setSelectedMilestoneForDeliverable(null);
        setDeliverableForm({
          submissionNotes: '',
          fileUrl: ''
        });
        await fetchContractDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit deliverable.');
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  const handleReviewDeliverable = async (e) => {
    e.preventDefault();

    if (!selectedDeliverableForReview) return;

    const deliverableId = getId(selectedDeliverableForReview);

    if (!deliverableId) {
      alert('Deliverable ID is missing.');
      return;
    }

    if (!reviewFeedback.trim()) {
      alert('Please enter review feedback.');
      return;
    }

    setSubmittingReview(true);

    try {
      const res = await api.post(
        `/milestones/deliverables/${deliverableId}/review`,
        {
          action: reviewAction,
          feedback: reviewFeedback.trim(),
          revisionNotes: reviewFeedback.trim()
        }
      );

      if (res.data.success) {
        alert(res.data.message || 'Deliverable review completed.');
        setSelectedDeliverableForReview(null);
        setReviewFeedback('');
        await fetchContractDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review deliverable.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading milestone details...</span>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
        <p>{error || 'Contract not found.'}</p>
        <button
          onClick={fetchContractDetails}
          className="px-4 py-2 bg-primary-600 text-white rounded-xl"
        >
          Retry
        </button>
        <div>
          <Link to="/contracts" className="text-primary-600 hover:underline">
            Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  const currentUserId = getId(user);
  const clientId = getId(contract.client || contract.clientId);
  const freelancerId = getId(contract.freelancer || contract.freelancerId);

  const isClientOwner = (isClient && currentUserId === clientId) || isAdmin;
  const isAssignedFreelancer = (isFreelancer && currentUserId === freelancerId) || isAdmin;

  const milestones = contract.milestones || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/contracts"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                Contract #{getId(contract)} Milestones
              </span>
              <StatusBadge status={contract.status} size="xs" />
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {contract.project?.title || contract.projectId?.title || 'Contract Milestones'}
            </h1>
          </div>
        </div>

        {isClientOwner && (
          <button
            onClick={() => setIsCreateMilestoneOpen(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Add Milestone
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Client</span>
          <p className="font-bold text-slate-800 mt-0.5">
            {getName(contract.client || contract.clientId)}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Freelancer</span>
          <p className="font-bold text-slate-800 mt-0.5">
            {getName(contract.freelancer || contract.freelancerId)}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Contract Value</span>
          <p className="font-black text-slate-900 text-sm mt-0.5">
            ${formatMoney(contract.contractValue)}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Agreed Deadline</span>
          <p className="font-bold text-slate-800 mt-0.5">
            {formatDate(contract.endDate)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {milestones.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            No milestones configured for this contract.
            {isClientOwner && ' Click "Add Milestone" above to create one.'}
          </div>
        ) : (
          milestones.map((milestone, index) => {
            const milestoneId = getId(milestone);
            const deliverables = milestone.deliverables || [];
            const latestDeliverable = deliverables.length > 0
              ? deliverables[deliverables.length - 1]
              : null;
            const payment = milestone.payment || milestone.paymentId;

            return (
              <div
                key={milestoneId || index}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary-50 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0 border border-primary-100">
                      {index + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">
                          {milestone.title}
                        </h3>
                        <StatusBadge status={milestone.status} size="xs" />
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        {milestone.description || 'Deliverable milestone'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 self-start sm:self-auto shrink-0 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Amount</span>
                      <p className="font-bold text-slate-900">
                        ${formatMoney(milestone.amount)}
                      </p>
                    </div>

                    <div className="h-5 w-px bg-slate-200" />

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Due Date</span>
                      <p className="font-semibold text-slate-700">
                        {formatDate(milestone.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {milestone.status === 'Revision Requested' && milestone.revisionNotes && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Client Revision Feedback:</span>
                      <p className="mt-0.5">{milestone.revisionNotes}</p>
                    </div>
                  </div>
                )}

                {deliverables.length > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-primary-600" />
                      Submitted Deliverables History ({deliverables.length})
                    </span>

                    <div className="space-y-2">
                      {deliverables.map((deliverable, deliverableIndex) => {
                        const deliverableId = getId(deliverable);

                        return (
                          <div
                            key={deliverableId || deliverableIndex}
                            className="p-2.5 bg-white rounded-lg border border-slate-200/60 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1 min-w-0">
                              <p className="text-slate-800 font-medium">
                                {deliverable.submissionNotes}
                              </p>

                              {deliverable.fileUrl && (
                                <a
                                  href={deliverable.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary-600 hover:underline flex items-center gap-1 text-[11px] break-all"
                                >
                                  {deliverable.fileUrl}
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              )}

                              <span className="text-[10px] text-slate-400 block">
                                Submitted: {formatDate(deliverable.submissionDate)}
                              </span>

                              {(deliverable.clientFeedback || deliverable.feedback) && (
                                <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 mt-1">
                                  <span className="font-semibold text-slate-700">Client Note:</span>{' '}
                                  {deliverable.clientFeedback || deliverable.feedback}
                                </p>
                              )}
                            </div>

                            <StatusBadge status={deliverable.status} size="xs" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {payment && typeof payment === 'object' && (
                  <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl text-xs flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-teal-900 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-teal-600" />
                        Simulated Payment Status: {payment.status}
                      </span>

                      <p className="text-[11px] text-teal-700 mt-0.5">
                        Txn ID: <span className="font-mono">{payment.transactionId || 'N/A'}</span>
                        {' '}• Amount: ${formatMoney(payment.amount)}
                      </p>
                    </div>

                    <Link
                      to="/payments"
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg shadow-xs"
                    >
                      Audit Payment
                    </Link>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                  {isAssignedFreelancer &&
                    ['Pending', 'In Progress', 'Revision Requested'].includes(milestone.status) && (
                      <button
                        onClick={() => setSelectedMilestoneForDeliverable(milestone)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Submit Deliverables
                      </button>
                    )}

                  {isClientOwner &&
                    milestone.status === 'Deliverable Submitted' &&
                    latestDeliverable && (
                      <button
                        onClick={() => {
                          setSelectedDeliverableForReview(latestDeliverable);
                          setReviewAction('approve');
                          setReviewFeedback('');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Review & Approve Deliverable
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={isCreateMilestoneOpen}
        onClose={() => setIsCreateMilestoneOpen(false)}
        title="Add Contract Milestone"
      >
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Milestone Title *
            </label>
            <input
              type="text"
              required
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              placeholder="e.g. Security Audit & Testing"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Release Amount ($) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={milestoneForm.amount}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, amount: e.target.value })}
                placeholder="1200"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={milestoneForm.dueDate}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Deliverable Description & Specifications
            </label>
            <textarea
              rows={3}
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              placeholder="Describe what must be completed and tested..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateMilestoneOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creatingMilestone}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl disabled:opacity-50"
            >
              {creatingMilestone ? 'Adding...' : 'Create Milestone'}
            </button>
          </div>
        </form>
      </Modal>

      {selectedMilestoneForDeliverable && (
        <Modal
          isOpen={!!selectedMilestoneForDeliverable}
          onClose={() => setSelectedMilestoneForDeliverable(null)}
          title={`Submit Deliverables: ${selectedMilestoneForDeliverable.title}`}
        >
          <form onSubmit={handleSubmitDeliverable} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Deliverable Notes & Summary *
              </label>
              <textarea
                required
                rows={4}
                value={deliverableForm.submissionNotes}
                onChange={(e) => setDeliverableForm({ ...deliverableForm, submissionNotes: e.target.value })}
                placeholder="Describe what has been delivered and tested..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Repository / Deliverable URL (Optional)
              </label>
              <input
                type="url"
                value={deliverableForm.fileUrl}
                onChange={(e) => setDeliverableForm({ ...deliverableForm, fileUrl: e.target.value })}
                placeholder="https://github.com/organization/repo"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-primary-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedMilestoneForDeliverable(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submittingDeliverable}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-xl disabled:opacity-50 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                {submittingDeliverable ? 'Submitting...' : 'Send for Client Review'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedDeliverableForReview && (
        <Modal
          isOpen={!!selectedDeliverableForReview}
          onClose={() => setSelectedDeliverableForReview(null)}
          title="Review Submitted Deliverables"
        >
          <form onSubmit={handleReviewDeliverable} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-700 uppercase text-[10px]">
                Freelancer Submission Notes
              </span>

              <p className="text-slate-800">
                {selectedDeliverableForReview.submissionNotes}
              </p>

              {selectedDeliverableForReview.fileUrl && (
                <a
                  href={selectedDeliverableForReview.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 hover:underline flex items-center gap-1 text-[11px] mt-1 break-all"
                >
                  {selectedDeliverableForReview.fileUrl}
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-2 text-[10px]">
                Decision Action *
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewAction('approve')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewAction === 'approve'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Approve Work
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Routes simulated payment to Payment Reviewer
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewAction('revision')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewAction === 'revision'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-500/20'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Request Revision
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Sends notes back to freelancer
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">
                Review Feedback / Revision Notes *
              </label>

              <textarea
                required
                rows={3}
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder={
                  reviewAction === 'approve'
                    ? 'Excellent work, all specifications met.'
                    : 'Please describe what needs to be corrected.'
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-primary-500 text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedDeliverableForReview(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submittingReview}
                className={`px-4 py-2 text-white font-semibold rounded-xl disabled:opacity-50 ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {submittingReview
                  ? 'Processing...'
                  : reviewAction === 'approve'
                    ? 'Confirm Approval'
                    : 'Send Revision Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
