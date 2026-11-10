
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Search, Filter, Shield, Star } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const getUserId = (user) => user?._id || user?.id;

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const query = params.toString();
      const res = await api.get(`/users${query ? `?${query}` : ''}`);

      if (res.data.success) {
        setUsers(
          Array.isArray(res.data.users) ? res.data.users : []
        );
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    const userId = getUserId(user);

    if (!userId || updatingId) {
      return;
    }

    setUpdatingId(userId);

    try {
      const res = await api.patch(`/users/${userId}/toggle-status`);

      if (res.data.success) {
        const newStatus = res.data.isActive;

        setUsers((previous) =>
          previous.map((u) =>
            String(getUserId(u)) === String(userId)
              ? { ...u, isActive: newStatus }
              : u
          )
        );

        setSelectedUser((previous) =>
          previous && String(getUserId(previous)) === String(userId)
            ? { ...previous, isActive: newStatus }
            : previous
        );
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Failed to update user status'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? 'N/A'
      : parsedDate.toLocaleDateString();
  };

  const formatMoney = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount.toLocaleString() : '0';
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            User Management
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Admin console: supervise client and freelancer accounts, manage roles, and control access.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <span>Total Managed Users:</span>
          <span className="text-primary-600 font-bold">
            {users.length}
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">

        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full md:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            Filter Role:
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-primary-500 focus:outline-hidden"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
            <option value="payment_reviewer">Payment Reviewer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-primary-500 focus:outline-hidden"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <span>Fetching user directory...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No users match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">User Profile</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Profile Stats</th>
                  <th className="px-4 py-3">Registered On</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
                {users.map((u) => {
                  const userId = getUserId(u);
                  const isFreelancer = u.role === 'freelancer';
                  const isClient = u.role === 'client';

                  const profile = isFreelancer
                    ? u.freelancerProfile
                    : isClient
                      ? u.clientProfile
                      : null;

                  return (
                    <tr
                      key={userId}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt={u.name || 'User'}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />

                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedUser(u)}
                              className="font-semibold text-slate-900 hover:text-primary-600 text-left"
                            >
                              {u.name}
                            </button>

                            <p className="text-[11px] text-slate-400">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={u.role} size="xs" />
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {isFreelancer && (
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-semibold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {profile?.rating ?? '5.0'}
                            </span>

                            <span>•</span>
                            <span>
                              {profile?.completedProjectsCount || 0} projects
                            </span>

                            <span>•</span>
                            <span>
                              ${profile?.hourlyRate || 35}/hr
                            </span>
                          </div>
                        )}

                        {isClient && (
                          <div>
                            <span className="font-semibold text-slate-800">
                              {profile?.companyName || 'Private Client'}
                            </span>

                            <span className="text-[10px] text-slate-400 ml-1">
                              ({profile?.totalProjectsPosted || 0} posted)
                            </span>
                          </div>
                        )}

                        {!isFreelancer && !isClient && (
                          <span className="text-slate-400">
                            — System Account —
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(u.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            disabled={String(updatingId) === String(userId)}
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                              u.isActive
                                ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                            }`}
                          >
                            {String(updatingId) === String(userId)
                              ? 'Saving...'
                              : u.isActive
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>
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

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`User Profile: ${selectedUser.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <img
                src={
                  selectedUser.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                }
                alt={selectedUser.name || 'User'}
                className="w-14 h-14 rounded-full object-cover border border-slate-200"
              />

              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedUser.name}
                </h3>

                <p className="text-xs text-slate-500">
                  {selectedUser.email}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedUser.role} size="xs" />

                  <span
                    className={`text-[10px] font-bold ${
                      selectedUser.isActive
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {selectedUser.isActive
                      ? '● Account Active'
                      : '● Deactivated'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Phone
                </span>

                <p className="font-medium text-slate-700 mt-0.5">
                  {selectedUser.phone || 'Not provided'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Joined Date
                </span>

                <p className="font-medium text-slate-700 mt-0.5">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
            </div>

            {selectedUser.freelancerProfile && (
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2 text-xs">
                <span className="font-bold text-emerald-800 uppercase text-[10px]">
                  Freelancer Profile
                </span>

                <div>
                  <span className="text-slate-500">Title:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {selectedUser.freelancerProfile.title || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500">Rating:</span>{' '}
                  <span className="font-semibold text-amber-700">
                    ★ {selectedUser.freelancerProfile.rating ?? '5.0'} / 5.0
                  </span>
                </div>

                <div>
                  <span className="text-slate-500">Total Earnings:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    ${formatMoney(selectedUser.freelancerProfile.totalEarnings)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500">Skills:</span>{' '}
                  <span className="text-slate-700">
                    {Array.isArray(selectedUser.freelancerProfile.skills)
                      ? selectedUser.freelancerProfile.skills.join(', ')
                      : selectedUser.freelancerProfile.skills || 'N/A'}
                  </span>
                </div>
              </div>
            )}

            {selectedUser.clientProfile && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2 text-xs">
                <span className="font-bold text-blue-800 uppercase text-[10px]">
                  Client Organization Profile
                </span>

                <div>
                  <span className="text-slate-500">Company:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {selectedUser.clientProfile.companyName || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500">Industry:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {selectedUser.clientProfile.industry || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500">Total Spent:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    ${formatMoney(selectedUser.clientProfile.totalSpent)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                disabled={!!updatingId}
                onClick={() => handleToggleStatus(selectedUser)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border disabled:opacity-50 ${
                  selectedUser.isActive
                    ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                    : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {updatingId
                  ? 'Saving...'
                  : selectedUser.isActive
                    ? 'Deactivate Account'
                    : 'Activate Account'}
              </button>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
