import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, Briefcase, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';

interface AnalyticsData {
  usersOverTime: Array<{ date: string; count: number }>;
  jobsOverTime: Array<{ date: string; count: number }>;
  applicationsOverTime: Array<{ date: string; count: number }>;
  topIndustries: Array<{ industry: string; count: number }>;
  topJobTypes: Array<{ job_type: string; count: number }>;
  applicationFunnel: Record<string, number>;
}

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const response = await api.get<AnalyticsData>('/admin/analytics');
      return response.data!;
    },
  });

  const funnelSteps = ['pending', 'reviewing', 'shortlisted', 'interview', 'offered', 'rejected'];
  const funnelColors = ['bg-navy-500', 'bg-accent-amber', 'bg-accent-sky', 'bg-accent-violet', 'bg-accent-emerald', 'bg-accent-rose'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-navy-700 rounded animate-pulse" />
        <div className="grid lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-navy-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Analytics</h1>
        <p className="text-navy-400 mt-1">Platform insights and metrics</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Users Over Time */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-primary-400" />
            <h2 className="font-semibold text-white">New Users (Last 30 Days)</h2>
          </div>
          <div className="h-48">
            <div className="flex items-end justify-between h-full gap-1">
              {data?.usersOverTime.slice(-30).map((day, i) => {
                const maxCount = Math.max(...(data?.usersOverTime.map(d => d.count) || [1]));
                const height = (day.count / maxCount) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-primary-500/30 hover:bg-primary-500/50 transition-colors rounded-t"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.date}: ${day.count} users`}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-navy-400">
            Total: {data?.usersOverTime.reduce((sum, d) => sum + d.count, 0) || 0} new users
          </div>
        </Card>

        {/* Jobs Over Time */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="w-5 h-5 text-accent-violet" />
            <h2 className="font-semibold text-white">New Jobs (Last 30 Days)</h2>
          </div>
          <div className="h-48">
            <div className="flex items-end justify-between h-full gap-1">
              {data?.jobsOverTime.slice(-30).map((day, i) => {
                const maxCount = Math.max(...(data?.jobsOverTime.map(d => d.count) || [1]));
                const height = (day.count / maxCount) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-accent-violet/30 hover:bg-accent-violet/50 transition-colors rounded-t"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.date}: ${day.count} jobs`}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-navy-400">
            Total: {data?.jobsOverTime.reduce((sum, d) => sum + d.count, 0) || 0} new jobs
          </div>
        </Card>

        {/* Application Funnel */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-accent-amber" />
            <h2 className="font-semibold text-white">Application Funnel</h2>
          </div>
          <div className="space-y-4">
            {funnelSteps.map((step, i) => {
              const count = data?.applicationFunnel[step] || 0;
              const total = Object.values(data?.applicationFunnel || {}).reduce((a, b) => a + b, 1);
              const percentage = (count / total) * 100;
              return (
                <div key={step}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-navy-300 capitalize">{step}</span>
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                  <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${funnelColors[i]} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Industries */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-accent-emerald" />
            <h2 className="font-semibold text-white">Top Industries</h2>
          </div>
          <div className="space-y-3">
            {data?.topIndustries.slice(0, 8).map((industry) => {
              const maxCount = data?.topIndustries[0]?.count || 1;
              const percentage = (industry.count / maxCount) * 100;
              return (
                <div key={industry.industry}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-navy-300">{industry.industry}</span>
                    <span className="text-sm font-medium text-white">{industry.count}</span>
                  </div>
                  <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-emerald rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Job Types */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-accent-sky" />
            <h2 className="font-semibold text-white">Job Types Distribution</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {data?.topJobTypes.map((jobType) => (
              <div key={jobType.job_type} className="text-center p-4 bg-navy-700/30 rounded-xl">
                <div className="text-2xl font-bold text-white">{jobType.count}</div>
                <div className="text-sm text-navy-400 mt-1">{jobType.job_type}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Applications Over Time */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-accent-coral" />
            <h2 className="font-semibold text-white">Applications (Last 30 Days)</h2>
          </div>
          <div className="h-48">
            <div className="flex items-end justify-between h-full gap-1">
              {data?.applicationsOverTime.slice(-30).map((day, i) => {
                const maxCount = Math.max(...(data?.applicationsOverTime.map(d => d.count) || [1]));
                const height = (day.count / maxCount) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-accent-coral/30 hover:bg-accent-coral/50 transition-colors rounded-t"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.date}: ${day.count} applications`}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-navy-400">
            Total: {data?.applicationsOverTime.reduce((sum, d) => sum + d.count, 0) || 0} applications
          </div>
        </Card>
      </div>
    </div>
  );
}

