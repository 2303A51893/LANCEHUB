
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  Search,
  Filter,
  PlusCircle,
  Briefcase,
  ChevronRight,
  AlertCircle,
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

const formatSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills;
  }

  if (!skills) {
    return [];
  }

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

export default function ProjectListPage() {
  const { user, isClient, isAdmin } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [scope, setScope] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('DESC');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.append('search', search.trim());
      if (category !== 'all') params.append('category', category);
      if (status !== 'all') params.append('status', status);
      if (scope !== 'all') params.append('scope', scope);

      params.append('sortBy', sortBy);
      params.append('order', order);

      const res = await api.get(`/projects?${params.toString()}`);

      if (res.data.success) {
        setProjects(
          Array.isArray(res.data.projects)
            ? res.data.projects
            : []
        );
      } else {
        setProjects([]);
        setError(res.data.message || 'Unable to load projects.');
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);

      setError(
        err.response?.data?.message ||
        'Failed to load projects. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, status, scope, sortBy, order]);

  useEffect(() => {
    fetchProjects();
  }, [category, status, scope, sortBy, order, fetchProjects]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-600" />
            Explore Projects & Opportunities
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Browse active client listings, filter by technical domain, and place proposals.
          </p>
        </div>

        {(isClient || isAdmin) && (
          <Link
            to="/projects/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Post a Project
          </Link>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col md:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, technologies, skills (e.g. React, Kubernetes)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </span>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            <option value="Cloud & DevOps">Cloud & DevOps</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Apps">Mobile Apps</option>
            <option value="AI & Machine Learning">AI & Machine Learning</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="Blockchain">Blockchain</option>
            <option value="Backend & APIs">Backend & APIs</option>
            <option value="Design & UI/UX">Design & UI/UX</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:border-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:border-primary-500"
          >
            <option value="all">All Scopes</option>
            <option value="Entry">Entry Level</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-slate-400">Sort:</span>

            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSortBy, newOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setOrder(newOrder);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:border-primary-500"
            >
              <option value="createdAt-DESC">Newest First</option>
              <option value="createdAt-ASC">Oldest First</option>
              <option value="budget-DESC">Budget: High to Low</option>
              <option value="budget-ASC">Budget: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading available projects...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />

          <p className="text-sm font-semibold text-slate-800">
            Unable to load projects
          </p>

          <p className="text-xs text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchProjects}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No projects matched your criteria. Try adjusting the filters or search keywords.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const projectId = getId(project);
            const clientId = getId(
              project.clientId || project.client
            );

            const isOwner =
              Boolean(user) &&
              getId(user) === clientId;

            const skillsList = formatSkills(
              project.skillsRequired
            );

            return (
              <div
                key={projectId}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-primary-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
                      {project.category || 'General'}
                    </span>

                    <StatusBadge
                      status={project.status || 'Open'}
                      size="xs"
                    />
                  </div>

                  {projectId ? (
                    <Link
                      to={`/projects/${projectId}`}
                      className="group block mt-2.5"
                    >
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {project.title || 'Untitled Project'}
                      </h3>
                    </Link>
                  ) : (
                    <h3 className="text-base font-bold text-slate-900 mt-2.5">
                      {project.title || 'Untitled Project'}
                    </h3>
                  )}

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {project.description || 'No description available.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skillsList.slice(0, 4).map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {String(skill).trim()}
                      </span>
                    ))}

                    {skillsList.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-medium self-center">
                        +{skillsList.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Budget
                      </span>

                      <p className="text-sm font-bold text-slate-900">
                        ${formatAmount(project.budget)}
                      </p>
                    </div>

                    <div className="h-6 w-px bg-slate-100" />

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Deadline
                      </span>

                      <p className="text-xs font-semibold text-slate-700">
                        {project.deadline
                          ? new Date(project.deadline).toLocaleDateString()
                          : 'Not specified'}
                      </p>
                    </div>

                    <div className="h-6 w-px bg-slate-100" />

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        Proposals
                      </span>

                      <p className="text-xs font-bold text-primary-600">
                        {project.bidsCount ?? project.bidCount ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {projectId && isOwner ? (
                      <Link
                        to={`/projects/${projectId}/compare`}
                        className="px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 font-semibold text-xs rounded-xl border border-primary-200 transition-colors"
                      >
                        Compare Bids
                      </Link>
                    ) : projectId ? (
                      <Link
                        to={`/projects/${projectId}`}
                        className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1"
                      >
                        View & Bid
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
