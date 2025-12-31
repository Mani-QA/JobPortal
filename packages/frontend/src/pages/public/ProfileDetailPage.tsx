import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Mail,
  Briefcase,
  GraduationCap,
  Download,
  Lock,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/SEO';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/utils';

interface WorkExperience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

interface ProfileDetail {
  id: string;
  fullName: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  skills: string[];
  currentRole: string | null;
  yearsOfExperience: number;
  workHistory: WorkExperience[];
  education: Education[];
  preferences: {
    desiredRoles: string[];
    desiredLocations: string[];
    locationType: string[];
    jobTypes: string[];
    willingToRelocate: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

function formatDateRange(startDate: string, endDate?: string, current?: boolean): string {
  const start = formatDate(startDate);
  if (current) return `${start} - Present`;
  if (endDate) return `${start} - ${formatDate(endDate)}`;
  return start;
}

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const response = await api.get<ProfileDetail>(`/profiles/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card className="p-8">
            <div className="flex gap-6">
              <Skeleton className="w-24 h-24 rounded-2xl" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-64 mb-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <User className="w-12 h-12 text-navy-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Profile Not Found</h2>
            <p className="text-navy-400 mb-4">
              This profile may have been removed or made private.
            </p>
            <Link to="/profiles">
              <Button variant="primary">Browse Profiles</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const seoDescription = `${profile.fullName}${profile.headline ? ` - ${profile.headline}` : ''}. ${profile.yearsOfExperience} years of experience${profile.location ? ` in ${profile.location}` : ''}. Skills: ${profile.skills.slice(0, 5).join(', ')}.`;

  return (
    <div className="min-h-screen py-8">
      <SEO
        title={`${profile.fullName}${profile.currentRole ? ` - ${profile.currentRole}` : ''}`}
        description={seoDescription}
        keywords={[profile.fullName, ...profile.skills.slice(0, 10), profile.location || '', ...profile.preferences.desiredRoles]}
        url={`/profiles/${id}`}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-navy-400 mb-6">
          <Link to="/profiles" className="hover:text-teal-400 transition-colors">
            Candidates
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{profile.fullName}</span>
        </nav>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-navy-700 flex items-center justify-center flex-shrink-0 overflow-hidden border border-navy-600">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-navy-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-display font-bold text-white mb-1">
                  {profile.fullName}
                </h1>
                {profile.headline && (
                  <p className="text-lg text-navy-300 mb-2">{profile.headline}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {profile.location && (
                    <div className="flex items-center gap-1.5 text-navy-400">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-navy-400">
                    <Clock className="w-4 h-4" />
                    <span>{profile.yearsOfExperience} years of experience</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {isAuthenticated && profile.resumeUrl ? (
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Resume
                    </Button>
                  </a>
                ) : !isAuthenticated ? (
                  <Link to="/login">
                    <Button variant="primary" className="w-full">
                      <Lock className="w-4 h-4 mr-2" />
                      Sign in for Resume
                    </Button>
                  </Link>
                ) : null}
                <Link to={`mailto:${profile.email}`}>
                  <Button variant="outline" className="w-full" disabled={!isAuthenticated}>
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            {profile.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">About</h2>
                  <p className="text-navy-300 whitespace-pre-line">{profile.bio}</p>
                </Card>
              </motion.div>
            )}

            {/* Work Experience */}
            {profile.workHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-teal-400" />
                    Work Experience
                  </h2>
                  <div className="space-y-6">
                    {profile.workHistory.map((job, index) => (
                      <div
                        key={index}
                        className={`relative pl-6 ${
                          index !== profile.workHistory.length - 1
                            ? 'pb-6 border-l-2 border-navy-700'
                            : ''
                        }`}
                      >
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-navy-700 border-2 border-teal-500" />
                        <h3 className="font-semibold text-white">{job.title}</h3>
                        <p className="text-teal-400">{job.company}</p>
                        <div className="flex items-center gap-3 text-sm text-navy-400 mt-1">
                          <span>{formatDateRange(job.startDate, job.endDate, job.current)}</span>
                          {job.location && (
                            <>
                              <span>•</span>
                              <span>{job.location}</span>
                            </>
                          )}
                        </div>
                        {job.description && (
                          <p className="text-navy-300 mt-2 text-sm">{job.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Education */}
            {profile.education.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-400" />
                    Education
                  </h2>
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{edu.degree} in {edu.field}</h3>
                          <p className="text-navy-300">{edu.institution}</p>
                          <p className="text-sm text-navy-400">
                            {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Looking For */}
            {(profile.preferences.desiredRoles.length > 0 || 
              profile.preferences.desiredLocations.length > 0 ||
              profile.preferences.jobTypes.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Looking For</h2>
                  
                  {profile.preferences.desiredRoles.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-navy-400 mb-2">Roles</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.preferences.desiredRoles.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.preferences.desiredLocations.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-navy-400 mb-2">Locations</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.preferences.desiredLocations.map((loc) => (
                          <Badge key={loc} variant="outline" className="text-xs">
                            {loc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.preferences.locationType.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-navy-400 mb-2">Work Type</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.preferences.locationType.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs capitalize">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.preferences.willingToRelocate && (
                    <p className="text-sm text-teal-400">
                      ✓ Willing to relocate
                    </p>
                  )}
                </Card>
              </motion.div>
            )}

            {/* CTA for employers */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="p-6 bg-gradient-to-br from-teal-500/20 to-purple-500/20 border-teal-500/30">
                  <h3 className="font-semibold text-white mb-2">
                    Hiring for your team?
                  </h3>
                  <p className="text-navy-300 text-sm mb-4">
                    Sign up as an employer to access full candidate profiles, contact details, and resumes.
                  </p>
                  <Link to="/register">
                    <Button variant="primary" className="w-full">
                      Get Started Free
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

