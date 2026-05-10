import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2, Plus, AlertCircle, Users } from 'lucide-react';
import TaskBoard from '../components/TaskBoard';
import { api } from '../api/client';
import { formatMemberCount, getUniqueProjectMembers } from '../utils/projectMembers';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [actionError, setActionError] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberActionMessage, setMemberActionMessage] = useState('');

  const loadProject = async () => {
    try {
      setServerError('');
      setLoading(true);
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.project);
    } catch (error) {
      setServerError(error?.response?.data?.message || 'Unable to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleAddMember = async (event) => {
    event.preventDefault();
    setActionError('');
    setMemberActionMessage('');

    try {
      await api.post(`/projects/${id}/members`, { userId: memberUserId.trim() });
      setMemberUserId('');
      setMemberActionMessage('Member added');
      await loadProject();
    } catch (error) {
      setActionError(error?.response?.data?.message || 'Unable to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    setActionError('');
    setMemberActionMessage('');
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      await loadProject();
    } catch (error) {
      setActionError(error?.response?.data?.message || 'Unable to remove member');
    }
  };

  const handleMoveTask = async (task, nextStatus) => {
    setActionError('');
    setUpdatingTaskId(task.id);
    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      await loadProject();
    } catch (error) {
      setActionError(error?.response?.data?.message || 'Unable to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return <div className="rounded-lg border-2 border-gray-300 bg-white p-8 text-gray-800 shadow-sm">Loading project...</div>;
  }

  if (!project) {
    return <div className="flex items-center gap-3 rounded-lg border-2 border-gray-300 bg-white p-6 text-gray-900 shadow-sm"><AlertCircle className="h-5 w-5" />{serverError || 'Project not found'}</div>;
  }

  const memberCount = getUniqueProjectMembers(project).length;
  const members = getUniqueProjectMembers(project);
  const creatorId = project.creator?.id || project.createdBy?.id;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-gray-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">{project.name}</h1>
            <p className="mt-2 max-w-3xl text-gray-700">{project.description || 'No description provided.'}</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border-2 border-gray-900 bg-white px-4 py-3 text-sm font-bold text-gray-950">
            <Users className="h-4 w-4" />
            {formatMemberCount(memberCount)}
          </div>
        </div>
      </div>

      <section className="rounded-lg border-2 border-gray-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-950">Project Members</h2>
            <p className="mt-2 text-sm text-gray-700">Paste a user ID to add them to this project.</p>
          </div>
          <form onSubmit={handleAddMember} className="flex flex-wrap items-center gap-3">
            <input
              value={memberUserId}
              onChange={(event) => setMemberUserId(event.target.value)}
              className="min-w-[18rem] rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-200"
              placeholder="Paste user ID"
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border-2 border-gray-900 bg-gray-900 px-5 py-3 font-bold text-white transition hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Add member
            </button>
          </form>
        </div>

        {memberActionMessage ? <p className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-800">✓ {memberActionMessage}</p> : null}

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => {
            const memberId = member.id || member._id;
            const isCreator = memberId === creatorId;

            return (
              <div key={memberId} className="rounded-lg border-2 border-gray-300 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-950">{member.name || 'Unnamed user'}</p>
                    <p className="mt-1 text-xs text-gray-700">{member.email || memberId}</p>
                  </div>
                  {isCreator ? (
                    <span className="rounded-full border-2 border-gray-900 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-950">
                      Creator
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(memberId)}
                      className="flex items-center gap-2 rounded-lg border-2 border-gray-900 bg-white px-3 py-2 text-xs font-bold text-gray-950 transition hover:bg-gray-100"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {actionError ? <div className="flex items-center gap-3 rounded-lg border-2 border-gray-300 bg-white p-5 text-gray-900 shadow-sm"><AlertCircle className="h-5 w-5" />{actionError}</div> : null}
      {serverError ? <div className="flex items-center gap-3 rounded-lg border-2 border-gray-300 bg-white p-5 text-gray-900 shadow-sm"><AlertCircle className="h-5 w-5" />{serverError}</div> : null}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-950">Task Board</h2>
          {updatingTaskId ? <span className="text-sm text-gray-700">Updating task {updatingTaskId}...</span> : null}
        </div>
        <TaskBoard tasks={project.tasks || []} onMoveTask={handleMoveTask} />
      </section>
    </div>
  );
}
