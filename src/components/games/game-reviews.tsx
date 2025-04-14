'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Flag } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTranslations } from 'next-intl';

type Review = {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  rating: number;
  title?: string;
  content?: string;
  playTime?: number;
  isVerifiedPurchase: boolean;
  isRecommended?: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: string;
};

type GameReviewsProps = {
  gameId: string;
};

export function GameReviews({ gameId }: GameReviewsProps) {
  const t = useTranslations();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecommended, setIsRecommended] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/games/${gameId}/reviews`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        
        // Sort reviews: user's review first, then by upvotes, then by date
        const sortedReviews = [...(data.data || [])].sort((a, b) => {
          // User's review first
          if (user && a.userId === user.id) return -1;
          if (user && b.userId === user.id) return 1;
          
          // Then by upvotes
          const aScore = a.upvotes - a.downvotes;
          const bScore = b.upvotes - b.downvotes;
          if (aScore !== bScore) return bScore - aScore;
          
          // Then by date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setReviews(sortedReviews);
        
        // Check if user has already reviewed
        if (user) {
          const existingReview = sortedReviews.find(review => review.userId === user.id);
          if (existingReview) {
            setUserReview(existingReview);
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [gameId, user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      return;
    }
    
    try {
      setSubmitting(true);

      console.log(`/api/games/${gameId}/reviews`);
      
      const response = await fetch(`/api/games/${gameId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          title: title.trim() || undefined,
          content: content.trim() || undefined,
          isRecommended,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
      
      const data = await response.json();
      
      // Add the new review to the list
      setReviews(prev => [data.data, ...prev.filter(r => r.userId !== user?.id)]);
      setUserReview(data.data);
      setShowWriteReview(false);
      
      // Reset form
      setRating(5);
      setTitle('');
      setContent('');
      setIsRecommended(true);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId: string, isUpvote: boolean) => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      const response = await fetch(`/api/games/${gameId}/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isUpvote,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to vote');
      }
      
      const data = await response.json();
      
      // Update the review in the list
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                upvotes: data.data.upvotes, 
                downvotes: data.data.downvotes 
              } 
            : review
        )
      );
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        {error}
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatPlayTime = (minutes?: number) => {
    if (!minutes) return 'Unknown playtime';
    
    const hours = Math.floor(minutes / 60);
    
    if (hours < 1) {
      return `${minutes} minutes`;
    } else if (hours === 1) {
      return `${hours} hour`;
    } else {
      return `${hours} hours`;
    }
  };

  return (
    <div>
      {/* Review Summary */}
      <div className="bg-card rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Player Reviews</h3>
            <p className="text-muted-foreground">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} from players
            </p>
          </div>
          
          {isAuthenticated && !userReview && !showWriteReview && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
        
        {/* Write Review Form */}
        {isAuthenticated && showWriteReview && (
          <div className="mt-6 border-t border-[hsl(var(--border))] pt-6">
            <h4 className="text-lg font-semibold mb-4">Write Your Review</h4>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-hidden focus:ring-1 focus:ring-primary rounded"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input focus:outline-hidden focus:ring-1 focus:ring-primary"
                  placeholder="Summarize your experience (optional)"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Review</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input focus:outline-hidden focus:ring-1 focus:ring-primary min-h-[100px]"
                  placeholder="Share your thoughts about this game (optional)"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Would you recommend this game?</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={isRecommended}
                      onChange={() => setIsRecommended(true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!isRecommended}
                      onChange={() => setIsRecommended(false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWriteReview(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-card rounded-lg p-6 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-lg font-semibold mb-1">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-4">Be the first to review this game!</p>
          
          {isAuthenticated && !showWriteReview && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-lg p-6">
              <div className="flex justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.user.name}</span>
                      {review.isVerifiedPurchase && (
                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                      {review.userId === user?.id && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Your Review
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {review.playTime && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatPlayTime(review.playTime)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleVote(review.id, true)}
                    className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                    aria-label="Upvote"
                    disabled={review.userId === user?.id}
                  >
                    <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <span className="text-sm">{review.upvotes}</span>
                  
                  <button
                    onClick={() => handleVote(review.id, false)}
                    className="p-1.5 rounded-full hover:bg-primary/10 transition-colors ml-1"
                    aria-label="Downvote"
                    disabled={review.userId === user?.id}
                  >
                    <ThumbsDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <span className="text-sm">{review.downvotes}</span>
                  
                  <button
                    className="p-1.5 rounded-full hover:bg-primary/10 transition-colors ml-1"
                    aria-label="Report"
                  >
                    <Flag className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              
              {review.title && (
                <h4 className="font-semibold mt-4">{review.title}</h4>
              )}
              
              {review.content && (
                <p className="mt-2 text-sm whitespace-pre-line">{review.content}</p>
              )}
              
              {review.isRecommended !== undefined && (
                <div className="mt-4 text-sm">
                  <span className="text-muted-foreground mr-1">Recommended:</span>
                  <span className={review.isRecommended ? 'text-green-500' : 'text-red-500'}>
                    {review.isRecommended ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
              
              {review.userId === user?.id && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setRating(review.rating);
                      setTitle(review.title || '');
                      setContent(review.content || '');
                      setIsRecommended(review.isRecommended !== false);
                      setShowWriteReview(true);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit Review
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    className="text-sm text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}