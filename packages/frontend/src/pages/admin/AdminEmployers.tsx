import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { PaginatedResponse } from '@job-portal/shared';
import toast from 'react-hot-toast';

interface Employer {
  id: string;
  userId: string;
  email: string;
  companyName: string;
  industry: string;
  logoUrl: string | null;
  verified: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminEmployers() {
  const queryClient = useQueryClient();
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-employers', verifiedFilter, page],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Employer>>('/admin/employers', {
        verified: verifiedFilter || undefined,
        page,
        pageSize: 20,
      });
      return response.data!;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ employerId, verified }: { employerId: string; verified: boolean }) => {
      return api.put(`/admin/employers/${employerId}/verify`, { verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employers'] });
      toast.success('Employer verification updated');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Employer Verification</h1>
          <p className="text-navy-400 mt-1">Review and verify employer accounts</p>
        </div>
        <Select
          options={[
            { value: '', label: 'All Employers' },
            { value: 'false', label: 'Pending Verification' },
            { value: 'true', label: 'Verified' },
          ]}
          value={verifiedFilter}
          onChange={(e) => {
            setVerifiedFilter(e.target.value);
            setPage(1);
          }}
          className="w-52"
        />
      </div>

      {/* Employers Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-navy-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : data?.items.length ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((employer, index) => (
            <motion.div
              key={employer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-navy-700 flex items-center justify-center overflow-hidden">
                    {employer.logoUrl ? (
                      <img src={employer.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-navy-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white truncate">{employer.companyName}</span>
                      {employer.verified && <CheckCircle2 className="w-4 h-4 text-accent-emerald" />}
                    </div>
                    <div className="text-sm text-navy-400">{employer.industry}</div>
                    <div className="text-xs text-navy-500 mt-1">{employer.email}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Badge variant={employer.verified ? 'success' : 'warning'}>
                    {employer.verified ? 'Verified' : 'Pending'}
                  </Badge>
                  <span className="text-xs text-navy-500">
                    Joined {formatDate(employer.createdAt)}
                  </span>
                </div>

                <div className="flex gap-2">
                  {employer.verified ? (
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => verifyMutation.mutate({ employerId: employer.id, verified: false })}
                    >
                      <XCircle className="w-4 h-4" />
                      Revoke
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => verifyMutation.mutate({ employerId: employer.id, verified: true })}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify
                    </Button>
                  )}
                  <a href={`/companies/${employer.id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-navy-500" />
          <h3 className="text-lg font-medium text-white mb-2">No employers found</h3>
          <p className="text-navy-400">
            {verifiedFilter ? 'Try adjusting your filter' : 'No employers registered yet'}
          </p>
        </Card>
      )}

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

