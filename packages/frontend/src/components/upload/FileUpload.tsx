import { useCallback, useState, useRef } from 'react';
import { Upload, X, FileText, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useFileUpload, validateFile, FILE_LIMITS, formatFileSize, UploadResult } from '../../hooks/useFileUpload';
import { Button } from '../ui/Button';

interface FileUploadProps {
  purpose: 'resume' | 'logo' | 'avatar';
  currentFileUrl?: string;
  onUploadComplete?: (result: UploadResult) => void;
  onRemove?: () => void;
  className?: string;
  label?: string;
  hint?: string;
}

export function FileUpload({
  purpose,
  currentFileUrl,
  onUploadComplete,
  onRemove,
  className = '',
  label,
  hint,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { upload, progress, isUploading, isSuccess, isError, error, data, reset } = useFileUpload({
    purpose,
    onSuccess: (result) => {
      onUploadComplete?.(result);
    },
  });

  const limits = FILE_LIMITS[purpose];
  const isImage = purpose === 'logo' || purpose === 'avatar';

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    setValidationError(null);
    
    const error = validateFile(file, purpose);
    if (error) {
      setValidationError(error);
      return;
    }

    // Create preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    upload(file);
  }, [purpose, isImage, upload]);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    reset();
    setPreviewUrl(null);
    setValidationError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onRemove?.();
  };

  const displayUrl = previewUrl || currentFileUrl;
  const showPreview = displayUrl && (isSuccess || currentFileUrl);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {showPreview ? (
        <div className="relative rounded-lg border-2 border-gray-200 p-4">
          <div className="flex items-center gap-4">
            {isImage ? (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={displayUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-900">
                  {data?.filename || 'File uploaded'}
                </span>
              </div>
              {data?.size && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(data.size)}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`relative rounded-lg border-2 border-dashed transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : validationError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={limits.allowedExtensions.join(',')}
            onChange={handleChange}
            className="sr-only"
          />

          <div className="p-8 text-center">
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-10 h-10 mx-auto text-indigo-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Uploading...</p>
                  <p className="text-xs text-gray-500">{progress?.percentage || 0}% complete</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress?.percentage || 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                  validationError ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {validationError ? (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  ) : isImage ? (
                    <Image className="w-6 h-6 text-gray-400" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Click to upload
                  </button>
                  <p className="text-xs text-gray-500">or drag and drop</p>
                </div>

                {validationError ? (
                  <p className="mt-2 text-xs text-red-600">{validationError}</p>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">{limits.description}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {isError && error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message}</span>
        </div>
      )}

      {hint && !validationError && !isError && (
        <p className="mt-2 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

