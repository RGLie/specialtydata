"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Coffee, ArrowLeft, Search, ExternalLink } from "lucide-react";
import { firestoreService, COLLECTIONS } from "@/lib/firestore";
import { FirestoreRoastery } from "@/data/firestoreSearchService";
import Link from "next/link";

export default function RoasteriesPage() {
  const [roasteries, setRoasteries] = useState<FirestoreRoastery[]>([]);
  const [filteredRoasteries, setFilteredRoasteries] = useState<FirestoreRoastery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRoastery, setSelectedRoastery] = useState<FirestoreRoastery | null>(null);

  useEffect(() => {
    loadRoasteries();
  }, []);

  useEffect(() => {
    filterRoasteries();
  }, [roasteries, searchTerm]);

  const loadRoasteries = async () => {
    try {
      setIsLoading(true);
      const data = await firestoreService.getAll<FirestoreRoastery>(COLLECTIONS.ROASTERIES);
      setRoasteries(data);
    } catch (error) {
      console.error('로스터리 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRoasteries = () => {
    if (!searchTerm) {
      setFilteredRoasteries(roasteries);
    } else {
      const filtered = roasteries.filter(roastery =>
        roastery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roastery.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roastery.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredRoasteries(filtered);
    }
  };

  const handleDeleteRoastery = async (roastery: FirestoreRoastery) => {
    setSelectedRoastery(roastery);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRoastery) return;

    try {
      await firestoreService.delete(COLLECTIONS.ROASTERIES, selectedRoastery.id);
      setRoasteries(prev => prev.filter(r => r.id !== selectedRoastery.id));
      setDeleteModalOpen(false);
      setSelectedRoastery(null);
    } catch (error) {
      console.error('로스터리 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>대시보드로</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">로스터리 관리</h1>
            </div>
            <Link 
              href="/admin/roasteries/new"
              className="inline-flex items-center px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              로스터리 추가
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 바 */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="로스터리 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
            />
          </div>
        </div>

        {/* 통계 */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">총 로스터리</p>
              <p className="text-2xl font-bold text-gray-900">{roasteries.length}개</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">검색 결과</p>
              <p className="text-2xl font-bold text-coffee-brown">{filteredRoasteries.length}개</p>
            </div>
          </div>
        </div>

        {/* 로스터리 리스트 */}
        {isLoading ? (
          <div className="text-center py-12">
            <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">로스터리 목록을 불러오는 중...</p>
          </div>
        ) : filteredRoasteries.length === 0 ? (
          <div className="text-center py-12">
            <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {searchTerm ? '검색 결과가 없습니다' : '등록된 로스터리가 없습니다'}
            </p>
            <Link 
              href="/admin/roasteries/new"
              className="inline-flex items-center px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              첫 번째 로스터리 추가
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoasteries.map((roastery) => (
              <div key={roastery.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: roastery.brandColor + '20', borderColor: roastery.brandColor }}
                      >
                        <span 
                          className="text-lg font-bold"
                          style={{ color: roastery.brandColor }}
                        >
                          {roastery.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{roastery.name}</h3>
                        <p className="text-sm text-gray-600">{roastery.location}</p>
                      </div>
                    </div>
                    {roastery.isUnspecialtyPartner && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        언스페셜티
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{roastery.description}</p>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">전문 분야</p>
                    <div className="flex flex-wrap gap-1">
                      {roastery.specialties.slice(0, 3).map((specialty, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {specialty}
                        </span>
                      ))}
                      {roastery.specialties.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{roastery.specialties.length - 3}개
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    설립: {roastery.founded}년
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/roasteries/${roastery.id}/edit`}
                        className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        수정
                      </Link>
                      <button
                        onClick={() => handleDeleteRoastery(roastery)}
                        className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        삭제
                      </button>
                    </div>
                    {roastery.website && (
                      <a
                        href={roastery.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-coffee-brown hover:text-coffee-light transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        사이트
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {deleteModalOpen && selectedRoastery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">로스터리 삭제</h3>
              <p className="text-gray-600 mb-6">
                <strong>{selectedRoastery.name}</strong>을(를) 삭제하시겠습니까? 
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 