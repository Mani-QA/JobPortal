import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { User, Upload, Plus, Trash2, Save, Briefcase, GraduationCap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { seekerProfileSchema, SKILLS_SUGGESTIONS } from '@job-portal/shared';
import type { SeekerProfile } from '@job-portal/shared';
import toast from 'react-hot-toast';

export default function SeekerProfilePage() {
  const queryClient = useQueryClient();
  const [skillInput, setSkillInput] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['seeker-profile'],
    queryFn: async () => {
      const response = await api.get<SeekerProfile>('/seekers/profile');
      return response.data!;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SeekerProfile>) => {
      return api.put('/seekers/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.upload<{ url: string }>('/upload/resume', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker-profile'] });
      toast.success('Resume uploaded successfully');
    },
    onError: () => {
      toast.error('Failed to upload resume');
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm({
    // @ts-expect-error - zod version mismatch with @hookform/resolvers
    resolver: zodResolver(seekerProfileSchema.partial()),
    values: profile ? {
      fullName: profile.fullName,
      headline: profile.headline || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      location: profile.location || '',
      workHistory: profile.workHistory || [],
      education: profile.education || [],
      skills: profile.skills || [],
      preferences: profile.preferences || {},
    } : undefined,
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control,
    name: 'workHistory',
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: 'education',
  });

  const skills = watch('skills') || [];

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setValue('skills', [...skills, skillInput], { shouldDirty: true });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setValue('skills', skills.filter((s) => s !== skill), { shouldDirty: true });
  };

  const onSubmit = (data: Partial<SeekerProfile>) => {
    updateMutation.mutate(data);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-navy-700 rounded animate-pulse" />
        <div className="h-64 bg-navy-700 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Profile</h1>
          <p className="text-navy-400 mt-1">Complete your profile to increase visibility</p>
        </div>
        <Button type="submit" isLoading={updateMutation.isPending} disabled={!isDirty}>
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-400" />
          Basic Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Professional Headline"
            placeholder="Senior Software Engineer"
            error={errors.headline?.message}
            {...register('headline')}
          />
          <Input
            label="Phone"
            placeholder="+1 (555) 000-0000"
            {...register('phone')}
          />
          <Input
            label="Location"
            placeholder="San Francisco, CA"
            {...register('location')}
          />
          <div className="md:col-span-2">
            <label className="label">Bio</label>
            <textarea
              rows={4}
              className="input resize-none"
              placeholder="Tell employers about yourself..."
              {...register('bio')}
            />
          </div>
        </div>
      </Card>

      {/* Resume Upload */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary-400" />
          Resume
        </h2>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            {profile?.resumeUrl ? (
              <div className="flex items-center gap-4 p-4 bg-navy-700/50 rounded-xl">
                <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">Resume uploaded</div>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    View current resume
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-navy-400">No resume uploaded yet</div>
            )}
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button type="button" variant="secondary" isLoading={uploadMutation.isPending} leftIcon={<Upload className="w-4 h-4" />}>
                {profile?.resumeUrl ? 'Update Resume' : 'Upload Resume'}
            </Button>
          </label>
        </div>
        <p className="text-sm text-navy-500 mt-3">
          Accepted formats: PDF, DOC, DOCX (max 5MB)
        </p>
      </Card>

      {/* Skills */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="primary"
              className="cursor-pointer"
              onClick={() => removeSkill(skill)}
            >
              {skill}
              <Trash2 className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
        <div className="flex gap-3">
          <Input
            placeholder="Add a skill..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={addSkill}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        <div className="mt-4">
          <p className="text-sm text-navy-500 mb-2">Popular skills:</p>
          <div className="flex flex-wrap gap-2">
            {SKILLS_SUGGESTIONS.slice(0, 10).map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => !skills.includes(skill) && setValue('skills', [...skills, skill], { shouldDirty: true })}
                className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                  skills.includes(skill)
                    ? 'bg-primary-500/10 border-primary-500/50 text-primary-400'
                    : 'bg-navy-700/50 border-navy-600 text-navy-400 hover:border-navy-500'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Work Experience */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-400" />
            Work Experience
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => appendWork({
              id: crypto.randomUUID(),
              company: '',
              title: '',
              startDate: '',
              current: false,
            })}
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </Button>
        </div>
        
        <div className="space-y-6">
          {workFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-navy-700/30 rounded-xl"
            >
              <div className="flex justify-between mb-4">
                <span className="text-sm text-navy-400">Experience #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeWork(index)}
                  className="text-accent-rose hover:text-accent-rose/80"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  placeholder="Software Engineer"
                  {...register(`workHistory.${index}.title`)}
                />
                <Input
                  label="Company"
                  placeholder="Acme Inc."
                  {...register(`workHistory.${index}.company`)}
                />
                <Input
                  label="Start Date"
                  type="month"
                  {...register(`workHistory.${index}.startDate`)}
                />
                <Input
                  label="End Date"
                  type="month"
                  {...register(`workHistory.${index}.endDate`)}
                  disabled={watch(`workHistory.${index}.current`)}
                />
              </div>
              <label className="flex items-center gap-2 mt-4 text-sm text-navy-300">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-navy-600 bg-navy-800 text-primary-500"
                  {...register(`workHistory.${index}.current`)}
                />
                I currently work here
              </label>
            </motion.div>
          ))}
          {workFields.length === 0 && (
            <div className="text-center py-8 text-navy-400">
              No work experience added yet
            </div>
          )}
        </div>
      </Card>

      {/* Education */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-400" />
            Education
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => appendEdu({
              id: crypto.randomUUID(),
              institution: '',
              degree: '',
              field: '',
              startDate: '',
              current: false,
            })}
          >
            <Plus className="w-4 h-4" />
            Add Education
          </Button>
        </div>
        
        <div className="space-y-6">
          {eduFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-navy-700/30 rounded-xl"
            >
              <div className="flex justify-between mb-4">
                <span className="text-sm text-navy-400">Education #{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeEdu(index)}
                  className="text-accent-rose hover:text-accent-rose/80"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Institution"
                  placeholder="University of..."
                  {...register(`education.${index}.institution`)}
                />
                <Input
                  label="Degree"
                  placeholder="Bachelor's"
                  {...register(`education.${index}.degree`)}
                />
                <Input
                  label="Field of Study"
                  placeholder="Computer Science"
                  {...register(`education.${index}.field`)}
                />
                <Input
                  label="Graduation Year"
                  type="month"
                  {...register(`education.${index}.endDate`)}
                />
              </div>
            </motion.div>
          ))}
          {eduFields.length === 0 && (
            <div className="text-center py-8 text-navy-400">
              No education added yet
            </div>
          )}
        </div>
      </Card>
    </form>
  );
}

