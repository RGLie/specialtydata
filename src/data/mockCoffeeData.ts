export interface CoffeePrice {
  roastery: string;
  price: number;
  weight: string;
  url: string;
}

export interface Coffee {
  id: number;
  name: string;
  origin: string;
  region: string;
  processing: string;
  roastLevel: string;
  description: string;
  prices: CoffeePrice[];
  rating: number;
  image: string;
}

export const mockCoffeeData: Coffee[] = [
  {
    id: 1,
    name: "에티오피아 예가체프 G1",
    origin: "에티오피아",
    region: "예가체프",
    processing: "워시드",
    roastLevel: "미디엄 라이트",
    description: "밝은 산미와 꽃향기가 특징인 스페셜티 커피",
    prices: [
      { roastery: "블루보틀", price: 28000, weight: "200g", url: "#" },
      { roastery: "스타벅스 리저브", price: 32000, weight: "200g", url: "#" },
      { roastery: "커피빈브라더스", price: 25000, weight: "200g", url: "#" }
    ],
    rating: 4.8,
    image: "/api/placeholder/300/200"
  },
  {
    id: 2,
    name: "콜롬비아 수프리모",
    origin: "콜롬비아",
    region: "후일라",
    processing: "워시드",
    roastLevel: "미디엄",
    description: "균형잡힌 바디감과 초콜릿 노트",
    prices: [
      { roastery: "이디야", price: 18000, weight: "200g", url: "#" },
      { roastery: "할리스", price: 22000, weight: "200g", url: "#" },
      { roastery: "투썸플레이스", price: 24000, weight: "200g", url: "#" }
    ],
    rating: 4.6,
    image: "/api/placeholder/300/200"
  },
  {
    id: 3,
    name: "자메이카 블루마운틴",
    origin: "자메이카",
    region: "블루마운틴",
    processing: "워시드",
    roastLevel: "미디엄",
    description: "세계 최고급 원두 중 하나로 부드럽고 균형잡힌 맛",
    prices: [
      { roastery: "프리미엄 로스터스", price: 85000, weight: "200g", url: "#" },
      { roastery: "스페셜티 커피", price: 92000, weight: "200g", url: "#" },
      { roastery: "커피 마스터", price: 88000, weight: "200g", url: "#" }
    ],
    rating: 4.9,
    image: "/api/placeholder/300/200"
  },
  {
    id: 4,
    name: "파나마 게이샤",
    origin: "파나마",
    region: "보케테",
    processing: "내추럴",
    roastLevel: "라이트",
    description: "독특한 플로럴 향과 복합적인 풍미",
    prices: [
      { roastery: "아티산 로스터리", price: 65000, weight: "200g", url: "#" },
      { roastery: "스페셜티 하우스", price: 68000, weight: "200g", url: "#" },
      { roastery: "커피 컬렉션", price: 62000, weight: "200g", url: "#" }
    ],
    rating: 4.7,
    image: "/api/placeholder/300/200"
  },
  {
    id: 5,
    name: "하와이 코나",
    origin: "하와이",
    region: "코나",
    processing: "워시드",
    roastLevel: "미디엄",
    description: "부드럽고 깔끔한 맛의 하와이 대표 원두",
    prices: [
      { roastery: "하와이안 커피", price: 55000, weight: "200g", url: "#" },
      { roastery: "트로피컬 로스트", price: 58000, weight: "200g", url: "#" },
      { roastery: "아일랜드 커피", price: 52000, weight: "200g", url: "#" }
    ],
    rating: 4.5,
    image: "/api/placeholder/300/200"
  }
]; 