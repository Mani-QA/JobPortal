import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  TrendingUp,
  Archive
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import api from '../../lib/api';

interface AdminJob {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  location: 'remote' | 'hybrid' | 'on-site';
  locationType: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  status: 'active' | 'pending' | 'expired' | 'rejected' | 'archived';
  applicationsCount: number;
  views: number;
  createdAt: string;
  expiresAt: string;
  flagged: boolean;
  flagReason?: string;
}

// Mock data for development
const mockJobs: AdminJob[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: { id: '1', name: 'TechCorp Inc.', logo: undefined },
    location: 'remote',
    locationType: 'San Francisco, CA',
    salaryMin: 120000,
    salaryMax: 180000,
    currency: 'USD',
    status: 'active',
    applicationsCount: 45,
    views: 1234,
    createdAt: '2024-12-15T10:00:00Z',
    expiresAt: '2025-01-15T10:00:00Z',
    flagged: false,
  },
  {
    id: '2',
    title: 'Product Manager',
    company: { id: '2', name: 'StartupXYZ', logo: undefined },
    location: 'hybrid',
    locationType: 'New York, NY',
    salaryMin: 100000,
    salaryMax: 150000,
    currency: 'USD',
    status: 'pending',
    applicationsCount: 0,
    views: 56,
    createdAt: '2024-12-30T14:00:00Z',
    expiresAt: '2025-01-30T14:00:00Z',
    flagged: false,
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: { id: '3', name: 'DataHub Analytics', logo: undefined },
    location: 'on-site',
    locationType: 'Austin, TX',
    salaryMin: 110000,
    salaryMax: 160000,
    currency: 'USD',
    status: 'active',
    applicationsCount: 23,
    views: 892,
    createdAt: '2024-12-10T08:00:00Z',
    expiresAt: '2025-01-10T08:00:00Z',
    flagged: true,
    flagReason: 'Potentially misleading salary information',
  },
  {
    id: '4',
    title: 'UX Designer',
    company: { id: '4', name: 'DesignStudio Co.', logo: undefined },
    location: 'remote',
    locationType: 'Los Angeles, CA',
    salaryMin: 80000,
    salaryMax: 120000,
    currency: 'USD',
    status: 'expired',
    applicationsCount: 67,
    views: 2341,
    createdAt: '2024-11-01T09:00:00Z',
    expiresAt: '2024-12-01T09:00:00Z',
    flagged: false,
  },
  {
    id: '5',
    title: 'Marketing Specialist',
    company: { id: '5', name: 'GrowthEngine', logo: undefined },
    location: 'hybrid',
    locationType: 'Chicago, IL',
    salaryMin: 60000,
    salaryMax: 85000,
    currency: 'USD',
    status: 'rejected',
    applicationsCount: 0,
    views: 12,
    createdAt: '2024-12-28T16:00:00Z',
    expiresAt: '2025-01-28T16:00:00Z',
    flagged: true,
    flagReason: 'Inappropriate content detected',
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: { id: '1', name: 'TechCorp Inc.', logo: undefined },
    location: 'remote',
    locationType: 'Remote - USA',
    salaryMin: 130000,
    salaryMax: 190000,
    currency: 'USD',
    status: 'active',
    applicationsCount: 34,
    views: 567,
    createdAt: '2024-12-20T11:00:00Z',
    expiresAt: '2025-01-20T11:00:00Z',
    flagged: false,
  },
];

export default function AdminJobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  // Note: selectedJob state and itemsPerPage will be used when implementing job details modal

  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['admin-jobs', searchQuery, statusFilter, locationFilter, showFlaggedOnly, currentPage],
    queryFn: async () => {
      // const { data } = await api.get('/admin/jobs', {
      //   params: { search: searchQuery, status: statusFilter, location: locationFilter, flagged: showFlaggedOnly, page: currentPage, limit: 10 }
      // });
      // return data;
      return {
        jobs: mockJobs,
        total: mockJobs.length,
        page: 1,
        totalPages: 1,
      };
    },
  });

  const approveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.put(`/admin/jobs/${jobId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
  });

  const rejectJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.put(`/admin/jobs/${jobId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
  });

  const archiveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.put(`/admin/jobs/${jobId}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.delete(`/admin/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
  });

  const getStatusBadge = (status: string, flagged: boolean) => {
    if (flagged) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          <AlertTriangle className="w-3 h-3" />
          Flagged
        </span>
      );
    }

    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <Clock className="w-3 h-3" />
            Expired
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const getLocationBadge = (location: string) => {
    switch (location) {
      case 'remote':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Remote</Badge>;
      case 'hybrid':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Hybrid</Badge>;
      case 'on-site':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700">On-site</Badge>;
      default:
        return null;
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const daysUntilExpiry = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const filteredJobs = jobs?.jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
    const matchesFlagged = !showFlaggedOnly || job.flagged;
    return matchesSearch && matchesStatus && matchesLocation && matchesFlagged;
  });

  // Stats
  const stats = {
    total: jobs?.jobs.length || 0,
    active: jobs?.jobs.filter(j => j.status === 'active').length || 0,
    pending: jobs?.jobs.filter(j => j.status === 'pending').length || 0,
    flagged: jobs?.jobs.filter(j => j.flagged).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Job Management</h1>
          <p className="text-gray-600 mt-1">Review and manage all job postings on the platform</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Jobs</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">Active Jobs</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
              <p className="text-sm text-gray-500">Flagged</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search jobs by title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showFlaggedOnly}
                onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Flagged only</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Jobs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div>
                          <Skeleton className="w-40 h-4 mb-1" />
                          <Skeleton className="w-28 h-3" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="w-24 h-6" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-32 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-20 h-6" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-16 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-24 h-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="w-8 h-8 ml-auto" /></td>
                  </tr>
                ))
              ) : (
                filteredJobs?.map((job) => (
                  <tr key={job.id} className={`hover:bg-gray-50 transition-colors ${job.flagged ? 'bg-orange-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {job.company.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            {job.title}
                            {job.flagged && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {job.company.name}
                          </p>
                          {job.flagReason && (
                            <p className="text-xs text-orange-600 mt-1">{job.flagReason}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {getLocationBadge(job.location)}
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.locationType}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(job.status, job.flagged)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{job.applicationsCount}</span>
                        <span className="text-xs text-gray-500">({job.views} views)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${isExpiringSoon(job.expiresAt) ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                          {formatDate(job.expiresAt)}
                        </span>
                        {isExpiringSoon(job.expiresAt) && (
                          <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">Soon</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === job.id ? null : job.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        
                        {actionMenuOpen === job.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Job
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Edit Job
                            </button>
                            <hr className="my-1" />
                            {job.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => approveJobMutation.mutate(job.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve Job
                                </button>
                                <button 
                                  onClick={() => rejectJobMutation.mutate(job.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject Job
                                </button>
                              </>
                            )}
                            {job.status === 'active' && (
                              <button 
                                onClick={() => archiveJobMutation.mutate(job.id)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Archive className="w-4 h-4" />
                                Archive Job
                              </button>
                            )}
                            <button 
                              onClick={() => deleteJobMutation.mutate(job.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Job
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredJobs?.length || 0}</span> of{' '}
            <span className="font-medium">{jobs?.total || 0}</span> jobs
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              Page {currentPage} of {jobs?.totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(jobs?.totalPages || 1, currentPage + 1))}
              disabled={currentPage === (jobs?.totalPages || 1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
