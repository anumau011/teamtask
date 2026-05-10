import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import SelectField from '../components/SelectField';
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
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
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
      assignedTo: ''
    }
  });

  const selectedPriority = watch('priority');

  const selectedProject = useMemo(() => {
    if (!globalSelectedProjectId) {
      return null;
    }

    return projects.find((project) => project.id === globalSelectedProjectId) || null;
  }, [projects, globalSelectedProjectId]);

  const visibleTasks = useMemo(() => {
    if (!globalSelectedProjectId) {
      return tasks;
    }

    return tasks.filter((task) => String(task.projectId) === String(globalSelectedProjectId));
  }, [tasks, globalSelectedProjectId]);

  const sortedTasks = useMemo(() => {
    if (!sortConfig.key) {
      return visibleTasks;
    }

    const statusOrder = {
      todo: 1,
      in_progress: 2,
      done: 3
    };

    const priorityOrder = {
      low: 1,
      medium: 2,
      high: 3
    };

    const getComparableValue = (task) => {
      if (sortConfig.key === 'dueDate') {
        const date = new Date(task.dueDate);
        return Number.isNaN(date.getTime()) ? 0 : date.getTime();
      }

      if (sortConfig.key === 'status') {
        return statusOrder[task.status] || 0;
      }

      if (sortConfig.key === 'priority') {
        return priorityOrder[task.priority] || 0;
      }

      return 0;
    };

    return [...visibleTasks].sort((leftTask, rightTask) => {
      const leftValue = getComparableValue(leftTask);
      const rightValue = getComparableValue(rightTask);

      if (leftValue === rightValue) {
        return 0;
      }

      const comparison = leftValue > rightValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [visibleTasks, sortConfig]);

  const handleSortChange = (key) => {
    setSortConfig((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

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
    if (!selectedProject) {
      return [];
    }

    return getUniqueProjectMembers(selectedProject);
  }, [selectedProject]);

  const selectedProjectName = useMemo(() => {
    return selectedProject?.name || '';
  }, [selectedProject]);

  useEffect(() => {
    setValue('assignedTo', '');
  }, [globalSelectedProjectId, setValue]);

  const handleCreateTask = async (values) => {
    try {
      if (!globalSelectedProjectId) {
        setError('Select a project before creating a task');
        return;
      }

      const response = await api.post('/tasks', {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate,
        priority: values.priority,
        projectId: globalSelectedProjectId,
        assignedTo: values.assignedTo || undefined
      });
      const createdTask = response.data.task;
      setTasks((currentTasks) => [createdTask, ...currentTasks]);
      reset({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        assignedTo: ''
      });
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

  const updateTaskPriority = async (task, priority) => {
    try {
      await api.put(`/tasks/${task.id}`, { priority });
      await loadTasks();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update priority');
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
        <SelectField
          wrapperClassName="inline-block"
          className="min-w-[14rem] border-2 border-gray-200 bg-white text-gray-900"
          value={globalSelectedProjectId}
          onChange={(event) => setGlobalSelectedProjectId(event.target.value || '')}
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </SelectField>
      </div>
      {role !== 'developer' && (
        <form
          onSubmit={handleSubmit(handleCreateTask)}
          className="grid gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1.2fr_0.8fr_1fr_1fr_auto]"
        >
          <input
            className="h-11 min-w-[14rem] rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition-colors hover:bg-gray-50 focus:border-gray-400 focus:ring-[3px] focus:ring-black/10"
            placeholder="Task title"
            {...register('title', { required: true })}
          />
          <SelectField
            wrapperClassName="inline-block"
            className="h-11 min-w-[10rem] border-2 border-gray-200 bg-white text-gray-900"
            value={selectedPriority || 'medium'}
            onChange={(event) => setValue('priority', event.target.value || 'medium')}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </SelectField>
          <SelectField
            wrapperClassName="inline-block"
            className="h-11 min-w-[14rem] border-2 border-gray-200 bg-white text-gray-900"
            value={watch('assignedTo') || ''}
            onChange={(event) => setValue('assignedTo', event.target.value || '')}
          >
            <option value="">{selectedProjectName ? `Assign from ${selectedProjectName}` : 'Select a project first'}</option>
            {availableAssignees.map((user) => (
              <option key={user.id || user._id} value={user.id || user._id}>
                {user.name}
              </option>
            ))}
          </SelectField>
          <input
            type="date"
            className="h-11 rounded-lg border-2 border-gray-200 bg-gray-50 px-4 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            {...register('dueDate', { required: true })}
          />
          <button
            type="submit"
            disabled={creatingTask || !globalSelectedProjectId}
            className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-gray-900 bg-gray-900 px-5 font-bold text-white transition hover:bg-gray-800 disabled:opacity-70"
          >
            <Plus className="h-4 w-4" />
            {creatingTask ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}
      {error && <div className="flex items-center gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-5 text-red-700"><AlertCircle className="h-5 w-5" />{error}</div>}
      <TaskTable
        tasks={sortedTasks}
        canDelete={role === 'admin' || role === 'project_manager'}
        canManageAssignee={role === 'admin'}
        canManagePriority={role === 'admin' || role === 'project_manager'}
        users={users}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        onStatusChange={updateTaskStatus}
        onPriorityChange={updateTaskPriority}
        onAssigneeChange={updateTaskAssignee}
        onDelete={deleteTask}
      />
    </div>
  );
}
