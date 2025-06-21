import { coffeeProducts, type CoffeeProduct } from './coffeeProducts';
import { roasteries, type Roastery } from './roasteryData';
import { standardCoffees, type StandardCoffee } from './standardCoffees';

export interface SearchResult {
  standardCoffee: StandardCoffee;
  products: Array<{
    product: CoffeeProduct;
    roastery: Roastery;
  }>;
  lowestPrice: number;
  avgPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export class CoffeeSearchService {
  private normalizeString(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '').trim();
  }

  // 검색어가 표준 원두나 상품명과 매칭되는지 확인
  private isMatch(searchTerm: string, targetStrings: string[]): boolean {
    const normalizedSearch = this.normalizeString(searchTerm);
    
    // 검색어가 너무 짧으면 정확한 매칭만 허용
    if (normalizedSearch.length <= 2) {
      return targetStrings.some(target => 
        this.normalizeString(target) === normalizedSearch
      );
    }
    
    // 검색어가 3글자 이상일 때만 부분 매칭 허용
    return targetStrings.some(target => {
      const normalizedTarget = this.normalizeString(target);
      
      // 검색어가 대상 문자열에 포함되는 경우만 매칭 (역방향 매칭 제거)
      return normalizedTarget.includes(normalizedSearch);
    });
  }

  // 검색 실행
  search(
    query: string, 
    onlyUnspecialtyPartners: boolean = false,
    roastLevelFilter: string[] = [],
    processingFilter: string[] = []
  ): SearchResult[] {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const processedStandardIds = new Set<string>();

    // 각 표준 원두에 대해 검색 (우선순위별로)
    for (const standardCoffee of standardCoffees) {
      // 우선순위 1: 원두 이름 (대표명 + 대체명)
      const coffeeNames = [standardCoffee.primaryName, ...standardCoffee.alternativeNames];
      // 우선순위 2: 지역 정보
      const locationInfo = [standardCoffee.origin, standardCoffee.region];
      
      let isMatchFound = false;
      
      // 먼저 원두 이름으로 검색
      if (this.isMatch(query, coffeeNames)) {
        isMatchFound = true;
      }
      // 원두 이름으로 매칭되지 않았을 때만 지역으로 검색
      else if (this.isMatch(query, locationInfo)) {
        isMatchFound = true;
      }

      if (isMatchFound && !processedStandardIds.has(standardCoffee.id)) {
        const matchingProducts = this.getProductsForStandardCoffee(standardCoffee.id, onlyUnspecialtyPartners, roastLevelFilter, processingFilter);
        
        if (matchingProducts.length > 0) {
          const prices = matchingProducts.map(p => p.product.price);
          
          results.push({
            standardCoffee,
            products: matchingProducts,
            lowestPrice: Math.min(...prices),
            avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
            priceRange: {
              min: Math.min(...prices),
              max: Math.max(...prices)
            }
          });
          
          processedStandardIds.add(standardCoffee.id);
        }
      }
    }

    // 로스터리명 검색
    const matchingRoastery = roasteries.find(roastery =>
      this.isMatch(query, [roastery.name]) && 
      (!onlyUnspecialtyPartners || roastery.isUnspecialtyPartner)
    );
    
    if (matchingRoastery) {
      const roasteryProducts = coffeeProducts.filter(
        product => product.roasteryId === matchingRoastery.id && 
                  product.inStock &&
                  (!product.standardCoffeeId || !processedStandardIds.has(product.standardCoffeeId)) &&
                  (roastLevelFilter.length === 0 || roastLevelFilter.includes(product.roastLevel)) &&
                  (processingFilter.length === 0 || processingFilter.includes(product.processing))
      );
      
      // 로스터리의 상품들을 표준 원두별로 그룹화
      const productsByStandard = new Map<string, typeof roasteryProducts>();
      const unlinkedProducts: typeof roasteryProducts = [];
      
      roasteryProducts.forEach(product => {
        if (product.standardCoffeeId) {
          if (!productsByStandard.has(product.standardCoffeeId)) {
            productsByStandard.set(product.standardCoffeeId, []);
          }
          productsByStandard.get(product.standardCoffeeId)!.push(product);
        } else {
          unlinkedProducts.push(product);
        }
      });
      
      // 표준 원두별로 결과 추가
      productsByStandard.forEach((products, standardId) => {
        const standardCoffee = standardCoffees.find(sc => sc.id === standardId);
        if (standardCoffee && !processedStandardIds.has(standardId)) {
          const productsWithRoastery = products.map(product => ({
            product,
            roastery: matchingRoastery
          }));
          const prices = products.map(p => p.price);
          
          results.push({
            standardCoffee,
            products: productsWithRoastery,
            lowestPrice: Math.min(...prices),
            avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
            priceRange: {
              min: Math.min(...prices),
              max: Math.max(...prices)
            }
          });
          
          processedStandardIds.add(standardId);
        }
      });
      
      // 표준 원두와 연결되지 않은 개별 상품들 처리
      unlinkedProducts.forEach(product => {
        const tempStandardCoffee: StandardCoffee = {
          id: `temp-${product.id}`,
          primaryName: product.name,
          alternativeNames: [],
          origin: product.origin,
          region: product.region,
          processing: [product.processing],
          commonRoastLevels: [product.roastLevel],
          description: product.description,
          commonTastingNotes: product.tastingNotes,
          avgRating: 4.0,
          commonVarieties: product.variety ? [product.variety] : [],
          altitudeRange: product.altitude || '',
          harvestSeason: '',
          typicalPrice: {
            min: product.price,
            max: product.price
          }
        };

        results.push({
          standardCoffee: tempStandardCoffee,
          products: [{ product, roastery: matchingRoastery }],
          lowestPrice: product.price,
          avgPrice: product.price,
          priceRange: {
            min: product.price,
            max: product.price
          }
        });
      });
    }

    // 기타 개별 상품 검색 (로스터리 매칭이 없을 때만)
    if (!matchingRoastery) {
      const unmatchedProducts = coffeeProducts.filter(product => {
        const productSearchableTerms = [
          product.name,
          product.farm || ''
        ];
        
        return this.isMatch(query, productSearchableTerms) && 
               product.inStock &&
               (!product.standardCoffeeId || !processedStandardIds.has(product.standardCoffeeId)) &&
               (roastLevelFilter.length === 0 || roastLevelFilter.includes(product.roastLevel)) &&
               (processingFilter.length === 0 || processingFilter.includes(product.processing));
      });

      // 매칭되지 않은 상품들을 개별 결과로 추가
      for (const product of unmatchedProducts) {
        const roastery = roasteries.find(r => r.id === product.roasteryId);
        if (roastery && (!onlyUnspecialtyPartners || roastery.isUnspecialtyPartner)) {
          const tempStandardCoffee: StandardCoffee = {
            id: `temp-${product.id}`,
            primaryName: product.name,
            alternativeNames: [],
            origin: product.origin,
            region: product.region,
            processing: [product.processing],
            commonRoastLevels: [product.roastLevel],
            description: product.description,
            commonTastingNotes: product.tastingNotes,
            avgRating: 4.0,
            commonVarieties: product.variety ? [product.variety] : [],
            altitudeRange: product.altitude || '',
            harvestSeason: '',
            typicalPrice: {
              min: product.price,
              max: product.price
            }
          };

          results.push({
            standardCoffee: tempStandardCoffee,
            products: [{ product, roastery }],
            lowestPrice: product.price,
            avgPrice: product.price,
            priceRange: {
              min: product.price,
              max: product.price
            }
          });
        }
      }
    }

    // 결과 정렬: 관련성 우선, 그 다음 가격 순
    return results.sort((a, b) => {
      // 표준 원두가 있는 것을 우선
      const aIsStandard = !a.standardCoffee.id.startsWith('temp-');
      const bIsStandard = !b.standardCoffee.id.startsWith('temp-');
      
      if (aIsStandard && !bIsStandard) return -1;
      if (!aIsStandard && bIsStandard) return 1;
      
      // 둘 다 표준 원두이거나 둘 다 임시인 경우 가격순 정렬
      return a.lowestPrice - b.lowestPrice;
    });
  }

  // 특정 표준 원두에 대한 모든 상품 가져오기
  private getProductsForStandardCoffee(
    standardCoffeeId: string, 
    onlyUnspecialtyPartners: boolean = false,
    roastLevelFilter: string[] = [],
    processingFilter: string[] = []
  ): Array<{
    product: CoffeeProduct;
    roastery: Roastery;
  }> {
    const matchingProducts = coffeeProducts.filter(
      product => product.standardCoffeeId === standardCoffeeId && product.inStock
    );

    return matchingProducts
      .map(product => {
        const roastery = roasteries.find(r => r.id === product.roasteryId);
        return roastery ? { product, roastery } : null;
      })
      .filter((item): item is { product: CoffeeProduct; roastery: Roastery } => item !== null)
      .filter(item => !onlyUnspecialtyPartners || item.roastery.isUnspecialtyPartner)
      .filter(item => {
        // 로스팅 레벨 필터
        if (roastLevelFilter.length > 0 && !roastLevelFilter.includes(item.product.roastLevel)) {
          return false;
        }
        // 프로세싱 필터
        if (processingFilter.length > 0 && !processingFilter.includes(item.product.processing)) {
          return false;
        }
        return true;
      });
  }

  // 로스터리별 검색
  searchByRoastery(roasteryName: string): Array<{
    product: CoffeeProduct;
    roastery: Roastery;
  }> {
    const matchingRoastery = roasteries.find(roastery =>
      this.isMatch(roasteryName, [roastery.name])
    );

    if (!matchingRoastery) return [];

    const roasteryProducts = coffeeProducts.filter(
      product => product.roasteryId === matchingRoastery.id && product.inStock
    );

    return roasteryProducts.map(product => ({
      product,
      roastery: matchingRoastery
    }));
  }

  // 가격대별 검색
  searchByPriceRange(minPrice: number, maxPrice: number): SearchResult[] {
    const allResults = this.getAllResults(); // 모든 결과 가져오기
    return allResults.filter(result => 
      result.lowestPrice >= minPrice && result.lowestPrice <= maxPrice
    );
  }

  // 사용 가능한 로스팅 레벨 목록 가져오기
  getAvailableRoastLevels(): string[] {
    const roastLevels = new Set<string>();
    coffeeProducts.forEach(product => {
      if (product.inStock) {
        roastLevels.add(product.roastLevel);
      }
    });
    return Array.from(roastLevels).sort();
  }

  // 사용 가능한 프로세싱 방식 목록 가져오기
  getAvailableProcessingMethods(): string[] {
    const processingMethods = new Set<string>();
    coffeeProducts.forEach(product => {
      if (product.inStock) {
        processingMethods.add(product.processing);
      }
    });
    return Array.from(processingMethods).sort();
  }

  // 모든 표준 원두 결과 가져오기
  private getAllResults(): SearchResult[] {
    const results: SearchResult[] = [];
    
    for (const standardCoffee of standardCoffees) {
      const matchingProducts = this.getProductsForStandardCoffee(standardCoffee.id);
      
      if (matchingProducts.length > 0) {
        const prices = matchingProducts.map(p => p.product.price);
        
        results.push({
          standardCoffee,
          products: matchingProducts,
          lowestPrice: Math.min(...prices),
          avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices)
          }
        });
      }
    }
    
    return results.sort((a, b) => a.lowestPrice - b.lowestPrice);
  }
}

export const coffeeSearchService = new CoffeeSearchService(); 