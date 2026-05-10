import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, AlertCircle, Users } from 'lucide-react';
import { api } from '../api/client';
import Loading from '../components/Loading';
import { useAuthStore } from '../store/authStore';
import { formatMemberCount, getUniqueProjectMembers } from '../utils/projectMembers';

export default function ProjectsPage() {
  const role = useAuthStore((state) => state.role);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [createError, setCreateError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const loadProjects = async () => {
    try {
      setServerError('');
      setLoading(true);
      const response = await api.get('/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      setServerError(error?.response?.data?.message || 'Unable to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const onSubmit = async (values) => {
    setCreateError('');
    try {
      await api.post('/projects', values);
      reset();
      await loadProjects();
    } catch (error) {
      const responseErrors = error?.response?.data?.errors;
      if (Array.isArray(responseErrors)) {
        setCreateError(responseErrors.map((entry) => entry.message).join(', '));
        return;
      }

      setCreateError(error?.response?.data?.message || 'Unable to create project');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-950">Projects</h1>
          <p className="mt-2 text-gray-700">Projects you can see and manage.</p>
        </div>
        {role !== 'developer' ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-3 rounded-lg border-2 border-gray-300 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]"
          >
            <input
              className="rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-200"
              placeholder="New project name"
              {...register('name', { required: true })}
            />
            <input
              className="rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-200"
              placeholder="Short description"
              {...register('description')}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg border-2 border-gray-900 bg-gray-900 px-5 py-3 font-bold text-white transition hover:bg-gray-800 disabled:opacity-70"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
            {createError ? <p className="md:col-span-3 text-sm text-gray-800">{createError}</p> : null}
          </form>
        ) : null}
      </div>
      {serverError ? <div className="flex items-center gap-3 rounded-lg border-2 border-gray-300 bg-white p-6 text-gray-900 shadow-sm"><AlertCircle className="h-5 w-5" />{serverError}</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const memberCount = getUniqueProjectMembers(project).length;

          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group rounded-lg border-2 border-gray-300 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gray-950"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-950">{project.name}</h2>
                <span className="flex items-center gap-1 rounded-full border-2 border-gray-900 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gray-950">
                  <Users className="h-3 w-3" />
                  {formatMemberCount(memberCount)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                {project.description || 'No project description provided.'}
              </p>
              <p className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-800 group-hover:text-gray-950">
                Open project →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
