import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '../api/listings';
import Layout from '../components/layout/Layout';
import ListingCard from '../components/listings/ListingCard';
import SearchFilters from '../components/listings/SearchFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ListingsPage() {
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['listings', filters, page],
    queryFn: () => listingsApi.getAll({ ...filters, page, page_size: 12 }),
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data ? Math.ceil(data.count / 12) : 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Listings
          </h1>
          <p className="text-gray-600">
            {data?.count || 0} listings available
          </p>
        </div>

        {/* Search & Filters */}
        <SearchFilters onFilterChange={handleFilterChange} />

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading listings..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">Failed to load listings</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-4">No listings found</p>
            <p className="text-gray-500 mb-8">Try adjusting your filters</p>
            <Button onClick={() => handleFilterChange({})}>Clear Filters</Button>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && !error && data && data.results.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.results.map((listing) => (
                <ListingCard
                  key={listing.listing_id}
                  listing={listing}
                  onFavoriteChange={() => refetch()}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-gray-500">...</span>}
                  {totalPages > 5 && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        page === totalPages
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}