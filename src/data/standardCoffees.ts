export interface StandardCoffee {
  id: string;
  primaryName: string; // 대표 이름
  alternativeNames: string[]; // 다른 이름들 (검색용)
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
}

export const standardCoffees: StandardCoffee[] = [
  {
    id: "std-ethiopia-yirgacheffe",
    primaryName: "에티오피아 예가체프",
    alternativeNames: [
      "Ethiopian Yirgacheffe",
      "Ethiopia Yergacheffe",
      "예가체프 G1",
      "이르가체페",
      "Yirgacheffe",
      "Yergacheffe"
    ],
    origin: "에티오피아",
    region: "예가체프",
    processing: ["워시드", "내추럴"],
    commonRoastLevels: ["라이트", "미디엄 라이트"],
    description: "밝은 산미와 꽃향기가 특징인 에티오피아 대표 스페셜티 커피. 해발 1800~2000m 고지대에서 재배되며 복합적인 플로럴 노트가 특징",
    commonTastingNotes: ["꽃향기", "레몬", "베르가못", "시트러스", "와인", "블루베리"],
    avgRating: 4.7,
    commonVarieties: ["헤어룸", "쿠루메"],
    altitudeRange: "1800-2000m",
    harvestSeason: "10월-1월",
    typicalPrice: {
      min: 25000,
      max: 35000
    }
  },
  {
    id: "std-colombia-huila",
    primaryName: "콜롬비아 후일라",
    alternativeNames: [
      "Colombia Huila",
      "Colombian Huila",
      "콜롬비아 수프리모",
      "Colombia Supremo",
      "후일라 수프리모",
      "Huila Supremo"
    ],
    origin: "콜롬비아",
    region: "후일라",
    processing: ["워시드", "허니"],
    commonRoastLevels: ["미디엄 라이트", "미디엄", "미디엄 다크"],
    description: "콜롬비아 남부 후일라 지역의 고품질 아라비카. 균형잡힌 바디감과 초콜릿, 견과류 풍미가 특징",
    commonTastingNotes: ["초콜릿", "캐러멜", "견과류", "오렌지", "사과"],
    avgRating: 4.5,
    commonVarieties: ["카투라", "콜롬비아", "티피카"],
    altitudeRange: "1400-1800m",
    harvestSeason: "4월-6월, 10월-12월",
    typicalPrice: {
      min: 18000,
      max: 28000
    }
  },
  {
    id: "std-jamaica-blue-mountain",
    primaryName: "자메이카 블루마운틴",
    alternativeNames: [
      "Jamaica Blue Mountain",
      "Jamaican Blue Mountain",
      "블루마운틴",
      "Blue Mountain",
      "JBM"
    ],
    origin: "자메이카",
    region: "블루마운틴",
    processing: ["워시드"],
    commonRoastLevels: ["미디엄 라이트", "미디엄"],
    description: "세계 최고급 원두 중 하나. 부드럽고 균형잡힌 맛과 독특한 향미로 유명",
    commonTastingNotes: ["부드러움", "균형", "견과류", "초콜릿", "허브"],
    avgRating: 4.9,
    commonVarieties: ["티피카"],
    altitudeRange: "1000-1700m",
    harvestSeason: "7월-11월",
    typicalPrice: {
      min: 80000,
      max: 100000
    }
  },
  {
    id: "std-panama-geisha",
    primaryName: "파나마 게이샤",
    alternativeNames: [
      "Panama Geisha",
      "Panamanian Geisha",
      "게샤",
      "Gesha",
      "파나마 게샤"
    ],
    origin: "파나마",
    region: "보케테",
    processing: ["내추럴", "워시드", "허니"],
    commonRoastLevels: ["라이트", "미디엄 라이트"],
    description: "독특한 플로럴 향과 복합적인 풍미로 세계적으로 인정받는 프리미엄 품종",
    commonTastingNotes: ["플로럴", "자스민", "망고", "파파야", "베르가못"],
    avgRating: 4.8,
    commonVarieties: ["게이샤"],
    altitudeRange: "1400-1800m",
    harvestSeason: "12월-3월",
    typicalPrice: {
      min: 60000,
      max: 80000
    }
  },
  {
    id: "std-hawaii-kona",
    primaryName: "하와이 코나",
    alternativeNames: [
      "Hawaii Kona",
      "Hawaiian Kona",
      "코나",
      "Kona",
      "하와이안 코나"
    ],
    origin: "하와이",
    region: "코나",
    processing: ["워시드"],
    commonRoastLevels: ["미디엄", "미디엄 다크"],
    description: "부드럽고 깔끔한 맛의 하와이 대표 원두. 독특한 화산토 환경에서 재배",
    commonTastingNotes: ["부드러움", "견과류", "초콜릿", "버터", "꿀"],
    avgRating: 4.4,
    commonVarieties: ["티피카"],
    altitudeRange: "150-900m",
    harvestSeason: "8월-1월",
    typicalPrice: {
      min: 50000,
      max: 65000
    }
  }
]; 