export function getMemberKey(member) {
  if (!member || typeof member !== 'object') {
    return '';
  }

  return member._id || member.id || member.email || member.name || '';
}

export function getUniqueProjectMembers(project) {
  const seen = new Set();
  const uniqueMembers = [];

  const addMember = (member) => {
    const key = getMemberKey(member);
    if (!key || seen.has(key)) {
      return;
    }

    seen.add(key);
    uniqueMembers.push(member);
  };

  (project?.members || []).forEach(addMember);
  addMember(project?.creator);

  return uniqueMembers;
}

export function formatMemberCount(count) {
  return count === 1 ? '1 member' : `${count} members`;
}