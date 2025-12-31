import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Mail, MapPin, FileText, MessageSquare, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { PaginatedResponse } from '@job-portal/shared';
import toast from 'react-hot-toast';

interface Applicant {
  id: string;
  status: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  appliedAt: string;
  seeker: {
    id: string;
    fullName: string;
    headline: string | null;
    avatarUrl: string | null;
    email: string;
    skills: string[];
    location: string | null;
  };
}

export default function EmployerApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employer-applicants', jobId, statusFilter, page],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Applicant>>(`/employers/jobs/${jobId}/applicants`, {
        status: statusFilter || undefined,
        page,
        pageSize: 20,
      });
      return response.data!;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      return api.put(`/employers/applications/${applicationId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-applicants'] });
      toast.success('Application status updated');
    },
  });

  const statusOptions = [
    { value: '', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interview' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const statusColors: Record<string, 'secondary' | 'warning' | 'info' | 'success' | 'danger'> = {
    pending: 'secondary',
    reviewing: 'warning',
    shortlisted: 'info',
    interview: 'info',
    offered: 'success',
    rejected: 'danger',
  };

  const updateStatus = (applicant: Applicant, newStatus: string) => {
    updateStatusMutation.mutate({ applicationId: applicant.id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/employer/jobs"
          className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-white">Applicants</h1>
          <p className="text-navy-400 mt-1">
            {data?.total || 0} total applications
          </p>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Applicants List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-navy-800/50 rounded-2xl animate-pulse" />
            ))
          ) : data?.items.length ? (
            data.items.map((applicant, index) => (
              <motion.div
                key={applicant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-colors ${
                    selectedApplicant?.id === applicant.id
                      ? 'border-primary-500'
                      : 'hover:border-navy-600'
                  }`}
                  onClick={() => setSelectedApplicant(applicant)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center overflow-hidden">
                      {applicant.seeker.avatarUrl ? (
                        <img src={applicant.seeker.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-navy-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{applicant.seeker.fullName}</span>
                        <Badge variant={statusColors[applicant.status] || 'secondary'}>
                          {applicant.status}
                        </Badge>
                      </div>
                      {applicant.seeker.headline && (
                        <p className="text-sm text-navy-400 mt-0.5">{applicant.seeker.headline}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-navy-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {applicant.seeker.email}
                        </span>
                        {applicant.seeker.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {applicant.seeker.location}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {applicant.seeker.skills.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" size="sm">{skill}</Badge>
                        ))}
                        {applicant.seeker.skills.length > 4 && (
                          <Badge variant="secondary" size="sm">+{applicant.seeker.skills.length - 4}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-navy-500">
                      {formatRelativeTime(applicant.appliedAt)}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-navy-500" />
              <h3 className="text-lg font-medium text-white mb-2">No applicants found</h3>
              <p className="text-navy-400">
                {statusFilter ? 'Try adjusting your filter' : 'No one has applied yet'}
              </p>
            </Card>
          )}
        </div>

        {/* Applicant Detail Panel */}
        <div className="lg:col-span-1">
          {selectedApplicant ? (
            <Card className="sticky top-24">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-navy-700 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {selectedApplicant.seeker.avatarUrl ? (
                    <img src={selectedApplicant.seeker.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-navy-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white">{selectedApplicant.seeker.fullName}</h3>
                {selectedApplicant.seeker.headline && (
                  <p className="text-sm text-navy-400">{selectedApplicant.seeker.headline}</p>
                )}
              </div>

              {/* Status Actions */}
              <div className="mb-6">
                <label className="label">Update Status</label>
                <Select
                  options={statusOptions.slice(1)}
                  value={selectedApplicant.status}
                  onChange={(e) => updateStatus(selectedApplicant, e.target.value)}
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mb-6">
                {selectedApplicant.resumeUrl && (
                  <a
                    href={selectedApplicant.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      <FileText className="w-4 h-4" />
                      Resume
                    </Button>
                  </a>
                )}
                <Link to={`/employer/applications/${selectedApplicant.id}/messages`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                </Link>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-navy-500" />
                  <a href={`mailto:${selectedApplicant.seeker.email}`} className="text-primary-400 hover:text-primary-300">
                    {selectedApplicant.seeker.email}
                  </a>
                </div>
                {selectedApplicant.seeker.location && (
                  <div className="flex items-center gap-2 text-sm text-navy-400">
                    <MapPin className="w-4 h-4 text-navy-500" />
                    {selectedApplicant.seeker.location}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-navy-300 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.seeker.skills.map((skill) => (
                    <Badge key={skill} variant="primary" size="sm">{skill}</Badge>
                  ))}
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplicant.coverLetter && (
                <div>
                  <h4 className="text-sm font-medium text-navy-300 mb-2">Cover Letter</h4>
                  <p className="text-sm text-navy-400 whitespace-pre-wrap">
                    {selectedApplicant.coverLetter}
                  </p>
                </div>
              )}
            </Card>
          ) : (
            <Card className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-navy-500" />
              <p className="text-navy-400">Select an applicant to view details</p>
            </Card>
          )}
        </div>
      </div>

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

