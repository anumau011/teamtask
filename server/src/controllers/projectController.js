const { Project, ProjectMember, Task, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { getAccessibleProjectIds, canAccessProject, canManageProject } = require('../utils/scopeHelpers');

function serializeMember(membership) {
  const user = membership.userId?.toJSON ? membership.userId.toJSON() : membership.userId;

  return {
    ...user,
    joinedAt: membership.joinedAt
  };
}

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

function normalizeProjectMembers(project, members = []) {
  const normalizedMembers = new Map();

  for (const member of members) {
    const memberId = member?.id || member?._id?.toString();
    if (memberId) {
      normalizedMembers.set(memberId, member);
    }
  }

  const creator = project?.createdBy?.toJSON ? project.createdBy.toJSON() : project?.createdBy;
  const creatorId = creator?.id || creator?._id?.toString();
  if (creatorId && !normalizedMembers.has(creatorId)) {
    normalizedMembers.set(creatorId, creator);
  }

  return [...normalizedMembers.values()];
}

function serializeProject(project, members = [], tasks = []) {
  const data = project.toJSON ? project.toJSON() : project;

  return {
    ...data,
    creator: data.createdBy,
    members: normalizeProjectMembers(data, members),
    tasks
  };
}

async function loadProjectMembers(projectIds) {
  if (!projectIds.length) {
    return new Map();
  }

  const memberships = await ProjectMember.find({
    projectId: { $in: projectIds }
  })
    .populate('userId', 'name email role createdAt updatedAt')
    .sort({ joinedAt: 1 });

  return memberships.reduce((map, membership) => {
    const key = membership.projectId.toString();
    const currentMembers = map.get(key) || [];
    currentMembers.push(serializeMember(membership));
    map.set(key, currentMembers);
    return map;
  }, new Map());
}

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: req.user.id
  });

  await ProjectMember.findOneAndUpdate(
    {
      projectId: project._id,
      userId: req.user.id
    },
    {
      $setOnInsert: {
        joinedAt: new Date()
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  const createdProject = await Project.findById(project._id).populate(
    'createdBy',
    'name email role createdAt updatedAt'
  );
  const membersByProject = await loadProjectMembers([createdProject._id.toString()]);

  return res.status(201).json({
    project: serializeProject(createdProject, membersByProject.get(createdProject._id.toString()) || [])
  });
});

const listProjects = asyncHandler(async (req, res) => {
  const projectIds = await getAccessibleProjectIds(req.user);
  const query = req.user.role === 'admin' ? {} : { _id: { $in: projectIds } };

  const projects = await Project.find(query)
    .populate('createdBy', 'name email role createdAt updatedAt')
    .sort({ createdAt: -1 });
  const membersByProject = await loadProjectMembers(projects.map((project) => project._id.toString()));

  return res.json({
    projects: projects.map((project) => serializeProject(project, membersByProject.get(project._id.toString()) || []))
  });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('createdBy', 'name email role createdAt updatedAt');

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const allowed = await canAccessProject(req.user, project);
  if (!allowed) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const membersByProject = await loadProjectMembers([project._id.toString()]);
  const tasks = await Task.find({ projectId: project._id })
    .populate('projectId', 'name description createdBy createdAt updatedAt')
    .populate('assignedTo', 'name email role createdAt updatedAt')
    .populate('createdBy', 'name email role createdAt updatedAt')
    .sort({ createdAt: -1 });

  return res.json({
    project: serializeProject(
      project,
      membersByProject.get(project._id.toString()) || [],
      tasks.map(serializeTask)
    )
  });
});

const addMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const allowed = await canManageProject(req.user, project);
  if (!allowed) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const user = await User.findById(req.body.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const membership = await ProjectMember.findOneAndUpdate(
    {
      projectId: project._id,
      userId: user._id
    },
    {
      $setOnInsert: {
        joinedAt: new Date()
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  ).populate('userId', 'name email role createdAt updatedAt');

  return res.status(201).json({
    member: serializeMember(membership)
  });
});

const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const allowed = await canManageProject(req.user, project);
  if (!allowed) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (project.createdBy?.toString() === req.params.userId) {
    return res.status(400).json({ message: 'Project creator cannot be removed' });
  }

  await Task.updateMany(
    {
      projectId: project._id,
      assignedTo: req.params.userId
    },
    {
      $set: {
        assignedTo: null
      }
    }
  );

  const deletedResult = await ProjectMember.deleteOne({
    projectId: project._id,
    userId: req.params.userId
  });

  if (!deletedResult.deletedCount) {
    return res.status(404).json({ message: 'Member not found' });
  }

  return res.json({ message: 'Member removed' });
});

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  addMember,
  removeMember
};
