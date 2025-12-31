import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Save, Send, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useCreateJob, useUpdateJob, useJob } from '@/hooks/useJobs';
import {
  createJobSchema,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  SKILLS_SUGGESTIONS,
  type CreateJobInput,
} from '@job-portal/shared';
import { useState } from 'react';

export default function EmployerJobForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [skillInput, setSkillInput] = useState('');

  const { data: existingJob, isLoading: jobLoading } = useJob(id || '');
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateJobInput>({
    // @ts-expect-error - zod version mismatch with @hookform/resolvers
    resolver: zodResolver(createJobSchema),
    values: isEditing && existingJob ? {
      title: existingJob.title,
      description: existingJob.description,
      locationType: existingJob.locationType,
      location: existingJob.location || '',
      salaryRange: existingJob.salaryRange,
      responsibilities: existingJob.responsibilities,
      requirements: existingJob.requirements,
      niceToHaves: existingJob.niceToHaves,
      skills: existingJob.skills,
      experienceLevel: existingJob.experienceLevel,
      jobType: existingJob.jobType,
      deadline: existingJob.deadline.split('T')[0],
      applyUrl: existingJob.applyUrl || '',
      status: existingJob.status as 'draft' | 'active',
    } : undefined,
    defaultValues: {
      title: '',
      description: '',
      locationType: 'remote',
      location: '',
      salaryRange: { min: 0, max: 0, currency: 'USD', period: 'yearly' },
      responsibilities: [''],
      requirements: [''],
      niceToHaves: [],
      skills: [],
      experienceLevel: '',
      jobType: '',
      deadline: '',
      applyUrl: '',
      status: 'draft',
    },
  });

  const { fields: respFields, append: appendResp, remove: removeResp } = useFieldArray({
    control,
    name: 'responsibilities' as never,
  });

  const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({
    control,
    name: 'requirements' as never,
  });

  const { fields: niceFields, append: appendNice, remove: removeNice } = useFieldArray({
    control,
    name: 'niceToHaves' as never,
  });

  const skills = watch('skills') || [];

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setValue('skills', [...skills, skillInput]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setValue('skills', skills.filter((s) => s !== skill));
  };

  const onSubmit = (data: CreateJobInput, status: 'draft' | 'active') => {
    const payload = { ...data, status };
    
    if (isEditing) {
      updateJob.mutate(
        { id, data: payload },
        { onSuccess: () => navigate('/employer/jobs') }
      );
    } else {
      createJob.mutate(payload, {
        onSuccess: () => navigate('/employer/jobs'),
      });
    }
  };

  if (isEditing && jobLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-navy-700 rounded animate-pulse" />
        <div className="h-96 bg-navy-700 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <form className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              {isEditing ? 'Edit Job' : 'Post a New Job'}
            </h1>
            <p className="text-navy-400 mt-1">
              Fill in the details to {isEditing ? 'update your' : 'create a new'} job posting
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmit((data) => onSubmit(data as CreateJobInput, 'draft'))}
            isLoading={createJob.isPending || updateJob.isPending}
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data as CreateJobInput, 'active'))}
            isLoading={createJob.isPending || updateJob.isPending}
          >
            <Send className="w-4 h-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Job Title"
              placeholder="e.g., Senior Software Engineer"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>
          <Select
            label="Job Type"
            options={JOB_TYPES.map((t) => ({ value: t, label: t }))}
            placeholder="Select job type"
            error={errors.jobType?.message}
            {...register('jobType')}
          />
          <Select
            label="Experience Level"
            options={EXPERIENCE_LEVELS.map((e) => ({ value: e, label: e }))}
            placeholder="Select level"
            error={errors.experienceLevel?.message}
            {...register('experienceLevel')}
          />
          <Select
            label="Work Type"
            options={[
              { value: 'remote', label: 'Remote' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'onsite', label: 'On-site' },
            ]}
            error={errors.locationType?.message}
            {...register('locationType')}
          />
          <Input
            label="Location"
            placeholder="e.g., San Francisco, CA"
            {...register('location')}
          />
          <Input
            label="Application Deadline"
            type="date"
            error={errors.deadline?.message}
            {...register('deadline')}
          />
          <Input
            label="External Apply URL (optional)"
            placeholder="https://your-ats.com/apply"
            {...register('applyUrl')}
          />
        </div>

        <div className="mt-6">
          <label className="label">Job Description</label>
          <textarea
            rows={8}
            className="input resize-none"
            placeholder="Describe the role, team, and what makes this opportunity exciting..."
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-accent-rose">{errors.description.message}</p>
          )}
        </div>
      </Card>

      {/* Salary Range */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6">Compensation</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Input
            label="Minimum Salary"
            type="number"
            placeholder="50000"
            error={errors.salaryRange?.min?.message}
            {...register('salaryRange.min', { valueAsNumber: true })}
          />
          <Input
            label="Maximum Salary"
            type="number"
            placeholder="80000"
            error={errors.salaryRange?.max?.message}
            {...register('salaryRange.max', { valueAsNumber: true })}
          />
          <Select
            label="Currency"
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
              { value: 'INR', label: 'INR' },
            ]}
            {...register('salaryRange.currency')}
          />
          <Select
            label="Period"
            options={[
              { value: 'yearly', label: 'Per Year' },
              { value: 'monthly', label: 'Per Month' },
              { value: 'hourly', label: 'Per Hour' },
            ]}
            {...register('salaryRange.period')}
          />
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6">Required Skills</h2>
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
        {errors.skills && (
          <p className="mb-4 text-sm text-accent-rose">{errors.skills.message}</p>
        )}
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
        <div className="mt-4 flex flex-wrap gap-2">
          {SKILLS_SUGGESTIONS.slice(0, 15).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => !skills.includes(skill) && setValue('skills', [...skills, skill])}
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
      </Card>

      {/* Responsibilities */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Responsibilities</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => appendResp('')}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {respFields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <Input
                placeholder="Describe a key responsibility..."
                {...register(`responsibilities.${index}`)}
                className="flex-1"
              />
              {respFields.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeResp(index)}>
                  <Trash2 className="w-4 h-4 text-accent-rose" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {errors.responsibilities && (
          <p className="mt-2 text-sm text-accent-rose">{errors.responsibilities.message}</p>
        )}
      </Card>

      {/* Requirements */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Requirements</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => appendReq('')}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {reqFields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <Input
                placeholder="Describe a requirement..."
                {...register(`requirements.${index}`)}
                className="flex-1"
              />
              {reqFields.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => removeReq(index)}>
                  <Trash2 className="w-4 h-4 text-accent-rose" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {errors.requirements && (
          <p className="mt-2 text-sm text-accent-rose">{errors.requirements.message}</p>
        )}
      </Card>

      {/* Nice to Haves */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Nice to Have (Optional)</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => appendNice('')}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {niceFields.length === 0 ? (
            <p className="text-navy-400 text-sm">Add optional qualifications that would be a plus</p>
          ) : (
            niceFields.map((field, index) => (
              <div key={field.id} className="flex gap-3">
                <Input
                  placeholder="A nice-to-have qualification..."
                  {...register(`niceToHaves.${index}`)}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeNice(index)}>
                  <Trash2 className="w-4 h-4 text-accent-rose" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </form>
  );
}

