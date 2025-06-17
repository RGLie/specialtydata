"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Coffee, MapPin, Star, ShoppingCart } from "lucide-react";

// Mock 데이터
const mockCoffeeData = [
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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof mockCoffeeData>([]);
  const [isSearched, setIsSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 자동완성 데이터
  const allSuggestions = [
    "에티오피아 예가체프",
    "콜롬비아 수프리모", 
    "자메이카 블루마운틴",
    "파나마 게이샤",
    "하와이 코나",
    "브라질 산토스",
    "과테말라 안티구아",
    "케냐 AA",
    "코스타리카 따라주",
    "페루 찬차마요"
  ];

  // 검색어 변경 시 자동완성 업데이트
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // 외부 클릭 시 자동완성 숨기기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      // Mock 검색 로직
      const results = mockCoffeeData.filter(coffee =>
        coffee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coffee.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coffee.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
      setIsSearched(true);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const getLowestPrice = (prices: any[]) => {
    return Math.min(...prices.map(p => p.price));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="w-full p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Coffee className="w-6 h-6 coffee-brown" />
            <span className="text-lg font-semibold coffee-brown">SpecialtyData</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              원두 검색
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              가격 비교
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              로스터리
            </a>
          </nav>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className={`flex-1 px-4 transition-all duration-500 ${isSearched ? 'pt-8' : 'flex flex-col items-center justify-center -mt-20'}`}>
        {/* 로고 */}
        <div className={`text-center transition-all duration-500 ${isSearched ? 'mb-6' : 'mb-8'}`}>
          <div className="flex items-center justify-center mb-4">
            <Coffee className={`coffee-brown mr-3 transition-all duration-500 ${isSearched ? 'w-8 h-8' : 'w-16 h-16'}`} />
            <h1 className={`font-light text-gray-900 transition-all duration-500 ${isSearched ? 'text-3xl' : 'text-6xl'}`}>
              <span className="coffee-brown">Specialty</span>
              <span className="text-gray-700">Data</span>
            </h1>
          </div>
          {!isSearched && (
            <p className="text-lg text-gray-600 mt-2">
              스페셜티 커피 원두의 모든 것
            </p>
          )}
        </div>

        {/* 검색창 */}
        <div className={`w-full transition-all duration-500 ${isSearched ? 'max-w-4xl mx-auto' : 'max-w-2xl'}`} ref={searchRef}>
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="원두 이름, 로스터리, 원산지를 검색해보세요..."
                  className="w-full pl-12 pr-4 py-4 text-lg text-gray-900 border-2 border-gray-200 rounded-full 
                           focus:outline-none focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown focus:ring-opacity-20
                           hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md
                           placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                className="px-6 py-4 bg-coffee-brown text-white rounded-full
                         hover:bg-coffee-light transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:ring-opacity-20
                         shadow-sm hover:shadow-md whitespace-nowrap"
              >
                검색하기
              </button>
            </div>

            {/* 자동완성 */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-12 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                             first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <Search className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 검색 결과 */}
        {isSearched && (
          <div className="w-full max-w-6xl mx-auto mt-8">
            <div className="mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-coffee-brown">{searchResults.length}개</span>의 검색 결과
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((coffee) => (
                <div key={coffee.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{coffee.name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{coffee.origin} · {coffee.region}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">{coffee.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-coffee-brown">
                          {getLowestPrice(coffee.prices).toLocaleString()}원
                        </div>
                        <div className="text-sm text-gray-500">최저가</div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{coffee.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">가공방식:</span>
                        <span className="text-gray-700">{coffee.processing}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">로스팅:</span>
                        <span className="text-gray-700">{coffee.roastLevel}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">가격 비교</h4>
                      <div className="space-y-2">
                        {coffee.prices.sort((a, b) => a.price - b.price).map((price, index) => (
                          <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium text-gray-900">{price.roastery}</span>
                              <span className="text-sm text-gray-500 ml-2">({price.weight})</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">
                                {price.price.toLocaleString()}원
                              </span>
                              <button className="p-1 text-coffee-brown hover:bg-coffee-brown hover:text-white rounded transition-colors">
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {searchResults.length === 0 && (
              <div className="text-center py-12">
                <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-600">다른 검색어로 시도해보세요.</p>
              </div>
            )}
          </div>
        )}

        {/* 인기 검색어 (검색 전에만 표시) */}
        {!isSearched && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-3">인기 검색어</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["에티오피아 예가체프", "콜롬비아 수프리모", "자메이카 블루마운틴", "하와이 코나", "파나마 게이샤"].map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => handleSuggestionClick(keyword)}
                  className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full
                           hover:bg-gray-200 transition-colors duration-200"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="w-full py-6 border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="hover:text-gray-700 transition-colors">서비스 소개</a>
              <a href="#" className="hover:text-gray-700 transition-colors">이용약관</a>
              <a href="#" className="hover:text-gray-700 transition-colors">개인정보처리방침</a>
              <a href="#" className="hover:text-gray-700 transition-colors">문의하기</a>
            </div>
            <div className="text-center md:text-right">
              <p>&copy; 2024 SpecialtyData. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
