import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '../api/listings';
import Layout from '../components/layout/Layout';
import ListingCard from '../components/listings/ListingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { data: favorites, isLoading, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: listingsApi.getFavorites,
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            My Favorites
          </h1>
          <p className="text-gray-600 mt-1">
            {favorites?.length || 0} saved listings
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading favorites..." />
          </div>
        )}

        {!isLoading && (!favorites || favorites.length === 0) && (
          <div className="card text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600">
              Start browsing and save listings you like!
            </p>
          </div>
        )}

        {!isLoading && favorites && favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((fav: any) => (
              <ListingCard
                key={fav.fav_id}
                listing={fav.listing}
                onFavoriteChange={() => refetch()}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}