import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-base font-semibold text-slate-700 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">
        The application route or screen you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
      >
        <Home className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
}

