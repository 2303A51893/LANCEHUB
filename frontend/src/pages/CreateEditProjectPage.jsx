
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function CreateEditProjectPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cloud & DevOps',
    scope: 'Intermediate',
    budget: '',
    deadline: '',
    skillsRequired: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setFetching(false);
      return;
    }

    let cancelled = false;

    const loadProject = async () => {
      try {
        setFetching(true);
        setError('');

        const res = await api.get(`/projects/${id}`);

        if (!res.data?.success || !res.data.project) {
          throw new Error('Project details were not found.');
        }

        const project = res.data.project;

        let skills = project.skillsRequired || [];

        if (Array.isArray(skills)) {
          skills = skills.join(', ');
        } else if (typeof skills === 'string') {
          try {
            const parsed = JSON.parse(skills);
            if (Array.isArray(parsed)) {
              skills = parsed.join(', ');
            }
          } catch {
            // Keep the original skills string.
          }
        } else {
          skills = '';
        }

        if (!cancelled) {
          setFormData({
            title: project.title || '',
            description: project.description || '',
            category: project.category || 'Cloud & DevOps',
            scope: project.scope || 'Intermediate',
            budget: project.budget ?? '',
            deadline: project.deadline
              ? new Date(project.deadline).toISOString().split('T')[0]
              : '',
            skillsRequired: skills
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load project details.'
          );
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const budget = Number(formData.budget);

    if (!Number.isFinite(budget) || budget < 10) {
      setError('Please enter a valid budget of at least $10.');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please enter the project title and description.');
      return;
    }

    if (!formData.deadline) {
      setError('Please select a project deadline.');
      return;
    }

    const selectedDate = new Date(`${formData.deadline}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      setError('Please enter a valid deadline.');
      return;
    }

    if (selectedDate < new Date(new Date().toDateString())) {
      setError('The project deadline cannot be in the past.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      scope: formData.scope,
      budget,
      deadline: formData.deadline,
      skillsRequired: formData.skillsRequired
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
    };

    try {
      setLoading(true);

      if (isEditing) {
        const res = await api.put(`/projects/${id}`, payload);

        if (!res.data?.success) {
          throw new Error('Project update was unsuccessful.');
        }

        setSuccess('Project updated successfully!');

        setTimeout(() => {
          navigate(`/projects/${id}`);
        }, 1000);
      } else {
        const res = await api.post('/projects', payload);

        if (!res.data?.success || !res.data.project) {
          throw new Error('Project creation was unsuccessful.');
        }

        const projectId = res.data.project._id || res.data.project.id;

        if (!projectId) {
          throw new Error('Project was created, but its ID was not returned.');
        }

        setSuccess('Project created and published successfully!');

        setTimeout(() => {
          navigate(`/projects/${projectId}`);
        }, 1000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to save the project. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading project details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/projects"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Project Specification' : 'Post a New Project'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Specify your project scope, deliverables, budget, and required freelancer skills.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Enterprise Cloud Migration & Microservices Architecture"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Domain Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-primary-500"
              >
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Apps">Mobile Apps</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="Blockchain">Blockchain</option>
                <option value="Backend & APIs">Backend & APIs</option>
                <option value="Design & UI/UX">Design & UI/UX</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Experience Scope Level *
              </label>
              <select
                name="scope"
                value={formData.scope}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-primary-500"
              >
                <option value="Entry">Entry (Foundational task, straightforward requirements)</option>
                <option value="Intermediate">Intermediate (Practical expertise required)</option>
                <option value="Expert">Expert (Complex distributed architecture & security)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fixed Budget ($ USD) *
              </label>
              <input
                type="number"
                name="budget"
                required
                min="10"
                step="1"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 4500"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Deadline Date *
              </label>
              <input
                type="date"
                name="deadline"
                required
                value={formData.deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Required Skills & Technologies (comma separated)
            </label>
            <input
              type="text"
              name="skillsRequired"
              value={formData.skillsRequired}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Docker, Kubernetes"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Separate technologies with commas.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Scope & Project Description *
            </label>
            <textarea
              name="description"
              required
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the business objectives, key milestones, technical constraints, and deliverable expectations..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/projects"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Submitting...'
                : isEditing
                  ? 'Save Changes'
                  : 'Publish Project Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
