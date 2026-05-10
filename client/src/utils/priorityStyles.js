const priorityBadgeStyles = {
  high: 'border-red-300 bg-red-50 text-red-700',
  medium: 'border-amber-300 bg-amber-50 text-amber-800',
  low: 'border-emerald-300 bg-emerald-50 text-emerald-700'
};

const priorityBorderStyles = {
  high: 'border-red-400',
  medium: 'border-amber-400',
  low: 'border-emerald-400'
};

export function getPriorityBadgeClass(priority) {
  return priorityBadgeStyles[priority] || priorityBadgeStyles.medium;
}

export function getPriorityBorderClass(priority) {
  return priorityBorderStyles[priority] || priorityBorderStyles.medium;
}
