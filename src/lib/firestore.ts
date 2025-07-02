import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// 컬렉션 이름 상수
export const COLLECTIONS = {
  ROASTERIES: 'roasteries',
  COFFEE_PRODUCTS: 'coffeeProducts', 
  STANDARD_COFFEES: 'standardCoffees',
  REVIEWS: 'reviews'
} as const;

// Firestore 데이터베이스 서비스 클래스
export class FirestoreService {
  
  // 모든 문서 조회
  async getAll<T>(collectionName: string): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      throw error;
    }
  }

  // 특정 문서 조회
  async getById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as T;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }

  // 문서 추가
  async add<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  // 문서 업데이트
  async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data as any);
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw error;
    }
  }

  // 문서 삭제
  async delete(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }

  // 조건부 검색
  async searchByField<T>(
    collectionName: string, 
    field: string, 
    operator: any, 
    value: any,
    limitCount?: number
  ): Promise<T[]> {
    try {
      let q = query(collection(db, collectionName), where(field, operator, value));
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error searching ${collectionName} by ${field}:`, error);
      throw error;
    }
  }

  // 텍스트 검색 (부분 일치)
  async searchByText<T>(
    collectionName: string,
    searchFields: string[],
    searchTerm: string
  ): Promise<T[]> {
    try {
      const allDocs = await this.getAll<T>(collectionName);
      
      // 클라이언트 사이드에서 텍스트 검색 (Firestore는 full-text 검색 제한적)
      return allDocs.filter(doc => {
        const searchTermLower = searchTerm.toLowerCase();
        return searchFields.some(field => {
          const fieldValue = (doc as any)[field];
          if (typeof fieldValue === 'string') {
            return fieldValue.toLowerCase().includes(searchTermLower);
          } else if (Array.isArray(fieldValue)) {
            return fieldValue.some(item => 
              typeof item === 'string' && item.toLowerCase().includes(searchTermLower)
            );
          }
          return false;
        });
      });
    } catch (error) {
      console.error(`Error searching ${collectionName} by text:`, error);
      throw error;
    }
  }

  // 배치 데이터 추가 (마이그레이션용)
  async addBatch<T>(collectionName: string, data: Omit<T, 'id'>[]): Promise<string[]> {
    try {
      const ids: string[] = [];
      
      for (const item of data) {
        const docRef = await addDoc(collection(db, collectionName), item);
        ids.push(docRef.id);
      }
      
      return ids;
    } catch (error) {
      console.error(`Error adding batch to ${collectionName}:`, error);
      throw error;
    }
  }
}

// 서비스 인스턴스 생성
export const firestoreService = new FirestoreService();