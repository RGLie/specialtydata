# SpecialtyData

스페셜티 커피 원두의 가격 비교 및 검색 플랫폼입니다. 다양한 로스터리의 커피 원두를 검색하고 가격을 비교할 수 있습니다.

## 기능

- 🔍 **커피 원두 검색**: 원두 이름, 로스터리, 원산지로 검색 가능
- 💰 **가격 비교**: 여러 로스터리의 동일 원두 가격 비교
- 🏷️ **상세 필터**: 로스팅 레벨, 가공 방식, 판매 상태별 필터링
- 📊 **실시간 데이터**: Firestore를 활용한 실시간 데이터 관리
- 🎨 **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting
- **Icons**: Lucide React

## 시작하기

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd specialtydata
```

### 2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

### 3. Firebase 설정

#### 3.1 Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore Database 활성화 (테스트 모드로 시작)
3. 웹 앱 추가하여 Firebase 설정 정보 획득

#### 3.2 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 Firebase 설정값을 추가하세요:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-your_measurement_id
```

### 4. 데이터 마이그레이션

개발용 mock 데이터를 Firestore로 마이그레이션:

```bash
# tsx 패키지 설치 (아직 안 했다면)
npm install -D tsx

# 데이터 마이그레이션 실행
npm run migrate:dev
```

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 스크립트

- `npm run dev` - 개발 서버 시작 (Turbopack 사용)
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 시작
- `npm run lint` - ESLint 실행
- `npm run migrate:dev` - 개발환경에서 Firestore 데이터 마이그레이션
- `npm run migrate` - 프로덕션 Firestore 데이터 마이그레이션

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router 페이지
├── data/               # 데이터 관련 파일
│   ├── autoFill.ts     # 자동완성 데이터
│   ├── coffeeProducts.ts # 커피 제품 mock 데이터
│   ├── roasteryData.ts  # 로스터리 mock 데이터
│   ├── standardCoffees.ts # 표준 커피 mock 데이터
│   ├── searchService.ts # 기존 검색 서비스 (mock 데이터용)
│   └── firestoreSearchService.ts # Firestore 검색 서비스
└── lib/                # 유틸리티 및 설정
    ├── firebase.ts     # Firebase 설정
    └── firestore.ts    # Firestore 서비스 클래스

scripts/
└── migrate-to-firestore.ts # 데이터 마이그레이션 스크립트
```

## 데이터베이스 스키마

### Collections

#### `roasteries` - 로스터리 정보
```typescript
{
  originalId: string;     // 기존 ID
  name: string;           // 로스터리 이름
  description: string;    // 설명
  website: string;        // 웹사이트
  location: string;       // 위치
  founded: number;        // 설립년도
  specialties: string[];  // 전문 분야
  logoUrl: string;        // 로고 URL
  brandColor: string;     // 브랜드 색상
  isUnspecialtyPartner: boolean; // 언스페셜티 파트너 여부
  createdAt: Date;
  updatedAt: Date;
}
```

#### `standardCoffees` - 표준 커피 정보
```typescript
{
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
  typicalPrice: { min: number; max: number; };
  createdAt: Date;
  updatedAt: Date;
}
```

#### `coffeeProducts` - 커피 제품 정보
```typescript
{
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
```

## 배포

### Firebase Hosting 배포

1. Firebase CLI 설치:
```bash
npm install -g firebase-tools
```

2. Firebase 로그인:
```bash
firebase login
```

3. 프로젝트 빌드:
```bash
npm run build
```

4. Firebase 배포:
```bash
firebase deploy
```

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.
