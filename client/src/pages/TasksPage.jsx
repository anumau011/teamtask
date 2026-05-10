import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import TaskTable from '../components/TaskTable';
import { useAuthStore } from '../store/authStore';
import { getUniqueProjectMembers } from '../utils/projectMembers';

export default function TasksPage() {
  const role = useAuthStore((state) => state.role);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [globalSelectedProjectId, setGlobalSelectedProjectId] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting: creatingTask }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      projectId: '',
      assignedTo: ''
    }
  });

  const selectedProjectId = watch('projectId');

  const loadTasks = async () => {
    try {
      setError('');
      const response = await api.get('/tasks');
      setTasks(response.data.tasks || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load tasks');
    }
  };

  const loadProjects = async () => {
    const response = await api.get('/projects');
    setProjects(response.data.projects || []);
  };

  const loadUsers = async () => {
    if (role !== 'admin') {
      setUsers([]);
      return;
    }

    const usersResponse = await api.get('/users');
    setUsers(usersResponse.data.users || []);
  };

  const loadPageData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadTasks(), loadProjects(), loadUsers()]);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [role]);

  const availableAssignees = useMemo(() => {
    if (!selectedProjectId) {
      return [];
    }

    const selectedProject = projects.find((project) => project.id === selectedProjectId);
    return getUniqueProjectMembers(selectedProject);
  }, [projects, selectedProjectId]);

  const selectedProjectName = useMemo(() => {
    const selectedProject = projects.find((project) => project.id === selectedProjectId);
    return selectedProject?.name || '';
  }, [projects, selectedProjectId]);

  useEffect(() => {
    setValue('assignedTo', '');
  }, [selectedProjectId, setValue]);

  useEffect(() => {
    if (globalSelectedProjectId) {
      setValue('projectId', globalSelectedProjectId);
    }
  }, [globalSelectedProjectId, setValue]);

  const handleCreateTask = async (values) => {
    try {
      await api.post('/tasks', {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate,
        priority: values.priority,
        projectId: values.projectId,
        assignedTo: values.assignedTo || undefined
      });
      reset();
      await loadPageData();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to create task');
    }
  };

  const updateTaskStatus = async (task, status) => {
    try {
      await api.put(`/tasks/${task.id}`, { status });
      await loadTasks();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update task');
    }
  };

  const updateTaskAssignee = async (task, assignedTo) => {
    try {
      await api.put(`/tasks/${task.id}`, { assignedTo });
      await loadTasks();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update assignee');
    }
  };

  const deleteTask = async (task) => {
    try {
      await api.delete(`/tasks/${task.id}`);
      await loadTasks();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to delete task');
    }
  };

  if (loading) {
    return <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-8 text-gray-700">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-2 text-gray-600">All tasks visible to your role.</p>
        </div>
        <select
          value={globalSelectedProjectId}
          onChange={(e) => setGlobalSelectedProjectId(e.target.value)}
          className="rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      {role !== 'developer' && (
        <form
          onSubmit={handleSubmit(handleCreateTask)}
          className="grid gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1.2fr_1fr_1fr_auto]"
        >
          <input
            className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Task title"
            {...register('title', { required: true })}
          />
          <select
            className="rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            {...register('assignedTo')}
          >
            <option value="">{selectedProjectName ? `Assign from ${selectedProjectName}` : 'Select project above'}</option>
            {availableAssignees.map((user) => (
              <option key={user.id || user._id} value={user.id || user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            {...register('dueDate', { required: true })}
          />
          <button
            type="submit"
            disabled={creatingTask || !globalSelectedProjectId}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-bold text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70"
          >
            <Plus className="h-4 w-4" />
            {creatingTask ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}
      {error && <div className="flex items-center gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-5 text-red-700"><AlertCircle className="h-5 w-5" />{error}</div>}
      <TaskTable
        tasks={tasks}
        canDelete={role === 'admin' || role === 'project_manager'}
        canManageAssignee={role === 'admin'}
        users={users}
        onStatusChange={updateTaskStatus}
        onAssigneeChange={updateTaskAssignee}
        onDelete={deleteTask}
      />
    </div>
  );
}
