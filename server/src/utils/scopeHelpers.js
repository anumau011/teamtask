const { Project, ProjectMember } = require('../models');

function getIdValue(value) {
  if (!value) {
    return value;
  }

  if (typeof value === 'object') {
    return value.id || value._id || value.toString();
  }

  return value;
}

async function getAccessibleProjectIds(user) {
  if (user.role === 'admin') {
    return null;
  }

  const userId = getIdValue(user.id || user._id);
  const createdProjects = await Project.find({ createdBy: userId }).select('_id').lean();
  const memberProjects = await ProjectMember.find({ userId }).select('projectId').lean();

  const ids = [
    ...createdProjects.map((project) => project._id.toString()),
    ...memberProjects.map((membership) => membership.projectId.toString())
  ];

  return [...new Set(ids)];
}

async function buildProjectFilter(user) {
  if (user.role === 'admin') {
    return {};
  }

  const projectIds = await getAccessibleProjectIds(user);
  return projectIds.length ? { _id: { $in: projectIds } } : { _id: { $in: [] } };
}

async function canAccessProject(user, project) {
  if (user.role === 'admin') {
    return true;
  }

  const userId = getIdValue(user.id || user._id);
  const projectCreatorId = getIdValue(project.createdBy);

  if (projectCreatorId === userId) {
    return true;
  }

  const membership = await ProjectMember.findOne({
    projectId: getIdValue(project._id || project.id),
    userId
  });

  return Boolean(membership);
}

async function canManageProject(user, project) {
  if (user.role === 'admin') {
    return true;
  }

  if (user.role !== 'project_manager') {
    return false;
  }

  return canAccessProject(user, project);
}

module.exports = {
  getAccessibleProjectIds,
  buildProjectFilter,
  canAccessProject,
  canManageProject
};
