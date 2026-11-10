import React from 'react';

const statusConfig = {
  // Project & Contract
  'Open': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'Active': 'bg-blue-50 text-blue-700 border-blue-200',
  'Completed': 'bg-purple-50 text-purple-700 border-purple-200',
  'Cancelled': 'bg-slate-100 text-slate-600 border-slate-200',
  'Terminated': 'bg-rose-50 text-rose-700 border-rose-200',
  
  // Bids
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Accepted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',

  // Milestones & Deliverables
  'Deliverable Submitted': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Paid': 'bg-teal-50 text-teal-700 border-teal-200',
  'Revision Requested': 'bg-orange-50 text-orange-700 border-orange-200',
  'Submitted': 'bg-sky-50 text-sky-700 border-sky-200',

  // Payments
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',

  // Roles
  'admin': 'bg-rose-50 text-rose-700 border-rose-200',
  'client': 'bg-blue-50 text-blue-700 border-blue-200',
  'freelancer': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'payment_reviewer': 'bg-amber-50 text-amber-700 border-amber-200'
};

export default function StatusBadge({ status, size = 'sm', className = '' }) {
  const badgeStyle = statusConfig[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${badgeStyle} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {status}
    </span>
  );
}
