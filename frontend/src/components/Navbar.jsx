
import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
  LogOut,
  RefreshCw,
  ChevronDown,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, quickLogin } = useAuth();

  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [switching, setSwitching] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.role-switcher')) {
        setShowRoleSwitcher(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRoleSwitch = async (role) => {
    if (switching || user?.role === role) {
      setShowRoleSwitcher(false);
      return;
    }

    setSwitching(true);

    try {
      await quickLogin(role);
      setShowRoleSwitcher(false);
      navigate('/');
    } catch (error) {
      console.error('Role switching failed:', error);
      alert(error.response?.data?.message || 'Unable to switch account.');
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary-600 to-brand-600 flex items-center justify-center text-white shadow-sm shadow-primary-500/20">
            <Briefcase className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                LanceHub
              </span>

              <span className="hidden sm:inline-flex text-[10px] font-semibold bg-primary-50 text-primary-700 border border-primary-200 px-2 py-0.5 rounded-full">
                Project #46
              </span>
            </div>

            <p className="text-[11px] text-slate-500 hidden md:block">
              Student: Gunda Venkataramana (2303A51893)
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">

        <div className="relative role-switcher">
          <button
            type="button"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            disabled={switching}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
            title="Switch demo account"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                switching ? 'animate-spin text-primary-600' : 'text-slate-500'
              }`}
            />

            <span className="hidden sm:inline">
              Switch Role
            </span>

            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">

              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Quick Demo Switcher
              </div>

              {DEMO_ACCOUNTS.map((account) => (
                <button
                  type="button"
                  key={account.role}
                  disabled={switching}
                  onClick={() => handleRoleSwitch(account.role)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex flex-col gap-0.5 hover:bg-slate-50 transition-colors disabled:opacity-50 ${
                    user?.role === account.role
                      ? 'bg-primary-50/60 font-semibold text-primary-700'
                      : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{account.label}</span>

                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {account.role}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            }
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />

          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              {user?.name}
            </span>

            <span className="text-[10px] text-slate-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
