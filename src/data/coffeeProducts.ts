export interface CoffeeProduct {
  id: string;
  roasteryId: string;
  name: string; // 로스터리에서 부르는 상품명
  standardCoffeeId?: string; // 표준 원두 ID (같은 원두 매칭용)
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
  lastUpdated: Date;
  tastingNotes: string[];
  altitude?: string;
  variety?: string;
}

export const coffeeProducts: CoffeeProduct[] = [
  // 블루보틀 상품들
  {
    id: "bb-ethiopian-yirgacheffe",
    roasteryId: "blue-bottle",
    name: "Ethiopian Yirgacheffe",
    standardCoffeeId: "std-ethiopia-yirgacheffe",
    origin: "에티오피아",
    region: "예가체프",
    farm: "Worka Cooperative",
    processing: "워시드",
    roastLevel: "미디엄 라이트",
    description: "밝은 산미와 꽃향기가 특징인 스페셜티 커피",
    price: 28000,
    weight: "200g",
    url: "https://bluebottlecoffee.com/ethiopian-yirgacheffe",
    inStock: true,
    lastUpdated: new Date("2024-01-15"),
    tastingNotes: ["꽃향기", "레몬", "베르가못"],
    altitude: "1800-2000m",
    variety: "헤어룸"
  },
  {
    id: "bb-colombia-supremo",
    roasteryId: "blue-bottle",
    name: "Colombia Supremo",
    standardCoffeeId: "std-colombia-huila",
    origin: "콜롬비아",
    region: "후일라",
    processing: "내추럴",
    roastLevel: "미디엄",
    description: "균형잡힌 바디감과 초콜릿 노트",
    price: 26000,
    weight: "200g",
    url: "https://bluebottlecoffee.com/colombia-supremo",
    inStock: true,
    lastUpdated: new Date("2024-01-15"),
    tastingNotes: ["초콜릿", "캐러멜", "견과류"],
    altitude: "1400-1800m",
    variety: "카투라"
  },

  // 스타벅스 리저브 상품들
  {
    id: "sbr-ethiopia-yergacheffe",
    roasteryId: "starbucks-reserve",
    name: "Ethiopia Yergacheffe Reserve",
    standardCoffeeId: "std-ethiopia-yirgacheffe", // 같은 원두
    origin: "에티오피아",
    region: "예가체프",
    processing: "워시드",
    roastLevel: "미디엄 라이트",
    description: "스타벅스 리저브만의 특별한 예가체프",
    price: 32000,
    weight: "200g",
    url: "https://www.starbucks.co.kr/reserve/ethiopia-yergacheffe",
    inStock: true,
    lastUpdated: new Date("2024-01-14"),
    tastingNotes: ["시트러스", "꽃향기", "흑차"],
    altitude: "1900m",
    variety: "헤어룸"
  },

  // 커피빈브라더스 상품들
  {
    id: "cbb-yirgacheffe-g1",
    roasteryId: "coffee-bean-brothers",
    name: "예가체프 G1 스페셜",
    standardCoffeeId: "std-ethiopia-yirgacheffe", // 같은 원두
    origin: "에티오피아",
    region: "예가체프",
    processing: "워시드",
    roastLevel: "미디엄 라이트",
    description: "엄선된 G1 등급 예가체프 원두",
    price: 25000,
    weight: "200g",
    url: "https://coffeebeanbrothers.com/yirgacheffe-g1",
    inStock: true,
    lastUpdated: new Date("2024-01-16"),
    tastingNotes: ["레몬", "꽃향기", "와인"],
    altitude: "2000m",
    variety: "헤어룸"
  },
  {
    id: "cbb-colombia-huila",
    roasteryId: "coffee-bean-brothers",
    name: "콜롬비아 후일라 수프리모",
    standardCoffeeId: "std-colombia-huila", // 같은 원두
    origin: "콜롬비아",
    region: "후일라",
    processing: "워시드",
    roastLevel: "미디엄",
    description: "후일라 지역의 프리미엄 수프리모 등급",
    price: 24000,
    weight: "200g",
    url: "https://coffeebeanbrothers.com/colombia-huila",
    inStock: true,
    lastUpdated: new Date("2024-01-16"),
    tastingNotes: ["초콜릿", "견과류", "오렌지"],
    altitude: "1600m",
    variety: "카투라"
  },

  // 이디야 상품들
  {
    id: "ediya-colombia-blend",
    roasteryId: "ediya",
    name: "콜롬비아 블렌드",
    standardCoffeeId: "std-colombia-huila", // 유사한 원두로 매칭
    origin: "콜롬비아",
    region: "후일라",
    processing: "워시드",
    roastLevel: "미디엄",
    description: "이디야만의 콜롬비아 블렌드",
    price: 18000,
    weight: "200g",
    url: "https://www.ediya.com/colombia-blend",
    inStock: true,
    lastUpdated: new Date("2024-01-13"),
    tastingNotes: ["밸런스", "달콤함", "부드러움"],
    variety: "수프리모"
  },

  // 할리스 상품들
  {
    id: "hollys-ethiopia-sidamo",
    roasteryId: "hollys",
    name: "에티오피아 시다모",
    standardCoffeeId: "std-ethiopia-yirgacheffe", // 유사한 에티오피아 원두로 매칭
    origin: "에티오피아",
    region: "시다모",
    processing: "워시드",
    roastLevel: "미디엄 라이트",
    description: "할리스의 시그니처 에티오피아 원두",
    price: 22000,
    weight: "200g",
    url: "https://www.hollys.co.kr/ethiopia-sidamo",
    inStock: true,
    lastUpdated: new Date("2024-01-12"),
    tastingNotes: ["꽃향기", "시트러스", "깔끔함"],
    altitude: "1800m",
    variety: "헤어룸"
  },

  // 추가 블루보틀 상품들
  {
    id: "bb-panama-geisha",
    roasteryId: "blue-bottle",
    name: "Panama Esmeralda Geisha",
    standardCoffeeId: "std-panama-geisha",
    origin: "파나마",
    region: "보케테",
    farm: "Hacienda La Esmeralda",
    processing: "워시드",
    roastLevel: "라이트",
    description: "블루보틀이 엄선한 프리미엄 게이샤 원두",
    price: 68000,
    weight: "200g",
    url: "https://bluebottlecoffee.com/panama-geisha",
    inStock: true,
    lastUpdated: new Date("2024-01-15"),
    tastingNotes: ["플로럴", "자스민", "망고", "베르가못"],
    altitude: "1600m",
    variety: "게이샤"
  },

  // 추가 커피빈브라더스 상품들
  {
    id: "cbb-jamaica-blue-mountain",
    roasteryId: "coffee-bean-brothers",
    name: "자메이카 블루마운틴 No.1",
    standardCoffeeId: "std-jamaica-blue-mountain",
    origin: "자메이카",
    region: "블루마운틴",
    processing: "워시드",
    roastLevel: "미디엄",
    description: "최고급 블루마운틴 No.1 등급",
    price: 85000,
    weight: "200g",
    url: "https://coffeebeanbrothers.com/jamaica-blue-mountain",
    inStock: true,
    lastUpdated: new Date("2024-01-16"),
    tastingNotes: ["부드러움", "균형", "견과류", "초콜릿"],
    altitude: "1200m",
    variety: "티피카"
  },

  // 추가 스타벅스 리저브 상품들
  {
    id: "sbr-hawaii-kona",
    roasteryId: "starbucks-reserve",
    name: "Hawaii Ka'u Reserve",
    standardCoffeeId: "std-hawaii-kona",
    origin: "하와이",
    region: "카우",
    processing: "워시드",
    roastLevel: "미디엄",
    description: "하와이 카우 지역의 특별한 원두",
    price: 54000,
    weight: "200g",
    url: "https://www.starbucks.co.kr/reserve/hawaii-kau",
    inStock: true,
    lastUpdated: new Date("2024-01-14"),
    tastingNotes: ["부드러움", "견과류", "꿀", "바닐라"],
    altitude: "600m",
    variety: "티피카"
  }
]; 