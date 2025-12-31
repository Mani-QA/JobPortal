import { useCallback, useState, useRef } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';
import { useFileUpload, validateFile, UploadResult } from '../../hooks/useFileUpload';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onUploadComplete?: (result: UploadResult) => void;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
};

const iconSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
};

const cameraSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
};

const cameraIconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

export function AvatarUpload({
  currentAvatarUrl,
  name,
  size = 'lg',
  onUploadComplete,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading, data } = useFileUpload({
    purpose: 'avatar',
    onSuccess: (result) => {
      onUploadComplete?.(result);
    },
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValidationError(null);
      
      const error = validateFile(file, 'avatar');
      if (error) {
        setValidationError(error);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      upload(file);
    }
  }, [upload]);

  const displayUrl = previewUrl || data?.url || currentAvatarUrl;
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleChange}
        className="sr-only"
        disabled={isUploading}
      />

      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer group relative`}
        onClick={() => inputRef.current?.click()}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : initials ? (
          <span className={`text-white font-bold ${size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg'}`}>
            {initials}
          </span>
        ) : (
          <User className={`${iconSizes[size]} text-white`} />
        )}

        {/* Overlay */}
        {!isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className={`${cameraIconSizes[size]} text-white`} />
          </div>
        )}

        {/* Loading spinner */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className={`${cameraIconSizes[size]} text-white animate-spin`} />
          </div>
        )}
      </div>

      {/* Camera button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={`absolute bottom-0 right-0 ${cameraSizes[size]} rounded-full bg-white border-2 border-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50`}
      >
        {isUploading ? (
          <Loader2 className={`${cameraIconSizes[size]} text-gray-600 animate-spin`} />
        ) : (
          <Camera className={`${cameraIconSizes[size]} text-gray-600`} />
        )}
      </button>

      {validationError && (
        <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-red-600">
          {validationError}
        </p>
      )}
    </div>
  );
}

