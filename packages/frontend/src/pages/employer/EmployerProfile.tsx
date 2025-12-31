import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Upload, Save, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { employerProfileSchema, INDUSTRIES, COMPANY_SIZES } from '@job-portal/shared';
import type { EmployerProfile } from '@job-portal/shared';
import toast from 'react-hot-toast';

export default function EmployerProfilePage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['employer-profile'],
    queryFn: async () => {
      const response = await api.get<EmployerProfile>('/employers/profile');
      return response.data!;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<EmployerProfile>) => {
      return api.put('/employers/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
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
      return api.upload<{ url: string }>('/upload/logo', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
      toast.success('Logo uploaded successfully');
    },
    onError: () => {
      toast.error('Failed to upload logo');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    // @ts-expect-error - zod version mismatch with @hookform/resolvers
    resolver: zodResolver(employerProfileSchema.partial()),
    values: profile ? {
      companyName: profile.companyName,
      description: profile.description,
      industry: profile.industry,
      companySize: profile.companySize || '',
      foundedYear: profile.foundedYear,
      contactDetails: profile.contactDetails || { email: '' },
    } : undefined,
  });

  const onSubmit = (data: Partial<EmployerProfile>) => {
    updateMutation.mutate(data);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
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
          <h1 className="text-2xl font-display font-bold text-white">Company Profile</h1>
          <p className="text-navy-400 mt-1">
            {profile?.verified ? (
              <span className="flex items-center gap-2">
                <Badge variant="success">Verified</Badge>
                Your company is verified
              </span>
            ) : (
              'Complete your profile to get verified'
            )}
          </p>
        </div>
        <Button type="submit" isLoading={updateMutation.isPending} disabled={!isDirty}>
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>

      {/* Logo & Basic Info */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-400" />
          Company Information
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Logo Upload */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-navy-700 border-2 border-dashed border-navy-600 flex items-center justify-center overflow-hidden">
              {profile?.logoUrl ? (
                <img src={profile.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-12 h-12 text-navy-500" />
              )}
            </div>
            <label className="cursor-pointer mt-3 block">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button type="button" variant="ghost" size="sm" className="w-full" leftIcon={<Upload className="w-4 h-4" />}>
                {profile?.logoUrl ? 'Change' : 'Upload'} Logo
              </Button>
            </label>
          </div>

          {/* Form Fields */}
          <div className="flex-1 grid md:grid-cols-2 gap-6">
            <Input
              label="Company Name"
              placeholder="Acme Inc."
              error={errors.companyName?.message}
              {...register('companyName')}
            />
            <Select
              label="Industry"
              options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
              placeholder="Select industry"
              error={errors.industry?.message}
              {...register('industry')}
            />
            <Select
              label="Company Size"
              options={COMPANY_SIZES.map((s) => ({ value: s, label: s }))}
              placeholder="Select size"
              {...register('companySize')}
            />
            <Input
              label="Founded Year"
              type="number"
              placeholder="2020"
              min={1800}
              max={new Date().getFullYear()}
              {...register('foundedYear', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="label">Company Description</label>
          <textarea
            rows={6}
            className="input resize-none"
            placeholder="Tell candidates about your company, culture, and what makes you unique..."
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-accent-rose">{errors.description.message}</p>
          )}
        </div>
      </Card>

      {/* Contact Details */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary-400" />
          Contact Information
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Contact Email"
            type="email"
            placeholder="hr@company.com"
            leftIcon={<Mail className="w-5 h-5" />}
            {...register('contactDetails.email')}
          />
          <Input
            label="Phone"
            placeholder="+1 (555) 000-0000"
            leftIcon={<Phone className="w-5 h-5" />}
            {...register('contactDetails.phone')}
          />
          <Input
            label="Website"
            placeholder="https://company.com"
            leftIcon={<Globe className="w-5 h-5" />}
            {...register('contactDetails.website')}
          />
          <Input
            label="Address"
            placeholder="123 Main St"
            leftIcon={<MapPin className="w-5 h-5" />}
            {...register('contactDetails.address')}
          />
          <Input
            label="City"
            placeholder="San Francisco"
            {...register('contactDetails.city')}
          />
          <Input
            label="Country"
            placeholder="United States"
            {...register('contactDetails.country')}
          />
        </div>
      </Card>
    </form>
  );
}

