import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Heart, Bell, Clock, CheckCircle2, XCircle, TrendingUp, Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

export default function SeekerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['seeker-dashboard'],
    queryFn: async () => {
      const response = await api.get<{
        stats: {
          totalApplications: number;
          pending: number;
          reviewing: number;
          shortlisted: number;
          interview: number;
          offered: number;
          rejected: number;
          savedJobs: number;
          activeAlerts: number;
        };
        recentApplications: Array<{
          id: string;
          jobId: string;
          jobTitle: string;
          location: string | null;
          companyName: string;
          companyLogo: string | null;
          status: string;
          appliedAt: string;
        }>;
      }>('/seekers/dashboard');
      return response.data!;
    },
  });

  const statCards = [
    { label: 'Total Applications', value: data?.stats.totalApplications || 0, icon: FileText, color: 'primary' },
    { label: 'In Progress', value: (data?.stats.pending || 0) + (data?.stats.reviewing || 0), icon: Clock, color: 'warning' },
    { label: 'Interviews', value: data?.stats.interview || 0, icon: TrendingUp, color: 'info' },
    { label: 'Saved Jobs', value: data?.stats.savedJobs || 0, icon: Heart, color: 'rose' },
  ];

  const statusColors: Record<string, 'secondary' | 'warning' | 'info' | 'success' | 'danger'> = {
    pending: 'secondary',
    reviewing: 'warning',
    shortlisted: 'info',
    interview: 'info',
    offered: 'success',
    rejected: 'danger',
    withdrawn: 'secondary',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-navy-400 mt-1">Track your job search progress</p>
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
        <Link to="/jobs" className="block">
          <Card variant="hover" className="text-center">
            <Briefcase className="w-8 h-8 text-primary-400 mx-auto mb-3" />
            <div className="font-medium text-white">Browse Jobs</div>
            <div className="text-sm text-navy-400 mt-1">Find new opportunities</div>
          </Card>
        </Link>
        <Link to="/seeker/profile" className="block">
          <Card variant="hover" className="text-center">
            <FileText className="w-8 h-8 text-accent-violet mx-auto mb-3" />
            <div className="font-medium text-white">Update Profile</div>
            <div className="text-sm text-navy-400 mt-1">Keep your info current</div>
          </Card>
        </Link>
        <Link to="/seeker/alerts" className="block">
          <Card variant="hover" className="text-center">
            <Bell className="w-8 h-8 text-accent-amber mx-auto mb-3" />
            <div className="font-medium text-white">Job Alerts</div>
            <div className="text-sm text-navy-400 mt-1">{data?.stats.activeAlerts || 0} active alerts</div>
          </Card>
        </Link>
      </div>

      {/* Recent Applications */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
          <Link to="/seeker/applications">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-navy-700/30 rounded-xl">
                <div className="w-12 h-12 bg-navy-600 rounded-xl" />
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
                to={`/seeker/applications`}
                className="flex items-center gap-4 p-4 bg-navy-700/30 rounded-xl hover:bg-navy-700/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center overflow-hidden">
                  {app.companyLogo ? (
                    <img src={app.companyLogo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-navy-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{app.jobTitle}</div>
                  <div className="text-sm text-navy-400">{app.companyName}</div>
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
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No applications yet</p>
            <Link to="/jobs" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
              Start applying to jobs
            </Link>
          </div>
        )}
      </Card>

      {/* Application Status Overview */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6">Application Status Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Pending', value: data?.stats.pending || 0, icon: Clock, color: 'text-navy-400' },
            { label: 'Reviewing', value: data?.stats.reviewing || 0, icon: FileText, color: 'text-accent-amber' },
            { label: 'Shortlisted', value: data?.stats.shortlisted || 0, icon: CheckCircle2, color: 'text-accent-sky' },
            { label: 'Interview', value: data?.stats.interview || 0, icon: TrendingUp, color: 'text-accent-violet' },
            { label: 'Offered', value: data?.stats.offered || 0, icon: CheckCircle2, color: 'text-accent-emerald' },
            { label: 'Rejected', value: data?.stats.rejected || 0, icon: XCircle, color: 'text-accent-rose' },
          ].map((status) => (
            <div key={status.label} className="text-center p-4 bg-navy-700/30 rounded-xl">
              <status.icon className={`w-6 h-6 mx-auto mb-2 ${status.color}`} />
              <div className="text-2xl font-bold text-white">{status.value}</div>
              <div className="text-xs text-navy-400 mt-1">{status.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

