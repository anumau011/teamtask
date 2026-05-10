import { Trash2 } from 'lucide-react';
import SelectField from './SelectField';
import { formatDisplayDate } from '../utils/dateFormat';

export default function TaskTable({ tasks, onStatusChange, onAssigneeChange, onDelete, canDelete, users = [], canManageAssignee = false }) {
  return (
    <div className="overflow-visible rounded-lg border-2 border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
          <tr>
            <th className="px-5 py-4 font-bold">Task</th>
            <th className="px-5 py-4 font-bold">Project</th>
            <th className="px-5 py-4 font-bold">Assignee</th>
            <th className="px-5 py-4 font-bold">Priority</th>
            <th className="px-5 py-4 font-bold">Due</th>
            <th className="px-5 py-4 font-bold">Status</th>
            <th className="px-5 py-4 font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="align-top text-gray-700 hover:bg-gray-50">
              <td className="px-5 py-4">
                <div className="font-semibold text-gray-900">{task.title}</div>
                <div className="mt-1 max-w-lg text-xs leading-5 text-gray-600">{task.description || 'No description'}</div>
              </td>
              <td className="px-5 py-4 text-gray-700">{task.project?.name || 'Project'}</td>
              <td className="px-5 py-4 text-gray-700">
                {canManageAssignee ? (
                  <SelectField
                    wrapperClassName="inline-block"
                    className="min-w-[14rem] border-2 border-gray-200 bg-white text-gray-900"
                    value={task.assignedTo || ''}
                    onChange={(event) => onAssigneeChange?.(task, event.target.value || null)}
                  >
                    <option value="">Select assignee</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </SelectField>
                ) : (
                  <span>{task.assignee?.name || 'No user assign'}</span>
                )}
              </td>
              <td className="px-5 py-4 capitalize text-gray-700">{task.priority}</td>
              <td className="px-5 py-4 text-gray-700">{formatDisplayDate(task.dueDate)}</td>
              <td className="px-5 py-4">
                <SelectField
                  wrapperClassName="inline-block"
                  className="min-w-[11rem] border-2 border-gray-200 bg-white text-gray-900"
                  value={task.status}
                  onChange={(event) => onStatusChange(task, event.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </SelectField>
              </td>
              <td className="px-5 py-4">
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(task)}
                    className="flex items-center gap-2 rounded-lg border-2 border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                ) : (
                  <span className="text-xs font-medium text-gray-500">Restricted</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
