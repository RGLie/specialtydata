"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Coffee, MapPin, Star, ShoppingCart, ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { coffeeSearchService, type SearchResult } from "@/data/searchService";
import { allSuggestions } from "@/data/autoFill";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [onlyUnspecialtyPartners, setOnlyUnspecialtyPartners] = useState(false);
  const [selectedRoastLevels, setSelectedRoastLevels] = useState<string[]>([]);
  const [selectedProcessingMethods, setSelectedProcessingMethods] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  

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

  // 필터 변경 시 재검색
  useEffect(() => {
    if (isSearched && searchQuery.trim()) {
      handleSearch();
    }
  }, [onlyUnspecialtyPartners, selectedRoastLevels, selectedProcessingMethods]);

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      const results = coffeeSearchService.search(
        searchTerm, 
        onlyUnspecialtyPartners, 
        selectedRoastLevels, 
        selectedProcessingMethods
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

  const toggleCardExpansion = (cardId: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(cardId)) {
      newExpandedCards.delete(cardId);
    } else {
      newExpandedCards.add(cardId);
    }
    setExpandedCards(newExpandedCards);
  };

  const toggleRoastLevel = (roastLevel: string) => {
    setSelectedRoastLevels(prev => 
      prev.includes(roastLevel) 
        ? prev.filter(level => level !== roastLevel)
        : [...prev, roastLevel]
    );
  };

  const toggleProcessingMethod = (method: string) => {
    setSelectedProcessingMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const clearAllFilters = () => {
    setOnlyUnspecialtyPartners(false);
    setSelectedRoastLevels([]);
    setSelectedProcessingMethods([]);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="w-full p-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Coffee className="w-5 h-5 coffee-brown" />
            <span className="text-base font-semibold coffee-brown">SpecialtyData</span>
          </div>
          <nav className="hidden md:flex space-x-4">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              원두 검색
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              가격 비교
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              로스터리
            </a>
          </nav>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className={`flex-1 px-3 transition-all duration-500 ${isSearched ? 'pt-6' : 'flex flex-col items-center justify-center -mt-16'}`}>
        {/* 로고 */}
        <div className={`text-center transition-all duration-500 ${isSearched ? 'mb-4' : 'mb-6'}`}>
          <div className="flex items-center justify-center mb-3">
            <Coffee className={`coffee-brown mr-2 transition-all duration-500 ${isSearched ? 'w-6 h-6' : 'w-12 h-12'}`} />
            <h1 className={`font-light text-gray-900 transition-all duration-500 ${isSearched ? 'text-2xl' : 'text-4xl'}`}>
              <span className="coffee-brown">Specialty</span>
              <span className="text-gray-700">Data</span>
            </h1>
          </div>
          {!isSearched && (
            <p className="text-base text-gray-600 mt-2">
              스페셜티 커피 원두의 모든 것
            </p>
          )}
        </div>

        {/* 검색창 */}
        <div className={`w-full transition-all duration-500 ${isSearched ? 'max-w-3xl mx-auto' : 'max-w-3xl'}`} ref={searchRef}>
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="원두 이름, 로스터리, 원산지를 검색해보세요..."
                  className="w-full pl-10 pr-3 py-3 text-base text-gray-900 border-2 border-gray-200 rounded-full 
                           focus:outline-none focus:border-coffee-brown focus:ring-2 focus:ring-coffee-brown focus:ring-opacity-20
                           hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md
                           placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                className="px-4 py-3 bg-coffee-brown text-white rounded-full text-sm
                         hover:bg-coffee-light transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:ring-opacity-20
                         shadow-sm hover:shadow-md whitespace-nowrap"
              >
                검색하기
              </button>
            </div>

            {/* 자동완성 */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm
                             first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <Search className="w-3 h-3 text-gray-400 mr-2" />
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
          <div className="w-full max-w-5xl mx-auto mt-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-coffee-brown">{searchResults.length}개</span>의 검색 결과
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span>필터</span>
                    {(onlyUnspecialtyPartners || selectedRoastLevels.length > 0 || selectedProcessingMethods.length > 0) && (
                      <span className="w-2 h-2 bg-coffee-brown rounded-full"></span>
                    )}
                  </button>
                  
                </div>
              </div>

              {/* 확장된 필터 패널 */}
              {showFilters && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">상세 필터</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        전체 해제
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlyUnspecialtyPartners}
                        onChange={(e) => setOnlyUnspecialtyPartners(e.target.checked)}
                        className="w-4 h-4 text-coffee-brown border-gray-300 rounded focus:ring-coffee-brown focus:ring-2"
                      />
                      <span className="flex items-center">
                        <span className="text-blue-600 font-medium mr-1">언스페셜티</span>
                      </span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 로스팅 레벨 필터 */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">로스팅 레벨</h4>
                      <div className="flex flex-wrap gap-2">
                        {coffeeSearchService.getAvailableRoastLevels().map(level => (
                          <button
                            key={level}
                            onClick={() => toggleRoastLevel(level)}
                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                              selectedRoastLevels.includes(level)
                                ? 'bg-coffee-brown text-white border-coffee-brown'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-coffee-brown'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 프로세싱 방식 필터 */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">가공 방식</h4>
                      <div className="flex flex-wrap gap-2">
                        {coffeeSearchService.getAvailableProcessingMethods().map(method => (
                          <button
                            key={method}
                            onClick={() => toggleProcessingMethod(method)}
                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                              selectedProcessingMethods.includes(method)
                                ? 'bg-coffee-brown text-white border-coffee-brown'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-coffee-brown'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 활성 필터 표시 */}
                  {(selectedRoastLevels.length > 0 || selectedProcessingMethods.length > 0) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex flex-wrap gap-1">
                        {selectedRoastLevels.map(level => (
                          <span
                            key={`roast-${level}`}
                            className="inline-flex items-center px-2 py-1 text-xs bg-coffee-brown text-white rounded-full"
                          >
                            {level}
                            <button
                              onClick={() => toggleRoastLevel(level)}
                              className="ml-1 hover:bg-coffee-light rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        {selectedProcessingMethods.map(method => (
                          <span
                            key={`processing-${method}`}
                            className="inline-flex items-center px-2 py-1 text-xs bg-coffee-brown text-white rounded-full"
                          >
                            {method}
                            <button
                              onClick={() => toggleProcessingMethod(method)}
                              className="ml-1 hover:bg-coffee-light rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {searchResults.map((result) => (
                <div key={result.standardCoffee.id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{result.standardCoffee.primaryName}</h3>
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{result.standardCoffee.origin} · {result.standardCoffee.region}</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-xs text-gray-600">{result.standardCoffee.avgRating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {result.lowestPrice.toLocaleString()}원
                        </div>
                        <div className="text-xs text-gray-500 mb-1">최저가</div>
                        <div className="text-xs text-gray-400">
                          평균 {Math.round(result.avgPrice).toLocaleString()}원
                        </div>
                        {result.products.length > 1 && (
                          <div className="mt-1">
                            <span className="inline-block px-1 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                              최대 {(result.priceRange.max - result.lowestPrice).toLocaleString()}원 차이
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 상세 정보 토글 버튼 */}
                    <button
                      onClick={() => toggleCardExpansion(result.standardCoffee.id)}
                      className="flex items-center text-xs text-coffee-brown hover:text-coffee-light transition-colors mb-2"
                    >
                      <span className="mr-1">상세 정보</span>
                      {expandedCards.has(result.standardCoffee.id) ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {/* 접을 수 있는 상세 정보 */}
                    {expandedCards.has(result.standardCoffee.id) && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs mb-2">{result.standardCoffee.description}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">가공방식:</span>
                            <span className="text-gray-700">{result.standardCoffee.processing.join(', ')}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">로스팅:</span>
                            <span className="text-gray-700">{result.standardCoffee.commonRoastLevels.join(', ')}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">테이스팅 노트:</span>
                            <span className="text-gray-700">{result.standardCoffee.commonTastingNotes.slice(0, 3).join(', ')}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">고도:</span>
                            <span className="text-gray-700">{result.standardCoffee.altitudeRange || '정보 없음'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">수확 시기:</span>
                            <span className="text-gray-700">{result.standardCoffee.harvestSeason || '정보 없음'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                                        <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base font-semibold text-gray-900">가격 비교</h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {result.products.length}개 로스터리
                        </span>
                      </div>
                      
                      {/* 가격 범위 표시 */}
                      <div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-0.5">최저가</div>
                            <div className="text-sm font-bold text-green-600">
                              {result.lowestPrice.toLocaleString()}원
                            </div>
                          </div>
                          <div className="flex-1 mx-3">
                            <div className="h-1.5 bg-gray-200 rounded-full relative">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-red-400 rounded-full"
                                style={{
                                  width: result.products.length > 1 
                                    ? `${((result.priceRange.max - result.lowestPrice) / (result.priceRange.max - result.lowestPrice + 10000)) * 100}%`
                                    : '100%'
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-0.5">최고가</div>
                            <div className="text-sm font-bold text-red-600">
                              {result.priceRange.max.toLocaleString()}원
                            </div>
                          </div>
                        </div>
                        <div className="text-center mt-1">
                          <span className="text-xs text-gray-600">
                            최대 {(result.priceRange.max - result.lowestPrice).toLocaleString()}원 절약 가능
                          </span>
                        </div>
                      </div>

                                            {/* 로스터리별 가격 목록 */}
                      <div className="space-y-2">
                        {result.products.sort((a, b) => a.product.price - b.product.price).map((item, index) => (
                          <div 
                            key={index} 
                            className={`relative p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                              index === 0 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            {index === 0 && (
                              <div className="absolute -top-1.5 left-3">
                                <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                  최저가
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {/* 로스터리 로고 */}
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border"
                                  style={{ borderColor: item.roastery.brandColor }}
                                >
                                  <img 
                                    src={item.roastery.logoUrl} 
                                    alt={item.roastery.name}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                      // 로고 로드 실패시 대체 텍스트 표시
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling!.classList.remove('hidden');
                                    }}
                                  />
                                  <div 
                                    className="hidden w-full h-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ backgroundColor: item.roastery.brandColor }}
                                  >
                                    {item.roastery.name.charAt(0)}
                                  </div>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center space-x-1">
                                    <span className="font-medium text-gray-900 text-sm">{item.roastery.name}</span>
                                    {item.roastery.isUnspecialtyPartner && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800 rounded-full">
                                        언스페셜티
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500">({item.product.weight})</span>
                                  </div>
                                  <div className="text-xs text-gray-600">{item.product.name}</div>
                                  {item.product.tastingNotes && item.product.tastingNotes.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5 mt-1">
                                      {item.product.tastingNotes.slice(0, 2).map((note, noteIndex) => (
                                        <span 
                                          key={noteIndex}
                                          className="text-xs px-1 py-0.5 bg-gray-100 text-gray-600 rounded"
                                        >
                                          {note}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <div className="text-base font-bold text-gray-900">
                                    {item.product.price.toLocaleString()}원
                                  </div>
                                  {/* {index > 0 && (
                                    <div className="text-xs text-red-500">
                                      +{(item.product.price - result.lowestPrice).toLocaleString()}원
                                    </div>
                                  )} */}
                                </div>
                                <a 
                                  href={item.product.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
                                  style={{ backgroundColor: item.roastery.brandColor }}
                                >
                                  <ShoppingCart className="w-4 h-4 text-white" />
                                </a>
                              </div>
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
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-2">인기 검색어</p>
            <div className="flex flex-wrap justify-center gap-1">
              {["에티오피아 예가체프", "콜롬비아 수프리모", "자메이카 블루마운틴", "하와이 코나", "파나마 게이샤"].map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => handleSuggestionClick(keyword)}
                  className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full
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
      <footer className="w-full py-4 border-t border-gray-100 mt-8">
        <div className="max-w-5xl mx-auto px-3">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <div className="flex space-x-4 mb-2 md:mb-0">
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
