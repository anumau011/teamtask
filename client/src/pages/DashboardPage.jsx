import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { api } from '../api/client';
import { formatDisplayDate } from '../utils/dateFormat';

function TaskList({ tasks }) {
  if (!tasks.length) {
    return <p className="text-sm text-gray-600">No overdue tasks.</p>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900">{task.title}</h4>
              <p className="mt-1 text-xs text-gray-600">{task.project?.name || 'Project'}</p>
            </div>
            <span className="flex items-center gap-1 rounded-full border-2 border-red-300 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-700">
              <Clock className="h-3 w-3" />
              Overdue
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [dashboardResponse, overdueResponse] = await Promise.all([
        api.get('/dashboard'),
        api.get('/tasks/overdue')
      ]);

      setSummary(dashboardResponse.data.summary);
      setRecentActivity(dashboardResponse.data.recentActivity || []);
      setOverdueTasks(overdueResponse.data.tasks || []);
      setError('');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load dashboard');
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRefresh = () => {
    loadDashboard({ silent: true });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="flex items-center gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-6 text-red-700"><AlertCircle className="h-5 w-5" />{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">A scoped view of work based on your role.</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border-2 border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tasks" value={summary.totalTasks} tone="sky" />
        <StatCard label="To Do" value={summary.todo} tone="slate" />
        <StatCard label="In Progress" value={summary.inProgress} tone="amber" />
        <StatCard label="Done" value={summary.done} tone="emerald" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Overdue Tasks</h2>
            <span className="flex items-center justify-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-700">
              {summary.overdueTasksCount}
            </span>
          </div>
          <TaskList tasks={overdueTasks} />
        </section>
        <section className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Tasks</h2>
          </div>
          <div className="overflow-hidden rounded-lg border-2 border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-bold">Task</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Priority</th>
                  <th className="px-4 py-3 font-bold">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentActivity.map((task) => (
                  <tr key={task.id} className="text-gray-700 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{task.title}</td>
                    <td className="px-4 py-3 capitalize text-gray-700">{task.status.replace('_', ' ')}</td>
                    <td className="px-4 py-3 capitalize text-gray-700">{task.priority}</td>
                    <td className="px-4 py-3 text-gray-700">{formatDisplayDate(task.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
