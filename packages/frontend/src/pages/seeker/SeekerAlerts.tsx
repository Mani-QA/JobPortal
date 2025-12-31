import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { createJobAlertSchema, type CreateJobAlertInput } from '@job-portal/shared';
import toast from 'react-hot-toast';

interface JobAlert {
  id: string;
  name: string;
  keywords: string[];
  locations: string[];
  locationType: string[];
  jobTypes: string[];
  frequency: string;
  isActive: boolean;
  createdAt: string;
}

export default function SeekerAlerts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  // Note: editingAlert state will be used for edit functionality
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_editingAlert, _setEditingAlert] = useState<JobAlert | null>(null);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['seeker-alerts'],
    queryFn: async () => {
      const response = await api.get<JobAlert[]>('/seekers/alerts');
      return response.data!;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateJobAlertInput) => {
      return api.post('/seekers/alerts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker-alerts'] });
      toast.success('Alert created successfully');
      setShowForm(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create alert');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateJobAlertInput> }) => {
      return api.put(`/seekers/alerts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker-alerts'] });
      toast.success('Alert updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/seekers/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker-alerts'] });
      toast.success('Alert deleted');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateJobAlertInput>({
    // @ts-expect-error - zod version mismatch with @hookform/resolvers
    resolver: zodResolver(createJobAlertSchema),
    defaultValues: {
      frequency: 'daily',
      isActive: true,
    },
  });

  const onSubmit = (data: CreateJobAlertInput) => {
    createMutation.mutate({
      ...data,
      keywords: data.keywords?.length ? data.keywords : [],
      locations: data.locations?.length ? data.locations : [],
    });
  };

  const toggleActive = (alert: JobAlert) => {
    updateMutation.mutate({
      id: alert.id,
      data: { isActive: !alert.isActive },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Job Alerts</h1>
          <p className="text-navy-400 mt-1">Get notified when new jobs match your criteria</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Create Alert
        </Button>
      </div>

      {/* Create Alert Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-navy-800 border border-navy-700 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-white">
                Create Job Alert
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
                className="text-navy-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Alert Name"
                placeholder="e.g., Remote React Jobs"
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Keywords (comma-separated)"
                placeholder="react, typescript, frontend"
                {...register('keywords', {
                  setValueAs: (v) => v ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                })}
              />

              <Input
                label="Locations (comma-separated)"
                placeholder="New York, Remote"
                {...register('locations', {
                  setValueAs: (v) => v ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                })}
              />

              <Select
                label="Frequency"
                options={[
                  { value: 'instant', label: 'Instant' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                ]}
                {...register('frequency')}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={createMutation.isPending} className="flex-1">
                  Create Alert
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Alerts List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-navy-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : alerts?.length ? (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    alert.isActive ? 'bg-primary-500/10' : 'bg-navy-700'
                  }`}>
                    <Bell className={`w-6 h-6 ${alert.isActive ? 'text-primary-400' : 'text-navy-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{alert.name}</span>
                      <Badge variant={alert.isActive ? 'success' : 'secondary'}>
                        {alert.isActive ? 'Active' : 'Paused'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {alert.keywords.slice(0, 3).map((kw) => (
                        <Badge key={kw} variant="secondary" size="sm">{kw}</Badge>
                      ))}
                      {alert.locations.slice(0, 2).map((loc) => (
                        <Badge key={loc} variant="primary" size="sm">{loc}</Badge>
                      ))}
                      <Badge variant="secondary" size="sm">{alert.frequency}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(alert)}
                  >
                    {alert.isActive ? 'Pause' : 'Activate'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(alert.id)}
                  >
                    <Trash2 className="w-4 h-4 text-accent-rose" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto mb-4 text-navy-500" />
          <h3 className="text-lg font-medium text-white mb-2">No job alerts yet</h3>
          <p className="text-navy-400 mb-6">
            Create alerts to get notified when new jobs match your criteria
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Create Your First Alert
          </Button>
        </Card>
      )}
    </div>
  );
}

