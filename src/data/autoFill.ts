import { standardCoffees } from './standardCoffees';
import { roasteries } from './roasteryData';

// 표준 원두 이름들 수집
const coffeeNames = standardCoffees.flatMap(coffee => [
  coffee.primaryName,
  ...coffee.alternativeNames
]);

// 원산지와 지역들 수집
const origins = [...new Set(standardCoffees.map(coffee => coffee.origin))];
const regions = [...new Set(standardCoffees.map(coffee => coffee.region))];

// 로스터리 이름들 수집
const roasteryNames = roasteries.map(roastery => roastery.name);

// 가공방식들 수집
const processings = [...new Set(standardCoffees.flatMap(coffee => coffee.processing))];

// 로스팅 레벨들 수집
const roastLevels = [...new Set(standardCoffees.flatMap(coffee => coffee.commonRoastLevels))];

// 테이스팅 노트들 수집 (인기있는 것들만)
const popularTastingNotes = ['꽃향기', '초콜릿', '견과류', '시트러스', '캐러멜', '베르가못', '레몬'];

// 자동완성 데이터
export const allSuggestions = [
  ...coffeeNames,
  ...origins,
  ...regions,
  ...roasteryNames,
  ...processings,
  ...roastLevels,
  ...popularTastingNotes
].filter(Boolean); // 빈 문자열 제거