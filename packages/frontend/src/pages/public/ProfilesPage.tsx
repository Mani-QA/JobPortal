import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, SlidersHorizontal, X, User, Briefcase, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/SEO';
import { api } from '@/lib/api';
interface PublicProfile {
  id: string;
  fullName: string;
  headline: string | null;
  avatarUrl: string | null;
  location: string | null;
  skills: string[];
  currentRole: string | null;
  yearsOfExperience: number;
  desiredRoles: string[];
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProfileSearchResult {
  items: PublicProfile[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const EXPERIENCE_RANGES = [
  { label: 'Fresher (0-1 years)', min: 0, max: 1 },
  { label: 'Junior (1-3 years)', min: 1, max: 3 },
  { label: 'Mid-level (3-5 years)', min: 3, max: 5 },
  { label: 'Senior (5-10 years)', min: 5, max: 10 },
  { label: 'Expert (10+ years)', min: 10, max: 50 },
];

const POPULAR_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Python', 'Java', '.NET', 'Node.js',
  'AWS', 'Azure', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'GraphQL',
  'Agile', 'Scrum', 'Product Management', 'UX Design', 'Data Science',
];

export default function ProfilesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Get current filters from URL
  const query = searchParams.get('query') || '';
  const skills = searchParams.get('skills') || '';
  const location = searchParams.get('location') || '';
  const minExp = searchParams.get('minExperience') || '';
  const maxExp = searchParams.get('maxExperience') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Local state for form inputs
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchLocation, setSearchLocation] = useState(location);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    skills ? skills.split(',') : []
  );
  const [experienceRange, setExperienceRange] = useState<{ min?: number; max?: number }>({
    min: minExp ? parseInt(minExp) : undefined,
    max: maxExp ? parseInt(maxExp) : undefined,
  });

  // Fetch profiles
  const { data, isLoading, error } = useQuery({
    queryKey: ['profiles', query, skills, location, minExp, maxExp, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (skills) params.set('skills', skills);
      if (location) params.set('location', location);
      if (minExp) params.set('minExperience', minExp);
      if (maxExp) params.set('maxExperience', maxExp);
      params.set('page', page.toString());
      params.set('pageSize', '20');

      const response = await api.get<ProfileSearchResult>(`/profiles?${params.toString()}`);
      return response.data;
    },
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','));
    if (searchLocation) params.set('location', searchLocation);
    if (experienceRange.min !== undefined) params.set('minExperience', experienceRange.min.toString());
    if (experienceRange.max !== undefined) params.set('maxExperience', experienceRange.max.toString());
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSearchLocation('');
    setSelectedSkills([]);
    setExperienceRange({});
    setSearchParams({});
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const selectExperienceRange = (range: { min: number; max: number }) => {
    if (experienceRange.min === range.min && experienceRange.max === range.max) {
      setExperienceRange({});
    } else {
      setExperienceRange(range);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const activeFilterCount = [
    selectedSkills.length > 0 ? 1 : 0,
    experienceRange.min !== undefined ? 1 : 0,
    searchLocation ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen py-8">
      <SEO
        title="Find Talent - Browse Candidate Profiles"
        description="Discover skilled professionals for your team. Search candidates by skills, experience level, and location. Connect with top talent in tech, design, management and more."
        keywords={['candidates', 'talent search', 'hiring', 'professionals', 'job seekers', 'recruitment']}
        url="/profiles"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Find Talent
          </h1>
          <p className="text-navy-300">
            Discover skilled professionals for your team
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search by skill, role, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
              />
            </div>
            <div className="relative md:w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
              />
            </div>
            <Button onClick={handleSearch} variant="primary" className="px-8">
              Search
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="relative"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="ml-2">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-teal-500 text-navy-900 text-xs font-bold rounded-full flex items-center justify-center">
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
            className="mb-6"
          >
            <Card className="p-6 bg-navy-800/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>

              {/* Skills Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-navy-300 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                          : 'bg-navy-700 text-navy-300 border border-navy-600 hover:border-navy-500'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-navy-300 mb-3">Experience Level</h4>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => selectExperienceRange(range)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        experienceRange.min === range.min && experienceRange.max === range.max
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                          : 'bg-navy-700 text-navy-300 border border-navy-600 hover:border-navy-500'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSearch} variant="primary">
                Apply Filters
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-navy-300">
            {isLoading ? 'Searching...' : `${data?.total || 0} candidates found`}
          </p>
        </div>

        {/* Profile Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <p className="text-red-400">Failed to load profiles. Please try again.</p>
          </Card>
        ) : data?.items.length === 0 ? (
          <Card className="p-8 text-center">
            <User className="w-12 h-12 text-navy-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No profiles found</h3>
            <p className="text-navy-400 mb-4">Try adjusting your search criteria</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data?.items.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/profiles/${profile.id}`}>
                  <Card className="p-5 hover:border-teal-500/50 transition-colors cursor-pointer h-full">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-xl bg-navy-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-navy-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {profile.fullName}
                        </h3>
                        {profile.headline && (
                          <p className="text-navy-300 text-sm truncate">{profile.headline}</p>
                        )}
                        {profile.currentRole && (
                          <div className="flex items-center gap-1.5 text-navy-400 text-sm mt-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span className="truncate">{profile.currentRole}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {profile.location && (
                            <div className="flex items-center gap-1 text-navy-400 text-xs">
                              <MapPin className="w-3 h-3" />
                              <span>{profile.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-navy-400 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{profile.yearsOfExperience} years exp</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {profile.skills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="default" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profile.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.skills.length - 5}
                        </Badge>
                      )}
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

