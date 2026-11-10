
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const getId = (item) => {
  if (!item) return '';
  if (typeof item === 'object') return String(item._id || item.id || '');
  return String(item);
};

const formatMoney = (value) => Number(value || 0).toLocaleString();

export default function PaymentManagementPage() {
  const { isReviewer, isAdmin } = useAuth();

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [reviewPaymentModal, setReviewPaymentModal] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('approve');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [receiptPayment, setReceiptPayment] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const [payRes, statRes] = await Promise.all([
        api.get(`/payments?${params.toString()}`),
        api.get('/payments/stats')
      ]);

      if (payRes.data.success) {
        setPayments(payRes.data.payments || []);
      }

      if (statRes.data.success) {
        setStats(statRes.data.stats || {});
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError(err.response?.data?.message || 'Unable to load payment records.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewPaymentModal) return;

    if (!reviewerNotes.trim()) {
      alert('Please enter auditor review notes.');
      return;
    }

    setSubmittingReview(true);

    try {
      const paymentId = getId(reviewPaymentModal);

      const res = await api.post(`/payments/${paymentId}/review`, {
        action: reviewDecision,
        reviewerNotes: reviewerNotes.trim()
      });

      if (res.data.success) {
        alert(res.data.message || 'Payment review completed successfully.');
        setReviewPaymentModal(null);
        setReviewerNotes('');
        await fetchPayments();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process payment review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const canReview = isReviewer || isAdmin;

  const getProjectTitle = (payment) => {
    return payment.contract?.project?.title ||
      payment.project?.title ||
      `Contract #${getId(payment.contractId) || 'N/A'}`;
  };

  const getMilestoneTitle = (payment) => {
    return payment.milestone?.title ||
      payment.milestoneId?.title ||
      'Deliverable Milestone';
  };

  const getPersonName = (person) => {
    if (!person) return 'N/A';
    if (typeof person === 'string') return person;
    return person.name || person.fullName || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-600" />
              Simulated Payment Management
            </h1>

            <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
              Simulated Escrow
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5">
            Audit milestone deliverables, verify escrow funds, and authorize simulated disbursements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Volume</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            ${formatMoney(stats?.totalAmount)}
          </p>
          <span className="text-[10px] text-slate-500">
            {stats?.totalTransactions || 0} transactions
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Approved & Disbursed</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">
            ${formatMoney(stats?.approvedAmount)}
          </p>
          <span className="text-[10px] text-emerald-600">
            {stats?.approvedCount || 0} payouts
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Review</span>
          <p className="text-xl font-extrabold text-amber-700 mt-1">
            ${formatMoney(stats?.pendingAmount)}
          </p>
          <span className="text-[10px] text-amber-600">
            {stats?.pendingCount || 0} awaiting sign-off
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Rejected Claims</span>
          <p className="text-xl font-extrabold text-rose-700 mt-1">
            ${formatMoney(stats?.rejectedAmount)}
          </p>
          <span className="text-[10px] text-rose-600">
            {stats?.rejectedCount || 0} claims
          </span>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          {['all', 'Pending Review', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'all' ? 'All Transactions' : status}
            </button>
          ))}
        </div>

        <span className="text-slate-400 text-[11px] font-medium">
          Showing {payments.length} payment records
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading payment records...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-rose-600">{error}</p>
            <button
              onClick={fetchPayments}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No payments found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Project & Milestone</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Client → Freelancer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reviewer Details</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((payment) => {
                  const paymentId = getId(payment);

                  return (
                    <tr key={paymentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-800 text-[11px]">
                        {payment.transactionId || paymentId}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">
                          {getProjectTitle(payment)}
                        </p>
                        <span className="text-[11px] text-slate-500">
                          {getMilestoneTitle(payment)}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-extrabold text-slate-900 text-sm">
                        ${formatMoney(payment.amount)}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        <span className="font-medium text-slate-800">
                          {getPersonName(payment.client || payment.clientId)}
                        </span>
                        <span className="text-slate-400 mx-1">→</span>
                        <span className="font-medium text-slate-800">
                          {getPersonName(payment.freelancer || payment.freelancerId)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={payment.status} size="xs" />
                      </td>

                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {payment.reviewer || payment.reviewerId ? (
                          <div>
                            <p className="font-semibold text-slate-700">
                              {getPersonName(payment.reviewer || payment.reviewerId)}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              {payment.reviewedAt
                                ? new Date(payment.reviewedAt).toLocaleDateString()
                                : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium">
                            Pending Auditor
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setReceiptPayment(payment)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
                          >
                            Receipt
                          </button>

                          {canReview && payment.status === 'Pending Review' && (
                            <button
                              onClick={() => {
                                setReviewPaymentModal(payment);
                                setReviewDecision('approve');
                                setReviewerNotes('');
                              }}
                              className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Review
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewPaymentModal && (
        <Modal
          isOpen={!!reviewPaymentModal}
          onClose={() => setReviewPaymentModal(null)}
          title="Review & Audit Simulated Payment"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">
                  {reviewPaymentModal.transactionId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Payment Amount:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ${formatMoney(reviewPaymentModal.amount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Milestone:</span>
                <span className="font-semibold text-slate-800 text-right">
                  {getMilestoneTitle(reviewPaymentModal)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Auditor Decision *
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewDecision('approve')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewDecision === 'approve'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Approve Payout
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Disburses simulated funds to freelancer
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewDecision('reject')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reviewDecision === 'reject'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-500/20'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Reject Claim
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Declines payout with review notes
                  </p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Auditor Audit Notes *
              </label>
              <textarea
                required
                rows={3}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter the reason for your decision..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-primary-500 text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewPaymentModal(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submittingReview}
                className={`px-4 py-2 text-white font-semibold rounded-xl disabled:opacity-50 ${
                  reviewDecision === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submittingReview
                  ? 'Processing...'
                  : reviewDecision === 'approve'
                    ? 'Sign Off & Disburse'
                    : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {receiptPayment && (
        <Modal
          isOpen={!!receiptPayment}
          onClose={() => setReceiptPayment(null)}
          title="Simulated Payment Receipt"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-900 text-white rounded-xl text-center space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                LanceHub Escrow Receipt
              </span>
              <p className="text-2xl font-black tracking-tight">
                ${formatMoney(receiptPayment.amount)}
              </p>
              <span className="inline-block mt-1 font-mono text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {receiptPayment.transactionId || getId(receiptPayment)}
              </span>
            </div>

            <div className="divide-y divide-slate-100 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-700">
              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <StatusBadge status={receiptPayment.status} size="xs" />
              </div>

              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Project:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {getProjectTitle(receiptPayment)}
                </span>
              </div>

              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Milestone:</span>
                <span className="font-semibold text-slate-900">
                  {getMilestoneTitle(receiptPayment)}
                </span>
              </div>

              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Payer (Client):</span>
                <span className="font-semibold text-slate-900">
                  {getPersonName(receiptPayment.client || receiptPayment.clientId)}
                </span>
              </div>

              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Recipient (Freelancer):</span>
                <span className="font-semibold text-slate-900">
                  {getPersonName(receiptPayment.freelancer || receiptPayment.freelancerId)}
                </span>
              </div>

              <div className="py-2 flex justify-between">
                <span className="text-slate-400">Reviewed By:</span>
                <span className="font-semibold text-slate-900">
                  {getPersonName(receiptPayment.reviewer || receiptPayment.reviewerId)}
                </span>
              </div>

              {receiptPayment.reviewerNotes && (
                <div className="py-2 flex flex-col gap-0.5">
                  <span className="text-slate-400">Auditor Notes:</span>
                  <span className="font-medium text-slate-700">
                    {receiptPayment.reviewerNotes}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setReceiptPayment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
