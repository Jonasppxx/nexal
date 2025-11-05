'use client';

import { Card } from '@/src/components/ui';
import { StatusBadge } from '@/src/components/StatusBadge';
import { APP_NAME } from '@/src/config/constants';

interface ExampleComponentProps {
  title: string;
  status: 'success' | 'error' | 'warning';
}

export function ExampleComponent({ title, status }: ExampleComponentProps) {
  return (
    <Card className="max-w-md">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        This is an example component from {APP_NAME}
      </p>
      <StatusBadge status={status} text="Component loaded" />
    </Card>
  );
}
