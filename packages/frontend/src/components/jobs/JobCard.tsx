import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Building2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatSalary, formatRelativeTime } from '@/lib/utils';
import type { JobWithEmployer } from '@job-portal/shared';

interface JobCardProps {
  job: JobWithEmployer;
  onSave?: (jobId: string) => void;
  onUnsave?: (jobId: string) => void;
  isSaved?: boolean;
  showApplyButton?: boolean;
}

export function JobCard({ job, onSave, onUnsave, isSaved, showApplyButton = true }: JobCardProps) {
  const locationTypeColors = {
    remote: 'success',
    hybrid: 'warning',
    onsite: 'info',
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-hover group"
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="w-14 h-14 rounded-xl bg-navy-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {job.employer.logoUrl ? (
            <img
              src={job.employer.logoUrl}
              alt={job.employer.companyName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-6 h-6 text-navy-400" />
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/jobs/${job.id}`}
                className="text-lg font-semibold text-white hover:text-primary-400 transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
              <Link
                to={`/companies/${job.employer.id}`}
                className="text-sm text-navy-400 hover:text-primary-400 transition-colors flex items-center gap-1"
              >
                {job.employer.companyName}
                {job.employer.verified && (
                  <span className="text-primary-400">✓</span>
                )}
              </Link>
            </div>
            
            {/* Save Button */}
            {(onSave || onUnsave) && (
              <button
                onClick={() => isSaved ? onUnsave?.(job.id) : onSave?.(job.id)}
                className="p-2 rounded-lg text-navy-400 hover:text-primary-400 hover:bg-navy-700 transition-colors"
              >
                {isSaved ? (
                  <BookmarkCheck className="w-5 h-5 text-primary-400" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-navy-400">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatRelativeTime(job.createdAt)}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant={locationTypeColors[job.locationType]}>
              {job.locationType.charAt(0).toUpperCase() + job.locationType.slice(1)}
            </Badge>
            <Badge variant="secondary">{job.jobType}</Badge>
            {job.skills.slice(0, 2).map((skill) => (
              <Badge key={skill} variant="primary">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 2 && (
              <Badge variant="secondary">+{job.skills.length - 2}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-navy-700/50">
        <div className="text-sm">
          <span className="text-primary-400 font-semibold">
            {formatSalary(
              job.salaryRange.min,
              job.salaryRange.max,
              job.salaryRange.currency,
              job.salaryRange.period
            )}
          </span>
        </div>
        {showApplyButton && (
          <Link to={`/jobs/${job.id}`}>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

