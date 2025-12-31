import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { JobCard } from '@/components/jobs/JobCard';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/SEO';
import { useJobSearch, useSaveJob, useUnsaveJob } from '@/hooks/useJobs';
import { INDUSTRIES, JOB_TYPES, EXPERIENCE_LEVELS } from '@job-portal/shared';
import type { JobSearchParams, LocationType } from '@job-portal/shared';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  // Parse URL params
  const filters: JobSearchParams = {
    query: searchParams.get('query') || undefined,
    location: searchParams.get('location') || undefined,
    locationType: searchParams.getAll('locationType') as LocationType[],
    jobType: searchParams.getAll('jobType'),
    industry: searchParams.getAll('industry'),
    experienceLevel: searchParams.getAll('experienceLevel'),
    minSalary: searchParams.get('minSalary') ? Number(searchParams.get('minSalary')) : undefined,
    page: Number(searchParams.get('page')) || 1,
    pageSize: 12,
    sortBy: (searchParams.get('sortBy') as 'date' | 'salary' | 'relevance') || 'date',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };

  const { data, isLoading } = useJobSearch(filters);

  const updateFilters = (newFilters: Partial<JobSearchParams>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, String(value));
      }
    });

    // Reset to page 1 when filters change
    if (!newFilters.page) {
      params.delete('page');
    }

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount: number = [
    filters.locationType?.length ?? 0,
    filters.jobType?.length ?? 0,
    filters.industry?.length ?? 0,
    filters.experienceLevel?.length ?? 0,
    filters.minSalary ? 1 : 0,
  ].reduce((acc, val) => acc + val, 0);

  const handleSave = (jobId: string) => {
    saveJob.mutate(jobId);
    setSavedJobs((prev) => new Set(prev).add(jobId));
  };

  const handleUnsave = (jobId: string) => {
    unsaveJob.mutate(jobId);
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(jobId);
      return newSet;
    });
  };

  const locationTypeOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
  ];

  // Build SEO title and description based on filters
  const getSeoTitle = () => {
    const parts: string[] = [];
    if (filters.query) parts.push(filters.query);
    if (filters.jobType?.length) parts.push(filters.jobType[0]);
    if (filters.location) parts.push(`in ${filters.location}`);
    if (filters.industry?.length) parts.push(`in ${filters.industry[0]}`);
    
    if (parts.length > 0) {
      return `${parts.join(' ')} Jobs`;
    }
    return 'Browse All Jobs';
  };

  const getSeoDescription = () => {
    const count = data?.total || 0;
    const parts: string[] = [`Browse ${count}+ jobs`];
    if (filters.query) parts.push(`for "${filters.query}"`);
    if (filters.location) parts.push(`in ${filters.location}`);
    if (filters.industry?.length) parts.push(`in ${filters.industry[0]}`);
    parts.push('on JobPortal. Find your dream career today.');
    return parts.join(' ');
  };

  return (
    <div className="min-h-screen py-8">
      <SEO
        title={getSeoTitle()}
        description={getSeoDescription()}
        keywords={[
          'jobs',
          'careers',
          filters.query || '',
          filters.location || '',
          ...(filters.industry || []),
          ...(filters.jobType || []),
        ].filter(Boolean)}
        url={`/jobs${window.location.search}`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-6">
            Find Your Perfect Job
          </h1>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={filters.query || ''}
                onChange={(e) => updateFilters({ query: e.target.value || undefined })}
                className="input pl-12"
              />
            </div>
            <div className="sm:w-64 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location || ''}
                onChange={(e) => updateFilters({ location: e.target.value || undefined })}
                className="input pl-12"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-navy-950 text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-navy-800/50 border border-navy-700 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Location Type */}
              <div>
                <label className="label">Work Type</label>
                <div className="flex flex-wrap gap-2">
                  {locationTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        const current = filters.locationType || [];
                        const newValue = current.includes(option.value as LocationType)
                          ? current.filter((v) => v !== option.value)
                          : [...current, option.value as LocationType];
                        updateFilters({ locationType: newValue });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        filters.locationType?.includes(option.value as LocationType)
                          ? 'bg-primary-500/10 border-primary-500/50 text-primary-400'
                          : 'bg-navy-700/50 border-navy-600 text-navy-300 hover:border-navy-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label className="label">Job Type</label>
                <Select
                  options={JOB_TYPES.map((t) => ({ value: t, label: t }))}
                  placeholder="Select job type"
                  value={filters.jobType?.[0] || ''}
                  onChange={(e) => updateFilters({ jobType: e.target.value ? [e.target.value] : [] })}
                />
              </div>

              {/* Industry */}
              <div>
                <label className="label">Industry</label>
                <Select
                  options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
                  placeholder="Select industry"
                  value={filters.industry?.[0] || ''}
                  onChange={(e) => updateFilters({ industry: e.target.value ? [e.target.value] : [] })}
                />
              </div>

              {/* Experience Level */}
              <div>
                <label className="label">Experience Level</label>
                <Select
                  options={EXPERIENCE_LEVELS.map((e) => ({ value: e, label: e }))}
                  placeholder="Select level"
                  value={filters.experienceLevel?.[0] || ''}
                  onChange={(e) => updateFilters({ experienceLevel: e.target.value ? [e.target.value] : [] })}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.locationType?.map((type) => (
              <Badge key={type} variant="primary" className="cursor-pointer" onClick={() => {
                updateFilters({ locationType: filters.locationType?.filter((t) => t !== type) });
              }}>
                {type}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.jobType?.map((type) => (
              <Badge key={type} variant="primary" className="cursor-pointer" onClick={() => {
                updateFilters({ jobType: filters.jobType?.filter((t) => t !== type) });
              }}>
                {type}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.industry?.map((ind) => (
              <Badge key={ind} variant="primary" className="cursor-pointer" onClick={() => {
                updateFilters({ industry: filters.industry?.filter((i) => i !== ind) });
              }}>
                {ind}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-navy-400">
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                <span className="text-white font-semibold">{data?.total || 0}</span> jobs found
              </>
            )}
          </p>

          <div className="flex items-center gap-4">
            <Select
              options={[
                { value: 'date', label: 'Most Recent' },
                { value: 'salary', label: 'Highest Salary' },
                { value: 'relevance', label: 'Most Relevant' },
              ]}
              value={filters.sortBy || 'date'}
              onChange={(e) => updateFilters({ sortBy: e.target.value as 'date' | 'salary' | 'relevance' })}
              className="w-40"
            />
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, i) => <JobCardSkeleton key={i} />)
          ) : data?.items.length ? (
            data.items.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSave={handleSave}
                onUnsave={handleUnsave}
                isSaved={savedJobs.has(job.id)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-navy-400 text-lg">No jobs found matching your criteria</div>
              <p className="text-navy-500 mt-2">Try adjusting your filters or search terms</p>
              <Button variant="outline" onClick={clearFilters} className="mt-6">
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={filters.page === 1}
              onClick={() => updateFilters({ page: (filters.page || 1) - 1 })}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => updateFilters({ page })}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      filters.page === page
                        ? 'bg-primary-500 text-navy-950'
                        : 'bg-navy-800 text-navy-300 hover:bg-navy-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {data.totalPages > 5 && (
                <>
                  <span className="text-navy-500">...</span>
                  <button
                    onClick={() => updateFilters({ page: data.totalPages })}
                    className="w-10 h-10 rounded-lg text-sm font-medium bg-navy-800 text-navy-300 hover:bg-navy-700"
                  >
                    {data.totalPages}
                  </button>
                </>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={filters.page === data.totalPages}
              onClick={() => updateFilters({ page: (filters.page || 1) + 1 })}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

