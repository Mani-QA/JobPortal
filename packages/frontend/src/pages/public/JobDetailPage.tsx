import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Building2,
  DollarSign,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  ChevronRight,
  CheckCircle2,
  Users,
  Eye,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/SEO';
import { useJob, useApplyToJob, useSaveJob, useUnsaveJob } from '@/hooks/useJobs';
import { useAuthStore } from '@/stores/authStore';
import { formatSalary, formatDate, formatRelativeTime } from '@/lib/utils';
import type { JobWithEmployer } from '@job-portal/shared';

// Extended type for job details with user-specific properties
interface JobDetail extends JobWithEmployer {
  isSaved?: boolean;
  hasApplied?: boolean;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: jobData, isLoading, error } = useJob(id!);
  const job = jobData as JobDetail | undefined;
  const { isAuthenticated, user } = useAuthStore();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const applyMutation = useApplyToJob();
  const saveMutation = useSaveJob();
  const unsaveMutation = useUnsaveJob();

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Job Not Found</h1>
        <p className="text-navy-400 mb-8">The job you're looking for doesn't exist or has been removed.</p>
        <Link to="/jobs">
          <Button>Browse All Jobs</Button>
        </Link>
      </div>
    );
  }

  const handleApply = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank');
    } else {
      applyMutation.mutate(
        { jobId: job.id, coverLetter },
        {
          onSuccess: () => {
            setShowApplyModal(false);
            setCoverLetter('');
          },
        }
      );
    }
  };

  const handleSave = () => {
    if (job.isSaved) {
      unsaveMutation.mutate(job.id);
    } else {
      saveMutation.mutate(job.id);
    }
  };

  const locationTypeColors = {
    remote: 'success',
    hybrid: 'warning',
    onsite: 'info',
  } as const;

  // Create description for SEO
  const seoDescription = `${job.title} at ${job.employer.companyName}${job.location ? ` in ${job.location}` : ''}. ${formatSalary(
    job.salaryRange.min,
    job.salaryRange.max,
    job.salaryRange.currency,
    job.salaryRange.period
  )}. ${job.locationType.charAt(0).toUpperCase() + job.locationType.slice(1)} ${job.jobType} position. ${job.description.substring(0, 150)}...`;

  return (
    <div className="min-h-screen py-8">
      <SEO
        title={`${job.title} at ${job.employer.companyName}`}
        description={seoDescription}
        keywords={[
          job.title,
          job.employer.companyName,
          job.employer.industry,
          job.locationType,
          job.jobType,
          job.location || '',
          ...job.skills,
        ]}
        url={`/jobs/${job.id}`}
        type="article"
        publishedTime={job.createdAt}
        jobPosting={{
          title: job.title,
          description: job.description,
          company: job.employer.companyName,
          location: job.location || 'Remote',
          salaryMin: job.salaryRange.min,
          salaryMax: job.salaryRange.max,
          currency: job.salaryRange.currency,
          employmentType: job.jobType,
          datePosted: job.createdAt,
          validThrough: job.deadline,
        }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-navy-400 mb-6">
          <Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-navy-300">{job.title}</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Company Logo */}
            <div className="w-20 h-20 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {job.employer.logoUrl ? (
                <img
                  src={job.employer.logoUrl}
                  alt={job.employer.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-navy-400" />
              )}
            </div>

            {/* Job Info */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Link
                  to={`/companies/${job.employer.id}`}
                  className="text-lg text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
                >
                  {job.employer.companyName}
                  {job.employer.verified && <CheckCircle2 className="w-4 h-4" />}
                </Link>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-navy-400">
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  {formatSalary(
                    job.salaryRange.min,
                    job.salaryRange.max,
                    job.salaryRange.currency,
                    job.salaryRange.period
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Posted {formatRelativeTime(job.createdAt)}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant={locationTypeColors[job.locationType]}>
                  {job.locationType.charAt(0).toUpperCase() + job.locationType.slice(1)}
                </Badge>
                <Badge variant="secondary">{job.jobType}</Badge>
                <Badge variant="secondary">{job.experienceLevel}</Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-8">
            {job.hasApplied ? (
              <Button disabled className="flex-1 sm:flex-none">
                <CheckCircle2 className="w-4 h-4" />
                Applied
              </Button>
            ) : isAuthenticated && user?.role === 'seeker' ? (
              <Button
                onClick={() => job.applyUrl ? handleApply() : setShowApplyModal(true)}
                className="flex-1 sm:flex-none"
              >
                {job.applyUrl ? (
                  <>
                    Apply on Company Site
                    <ExternalLink className="w-4 h-4" />
                  </>
                ) : (
                  'Apply Now'
                )}
              </Button>
            ) : (
              <Link to="/login" className="flex-1 sm:flex-none">
                <Button className="w-full">
                  Sign in to Apply
                </Button>
              </Link>
            )}

            {isAuthenticated && user?.role === 'seeker' && (
              <Button
                variant="secondary"
                onClick={handleSave}
                disabled={saveMutation.isPending || unsaveMutation.isPending}
              >
                {job.isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-primary-400" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
            )}

            <Button variant="ghost">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <h2 className="text-xl font-display font-semibold text-white mb-4">
                Job Description
              </h2>
              <div className="prose prose-invert prose-navy max-w-none text-navy-300">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </Card>

            {/* Responsibilities */}
            <Card>
              <h2 className="text-xl font-display font-semibold text-white mb-4">
                Responsibilities
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-navy-300">
                    <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Requirements */}
            <Card>
              <h2 className="text-xl font-display font-semibold text-white mb-4">
                Requirements
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-navy-300">
                    <CheckCircle2 className="w-5 h-5 text-accent-coral flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Nice to Haves */}
            {job.niceToHaves.length > 0 && (
              <Card>
                <h2 className="text-xl font-display font-semibold text-white mb-4">
                  Nice to Have
                </h2>
                <ul className="space-y-3">
                  {job.niceToHaves.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-navy-300">
                      <CheckCircle2 className="w-5 h-5 text-accent-emerald flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <Card>
              <h3 className="font-semibold text-white mb-4">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Job Details */}
            <Card>
              <h3 className="font-semibold text-white mb-4">Job Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-navy-400">Deadline</span>
                  <span className="text-navy-200">{formatDate(job.deadline)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-navy-400">Applications</span>
                  <span className="text-navy-200 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {job.applicationCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-navy-400">Views</span>
                  <span className="text-navy-200 flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {job.viewCount}
                  </span>
                </div>
              </div>
            </Card>

            {/* Company Info */}
            <Card>
              <h3 className="font-semibold text-white mb-4">About the Company</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-navy-700 flex items-center justify-center overflow-hidden">
                  {job.employer.logoUrl ? (
                    <img src={job.employer.logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5 text-navy-400" />
                  )}
                </div>
                <div>
                  <Link
                    to={`/companies/${job.employer.id}`}
                    className="font-medium text-white hover:text-primary-400 transition-colors"
                  >
                    {job.employer.companyName}
                  </Link>
                  <p className="text-sm text-navy-400">{job.employer.industry}</p>
                </div>
              </div>
              <p className="text-sm text-navy-400 line-clamp-4">
                {job.employer.description}
              </p>
              <Link
                to={`/companies/${job.employer.id}`}
                className="block mt-4 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                View company profile →
              </Link>
            </Card>
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg bg-navy-800 border border-navy-700 rounded-2xl p-6"
            >
              <h2 className="text-xl font-display font-semibold text-white mb-4">
                Apply for {job.title}
              </h2>
              <p className="text-navy-400 mb-6">
                Your profile information will be shared with {job.employer.companyName}.
              </p>
              
              <div className="mb-6">
                <label className="label">Cover Letter (Optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="input resize-none"
                  placeholder="Tell the employer why you're the perfect fit for this role..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  isLoading={applyMutation.isPending}
                  className="flex-1"
                >
                  Submit Application
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

