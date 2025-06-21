export interface Roastery {
  id: string;
  name: string;
  description: string;
  website: string;
  location: string;
  founded: number;
  specialties: string[];
  logoUrl: string;
  brandColor: string; // 브랜드 색상
  isUnspecialtyPartner: boolean; // 언스페셜티 파트너 여부
}

export const roasteries: Roastery[] = [
  {
    id: "blue-bottle",
    name: "블루보틀",
    description: "캘리포니아 오클랜드에서 시작된 스페셜티 커피 로스터리",
    website: "https://bluebottlecoffee.com",
    location: "서울, 한국",
    founded: 2002,
    specialties: ["싱글 오리진", "블렌드", "콜드브루"],
    logoUrl: "/test-logo.svg",
    brandColor: "#003d82",
    isUnspecialtyPartner: true
  },
  {
    id: "starbucks-reserve",
    name: "스타벅스 리저브",
    description: "스타벅스의 프리미엄 스페셜티 커피 라인",
    website: "https://www.starbucks.co.kr",
    location: "서울, 한국",
    founded: 1971,
    specialties: ["리저브 원두", "한정판 블렌드"],
    logoUrl: "/test-logo.svg",
    brandColor: "#00754a",
    isUnspecialtyPartner: true
  },
  {
    id: "coffee-bean-brothers",
    name: "커피빈브라더스",
    description: "국내 스페셜티 커피 전문 로스터리",
    website: "https://coffeebeanbrothers.com",
    location: "서울, 한국",
    founded: 2015,
    specialties: ["에티오피아", "케냐", "콜롬비아"],
    logoUrl: "/test-logo.svg",
    brandColor: "#8B4513",
    isUnspecialtyPartner: false
  },
  {
    id: "ediya",
    name: "이디야",
    description: "대한민국 대표 커피 프랜차이즈",
    website: "https://www.ediya.com",
    location: "서울, 한국",
    founded: 2001,
    specialties: ["블렌드", "아메리카노", "라떼"],
    logoUrl: "/test-logo.svg",
    brandColor: "#ff6b35",
    isUnspecialtyPartner: false
  },
  {
    id: "hollys",
    name: "할리스",
    description: "프리미엄 커피 전문점",
    website: "https://www.hollys.co.kr",
    location: "서울, 한국",
    founded: 1998,
    specialties: ["원두", "음료", "디저트"],
    logoUrl: "/test-logo.svg",
    brandColor: "#c41e3a",
    isUnspecialtyPartner: false
  }
]; 