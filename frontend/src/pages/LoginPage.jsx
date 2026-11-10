
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import {
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionExpired = searchParams.get('expired');

  // Standard login
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError('');
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Demo account login
  const handleDemoClick = async (demoRole) => {
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      await quickLogin(demoRole);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Demo login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-brand-500 items-center justify-center text-white shadow-lg shadow-primary-500/30 mb-3">
          <Briefcase className="w-6 h-6" />
        </div>

        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          LanceHub
        </h2>

        <p className="mt-1 text-sm text-slate-300">
          Freelancer Project Bidding & Contract Management Platform
        </p>

        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <span className="font-semibold text-primary-400">
            Project #46
          </span>
          <span>•</span>
          <span>GUNDA VENKATARAMANA (2303A51893)</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">

          {sessionExpired && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Your session has expired. Please sign in again.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Account Login */}
          <div className="mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary-600" />
                Instant Role Demo Login
              </span>

              <span className="text-[11px] text-slate-400">
                Click to enter as:
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoClick(account.role)}
                  className="flex flex-col items-start p-2.5 text-left rounded-xl border border-slate-200 hover:border-primary-400 hover:bg-primary-50/40 transition-all text-xs group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-slate-800 group-hover:text-primary-700 capitalize">
                      {account.role.replace('_', ' ')}
                    </span>

                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  <span className="text-[11px] text-slate-500 mt-0.5 truncate w-full">
                    {account.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Standard Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>

              <div className="relative rounded-lg shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>

                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-sm placeholder-slate-400 focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>

              <div className="relative rounded-lg shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>

                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-sm placeholder-slate-400 focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Register here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
