"use client";

import { useState, useEffect } from 'react';
import { X, Save, Star } from 'lucide-react';
import { Review, ReviewService } from '@/lib/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from './StarRating';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  standardCoffeeId?: string;
  productName: string;
  existingReview?: Review | null;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSuccess,
  productId,
  standardCoffeeId,
  productName,
  existingReview
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!existingReview;

  useEffect(() => {
    if (isOpen) {
      if (existingReview) {
        setRating(existingReview.rating);
        setComment(existingReview.comment);
      } else {
        setRating(0);
        setComment('');
      }
      setError('');
    }
  }, [isOpen, existingReview]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('별점을 선택해주세요.');
      return;
    }
    
    if (comment.trim().length < 10) {
      setError('리뷰는 최소 10자 이상 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing && existingReview) {
        // 기존 리뷰 수정
        await ReviewService.updateReview(existingReview.id, {
          rating,
          comment: comment.trim()
        });
      } else {
        // 새 리뷰 작성
        await ReviewService.createReview({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || user.email?.split('@')[0] || '익명',
          productId,
          standardCoffeeId,
          rating,
          comment: comment.trim()
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('리뷰 저장 실패:', error);
      setError('리뷰 저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? '리뷰 수정' : '리뷰 작성'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* 제품 정보 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 text-sm">{productName}</h3>
            <p className="text-xs text-gray-600 mt-1">이 제품에 대한 솔직한 리뷰를 남겨주세요</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 별점 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              별점 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
              <span className="text-sm text-gray-600">
                {rating > 0 ? `${rating}점` : '별점을 선택하세요'}
              </span>
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              리뷰 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown resize-none"
              placeholder="이 원두에 대한 솔직한 후기를 남겨주세요. 맛, 향, 품질 등에 대해 자세히 써주시면 다른 분들에게 도움이 됩니다."
              minLength={10}
              maxLength={500}
              required
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {comment.length}/500자 (최소 10자)
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
              className="inline-flex items-center px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? '저장 중...' : (isEditing ? '수정 완료' : '리뷰 등록')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 