"use client";

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readOnly = false, 
  size = 'md',
  showNumber = false 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleStarClick = (starRating: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            disabled={readOnly}
            className={`
              ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} 
              transition-transform duration-150
              ${!readOnly ? 'focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:ring-opacity-50 rounded' : ''}
            `}
          >
            <Star
              className={`
                ${sizeClasses[size]}
                ${star <= rating 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
                }
                ${!readOnly ? 'hover:text-yellow-400 hover:fill-yellow-400' : ''}
                transition-colors duration-150
              `}
            />
          </button>
        ))}
      </div>
      
      {showNumber && (
        <span className="text-sm text-gray-600 ml-2">
          {rating > 0 ? rating.toFixed(1) : '평가 없음'}
        </span>
      )}
    </div>
  );
} 