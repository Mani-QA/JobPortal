import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Building2, MapPin, Calendar, MessageSquare, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { PaginatedResponse } from '@job-portal/shared';

interface Application {
  id: string;
  status: string;
  coverLetter: string | null;
  appliedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    location: string | null;
    locationType: string;
    salaryRange: { min: number; max: number; currency: string; period: string };
    status: string;
  };
  employer: {
    companyName: string;
    logoUrl: string | null;
  };
}

export default function SeekerApplications() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['seeker-applications', statusFilter, page],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Application>>('/seekers/applications', {
        status: statusFilter || undefined,
        page,
        pageSize: 10,
      });
      return response.data!;
    },
  });

  const statusColors: Record<string, 'secondary' | 'warning' | 'info' | 'success' | 'danger'> = {
    pending: 'secondary',
    reviewing: 'warning',
    shortlisted: 'info',
    interview: 'info',
    offered: 'success',
    rejected: 'danger',
    withdrawn: 'secondary',
  };

  const statusOptions = [
    { value: '', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interview' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Applications</h1>
          <p className="text-navy-400 mt-1">Track and manage your job applications</p>
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-48"
        />
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-navy-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : data?.items.length ? (
        <div className="space-y-4">
          {data.items.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:border-navy-600 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Company Logo */}
                  <div className="w-14 h-14 rounded-xl bg-navy-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {app.employer.logoUrl ? (
                      <img src={app.employer.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-navy-400" />
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link
                        to={`/jobs/${app.job.id}`}
                        className="text-lg font-semibold text-white hover:text-primary-400 transition-colors"
                      >
                        {app.job.title}
                      </Link>
                      <Badge variant={statusColors[app.status] || 'secondary'}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Badge>
                      {app.job.status !== 'active' && (
                        <Badge variant="secondary">Job Closed</Badge>
                      )}
                    </div>
                    <div className="text-navy-400">{app.employer.companyName}</div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-navy-500">
                      {app.job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {app.job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {formatRelativeTime(app.appliedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link to={`/jobs/${app.job.id}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                        View Job
                      </Button>
                    </Link>
                    <Link to={`/seeker/applications/${app.id}/messages`}>
                      <Button variant="secondary" size="sm">
                        <MessageSquare className="w-4 h-4" />
                        Messages
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Cover Letter Preview */}
                {app.coverLetter && (
                  <div className="mt-4 pt-4 border-t border-navy-700/50">
                    <p className="text-sm text-navy-400">
                      <span className="text-navy-300 font-medium">Cover Letter: </span>
                      {app.coverLetter.length > 150
                        ? `${app.coverLetter.slice(0, 150)}...`
                        : app.coverLetter}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-navy-500" />
          <h3 className="text-lg font-medium text-white mb-2">No applications found</h3>
          <p className="text-navy-400 mb-6">
            {statusFilter ? 'Try adjusting your filter' : "Start applying to jobs to see them here"}
          </p>
          <Link to="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-navy-400">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

