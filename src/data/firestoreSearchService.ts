import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  DocumentData 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { firestoreService, COLLECTIONS } from '@/lib/firestore';

export interface FirestoreRoastery {
  id: string;
  originalId: string;
  name: string;
  description: string;
  website: string;
  location: string;
  founded: number;
  specialties: string[];
  logoUrl: string;
  brandColor: string;
  isUnspecialtyPartner: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreStandardCoffee {
  id: string;
  originalId: string;
  primaryName: string;
  alternativeNames: string[];
  origin: string;
  region: string;
  processing: string[];
  commonRoastLevels: string[];
  description: string;
  commonTastingNotes: string[];
  avgRating: number;
  commonVarieties: string[];
  altitudeRange: string;
  harvestSeason: string;
  typicalPrice: {
    min: number;
    max: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreCoffeeProduct {
  id: string;
  originalId: string;
  roasteryId: string;
  name: string;
  standardCoffeeId?: string;
  origin: string;
  region: string;
  farm?: string;
  processing: string;
  roastLevel: string;
  description: string;
  price: number;
  weight: string;
  url: string;
  inStock: boolean;
  saleStatus: 'active' | 'discontinued' | 'limited';
  lastUpdated: Date;
  tastingNotes: string[];
  altitude?: string;
  variety?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreSearchResult {
  standardCoffee: FirestoreStandardCoffee;
  products: Array<{
    product: FirestoreCoffeeProduct;
    roastery: FirestoreRoastery;
  }>;
  lowestPrice: number;
  avgPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
}

class FirestoreCoffeeSearchService {
  private roasteries: FirestoreRoastery[] = [];
  private standardCoffees: FirestoreStandardCoffee[] = [];
  private coffeeProducts: FirestoreCoffeeProduct[] = [];
  private isDataLoaded = false;

  // 데이터 로드
  async loadData(): Promise<void> {
    if (this.isDataLoaded) return;

    try {
      console.log('🔄 Firestore에서 데이터를 로드하는 중...');

      // 병렬로 모든 데이터 로드
      const [roasteriesData, standardCoffeesData, coffeeProductsData] = await Promise.all([
        firestoreService.getAll<FirestoreRoastery>(COLLECTIONS.ROASTERIES),
        firestoreService.getAll<FirestoreStandardCoffee>(COLLECTIONS.STANDARD_COFFEES),
        firestoreService.getAll<FirestoreCoffeeProduct>(COLLECTIONS.COFFEE_PRODUCTS)
      ]);

      this.roasteries = roasteriesData;
      this.standardCoffees = standardCoffeesData;
      this.coffeeProducts = coffeeProductsData;
      this.isDataLoaded = true;

      console.log(`✅ 데이터 로드 완료:`, {
        roasteries: this.roasteries.length,
        standardCoffees: this.standardCoffees.length,
        coffeeProducts: this.coffeeProducts.length
      });
    } catch (error) {
      console.error('❌ Firestore 데이터 로드 실패:', error);
      throw error;
    }
  }

  // 데이터 새로고침
  async refreshData(): Promise<void> {
    this.isDataLoaded = false;
    await this.loadData();
  }

  // 검색 실행
  async search(
    searchTerm: string,
    onlyUnspecialtyPartners: boolean = false,
    selectedRoastLevels: string[] = [],
    selectedProcessingMethods: string[] = [],
    showDiscontinuedProducts: boolean = true
  ): Promise<FirestoreSearchResult[]> {
    await this.loadData();

    const searchTermLower = searchTerm.toLowerCase();
    const results: FirestoreSearchResult[] = [];

    // 표준 커피에서 검색 조건에 맞는 것들 찾기
    const matchingStandardCoffees = this.standardCoffees.filter(coffee => {
      const nameMatch = coffee.primaryName.toLowerCase().includes(searchTermLower) ||
                       coffee.alternativeNames.some(name => name.toLowerCase().includes(searchTermLower));
      const originMatch = coffee.origin.toLowerCase().includes(searchTermLower);
      const regionMatch = coffee.region.toLowerCase().includes(searchTermLower);
      const tastingMatch = coffee.commonTastingNotes.some(note => note.toLowerCase().includes(searchTermLower));

      return nameMatch || originMatch || regionMatch || tastingMatch;
    });

    // 각 표준 커피에 대해 해당하는 제품들 찾기
    for (const standardCoffee of matchingStandardCoffees) {
      const relatedProducts = this.coffeeProducts.filter(product => {
        // standardCoffeeId로 매칭하거나, 유사한 이름/지역으로 매칭
        const directMatch = product.standardCoffeeId === standardCoffee.originalId;
        const nameMatch = product.name.toLowerCase().includes(searchTermLower) ||
                         standardCoffee.primaryName.toLowerCase().includes(product.name.toLowerCase());
        const originMatch = product.origin === standardCoffee.origin && 
                           product.region === standardCoffee.region;

        const baseMatch = directMatch || nameMatch || originMatch;
        if (!baseMatch) return false;

        // 판매 상태 필터
        if (!showDiscontinuedProducts && product.saleStatus === 'discontinued') {
          return false;
        }

        // 로스팅 레벨 필터
        if (selectedRoastLevels.length > 0) {
          if (!selectedRoastLevels.includes(product.roastLevel)) {
            return false;
          }
        }

        // 가공 방식 필터
        if (selectedProcessingMethods.length > 0) {
          if (!selectedProcessingMethods.includes(product.processing)) {
            return false;
          }
        }

        return true;
      });

      if (relatedProducts.length > 0) {
        // 각 제품에 대해 로스터리 정보 추가
        const productsWithRoasteries = relatedProducts.map(product => {
          const roastery = this.roasteries.find(r => r.originalId === product.roasteryId);
          return {
            product,
            roastery: roastery!
          };
        }).filter(item => {
          // 언스페셜티 파트너 필터
          if (onlyUnspecialtyPartners) {
            return item.roastery?.isUnspecialtyPartner === true;
          }
          return true;
        });

        if (productsWithRoasteries.length > 0) {
          const prices = productsWithRoasteries.map(item => item.product.price);
          const lowestPrice = Math.min(...prices);
          const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

          results.push({
            standardCoffee,
            products: productsWithRoasteries,
            lowestPrice,
            avgPrice,
            priceRange: {
              min: Math.min(...prices),
              max: Math.max(...prices)
            }
          });
        }
      }
    }

    // 직접 제품 검색 (표준 커피에 매칭되지 않은 제품들)
    const directProductMatches = this.coffeeProducts.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchTermLower);
      const originMatch = product.origin.toLowerCase().includes(searchTermLower);
      const regionMatch = product.region.toLowerCase().includes(searchTermLower);
      const roasteryMatch = this.roasteries.find(r => r.originalId === product.roasteryId)
                             ?.name.toLowerCase().includes(searchTermLower);

      const baseMatch = nameMatch || originMatch || regionMatch || roasteryMatch;
      if (!baseMatch) return false;

      // 이미 표준 커피 결과에 포함된 제품들 제외
      const alreadyIncluded = results.some(result => 
        result.products.some(item => item.product.originalId === product.originalId)
      );
      if (alreadyIncluded) return false;

      // 필터 적용
      if (!showDiscontinuedProducts && product.saleStatus === 'discontinued') return false;
      if (selectedRoastLevels.length > 0 && !selectedRoastLevels.includes(product.roastLevel)) return false;
      if (selectedProcessingMethods.length > 0 && !selectedProcessingMethods.includes(product.processing)) return false;

      const roastery = this.roasteries.find(r => r.originalId === product.roasteryId);
      if (onlyUnspecialtyPartners && roastery?.isUnspecialtyPartner !== true) return false;

      return true;
    });

    // 직접 매칭된 제품들을 가상의 표준 커피로 그룹화
    for (const product of directProductMatches) {
      const roastery = this.roasteries.find(r => r.originalId === product.roasteryId);
      
      if (roastery) {
        // 가상의 표준 커피 생성
        const virtualStandardCoffee: FirestoreStandardCoffee = {
          id: `virtual-${product.originalId}`,
          originalId: `virtual-${product.originalId}`,
          primaryName: product.name,
          alternativeNames: [product.name],
          origin: product.origin,
          region: product.region,
          processing: [product.processing],
          commonRoastLevels: [product.roastLevel],
          description: product.description,
          commonTastingNotes: product.tastingNotes,
          avgRating: 4.0, // 기본값
          commonVarieties: product.variety ? [product.variety] : [],
          altitudeRange: product.altitude || '',
          harvestSeason: '',
          typicalPrice: {
            min: product.price,
            max: product.price
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        results.push({
          standardCoffee: virtualStandardCoffee,
          products: [{
            product,
            roastery
          }],
          lowestPrice: product.price,
          avgPrice: product.price,
          priceRange: {
            min: product.price,
            max: product.price
          }
        });
      }
    }

    // 최저가 순으로 정렬
    return results.sort((a, b) => a.lowestPrice - b.lowestPrice);
  }

  // 사용 가능한 로스팅 레벨 목록
  async getAvailableRoastLevels(): Promise<string[]> {
    await this.loadData();
    const levels = new Set<string>();
    this.coffeeProducts.forEach(product => levels.add(product.roastLevel));
    return Array.from(levels).sort();
  }

  // 사용 가능한 가공 방식 목록
  async getAvailableProcessingMethods(): Promise<string[]> {
    await this.loadData();
    const methods = new Set<string>();
    this.coffeeProducts.forEach(product => methods.add(product.processing));
    return Array.from(methods).sort();
  }

  // 통계 정보
  async getStats(): Promise<{
    totalRoasteries: number;
    totalProducts: number;
    totalStandardCoffees: number;
    priceRange: { min: number; max: number };
  }> {
    await this.loadData();
    
    const prices = this.coffeeProducts.map(p => p.price);
    
    return {
      totalRoasteries: this.roasteries.length,
      totalProducts: this.coffeeProducts.length,
      totalStandardCoffees: this.standardCoffees.length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    };
  }
}

// 싱글톤 인스턴스
export const firestoreCoffeeSearchService = new FirestoreCoffeeSearchService(); 