import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Users, Building2, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { JobCard } from '@/components/jobs/JobCard';
import { useFeaturedJobs } from '@/hooks/useJobs';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/SEO';
import { INDUSTRIES } from '@job-portal/shared';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const { data: featuredJobs, isLoading } = useFeaturedJobs();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  const stats = [
    { label: 'Active Jobs', value: '10,000+', icon: Briefcase },
    { label: 'Companies', value: '2,500+', icon: Building2 },
    { label: 'Job Seekers', value: '50,000+', icon: Users },
    { label: 'Placements', value: '15,000+', icon: TrendingUp },
  ];

  const features = [
    'AI-powered job matching',
    'Real-time application tracking',
    'Direct employer messaging',
    'Salary insights and comparisons',
    'Resume builder and optimization',
    'Job alerts tailored to you',
  ];

  return (
    <div className="min-h-screen">
      <SEO
        title="Find Your Dream Career"
        description="JobPortal - Your gateway to top careers. Browse thousands of job listings from leading companies across India. Find remote, hybrid, and on-site opportunities in tech, finance, healthcare and more."
        keywords={[
          'job portal',
          'career',
          'employment',
          'hiring',
          'India jobs',
          'remote jobs',
          'tech jobs',
          'Bangalore jobs',
          'Chennai jobs',
        ]}
        url="/"
      />
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-hero-pattern">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-violet/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight"
            >
              Find Your{' '}
              <span className="gradient-text">Dream Career</span>
              <br />
              Build Your Future
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-lg sm:text-xl text-navy-300 max-w-2xl mx-auto"
            >
              Connect with top employers, discover amazing opportunities, and take the next step in your professional journey.
            </motion.p>

            {/* Search Box */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onSubmit={handleSearch}
              className="mt-10 flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-navy-800/80 backdrop-blur border border-navy-700 rounded-2xl text-white placeholder:text-navy-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <div className="sm:w-64 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-navy-800/80 backdrop-blur border border-navy-700 rounded-2xl text-white placeholder:text-navy-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <Button type="submit" size="lg" className="sm:w-auto">
                Search Jobs
              </Button>
            </motion.form>

            {/* Popular Searches */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm"
            >
              <span className="text-navy-400">Popular:</span>
              {['Remote', 'Software Engineer', 'Marketing', 'Design', 'Data Science'].map((term) => (
                <Link
                  key={term}
                  to={`/jobs?query=${encodeURIComponent(term)}`}
                  className="px-3 py-1.5 bg-navy-800/50 border border-navy-700 rounded-full text-navy-300 hover:text-white hover:border-primary-500/50 transition-colors"
                >
                  {term}
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-navy-800 bg-navy-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-primary-500/10 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-navy-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Featured Jobs
              </h2>
              <p className="text-navy-400 mt-2">
                Hand-picked opportunities from top companies
              </p>
            </div>
            <Link to="/jobs" className="hidden sm:flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors">
              View all jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))
            ) : featuredJobs?.length ? (
              featuredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-navy-400">
                No featured jobs available at the moment.
              </div>
            )}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/jobs">
              <Button variant="outline">
                View all jobs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-20 bg-navy-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Browse by Industry
            </h2>
            <p className="text-navy-400 mt-2">
              Explore opportunities across various sectors
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {INDUSTRIES.slice(0, 12).map((industry, index) => (
              <motion.div
                key={industry}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/jobs?industry=${encodeURIComponent(industry)}`}
                  className="block p-4 bg-navy-800/50 border border-navy-700/50 rounded-xl text-center hover:bg-navy-800 hover:border-primary-500/30 transition-all group"
                >
                  <div className="text-sm font-medium text-navy-200 group-hover:text-primary-400 transition-colors">
                    {industry}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* For Job Seekers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 lg:p-10"
            >
              <span className="badge-primary mb-4">For Job Seekers</span>
              <h3 className="text-2xl font-display font-bold text-white mt-2">
                Land Your Dream Job
              </h3>
              <p className="text-navy-400 mt-3">
                Create your profile, upload your resume, and let employers find you. Get matched with opportunities that fit your skills and preferences.
              </p>
              <ul className="mt-6 space-y-3">
                {features.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-navy-300">
                    <CheckCircle2 className="w-4 h-4 text-primary-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-8 inline-block">
                <Button>
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            {/* For Employers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 lg:p-10"
            >
              <span className="badge bg-accent-violet/10 text-accent-violet border border-accent-violet/20 mb-4">
                For Employers
              </span>
              <h3 className="text-2xl font-display font-bold text-white mt-2">
                Find Top Talent
              </h3>
              <p className="text-navy-400 mt-3">
                Post jobs, review applications, and connect with qualified candidates. Our platform makes hiring simple and efficient.
              </p>
              <ul className="mt-6 space-y-3">
                {features.slice(3).map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-navy-300">
                    <CheckCircle2 className="w-4 h-4 text-accent-violet" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-8 inline-block">
                <Button variant="outline" className="border-accent-violet/50 text-accent-violet hover:bg-accent-violet/10">
                  Post a Job
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

