import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FolderGit2,
  PlusCircle,
  FileCheck2,
  Layers,
  CreditCard,
  BarChart3,
  Users,
  Shield,
  Briefcase
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, isClient, isFreelancer, isReviewer } = useAuth();

  const navigation = [
    {
      name: 'Main Dashboard',
      to: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'client', 'freelancer', 'payment_reviewer']
    },
    {
      name: 'Project Listing',
      to: '/projects',
      icon: FolderGit2,
      roles: ['admin', 'client', 'freelancer', 'payment_reviewer']
    },
    {
      name: 'Post New Project',
      to: '/projects/create',
      icon: PlusCircle,
      roles: ['client', 'admin']
    },
    {
      name: 'My Proposals & Bids',
      to: '/bids',
      icon: FileCheck2,
      roles: ['freelancer', 'admin']
    },
    {
      name: 'Contracts & Milestones',
      to: '/contracts',
      icon: Layers,
      roles: ['admin', 'client', 'freelancer', 'payment_reviewer']
    },
    {
      name: 'Payment Management',
      to: '/payments',
      icon: CreditCard,
      roles: ['admin', 'payment_reviewer', 'client', 'freelancer'],
      badge: isReviewer ? 'Review' : null
    },
    {
      name: 'Reports & Analytics',
      to: '/reports',
      icon: BarChart3,
      roles: ['admin', 'payment_reviewer', 'client', 'freelancer']
    },
    {
      name: 'User Management',
      to: '/users',
      icon: Users,
      roles: ['admin'],
      adminOnly: true
    }
  ];

  const filteredNav = navigation.filter(item =>
    item.roles.includes(user?.role || '')
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r border-slate-200/80 bg-white transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* User Role Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-primary-600 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Shield className="w-3 h-3 text-primary-600" />
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation Menu
            </div>
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs border border-primary-100'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      {item.badge}
                    </span>
                  )}
                  {item.adminOnly && (
                    <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                      Admin
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Project #46</span>
            <p className="truncate">Gunda Venkataramana</p>
            <p className="text-[10px] text-slate-400">Enrolment: 2303A51893</p>
          </div>
        </div>
      </aside>
    </>
  );
}

