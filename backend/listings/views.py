from django.shortcuts import render
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
from PIL import Image
from io import BytesIO
from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Listing, ListingImage, PricingPlan, RatingReview, Favorite, ReportMisconduct
from .serializers import (
    CategorySerializer, ListingSerializer, ListingCreateSerializer,
    ListingDetailSerializer, PricingPlanSerializer, RatingReviewSerializer,
    RatingReviewCreateSerializer, FavoriteSerializer, ReportMisconductSerializer, ReportCreateSerializer
)

from notifications.utils import create_notification


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ============================================================================
# CATEGORIES
# ============================================================================

@api_view(['GET'])
def category_list(request):
    """
    Get all active categories
    GET /api/categories/
    """
    categories = Category.objects.filter(is_active=True)
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def category_detail(request, pk):
    """
    Get category details
    GET /api/categories/{id}/
    """
    category = get_object_or_404(Category, pk=pk, is_active=True)
    serializer = CategorySerializer(category)
    return Response(serializer.data)


# ============================================================================
# LISTINGS
# ============================================================================

class ListingListView(generics.ListAPIView):
    """
    List all listings with filters
    GET /api/listings/?category=1&min_price=1000&max_price=50000&location=Bujumbura&search=house
    """
    queryset = Listing.objects.filter(listing_status='active').select_related('userid', 'cat_id').prefetch_related('images')
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['cat_id', 'listing_status', 'is_featured', 'list_location']
    search_fields = ['listing_title', 'list_description', 'list_location']
    ordering_fields = ['listing_price', 'createdat', 'views']
    ordering = ['-createdat']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(listing_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(listing_price__lte=max_price)
        
        return queryset


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def listing_create(request):
    """
    Create a new listing
    POST /api/listings/create/
    {
        "cat_id": 1,
        "listing_title": "Beautiful House in Bujumbura",
        "list_description": "3 bedrooms, 2 bathrooms...",
        "listing_price": 50000000,
        "list_location": "Bujumbura, Rohero"
    }
    """
    serializer = ListingCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        listing = serializer.save(userid=request.user)
        
        return Response({
            'message': 'Listing created successfully',
            'listing': ListingDetailSerializer(listing).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def listing_detail(request, pk):
    """
    Get listing details
    GET /api/listings/{id}/
    """
    listing = get_object_or_404(
        Listing.objects.select_related('userid', 'cat_id').prefetch_related('images'),
        pk=pk
    )
    
    # Increment view count (don't count owner's views)
    if not request.user.is_authenticated or request.user != listing.userid:
        listing.increment_views()
    
    serializer = ListingDetailSerializer(listing, context={'request': request})
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def listing_update(request, pk):
    """
    Update listing (owner only)
    PUT/PATCH /api/listings/{id}/
    """
    listing = get_object_or_404(Listing, pk=pk)
    
    # Check ownership
    if listing.userid != request.user:
        return Response({
            'error': 'You do not have permission to edit this listing'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ListingCreateSerializer(
        listing,
        data=request.data,
        partial=True
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Listing updated successfully',
            'listing': ListingDetailSerializer(listing).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def listing_delete(request, pk):
    """
    Delete listing (owner only)
    DELETE /api/listings/{id}/
    """
    listing = get_object_or_404(Listing, pk=pk)
    
    # Check ownership
    if listing.userid != request.user:
        return Response({
            'error': 'You do not have permission to delete this listing'
        }, status=status.HTTP_403_FORBIDDEN)
    
    listing.delete()
    return Response({
        'message': 'Listing deleted successfully'
    }, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def my_listings(request):
    """
    Get current user's listings
    GET /api/listings/my-listings/
    """
    if not request.user.is_authenticated:
        return Response({
            'error': 'Authentication required'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    listings = Listing.objects.filter(userid=request.user).order_by('-createdat')
    serializer = ListingSerializer(listings, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def featured_listings(request):
    """
    Get featured listings
    GET /api/listings/featured/
    """
    listings = Listing.objects.filter(
        listing_status='active',
        is_featured=True
    ).order_by('-createdat')[:10]
    
    serializer = ListingSerializer(listings, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def similar_listings(request, pk):
    """
    Get similar listings (same category, similar price)
    GET /api/listings/{id}/similar/
    """
    from decimal import Decimal
    
    listing = get_object_or_404(Listing, pk=pk)
    
    # Price range: ±30% using Decimal arithmetic
    min_price = listing.listing_price * Decimal('0.7')
    max_price = listing.listing_price * Decimal('1.3')
    
    similar = Listing.objects.filter(
        cat_id=listing.cat_id,
        listing_status='active',
        listing_price__gte=min_price,
        listing_price__lte=max_price
    ).exclude(pk=pk).select_related('userid', 'cat_id').prefetch_related('images').order_by('-createdat')[:6]
    
    serializer = ListingSerializer(similar, many=True)
    return Response(serializer.data)


# ============================================================================
# FAVORITES
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def favorite_list(request):
    """
    Get user's favorite listings
    GET /api/favorites/
    """
    favorites = Favorite.objects.filter(userid=request.user).select_related('listing_id')
    serializer = FavoriteSerializer(favorites, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def favorite_toggle(request, listing_id):
    """
    Add/remove listing from favorites
    POST /api/favorites/{listing_id}/toggle/
    """
    listing = get_object_or_404(Listing, pk=listing_id)
    
    favorite, created = Favorite.objects.get_or_create(
        userid=request.user,
        listing_id=listing
    )
    
    if not created:
        favorite.delete()
        return Response({
            'message': 'Removed from favorites',
            'is_favorited': False
        })
    
    return Response({
        'message': 'Added to favorites',
        'is_favorited': True
    }, status=status.HTTP_201_CREATED)


# ============================================================================
# RATINGS & REVIEWS
# ============================================================================

@api_view(['GET'])
def review_list(request, user_id):
    """
    Get reviews for a user
    GET /api/reviews/user/{user_id}/
    """
    reviews = RatingReview.objects.filter(
        reviewed_userid=user_id,
        is_visible=True
    ).select_related('userid').order_by('-createdat')
    
    # Calculate average rating
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
    
    serializer = RatingReviewSerializer(reviews, many=True)
    return Response({
        'average_rating': round(avg_rating, 1),
        'total_reviews': reviews.count(),
        'reviews': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_create(request):
    """
    Create a review
    POST /api/reviews/create/
    {
        "reviewed_userid": 2,
        "listing_id": 5,
        "rating": 5,
        "comment": "Great seller!"
    }
    """
    serializer = RatingReviewCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        # Check if user is trying to review themselves
        if serializer.validated_data['reviewed_userid'] == request.user:
            return Response({
                'error': 'You cannot review yourself'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        review = serializer.save(userid=request.user)
        
        return Response({
            'message': 'Review posted successfully',
            'review': RatingReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# PRICING PLANS
# ============================================================================

@api_view(['GET'])
def pricing_plans_list(request):
    """
    Get all active pricing plans
    GET /api/pricing-plans/
    """
    plans = PricingPlan.objects.filter(is_active=True)
    serializer = PricingPlanSerializer(plans, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_create(request):
    """
    Submit a report
    POST /api/reports/create/
    {
        "listing_id": 5,  // Optional
        "reported_userid": 3,  // Optional
        "report_type": "spam",
        "report_reason": "This listing is fake..."
    }
    """
    serializer = ReportCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        # Prevent self-reporting
        reported_user = serializer.validated_data.get('reported_userid')
        if reported_user and reported_user == request.user:
            return Response({
                'error': 'You cannot report yourself'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        report = serializer.save(userid=request.user)
        
        # Notify admins (in production, notify actual admin users)
        # For now, just create a system notification
        create_notification(
            user=request.user,
            title='Report Submitted',
            message='Your report has been submitted and is under review',
            notif_type='report'
        )
        
        return Response({
            'message': 'Report submitted successfully. We will review it shortly.',
            'report': ReportMisconductSerializer(report).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reports(request):
    """
    Get current user's submitted reports
    GET /api/reports/my-reports/
    """
    reports = ReportMisconduct.objects.filter(
        userid=request.user
    ).select_related(
        'reported_userid', 'listing_id'
    ).order_by('-createdat')
    
    serializer = ReportMisconductSerializer(reports, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_detail(request, pk):
    """
    Get report details (owner only)
    GET /api/reports/{id}/
    """
    report = get_object_or_404(ReportMisconduct, pk=pk)
    
    # Only reporter can view their own report
    if report.userid != request.user:
        return Response({
            'error': 'You do not have permission to view this report'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ReportMisconductSerializer(report)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_listing_image(request, listing_id):
    """
    Upload image for a listing
    POST /api/listings/{listing_id}/upload-image/
    Form-data: image (file)
    """
    listing = get_object_or_404(Listing, pk=listing_id)
    
    # Check ownership
    if listing.userid != request.user:
        return Response({
            'error': 'You do not have permission to upload images for this listing'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if 'image' not in request.FILES:
        return Response({
            'error': 'No image file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if image_file.content_type not in allowed_types:
        return Response({
            'error': 'Invalid file type. Only JPEG, PNG, and WebP are allowed'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate file size (5MB max)
    if image_file.size > 5 * 1024 * 1024:
        return Response({
            'error': 'File too large. Maximum size is 5MB'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Open and optimize image
        img = Image.open(image_file)
        
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Resize if too large (max 1920px width)
        max_width = 1920
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Save optimized image
        output = BytesIO()
        img.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        
        # Generate unique filename
        ext = 'jpg'
        filename = f"listings/{listing.listing_id}/{uuid.uuid4().hex}.{ext}"
        
        # Save file
        path = default_storage.save(filename, ContentFile(output.read()))
        url = default_storage.url(path)
        
        # Get next display order
        max_order = ListingImage.objects.filter(listing_id=listing).count()
        
        # Create image record
        listing_image = ListingImage.objects.create(
            listing_id=listing,
            image_url=url,
            is_primary=(max_order == 0),  # First image is primary
            display_order=max_order
        )
        
        return Response({
            'message': 'Image uploaded successfully',
            'image': {
                'listimage_id': listing_image.listimage_id,
                'image_url': listing_image.image_url,
                'is_primary': listing_image.is_primary,
                'display_order': listing_image.display_order
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Error processing image: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_listing_image(request, listing_id, image_id):
    """
    Delete a listing image
    DELETE /api/listings/{listing_id}/images/{image_id}/
    """
    listing = get_object_or_404(Listing, pk=listing_id)
    
    # Check ownership
    if listing.userid != request.user:
        return Response({
            'error': 'You do not have permission to delete images from this listing'
        }, status=status.HTTP_403_FORBIDDEN)
    
    image = get_object_or_404(ListingImage, pk=image_id, listing_id=listing)
    
    # Delete file from storage
    try:
        if default_storage.exists(image.image_url):
            default_storage.delete(image.image_url)
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    # If this was primary, make first remaining image primary
    was_primary = image.is_primary
    image.delete()
    
    if was_primary:
        first_image = ListingImage.objects.filter(listing_id=listing).first()
        if first_image:
            first_image.is_primary = True
            first_image.save()
    
    return Response({
        'message': 'Image deleted successfully'
    }, status=status.HTTP_204_NO_CONTENT)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def set_primary_image(request, listing_id, image_id):
    """
    Set an image as primary
    PUT /api/listings/{listing_id}/images/{image_id}/set-primary/
    """
    listing = get_object_or_404(Listing, pk=listing_id)
    
    # Check ownership
    if listing.userid != request.user:
        return Response({
            'error': 'You do not have permission to modify this listing'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Unset all primary images
    ListingImage.objects.filter(listing_id=listing).update(is_primary=False)
    
    # Set new primary
    image = get_object_or_404(ListingImage, pk=image_id, listing_id=listing)
    image.is_primary = True
    image.save()
    
    return Response({
        'message': 'Primary image updated'
    })