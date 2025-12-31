import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Users, Eye, Edit2, Trash2, MoreVertical, Pause, Play, Archive } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { formatDate, formatSalary } from '@/lib/utils';
import type { PaginatedResponse, Job } from '@job-portal/shared';
import toast from 'react-hot-toast';

export default function EmployerJobs() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employer-jobs', statusFilter, page],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Job>>('/employers/jobs', {
        status: statusFilter || undefined,
        page,
        pageSize: 10,
      });
      return response.data!;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.put(`/jobs/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Job status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Job deleted');
    },
  });

  const statusOptions = [
    { value: '', label: 'All Jobs' },
    { value: 'draft', label: 'Drafts' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'closed', label: 'Closed' },
    { value: 'archived', label: 'Archived' },
  ];

  const statusColors: Record<string, 'secondary' | 'success' | 'warning' | 'danger'> = {
    draft: 'secondary',
    active: 'success',
    paused: 'warning',
    closed: 'danger',
    archived: 'secondary',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Jobs</h1>
          <p className="text-navy-400 mt-1">Manage your job postings</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-40"
          />
          <Link to="/employer/jobs/new">
            <Button>
              <Plus className="w-4 h-4" />
              Post Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-navy-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : data?.items.length ? (
        <div className="space-y-4">
          {data.items.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-lg font-semibold text-white hover:text-primary-400 transition-colors"
                      >
                        {job.title}
                      </Link>
                      <Badge variant={statusColors[job.status] || 'secondary'}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-navy-400">
                      {job.locationType} • {job.jobType} • {job.experienceLevel}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-navy-500">
                      <span className="text-primary-400 font-medium">
                        {formatSalary(
                          job.salaryRange.min,
                          job.salaryRange.max,
                          job.salaryRange.currency,
                          job.salaryRange.period
                        )}
                      </span>
                      <span>Deadline: {formatDate(job.deadline)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <div className="text-xl font-bold text-white">{job.applicationCount}</div>
                      <div className="text-xs text-navy-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> Applicants
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{job.viewCount}</div>
                      <div className="text-xs text-navy-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Views
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link to={`/employer/jobs/${job.id}/applicants`}>
                      <Button variant="secondary" size="sm">
                        <Users className="w-4 h-4" />
                        Applicants
                      </Button>
                    </Link>
                    <Link to={`/employer/jobs/${job.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveMenu(activeMenu === job.id ? null : job.id)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      {activeMenu === job.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-navy-800 border border-navy-700 rounded-xl shadow-xl z-10">
                          <div className="p-2">
                            {job.status === 'active' ? (
                              <button
                                onClick={() => {
                                  updateMutation.mutate({ id: job.id, status: 'paused' });
                                  setActiveMenu(null);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-navy-200 hover:bg-navy-700"
                              >
                                <Pause className="w-4 h-4" />
                                Pause Job
                              </button>
                            ) : job.status === 'paused' ? (
                              <button
                                onClick={() => {
                                  updateMutation.mutate({ id: job.id, status: 'active' });
                                  setActiveMenu(null);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-navy-200 hover:bg-navy-700"
                              >
                                <Play className="w-4 h-4" />
                                Activate Job
                              </button>
                            ) : null}
                            <button
                              onClick={() => {
                                updateMutation.mutate({ id: job.id, status: 'archived' });
                                setActiveMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-navy-200 hover:bg-navy-700"
                            >
                              <Archive className="w-4 h-4" />
                              Archive
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this job?')) {
                                  deleteMutation.mutate(job.id);
                                }
                                setActiveMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-accent-rose hover:bg-navy-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-navy-500" />
          <h3 className="text-lg font-medium text-white mb-2">No jobs found</h3>
          <p className="text-navy-400 mb-6">
            {statusFilter ? 'Try adjusting your filter' : 'Post your first job to start hiring'}
          </p>
          <Link to="/employer/jobs/new">
            <Button>
              <Plus className="w-4 h-4" />
              Post Your First Job
            </Button>
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

