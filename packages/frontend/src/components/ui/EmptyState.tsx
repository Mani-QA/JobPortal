import { ReactNode } from 'react';
import { 
  Inbox, 
  Search, 
  FileText, 
  Briefcase, 
  Users, 
  Bell,
  Heart,
  FolderOpen
} from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

type EmptyStateType = 
  | 'default' 
  | 'search' 
  | 'no-data' 
  | 'no-jobs' 
  | 'no-applications' 
  | 'no-candidates'
  | 'no-alerts'
  | 'no-saved'
  | 'no-files';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultContent: Record<EmptyStateType, { icon: ReactNode; title: string; description: string }> = {
  default: {
    icon: <Inbox className="w-12 h-12 text-gray-400" />,
    title: 'Nothing here yet',
    description: 'Get started by creating your first item.',
  },
  search: {
    icon: <Search className="w-12 h-12 text-gray-400" />,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
  },
  'no-data': {
    icon: <FolderOpen className="w-12 h-12 text-gray-400" />,
    title: 'No data available',
    description: 'There\'s nothing to display at the moment.',
  },
  'no-jobs': {
    icon: <Briefcase className="w-12 h-12 text-gray-400" />,
    title: 'No jobs found',
    description: 'We couldn\'t find any jobs matching your criteria.',
  },
  'no-applications': {
    icon: <FileText className="w-12 h-12 text-gray-400" />,
    title: 'No applications yet',
    description: 'Start applying to jobs to see your applications here.',
  },
  'no-candidates': {
    icon: <Users className="w-12 h-12 text-gray-400" />,
    title: 'No candidates yet',
    description: 'Candidates will appear here once they apply to your jobs.',
  },
  'no-alerts': {
    icon: <Bell className="w-12 h-12 text-gray-400" />,
    title: 'No job alerts',
    description: 'Create alerts to get notified about new jobs matching your criteria.',
  },
  'no-saved': {
    icon: <Heart className="w-12 h-12 text-gray-400" />,
    title: 'No saved jobs',
    description: 'Save jobs you\'re interested in to view them later.',
  },
  'no-files': {
    icon: <FileText className="w-12 h-12 text-gray-400" />,
    title: 'No files uploaded',
    description: 'Upload your resume or documents to get started.',
  },
};

export function EmptyState({
  type = 'default',
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const defaults = defaultContent[type];

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        {icon || defaults.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || defaults.title}
      </h3>
      <p className="text-gray-600 max-w-sm mb-6">
        {description || defaults.description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

