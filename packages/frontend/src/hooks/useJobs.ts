import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getErrorMessage } from '@/lib/api';
import type { 
  Job, 
  JobWithEmployer, 
  PaginatedResponse, 
  JobSearchParams,
  CreateJobInput,
  UpdateJobInput,
} from '@job-portal/shared';
import toast from 'react-hot-toast';

// Query keys
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobSearchParams) => [...jobKeys.lists(), filters] as const,
  featured: () => [...jobKeys.all, 'featured'] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  employer: () => [...jobKeys.all, 'employer'] as const,
  employerList: (status?: string) => [...jobKeys.employer(), status] as const,
};

// Search jobs
export function useJobSearch(params: JobSearchParams) {
  return useQuery({
    queryKey: jobKeys.list(params),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<JobWithEmployer>>('/jobs', params as Record<string, string | number | boolean | undefined>);
      return response.data!;
    },
  });
}

// Get featured jobs
export function useFeaturedJobs() {
  return useQuery({
    queryKey: jobKeys.featured(),
    queryFn: async () => {
      const response = await api.get<JobWithEmployer[]>('/jobs/featured');
      return response.data!;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get job details
export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<JobWithEmployer>(`/jobs/${id}`);
      return response.data!;
    },
    enabled: !!id,
  });
}

// Get employer's jobs
export function useEmployerJobs(status?: string) {
  return useQuery({
    queryKey: jobKeys.employerList(status),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Job>>('/employers/jobs', { status });
      return response.data!;
    },
  });
}

// Create job
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobInput) => {
      const response = await api.post<{ id: string }>('/jobs', data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.employer() });
      toast.success('Job created successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Update job
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateJobInput }) => {
      const response = await api.put(`/jobs/${id}`, data);
      return response;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.employer() });
      toast.success('Job updated successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Delete job
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/jobs/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.employer() });
      toast.success('Job deleted successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Apply to job
export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, coverLetter }: { jobId: string; coverLetter?: string }) => {
      const response = await api.post<{ id: string }>(`/jobs/${jobId}/apply`, { coverLetter });
      return response.data!;
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      toast.success('Application submitted successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Save job
export function useSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.post(`/jobs/${jobId}/save`);
      return response;
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      toast.success('Job saved');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// Unsave job
export function useUnsaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.delete(`/jobs/${jobId}/save`);
      return response;
    },
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) });
      toast.success('Job removed from saved');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

