const { getAccessibleProjectIds } = require('../utils/scopeHelpers');

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

module.exports = {
  getTaskScopeWhere
};
