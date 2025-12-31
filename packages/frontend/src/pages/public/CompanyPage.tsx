import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, Calendar, CheckCircle2, Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { JobCard } from '@/components/jobs/JobCard';
import { Skeleton, JobCardSkeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/SEO';
import { api } from '@/lib/api';
import type { EmployerProfile, JobWithEmployer, PaginatedResponse } from '@job-portal/shared';

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const response = await api.get<EmployerProfile & { activeJobCount: number }>(`/employers/${id}`);
      return response.data!;
    },
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['company-jobs', id],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<JobWithEmployer>>('/jobs', { 
        employerId: id,
        status: 'active',
        pageSize: 10,
      });
      return response.data!;
    },
  });

  if (companyLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-32 w-full rounded-2xl mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Company Not Found</h1>
        <p className="text-navy-400 mb-8">The company you're looking for doesn't exist.</p>
        <Link to="/jobs">
          <Button>Browse Jobs</Button>
        </Link>
      </div>
    );
  }

  // Create description for SEO
  const seoDescription = company.description
    ? `${company.companyName} - ${company.industry}. ${company.description.substring(0, 150)}...`
    : `${company.companyName} is a ${company.industry} company with ${company.activeJobCount} open positions. View company profile and job listings.`;

  return (
    <div className="min-h-screen py-8">
      <SEO
        title={`${company.companyName} - Jobs & Company Profile`}
        description={seoDescription}
        keywords={[
          company.companyName,
          company.industry,
          'jobs',
          'careers',
          'company profile',
          company.companySize || '',
        ]}
        url={`/companies/${id}`}
        type="profile"
        image={company.logoUrl}
        organization={{
          name: company.companyName,
          description: company.description || '',
          logo: company.logoUrl,
          industry: company.industry,
          foundedYear: company.foundedYear,
        }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-navy-700 border border-navy-600 flex items-center justify-center overflow-hidden flex-shrink-0 p-2">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-10 h-10 text-navy-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-display font-bold text-white">
                  {company.companyName}
                </h1>
                {company.verified && (
                  <Badge variant="success">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-navy-400">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  {company.industry}
                </span>
                {company.companySize && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {company.companySize}
                  </span>
                )}
                {company.foundedYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Founded {company.foundedYear}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">{company.activeJobCount}</div>
                <div className="text-sm text-navy-400">Open Jobs</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* About */}
        <Card className="mb-8">
          <h2 className="text-xl font-display font-semibold text-white mb-4">
            About {company.companyName}
          </h2>
          <p className="text-navy-300 whitespace-pre-wrap">
            {company.description || 'No description provided.'}
          </p>
        </Card>

        {/* Open Positions */}
        <div>
          <h2 className="text-xl font-display font-semibold text-white mb-6">
            Open Positions ({company.activeJobCount})
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {jobsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)
            ) : jobs?.items.length ? (
              jobs.items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-navy-400">
                No open positions at the moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

