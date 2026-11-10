
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  Code,
  AlertCircle
} from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'freelancer',
    phone: '',
    title: 'Full Stack Engineer',
    hourlyRate: '35',
    companyName: '',
    industry: 'Technology'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((previous) => ({
      ...previous,
      role
    }));

    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError('');

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (name.length < 2) {
      setError('Please enter a valid full name.');
      return;
    }

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    const hourlyRate = Number(formData.hourlyRate);

    if (
      formData.role === 'freelancer' &&
      (
        formData.hourlyRate.trim() === '' ||
        !Number.isFinite(hourlyRate) ||
        hourlyRate < 0
      )
    ) {
      setError('Please enter a valid hourly rate.');
      return;
    }

    if (
      formData.role === 'freelancer' &&
      !formData.title.trim()
    ) {
      setError('Please enter your professional title.');
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        name,
        email,
        password,
        role: formData.role,
        phone: formData.phone.trim()
      };

      if (formData.role === 'freelancer') {
        registrationData.title = formData.title.trim();
        registrationData.hourlyRate = hourlyRate;
      }

      if (formData.role === 'client') {
        registrationData.companyName = formData.companyName.trim();
        registrationData.industry = formData.industry.trim();
      }

      await register(registrationData);

      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.'
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
          Create Account
        </h2>

        <p className="mt-1 text-sm text-slate-300">
          Join LanceHub to post projects or bid on contracts
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                I want to join as:
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'freelancer',
                    label: 'Freelancer',
                    desc: 'Find work & bid'
                  },
                  {
                    id: 'client',
                    label: 'Client',
                    desc: 'Post projects & hire'
                  }
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    disabled={loading}
                    onClick={() => handleRoleChange(role.id)}
                    className={`p-3 rounded-xl border text-left transition-all disabled:opacity-50 ${
                      formData.role === role.id
                        ? 'border-primary-500 bg-primary-50 text-primary-900 font-semibold ring-2 ring-primary-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">
                      {role.label}
                    </div>

                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {role.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>

                  <input
                    type="text"
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="block w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>

                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="block w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>

                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    className="block w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>

                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="block w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>
            </div>

            {formData.role === 'freelancer' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-primary-600" />
                  Freelancer Profile Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Professional Title
                    </label>

                    <input
                      type="text"
                      name="title"
                      maxLength={100}
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. React Developer"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Hourly Rate ($USD)
                    </label>

                    <input
                      type="number"
                      name="hourlyRate"
                      min="0"
                      step="0.01"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'client' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-primary-600" />
                  Organization Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Company / Team Name
                    </label>

                    <input
                      type="text"
                      name="companyName"
                      maxLength={150}
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Acme Tech Labs"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Industry
                    </label>

                    <input
                      type="text"
                      name="industry"
                      maxLength={100}
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="e.g. Technology"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700"
            >
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
