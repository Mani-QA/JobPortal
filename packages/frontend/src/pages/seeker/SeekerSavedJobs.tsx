import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { JobCard } from '@/components/jobs/JobCard';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { useUnsaveJob } from '@/hooks/useJobs';
import { api } from '@/lib/api';
import type { PaginatedResponse, JobWithEmployer } from '@job-portal/shared';

interface SavedJob {
  id: string;
  savedAt: string;
  job: JobWithEmployer;
  employer: JobWithEmployer['employer'];
}

export default function SeekerSavedJobs() {
  const [page, setPage] = useState(1);
  const unsaveJob = useUnsaveJob();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['seeker-saved-jobs', page],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<SavedJob>>('/seekers/saved-jobs', {
        page,
        pageSize: 12,
      });
      return response.data!;
    },
  });

  const handleUnsave = async (jobId: string) => {
    await unsaveJob.mutateAsync(jobId);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Saved Jobs</h1>
        <p className="text-navy-400 mt-1">
          Jobs you've bookmarked for later ({data?.total || 0} saved)
        </p>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.items.length ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((saved, index) => (
            <motion.div
              key={saved.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <JobCard
                job={{
                  ...saved.job,
                  employer: saved.employer,
                } as JobWithEmployer}
                isSaved={true}
                onUnsave={handleUnsave}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Heart className="w-12 h-12 mx-auto mb-4 text-navy-500" />
          <h3 className="text-lg font-medium text-white mb-2">No saved jobs yet</h3>
          <p className="text-navy-400 mb-6">
            Save jobs while browsing to keep track of opportunities you're interested in
          </p>
          <a href="/jobs">
            <Button>Browse Jobs</Button>
          </a>
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

