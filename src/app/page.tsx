"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Coffee, MapPin, Star, ShoppingCart, ChevronDown, ChevronUp, Filter, X, User, LogOut, MessageCircle, Plus } from "lucide-react";
import { firestoreCoffeeSearchService, type FirestoreSearchResult } from "@/data/firestoreSearchService";
import { allSuggestions } from "@/data/autoFill";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import LoginModal from "@/components/LoginModal";
import StarRating from "@/components/StarRating";
import ReviewModal from "@/components/ReviewModal";
import ReviewList from "@/components/ReviewList";
import { Review, ReviewService, ReviewStats } from "@/lib/reviewService";

export default function Home() {
  const { user, isAdmin, isAuthenticated, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<FirestoreSearchResult[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [onlyUnspecialtyPartners, setOnlyUnspecialtyPartners] = useState(false);
  const [selectedRoastLevels, setSelectedRoastLevels] = useState<string[]>([]);
  const [selectedProcessingMethods, setSelectedProcessingMethods] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDiscontinuedProducts, setShowDiscontinuedProducts] = useState(true);
  const [availableRoastLevels, setAvailableRoastLevels] = useState<string[]>([]);
  const [availableProcessingMethods, setAvailableProcessingMethods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{ productId: string; standardCoffeeId?: string; productName: string } | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewStats, setReviewStats] = useState<{ [standardCoffeeId: string]: ReviewStats }>({});
  const [userReviews, setUserReviews] = useState<{ [productId: string]: Review }>({});
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 사용 가능한 필터 옵션 로드
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [roastLevels, processingMethods] = await Promise.all([
          firestoreCoffeeSearchService.getAvailableRoastLevels(),
          firestoreCoffeeSearchService.getAvailableProcessingMethods()
        ]);
        setAvailableRoastLevels(roastLevels);
        setAvailableProcessingMethods(processingMethods);
      } catch (error) {
        console.error('필터 옵션 로드 실패:', error);
      }
    };

    loadFilterOptions();
  }, []);

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
  }, [onlyUnspecialtyPartners, selectedRoastLevels, selectedProcessingMethods, showDiscontinuedProducts]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      setIsLoading(true);
      try {
        const results = await firestoreCoffeeSearchService.search(
          searchTerm, 
          onlyUnspecialtyPartners, 
          selectedRoastLevels, 
          selectedProcessingMethods,
          showDiscontinuedProducts
        );
        setSearchResults(results);
        setIsSearched(true);
        setShowSuggestions(false);
        
        // 검색 결과에 대한 리뷰 데이터 로드
        await Promise.all([
          loadReviewStats(results),
          loadUserReviews(results)
        ]);
      } catch (error) {
        console.error('검색 중 오류가 발생했습니다:', error);
        // 사용자에게 오류 메시지 표시할 수 있음
      } finally {
        setIsLoading(false);
      }
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
    setShowDiscontinuedProducts(true);
  };

  // 리뷰 통계 로드
  const loadReviewStats = async (results: FirestoreSearchResult[]) => {
    if (!results.length) return;

    const stats: { [standardCoffeeId: string]: ReviewStats } = {};
    
    for (const result of results) {
      if (result.standardCoffee.id) {
        try {
          const reviewStats = await ReviewService.getStandardCoffeeReviewStats(result.standardCoffee.id);
          stats[result.standardCoffee.id] = reviewStats;
        } catch (error) {
          console.error('리뷰 통계 로드 실패:', error);
        }
      }
    }
    
    setReviewStats(stats);
  };

  // 사용자 리뷰 로드
  const loadUserReviews = async (results: FirestoreSearchResult[]) => {
    if (!user || !results.length) return;

    const userReviewsData: { [productId: string]: Review } = {};
    
    for (const result of results) {
      for (const product of result.products) {
        try {
          const userReview = await ReviewService.getUserProductReview(user.uid, product.product.id);
          if (userReview) {
            userReviewsData[product.product.id] = userReview;
          }
        } catch (error) {
          console.error('사용자 리뷰 로드 실패:', error);
        }
      }
    }
    
    setUserReviews(userReviewsData);
  };

  // 리뷰 작성 버튼 클릭
  const handleWriteReview = (productId: string, standardCoffeeId: string | undefined, productName: string) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setSelectedProductForReview({ productId, standardCoffeeId, productName });
    setEditingReview(null);
    setShowReviewModal(true);
  };

  // 리뷰 수정 버튼 클릭
  const handleEditReview = (review: Review) => {
    if (!user) return;

    setEditingReview(review);
    setSelectedProductForReview({
      productId: review.productId,
      standardCoffeeId: review.standardCoffeeId,
      productName: `${review.productId} 리뷰` // 제품명을 가져올 수 없어서 임시
    });
    setShowReviewModal(true);
  };

  // 리뷰 모달 성공 후
  const handleReviewSuccess = () => {
    setReviewRefreshTrigger(prev => prev + 1);
    // 리뷰 통계 및 사용자 리뷰 다시 로드
    if (searchResults.length > 0) {
      loadReviewStats(searchResults);
      loadUserReviews(searchResults);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 임시 디버그 패널 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border-b border-yellow-200 p-2 text-xs">
          <div className="max-w-6xl mx-auto">
            <strong>디버그 정보:</strong> 
            <span className="ml-2">
              인증 로딩: {loading ? 'Y' : 'N'} | 
              인증됨: {isAuthenticated ? 'Y' : 'N'} | 
              관리자: {isAdmin ? 'Y' : 'N'} | 
                            사용자: {user ? `${user.email} (${user.role})` : '없음'} |
               모달 열림: {showLoginModal ? 'Y' : 'N'}
             </span>
             <button 
               onClick={() => console.log('Firebase 상태:', { user, loading, isAuthenticated, isAdmin })}
               className="ml-4 px-2 py-1 bg-blue-500 text-white text-xs rounded"
             >
               콘솔 로그 출력
             </button>
           </div>
         </div>
       )}
      
      {/* 헤더 */}
      <header className="w-full p-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Coffee className="w-5 h-5 coffee-brown" />
            <span className="text-base font-semibold coffee-brown cursor-pointer" onClick={() => setIsSearched(false)}>SpecialtyData</span>
          </div>
                      <nav className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-4">
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  원두 검색
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  가격 비교
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  로스터리
                </a>
                {isAdmin && (
                  <Link href="/admin" className="text-sm text-coffee-brown hover:text-coffee-light transition-colors font-medium">
                    관리자
                  </Link>
                )}
              </div>
              
              {/* 사용자 메뉴 */}
              <div className="flex items-center space-x-2">
                {loading ? (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-coffee-brown"></div>
                    <span className="hidden sm:inline">로딩중...</span>
                  </div>
                ) : isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <User className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 hidden sm:inline">
                        {user?.displayName || user?.email?.split('@')[0]}
                      </span>
                      {isAdmin && (
                        <span className="text-xs bg-coffee-brown text-white px-2 py-0.5 rounded-full">
                          관리자
                        </span>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await signOut();
                          console.log('로그아웃 성공');
                        } catch (error) {
                          console.error('로그아웃 실패:', error);
                        }
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-gray-100"
                      title="로그아웃"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">로그아웃</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      console.log('로그인 버튼 클릭됨');
                      setShowLoginModal(true);
                    }}
                    className="text-sm text-coffee-brown hover:text-coffee-light transition-colors font-medium flex items-center space-x-1 px-3 py-2 border border-coffee-brown rounded-lg hover:bg-coffee-brown hover:text-white"
                  >
                    <User className="w-4 h-4" />
                    <span>로그인</span>
                  </button>
                )}
              </div>
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
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="px-4 py-3 bg-coffee-brown text-white rounded-full text-sm
                         hover:bg-coffee-light transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-coffee-brown focus:ring-opacity-20
                         shadow-sm hover:shadow-md whitespace-nowrap disabled:opacity-50"
              >
                {isLoading ? '검색중...' : '검색하기'}
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
                    {(onlyUnspecialtyPartners || selectedRoastLevels.length > 0 || selectedProcessingMethods.length > 0 || !showDiscontinuedProducts) && (
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
                        <span>파트너만 보기</span>
                      </span>
                    </label>
                  </div>
                  <div className="mb-3">
                    <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!showDiscontinuedProducts}
                        onChange={(e) => setShowDiscontinuedProducts(!e.target.checked)}
                        className="w-4 h-4 text-coffee-brown border-gray-300 rounded focus:ring-coffee-brown focus:ring-2"
                      />
                      <span>판매중인 상품만 보기</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 로스팅 레벨 필터 */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">로스팅 레벨</h4>
                      <div className="flex flex-wrap gap-2">
                        {availableRoastLevels.map((level: string) => (
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
                        {availableProcessingMethods.map((method: string) => (
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
                  {(selectedRoastLevels.length > 0 || selectedProcessingMethods.length > 0 || !showDiscontinuedProducts) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex flex-wrap gap-1">
                        {!showDiscontinuedProducts && (
                          <span className="inline-flex items-center px-2 py-1 text-xs bg-coffee-brown text-white rounded-full">
                            판매중만 보기
                            <button
                              onClick={() => setShowDiscontinuedProducts(true)}
                              className="ml-1 hover:bg-coffee-light rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {selectedRoastLevels.map((level: string) => (
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
                        {selectedProcessingMethods.map((method: string) => (
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
                          {reviewStats[result.standardCoffee.id] ? (
                            <div className="flex items-center space-x-1">
                              <StarRating 
                                rating={reviewStats[result.standardCoffee.id].averageRating} 
                                readOnly 
                                size="sm" 
                              />
                              <span className="text-xs text-gray-600">
                                ({reviewStats[result.standardCoffee.id].totalReviews})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <StarRating rating={0} readOnly size="sm" />
                              <span className="text-xs text-gray-600 ml-1">리뷰 없음</span>
                            </div>
                          )}
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
                        
                        {/* 리뷰 섹션 */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <ReviewList 
                            standardCoffeeId={result.standardCoffee.id}
                            onEditReview={handleEditReview}
                            refreshTrigger={reviewRefreshTrigger}
                          />
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
                              item.product.saleStatus === 'discontinued' 
                                ? 'border-gray-300 bg-gray-100 opacity-70' 
                                : index === 0 
                                  ? 'border-green-200 bg-green-50' 
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            {index === 0 && item.product.saleStatus !== 'discontinued' && (
                              <div className="absolute -top-1.5 left-3">
                                <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                  최저가
                                </span>
                              </div>
                            )}
                            
                            {item.product.saleStatus === 'discontinued' && (
                              <div className="absolute -top-1.5 right-3">
                                <span className="bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                  판매종료
                                </span>
                              </div>
                            )}
                            
                            {item.product.saleStatus === 'limited' && (
                              <div className="absolute -top-1.5 right-3">
                                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                                  한정판매
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {/* 로스터리 로고 */}
                                <div 
                                  className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border ${
                                    item.product.saleStatus === 'discontinued' ? 'grayscale' : ''
                                  }`}
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
                                    <span className={`font-medium text-sm ${
                                      item.product.saleStatus === 'discontinued' ? 'text-gray-500' : 'text-gray-900'
                                    }`}>{item.roastery.name}</span>
                                    {item.roastery.isUnspecialtyPartner && (
                                      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800 rounded-full">
                                        언스페셜티
                                      </span>
                                    )}
                                    <span className={`text-xs ${
                                      item.product.saleStatus === 'discontinued' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>({item.product.weight})</span>
                                  </div>
                                  <div className={`text-xs ${
                                    item.product.saleStatus === 'discontinued' ? 'text-gray-400' : 'text-gray-600'
                                  }`}>{item.product.name}</div>
                                  {item.product.tastingNotes && item.product.tastingNotes.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5 mt-1">
                                      {item.product.tastingNotes.slice(0, 2).map((note: string, noteIndex: number) => (
                                        <span 
                                          key={noteIndex}
                                          className={`text-xs px-1 py-0.5 rounded ${
                                            item.product.saleStatus === 'discontinued' 
                                              ? 'bg-gray-200 text-gray-500' 
                                              : 'bg-gray-100 text-gray-600'
                                          }`}
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
                                  <div className={`text-base font-bold ${
                                    item.product.saleStatus === 'discontinued' ? 'text-gray-500' : 'text-gray-900'
                                  }`}>
                                    {item.product.price.toLocaleString()}원
                                  </div>
                                </div>
                                
                                {/* 리뷰 버튼 */}
                                {user && (
                                  <button
                                    onClick={() => {
                                      const existingReview = userReviews[item.product.id];
                                      if (existingReview) {
                                        handleEditReview(existingReview);
                                      } else {
                                        handleWriteReview(
                                          item.product.id, 
                                          result.standardCoffee.id, 
                                          `${item.roastery.name} ${item.product.name}`
                                        );
                                      }
                                    }}
                                    className={`p-2 rounded-lg transition-all duration-200 shadow-sm ${
                                      userReviews[item.product.id] 
                                        ? 'bg-coffee-brown text-white hover:bg-coffee-light' 
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                    title={userReviews[item.product.id] ? '내 리뷰 수정' : '리뷰 작성'}
                                  >
                                    {userReviews[item.product.id] ? (
                                      <MessageCircle className="w-4 h-4" />
                                    ) : (
                                      <Plus className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                                
                                {/* 구매 버튼 */}
                                <a 
                                  href={item.product.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`p-2 text-white rounded-lg transition-all duration-200 shadow-sm ${
                                    item.product.saleStatus === 'discontinued' 
                                      ? 'bg-gray-400 cursor-not-allowed' 
                                      : 'hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: item.product.saleStatus === 'discontinued' ? '#9CA3AF' : item.roastery.brandColor }}
                                  onClick={item.product.saleStatus === 'discontinued' ? (e) => e.preventDefault() : undefined}
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

            {searchResults.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-600">다른 검색어로 시도해보세요.</p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색중...</h3>
                <p className="text-gray-600">잠시만 기다려주세요.</p>
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
              <p>&copy; 2025 SpecialtyData. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* 로그인 모달 */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          console.log('로그인 모달 닫힘');
          setShowLoginModal(false);
        }}
        onSuccess={() => {
          console.log('로그인 성공!');
          setShowLoginModal(false);
          // 관리자라면 관리자 페이지로 안내할 수도 있음
          // if (isAdmin) {
          //   router.push('/admin');
          // }
        }}
      />

      {/* 리뷰 모달 */}
      {selectedProductForReview && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedProductForReview(null);
            setEditingReview(null);
          }}
          onSuccess={handleReviewSuccess}
          productId={selectedProductForReview.productId}
          standardCoffeeId={selectedProductForReview.standardCoffeeId}
          productName={selectedProductForReview.productName}
          existingReview={editingReview}
        />
      )}
    </div>
  );
}
