import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  UserCheck
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

interface DashboardStats {
  totalUsers: number;
  totalEmployers: number;
  totalJobSeekers: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  usersThisMonth: number;
  jobsThisMonth: number;
  applicationsThisMonth: number;
  userGrowth: number;
  jobGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registered' | 'job_posted' | 'application_submitted' | 'job_closed';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Mock data for development
const mockStats: DashboardStats = {
  totalUsers: 12847,
  totalEmployers: 1256,
  totalJobSeekers: 11591,
  totalJobs: 3421,
  activeJobs: 2156,
  totalApplications: 45678,
  pendingApplications: 8934,
  usersThisMonth: 847,
  jobsThisMonth: 234,
  applicationsThisMonth: 3421,
  userGrowth: 12.5,
  jobGrowth: 8.3,
};

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'user_registered',
    description: 'New employer registered: TechCorp Inc.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'job_posted',
    description: 'New job posted: Senior React Developer at StartupXYZ',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '3',
    type: 'application_submitted',
    description: 'Application submitted for Product Manager role',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '4',
    type: 'job_closed',
    description: 'Job closed: Data Analyst at FinanceHub',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '5',
    type: 'user_registered',
    description: 'New job seeker registered: John Smith',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

const mockPendingReviews = [
  { id: '1', type: 'job', title: 'Suspicious job posting: "Easy Money"', priority: 'high' },
  { id: '2', type: 'user', title: 'Reported user: spam@example.com', priority: 'medium' },
  { id: '3', type: 'job', title: 'Job with incomplete details', priority: 'low' },
];

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // In production, these would be real API calls
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats', timeRange],
    queryFn: async () => {
      // const { data } = await api.get('/admin/stats', { params: { timeRange } });
      // return data;
      return mockStats;
    },
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      // const { data } = await api.get('/admin/activity');
      // return data;
      return mockRecentActivity;
    },
  });

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registered':
        return <UserCheck className="w-4 h-4 text-emerald-500" />;
      case 'job_posted':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'application_submitted':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'job_closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and management</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))
        ) : (
          <>
            <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{stats?.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-indigo-200" />
                    <span className="text-indigo-100 text-sm">+{stats?.userGrowth}% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Active Jobs</p>
                  <p className="text-3xl font-bold mt-1">{stats?.activeJobs.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-200" />
                    <span className="text-emerald-100 text-sm">+{stats?.jobGrowth}% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Briefcase className="w-8 h-8" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Applications</p>
                  <p className="text-3xl font-bold mt-1">{stats?.totalApplications.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <FileText className="w-4 h-4 text-purple-200" />
                    <span className="text-purple-100 text-sm">{stats?.pendingApplications.toLocaleString()} pending</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="w-8 h-8" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Companies</p>
                  <p className="text-3xl font-bold mt-1">{stats?.totalEmployers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Building2 className="w-4 h-4 text-amber-200" />
                    <span className="text-amber-100 text-sm">{stats?.totalJobs.toLocaleString()} total jobs</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Building2 className="w-8 h-8" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900">User Breakdown</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Job Seekers</span>
                <span className="font-medium text-gray-900">{stats?.totalJobSeekers.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(stats?.totalJobSeekers || 0) / (stats?.totalUsers || 1) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Employers</span>
                <span className="font-medium text-gray-900">{stats?.totalEmployers.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(stats?.totalEmployers || 0) / (stats?.totalUsers || 1) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Job Status</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Active Jobs</span>
                <span className="font-medium text-gray-900">{stats?.activeJobs.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(stats?.activeJobs || 0) / (stats?.totalJobs || 1) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Closed/Archived</span>
                <span className="font-medium text-gray-900">{((stats?.totalJobs || 0) - (stats?.activeJobs || 0)).toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${((stats?.totalJobs || 0) - (stats?.activeJobs || 0)) / (stats?.totalJobs || 1) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">This Month</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.usersThisMonth}</p>
              <p className="text-xs text-gray-500">New Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.jobsThisMonth}</p>
              <p className="text-xs text-gray-500">New Jobs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.applicationsThisMonth}</p>
              <p className="text-xs text-gray-500">Applications</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity and Pending Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </button>
          </div>
          {activityLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Reviews */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Pending Reviews</h3>
            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              {mockPendingReviews.length} items
            </span>
          </div>
          <div className="space-y-3">
            {mockPendingReviews.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-lg border ${getPriorityColor(item.priority)} transition-colors hover:opacity-90 cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <span className="text-xs font-medium uppercase">{item.priority}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
            Review All Items
          </button>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group">
            <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-indigo-100 transition-colors">
              <Users className="w-6 h-6 text-gray-600 group-hover:text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Manage Users</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group">
            <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <Briefcase className="w-6 h-6 text-gray-600 group-hover:text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">Review Jobs</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
            <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-purple-100 transition-colors">
              <FileText className="w-6 h-6 text-gray-600 group-hover:text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">View Reports</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors group">
            <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-amber-100 transition-colors">
              <Activity className="w-6 h-6 text-gray-600 group-hover:text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">System Health</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
