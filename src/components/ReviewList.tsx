"use client";

import { useState, useEffect } from 'react';
import { MessageCircle, Edit, Trash2, Calendar, User } from 'lucide-react';
import { Review, ReviewService } from '@/lib/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from './StarRating';

interface ReviewListProps {
  productId?: string;
  standardCoffeeId?: string;
  onEditReview?: (review: Review) => void;
  refreshTrigger?: number; // 외부에서 리뷰 목록 새로고침을 트리거하기 위한 prop
}

export default function ReviewList({ 
  productId, 
  standardCoffeeId, 
  onEditReview,
  refreshTrigger = 0
}: ReviewListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [productId, standardCoffeeId, refreshTrigger]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      let reviewData: Review[] = [];
      
      if (productId) {
        reviewData = await ReviewService.getProductReviews(productId);
      } else if (standardCoffeeId) {
        reviewData = await ReviewService.getStandardCoffeeReviews(standardCoffeeId);
      }
      
      setReviews(reviewData);
    } catch (error) {
      console.error('리뷰 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    setDeletingReviewId(reviewId);
    try {
      await ReviewService.deleteReview(reviewId);
      await loadReviews(); // 목록 새로고침
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      alert('리뷰 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}분 전`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-brown mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">리뷰 불러오는 중...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-gray-900 mb-1">아직 리뷰가 없습니다</h3>
        <p className="text-xs text-gray-500">첫 번째 리뷰를 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          리뷰 ({reviews.length})
        </h3>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-coffee-brown rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {review.userName}
                    </h4>
                    <StarRating rating={review.rating} readOnly size="sm" />
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(review.createdAt)}</span>
                    {review.updatedAt.getTime() !== review.createdAt.getTime() && (
                      <span className="text-gray-400">(수정됨)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 본인 리뷰일 때만 수정/삭제 버튼 표시 */}
              {user && user.uid === review.userId && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditReview?.(review)}
                    className="p-1 text-gray-400 hover:text-coffee-brown transition-colors"
                    title="리뷰 수정"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deletingReviewId === review.id}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="리뷰 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 