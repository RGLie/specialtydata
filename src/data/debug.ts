import { coffeeSearchService } from './searchService';

// 검색 테스트 함수
export function testSearch(query: string) {
  console.log(`\n=== 검색어: "${query}" ===`);
  const results = coffeeSearchService.search(query);
  
  console.log(`검색 결과: ${results.length}개`);
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.standardCoffee.primaryName}`);
    console.log(`   - 원산지: ${result.standardCoffee.origin} ${result.standardCoffee.region}`);
    console.log(`   - 최저가: ${result.lowestPrice.toLocaleString()}원`);
    console.log(`   - 로스터리 수: ${result.products.length}개`);
    console.log(`   - 표준원두ID: ${result.standardCoffee.id}`);
    
    result.products.forEach(p => {
      console.log(`     * ${p.roastery.name}: ${p.product.name} (${p.product.price.toLocaleString()}원)`);
    });
  });
}

// 테스트 케이스들
export function runAllTests() {
  // 정확한 매칭 테스트
  testSearch("예가체프");
  testSearch("콜롬비아");
  testSearch("블루보틀");
  
  // 부분 매칭 테스트
  testSearch("에티오피아");
  testSearch("게이샤");
  
  // 짧은 검색어 테스트
  testSearch("코나");
  testSearch("자");
  
  // 로스터리 검색 테스트
  testSearch("스타벅스");
} 