const { Task } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { getTaskScopeWhere } = require('./taskScopeBridge');

const getDashboard = asyncHandler(async (req, res) => {
  const where = await getTaskScopeWhere(req.user);
  const tasks = await Task.find(where).sort({ updatedAt: -1 });

  const totalTasks = tasks.length;
  const todo = tasks.filter((task) => task.status === 'todo').length;
  const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
  const done = tasks.filter((task) => task.status === 'done').length;
  const overdueTasksCount = tasks.filter((task) => task.dueDate < new Date() && task.status !== 'done').length;

  const recentActivity = tasks.slice(0, 5).map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    updatedAt: task.updatedAt
  }));

  return res.json({
    summary: {
      totalTasks,
      todo,
      inProgress,
      done,
      overdueTasksCount
    },
    recentActivity
  });
});

module.exports = {
  getDashboard
};
