import { firestoreService, COLLECTIONS } from './firestore';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Review {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  standardCoffeeId?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number }; // 1점:5개, 2점:3개 등
}

export class ReviewService {
  // 특정 제품의 리뷰 목록 가져오기
  static async getProductReviews(productId: string): Promise<Review[]> {
    try {
      const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
      const q = query(
        reviewsRef,
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Review);
      });
      
      return reviews;
    } catch (error) {
      console.error('제품 리뷰 로드 실패:', error);
      throw error;
    }
  }

  // 표준 커피의 모든 리뷰 가져오기 (여러 제품에서)
  static async getStandardCoffeeReviews(standardCoffeeId: string): Promise<Review[]> {
    try {
      const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
      const q = query(
        reviewsRef,
        where('standardCoffeeId', '==', standardCoffeeId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Review);
      });
      
      return reviews;
    } catch (error) {
      console.error('표준 커피 리뷰 로드 실패:', error);
      throw error;
    }
  }

  // 사용자의 특정 제품 리뷰 가져오기
  static async getUserProductReview(userId: string, productId: string): Promise<Review | null> {
    try {
      const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
      const q = query(
        reviewsRef,
        where('userId', '==', userId),
        where('productId', '==', productId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Review;
    } catch (error) {
      console.error('사용자 리뷰 로드 실패:', error);
      throw error;
    }
  }

  // 리뷰 생성
  static async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const review = {
        ...reviewData,
        createdAt: now,
        updatedAt: now,
      };
      
      const reviewId = await firestoreService.add(COLLECTIONS.REVIEWS, review);
      return reviewId;
    } catch (error) {
      console.error('리뷰 생성 실패:', error);
      throw error;
    }
  }

  // 리뷰 수정
  static async updateReview(reviewId: string, updates: Partial<Pick<Review, 'rating' | 'comment'>>): Promise<void> {
    try {
      const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('리뷰 수정 실패:', error);
      throw error;
    }
  }

  // 리뷰 삭제
  static async deleteReview(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
      await deleteDoc(reviewRef);
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      throw error;
    }
  }

  // 제품의 리뷰 통계 계산
  static async getProductReviewStats(productId: string): Promise<ReviewStats> {
    try {
      const reviews = await this.getProductReviews(productId);
      
      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {}
        };
      }
      
      const ratingDistribution: { [key: number]: number } = {};
      let totalRating = 0;
      
      reviews.forEach(review => {
        totalRating += review.rating;
        ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
      });
      
      return {
        averageRating: Math.round((totalRating / reviews.length) * 10) / 10, // 소수점 1자리
        totalReviews: reviews.length,
        ratingDistribution
      };
    } catch (error) {
      console.error('리뷰 통계 계산 실패:', error);
      throw error;
    }
  }

  // 표준 커피의 리뷰 통계 계산 (모든 제품의 리뷰 합산)
  static async getStandardCoffeeReviewStats(standardCoffeeId: string): Promise<ReviewStats> {
    try {
      const reviews = await this.getStandardCoffeeReviews(standardCoffeeId);
      
      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {}
        };
      }
      
      const ratingDistribution: { [key: number]: number } = {};
      let totalRating = 0;
      
      reviews.forEach(review => {
        totalRating += review.rating;
        ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
      });
      
      return {
        averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution
      };
    } catch (error) {
      console.error('표준 커피 리뷰 통계 계산 실패:', error);
      throw error;
    }
  }
} 