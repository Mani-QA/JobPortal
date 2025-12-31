import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Building2, Users, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/SEO';
import { api } from '@/lib/api';
import { INDUSTRIES } from '@job-portal/shared';

interface Company {
  id: string;
  companyName: string;
  description: string | null;
  logoUrl: string | null;
  industry: string;
  companySize: string | null;
  foundedYear: number | null;
  verified: boolean;
  activeJobCount: number;
}

interface CompanySearchResult {
  items: Company[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function CompaniesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current filters from URL
  const query = searchParams.get('query') || '';
  const industry = searchParams.get('industry') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Local state for form inputs
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedIndustry, setSelectedIndustry] = useState(industry);

  // Fetch companies
  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', query, industry, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (industry) params.set('industry', industry);
      params.set('page', page.toString());
      params.set('pageSize', '20');

      const response = await api.get<CompanySearchResult>(`/employers?${params.toString()}`);
      return response.data;
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (selectedIndustry) params.set('industry', selectedIndustry);
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('');
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Companies Hiring - Explore Top Employers"
        description="Discover companies actively hiring. Browse employer profiles, learn about company culture, and find your next career opportunity with top organizations."
        keywords={['companies', 'employers', 'hiring', 'company profiles', 'careers', 'jobs']}
        url="/companies"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Companies Hiring
          </h1>
          <p className="text-navy-300">
            Explore top employers and discover your next opportunity
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search companies by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
              />
            </div>
            <div className="md:w-64">
              <Select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                options={[
                  { value: '', label: 'All Industries' },
                  ...INDUSTRIES.map((ind) => ({ value: ind, label: ind })),
                ]}
              />
            </div>
            <Button onClick={handleSearch} variant="primary" className="px-8">
              Search
            </Button>
            {(query || industry) && (
              <Button onClick={clearFilters} variant="ghost">
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-navy-300">
            {isLoading ? 'Searching...' : `${data?.total || 0} companies found`}
          </p>
        </div>

        {/* Company Cards */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-400">Failed to load companies. Please try again.</p>
          </Card>
        ) : data?.items.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="w-12 h-12 text-navy-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No companies found</h3>
            <p className="text-navy-400 mb-4">Try adjusting your search criteria</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/companies/${company.id}`}>
                  <Card className="p-6 hover:border-teal-500/50 transition-all cursor-pointer h-full group">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-navy-700 border border-navy-600 flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={company.companyName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-navy-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white truncate group-hover:text-teal-400 transition-colors">
                            {company.companyName}
                          </h3>
                          {company.verified && (
                            <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {company.industry}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    {company.description && (
                      <p className="text-navy-400 text-sm mb-4 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-navy-400 mb-4">
                      {company.companySize && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {company.companySize}
                        </span>
                      )}
                      {company.foundedYear && (
                        <span>Est. {company.foundedYear}</span>
                      )}
                    </div>

                    {/* Jobs CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-navy-700">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-teal-500" />
                        <span className="text-white font-medium">
                          {company.activeJobCount} open position{company.activeJobCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, data.totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-teal-500 text-navy-900'
                        : 'bg-navy-700 text-navy-300 hover:bg-navy-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {data.totalPages > 5 && (
                <>
                  <span className="text-navy-400 px-2">...</span>
                  <button
                    onClick={() => handlePageChange(data.totalPages)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === data.totalPages
                        ? 'bg-teal-500 text-navy-900'
                        : 'bg-navy-700 text-navy-300 hover:bg-navy-600'
                    }`}
                  >
                    {data.totalPages}
                  </button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= data.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

