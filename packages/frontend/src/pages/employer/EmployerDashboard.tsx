import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, Eye, Clock, Plus, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

export default function EmployerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['employer-dashboard'],
    queryFn: async () => {
      const response = await api.get<{
        stats: {
          totalJobs: number;
          activeJobs: number;
          draftJobs: number;
          totalApplications: number;
          pendingApplications: number;
          totalViews: number;
        };
        applicationsByStatus: Record<string, number>;
        recentApplications: Array<{
          id: string;
          jobId: string;
          jobTitle: string;
          seekerName: string;
          seekerAvatar: string | null;
          status: string;
          appliedAt: string;
        }>;
      }>('/employers/dashboard');
      return response.data!;
    },
  });

  const statCards = [
    { label: 'Active Jobs', value: data?.stats.activeJobs || 0, icon: Briefcase, color: 'primary' },
    { label: 'Total Applications', value: data?.stats.totalApplications || 0, icon: Users, color: 'violet' },
    { label: 'Pending Review', value: data?.stats.pendingApplications || 0, icon: Clock, color: 'amber' },
    { label: 'Total Views', value: data?.stats.totalViews || 0, icon: Eye, color: 'sky' },
  ];

  const statusColors: Record<string, 'secondary' | 'warning' | 'info' | 'success' | 'danger'> = {
    pending: 'secondary',
    reviewing: 'warning',
    shortlisted: 'info',
    interview: 'info',
    offered: 'success',
    rejected: 'danger',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Employer Dashboard</h1>
          <p className="text-navy-400 mt-1">Manage your job postings and applicants</p>
        </div>
        <Link to="/employer/jobs/new">
          <Button>
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-navy-400">{stat.label}</span>
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mt-3">{stat.value}</div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/employer/jobs" className="block">
          <Card variant="hover" className="text-center">
            <Briefcase className="w-8 h-8 text-primary-400 mx-auto mb-3" />
            <div className="font-medium text-white">Manage Jobs</div>
            <div className="text-sm text-navy-400 mt-1">
              {data?.stats.totalJobs || 0} total postings
            </div>
          </Card>
        </Link>
        <Link to="/employer/profile" className="block">
          <Card variant="hover" className="text-center">
            <Building2 className="w-8 h-8 text-accent-violet mx-auto mb-3" />
            <div className="font-medium text-white">Company Profile</div>
            <div className="text-sm text-navy-400 mt-1">Update your brand</div>
          </Card>
        </Link>
        <Link to="/employer/jobs/new" className="block">
          <Card variant="hover" className="text-center">
            <Plus className="w-8 h-8 text-accent-emerald mx-auto mb-3" />
            <div className="font-medium text-white">Post a Job</div>
            <div className="text-sm text-navy-400 mt-1">Attract top talent</div>
          </Card>
        </Link>
      </div>

      {/* Recent Applications */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
          <Link to="/employer/jobs">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-navy-700/30 rounded-xl">
                <div className="w-10 h-10 bg-navy-600 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-navy-600 rounded w-3/4" />
                  <div className="h-3 bg-navy-600 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.recentApplications.length ? (
          <div className="space-y-4">
            {data.recentApplications.map((app) => (
              <Link
                key={app.id}
                to={`/employer/jobs/${app.jobId}/applicants`}
                className="flex items-center gap-4 p-4 bg-navy-700/30 rounded-xl hover:bg-navy-700/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center overflow-hidden">
                  {app.seekerAvatar ? (
                    <img src={app.seekerAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-4 h-4 text-navy-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{app.seekerName || 'Anonymous'}</div>
                  <div className="text-sm text-navy-400">Applied for {app.jobTitle}</div>
                </div>
                <div className="text-right">
                  <Badge variant={statusColors[app.status] || 'secondary'}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                  <div className="text-xs text-navy-500 mt-1">
                    {formatRelativeTime(app.appliedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-navy-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No applications yet</p>
            <Link to="/employer/jobs/new" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
              Post a job to start receiving applications
            </Link>
          </div>
        )}
      </Card>

      {/* Application Funnel */}
      {data?.applicationsByStatus && Object.keys(data.applicationsByStatus).length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-white mb-6">Application Pipeline</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(data.applicationsByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-navy-700/30 rounded-xl">
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-xs text-navy-400 mt-1 capitalize">{status}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

