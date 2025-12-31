import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  key: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface UseFileUploadOptions {
  purpose: 'resume' | 'logo' | 'avatar';
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: UploadProgress) => void;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const { purpose, onSuccess, onError, onProgress } = options;
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });

      const formData = new FormData();
      formData.append('file', file);

      // Use XMLHttpRequest for progress tracking
      return new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progressData = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            };
            setProgress(progressData);
            onProgress?.(progressData);
          }
        });

        xhr.addEventListener('load', () => {
          setIsUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve(response.data);
              } else {
                reject(new Error(response.message || 'Upload failed'));
              }
            } catch {
              reject(new Error('Invalid server response'));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          setIsUploading(false);
          reject(new Error('Network error occurred'));
        });

        xhr.addEventListener('abort', () => {
          setIsUploading(false);
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', `/api/upload/${purpose}`);
        
        // Add auth header
        const token = localStorage.getItem('accessToken');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.send(formData);
      });
    },
    onSuccess: (result) => {
      setProgress({ loaded: result.size, total: result.size, percentage: 100 });
      onSuccess?.(result);
    },
    onError: (error: Error) => {
      setProgress(null);
      onError?.(error);
    },
  });

  const upload = useCallback((file: File) => {
    uploadMutation.mutate(file);
  }, [uploadMutation]);

  const reset = useCallback(() => {
    setProgress(null);
    setIsUploading(false);
    uploadMutation.reset();
  }, [uploadMutation]);

  return {
    upload,
    reset,
    progress,
    isUploading,
    isSuccess: uploadMutation.isSuccess,
    isError: uploadMutation.isError,
    error: uploadMutation.error,
    data: uploadMutation.data,
  };
}

// Validation helpers
export const FILE_LIMITS = {
  resume: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf', '.doc', '.docx'],
    description: 'PDF, DOC, or DOCX up to 5MB',
  },
  logo: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    description: 'JPEG, PNG, or WebP up to 2MB',
  },
  avatar: {
    maxSize: 1024 * 1024, // 1MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    description: 'JPEG, PNG, or WebP up to 1MB',
  },
};

export function validateFile(file: File, purpose: 'resume' | 'logo' | 'avatar'): string | null {
  const limits = FILE_LIMITS[purpose];
  
  if (file.size > limits.maxSize) {
    return `File size must be less than ${formatFileSize(limits.maxSize)}`;
  }
  
  if (!limits.allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed: ${limits.allowedExtensions.join(', ')}`;
  }
  
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

