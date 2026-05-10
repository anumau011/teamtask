import { DndContext, closestCenter, useDraggable, useDroppable } from '@dnd-kit/core';
import { Workflow, Clock, CheckCircle } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateFormat';

const columns = [
  { id: 'todo', label: 'To Do', icon: Clock, tone: 'bg-blue-50', border: 'border-blue-200', header: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  { id: 'in_progress', label: 'In Progress', icon: Workflow, tone: 'bg-amber-50', border: 'border-amber-200', header: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  { id: 'done', label: 'Done', icon: CheckCircle, tone: 'bg-emerald-50', border: 'border-emerald-200', header: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' }
];

function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(task.id),
    data: { task }
  });

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined
      }}
      className={`cursor-grab rounded-lg border-2 border-gray-200 bg-white p-4 shadow-sm transition ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-gray-900">{task.title}</h4>
          <p className="mt-1 text-xs leading-5 text-gray-600">{task.description || 'No description'}</p>
        </div>
        <span className="rounded-full border-2 border-gray-200 bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-700">
          {task.priority}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
        <span>{task.assignee?.name || 'No user assign'}</span>
        <span>{formatDisplayDate(task.dueDate)}</span>
      </div>
    </article>
  );
}

function TaskColumn({ column, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const Icon = column.icon;

  return (
    <section
      ref={setNodeRef}
      className={`rounded-lg border-2 ${column.border} ${column.tone} p-4 transition ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-[0.22em] ${column.header}`}>
          <Icon className="h-4 w-4" />
          {column.label}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${column.badge}`}>{tasks.length}</span>
      </div>
      <div className="mt-4 space-y-3">
        {tasks.length ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className={`rounded-lg border-2 border-dashed ${column.border} ${column.tone} px-4 py-6 text-sm text-gray-600`}>
            Drop tasks here
          </div>
        )}
      </div>
    </section>
  );
}

export default function TaskBoard({ tasks, onMoveTask }) {
  const groupedTasks = columns.reduce((accumulator, column) => {
    accumulator[column.id] = tasks.filter((task) => task.status === column.id);
    return accumulator;
  }, {});

  const handleDragEnd = (event) => {
    const activeId = event.active?.id;
    const overId = event.over?.id;

    if (!activeId || !overId || activeId === overId) {
      return;
    }

    const task = tasks.find((entry) => String(entry.id) === String(activeId));
    if (!task || !columns.some((column) => column.id === overId)) {
      return;
    }

    if (task.status !== overId) {
      onMoveTask(task, overId);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <TaskColumn key={column.id} column={column} tasks={groupedTasks[column.id]} />
        ))}
      </div>
    </DndContext>
  );
}
