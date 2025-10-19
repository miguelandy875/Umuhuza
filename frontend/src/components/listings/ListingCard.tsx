import { Link } from 'react-router-dom';
import { Heart, MapPin, Eye } from 'lucide-react';
import type { Listing } from '../../types';
import { useState } from 'react';
import { listingsApi } from '../../api/listings';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useRequireVerification } from '../../hooks/useRequireVerification';

interface ListingCardProps {
  listing: Listing;
  onFavoriteChange?: () => void;
}

export default function ListingCard({ listing, onFavoriteChange }: ListingCardProps) {
  const { isAuthenticated } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(listing.is_favorited || false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

   // Safety check - if no listing or seller data, don't render
  if (!listing || !listing.seller) {
    return null;
  }
  
  const primaryImage = listing.images.find(img => img.is_primary) || listing.images[0];
  const imageUrl = primaryImage?.image_url || '/placeholder-image.jpg';

  const { checkVerification } = useRequireVerification();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }

     if (!checkVerification('save favorites')) {
      return;
    }

    setIsLoadingFavorite(true);
    try {
      const result = await listingsApi.toggleFavorite(listing.listing_id);
      setIsFavorited(result.is_favorited);
      toast.success(result.is_favorited ? 'Added to favorites' : 'Removed from favorites');
      onFavoriteChange?.();
    } catch (error) {
      toast.error('Failed to update favorite');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BIF',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  return (
    <Link
      to={`/listings/${listing.listing_id}`}
      className="card hover:shadow-xl transition-shadow duration-200 overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={listing.listing_title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Featured Badge */}
        {listing.is_featured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            FEATURED
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={isLoadingFavorite}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isFavorited
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Status Badge */}
        {listing.listing_status !== 'active' && (
          <div className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            {listing.listing_status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {listing.listing_title}
        </h3>

        {/* Price */}
        <div className="text-2xl font-bold text-primary-600 mb-2">
          {formatPrice(listing.listing_price)}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{listing.list_location}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          {/* Category */}
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {listing.category.cat_name}
          </span>

          {/* Views */}
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Eye className="w-4 h-4" />
            <span>{listing.views}</span>
          </div>
        </div>

        {/* Seller Info */}
        {listing.seller && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
              {listing.seller.user_firstname?.[0] || listing.seller.full_name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {listing.seller.full_name || 'Unknown Seller'}
              </p>
              {listing.seller.is_verified && (
                <p className="text-xs text-green-600">✓ Verified</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}