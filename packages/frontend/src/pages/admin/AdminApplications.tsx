import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { PaginatedResponse } from '@job-portal/shared';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  seekerName: string;
  status: string;
  appliedAt: string;
}

export default function AdminApplications() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', statusFilter, page],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Application>>('/admin/applications', {
        status: statusFilter || undefined,
        page,
        pageSize: 20,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Application Monitoring</h1>
          <p className="text-navy-400 mt-1">View all applications across the platform</p>
        </div>
        <Select
          options={[
            { value: '', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'reviewing', label: 'Reviewing' },
            { value: 'shortlisted', label: 'Shortlisted' },
            { value: 'interview', label: 'Interview' },
            { value: 'offered', label: 'Offered' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-40"
        />
      </div>

      {/* Applications Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-700">
                <th className="px-6 py-4 text-left text-sm font-medium text-navy-400">Job</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-navy-400">Company</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-navy-400">Applicant</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-navy-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-navy-400">Applied</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-navy-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-navy-800">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-6 bg-navy-700/50 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : data?.items.length ? (
                data.items.map((app) => (
                  <tr key={app.id} className="border-b border-navy-800 hover:bg-navy-800/30">
                    <td className="px-6 py-4">
                      <Link to={`/jobs/${app.jobId}`} className="font-medium text-white hover:text-primary-400">
                        {app.jobTitle}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-navy-300">
                      {app.companyName}
                    </td>
                    <td className="px-6 py-4 text-navy-300">
                      {app.seekerName}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusColors[app.status] || 'secondary'}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-navy-400">
                      {formatDate(app.appliedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/jobs/${app.jobId}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-navy-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="px-4 py-2 text-navy-400">Page {page} of {data.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page === data.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

