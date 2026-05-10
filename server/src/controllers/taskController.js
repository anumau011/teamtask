const { Project, ProjectMember, Task, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { getAccessibleProjectIds, canManageProject } = require('../utils/scopeHelpers');

function serializeTask(task) {
  const data = task.toJSON ? task.toJSON() : task;

  return {
    ...data,
    project: data.projectId,
    assignee: data.assignedTo,
    creator: data.createdBy,
    projectId: data.projectId?.id || data.projectId,
    assignedTo: data.assignedTo?.id || data.assignedTo,
    createdBy: data.createdBy?.id || data.createdBy
  };
}

function taskPopulate() {
  return [
    { path: 'projectId', select: 'name description createdBy createdAt updatedAt' },
    { path: 'assignedTo', select: 'name email role createdAt updatedAt' },
    { path: 'createdBy', select: 'name email role createdAt updatedAt' }
  ];
}

async function ensureTaskAssignment(projectId, assignedTo, actingUserRole) {
  const project = await Project.findById(projectId);
  if (!project) {
    return { error: { status: 404, message: 'Project not found' } };
  }

  if (!assignedTo) {
    return { project, user: null };
  }

  const user = await User.findById(assignedTo);
  if (!user) {
    return { error: { status: 404, message: 'Assignee not found' } };
  }

  if (actingUserRole !== 'admin' && user.role !== 'developer') {
    return { error: { status: 400, message: 'Tasks can only be assigned to developers' } };
  }

  const isProjectMember = project.createdBy?.toString() === user.id.toString() || Boolean(
    await ProjectMember.findOne({ projectId: project._id, userId: user._id })
  );

  if (!isProjectMember && actingUserRole !== 'admin') {
    return { error: { status: 400, message: 'Assignee must belong to the project' } };
  }

  return { project, user };
}

async function getTaskScopeWhere(user) {
  if (user.role === 'admin') {
    return {};
  }

  if (user.role === 'developer') {
    return { assignedTo: user.id };
  }

  const projectIds = await getAccessibleProjectIds(user);
  return projectIds.length ? { projectId: { $in: projectIds } } : { projectId: { $in: [] } };
}

const createTask = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;
  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const allowed = req.user.role === 'admin' || (await canManageProject(req.user, project));
  if (!allowed) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  let assignment = { user: null };
  if (assignedTo) {
    assignment = await ensureTaskAssignment(projectId, assignedTo, req.user.role);
    if (assignment.error) {
      return res.status(assignment.error.status).json({ message: assignment.error.message });
    }
  }

  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate,
    projectId: project._id,
    assignedTo: assignment.user?._id || null,
    createdBy: req.user.id
  });

  const createdTask = await Task.findById(task._id).populate(taskPopulate());

  return res.status(201).json({ task: serializeTask(createdTask) });
});

const listTasks = asyncHandler(async (req, res) => {
  const where = await getTaskScopeWhere(req.user);
  const tasks = await Task.find(where).populate(taskPopulate()).sort({ createdAt: -1 });

  return res.json({ tasks: tasks.map(serializeTask) });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('projectId', 'name description createdBy createdAt updatedAt');

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;
  const updatePayload = {};

  if (req.user.role === 'developer') {
    if (task.assignedTo?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const allowedKeys = ['status'];
    const incomingKeys = Object.keys(req.body).filter((key) => req.body[key] !== undefined);
    const hasForbiddenField = incomingKeys.some((key) => !allowedKeys.includes(key));

    if (hasForbiddenField) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (status) {
      const statusOrder = {
        todo: 1,
        in_progress: 2,
        done: 3
      };

      if (statusOrder[status] < statusOrder[task.status]) {
        return res.status(400).json({ message: 'Status cannot move backwards' });
      }

      updatePayload.status = status;
    }
  } else {
    const canUpdate = req.user.role === 'admin' || (await canManageProject(req.user, task.projectId));
    if (!canUpdate) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const targetProjectId = projectId !== undefined ? projectId : task.projectId._id || task.projectId;
    const targetAssignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;

    if (title !== undefined) {
      updatePayload.title = title;
    }
    if (description !== undefined) {
      updatePayload.description = description;
    }
    if (status !== undefined) {
      updatePayload.status = status;
    }
    if (priority !== undefined) {
      updatePayload.priority = priority;
    }
    if (dueDate !== undefined) {
      updatePayload.dueDate = dueDate;
    }
    if (projectId !== undefined) {
      const targetProject = await Project.findById(projectId);
      if (!targetProject) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const targetAllowed = req.user.role === 'admin' || (await canManageProject(req.user, targetProject));
      if (!targetAllowed) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      updatePayload.projectId = targetProject._id;
    }

    if (assignedTo !== undefined) {
      if (!assignedTo) {
        updatePayload.assignedTo = null;
      } else {
        const assignment = await ensureTaskAssignment(targetProjectId, assignedTo, req.user.role);
        if (assignment.error) {
          return res.status(assignment.error.status).json({ message: assignment.error.message });
        }

        updatePayload.assignedTo = assignment.user._id;
      }
    } else if (projectId !== undefined && task.assignedTo) {
      const assignment = await ensureTaskAssignment(targetProjectId, task.assignedTo, req.user.role);
      if (assignment.error) {
        return res.status(assignment.error.status).json({ message: assignment.error.message });
      }
    }
  }

  if (!Object.keys(updatePayload).length) {
    return res.status(400).json({ message: 'No updatable fields provided' });
  }

  Object.assign(task, updatePayload);
  await task.save();

  const updatedTask = await Task.findById(task._id).populate(taskPopulate());

  return res.json({ task: serializeTask(updatedTask) });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('projectId', 'name description createdBy createdAt updatedAt');

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (req.user.role !== 'admin') {
    if (req.user.role !== 'project_manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const allowed = await canManageProject(req.user, task.projectId);
    if (!allowed) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  await task.deleteOne();
  return res.json({ message: 'Task deleted' });
});

const getOverdueTasks = asyncHandler(async (req, res) => {
  const where = await getTaskScopeWhere(req.user);
  const tasks = await Task.find({
    ...where,
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' }
  })
    .populate(taskPopulate())
    .sort({ dueDate: 1 });

  return res.json({ tasks: tasks.map(serializeTask) });
});

module.exports = {
  createTask,
  listTasks,
  updateTask,
  deleteTask,
  getOverdueTasks
};
