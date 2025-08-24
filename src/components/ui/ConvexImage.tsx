import { useQuery } from '@tanstack/react-query';
import { convexQuery } from '@convex-dev/react-query';
import { api } from 'convex/_generated/api';

interface ConvexImageProps {
  storageId: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function ConvexImage({ storageId, alt, className, fallback }: ConvexImageProps) {
  const imageUrlQuery = useQuery(
    convexQuery(api.yallas.getImageUrl, { storageId })
  );

  if (imageUrlQuery.isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse rounded-2xl flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (imageUrlQuery.isError || !imageUrlQuery.data) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Image not found</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={imageUrlQuery.data}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Failed to load image:', e);
        }}
      />
    </div>
  );
}