interface StatusBadgeProps {
  status: 'success' | 'error' | 'warning';
  text: string;
}

export function StatusBadge({ status, text }: StatusBadgeProps) {
  const colors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {text}
    </span>
  );
}
