"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Package, Coffee } from "lucide-react";
import { firestoreService, COLLECTIONS } from "@/lib/firestore";
import { FirestoreCoffeeProduct, FirestoreRoastery } from "@/data/firestoreSearchService";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<FirestoreCoffeeProduct[]>([]);
  const [roasteries, setRoasteries] = useState<Record<string, FirestoreRoastery>>({});
  const [filteredProducts, setFilteredProducts] = useState<FirestoreCoffeeProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, productId: string, productName: string}>({
    show: false,
    productId: '',
    productName: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // 검색 필터링
    if (searchQuery.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roasteries[product.roasteryId]?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products, roasteries]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // 원두 제품과 로스터리 정보를 병렬로 로드
      const [productsData, roasteriesData] = await Promise.all([
        firestoreService.getAll<FirestoreCoffeeProduct>(COLLECTIONS.COFFEE_PRODUCTS),
        firestoreService.getAll<FirestoreRoastery>(COLLECTIONS.ROASTERIES)
      ]);

      // 로스터리 정보를 ID로 매핑
      const roasteryMap: Record<string, FirestoreRoastery> = {};
      roasteriesData.forEach(roastery => {
        roasteryMap[roastery.id] = roastery;
      });

      setProducts(productsData);
      setRoasteries(roasteryMap);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      alert('데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (product: FirestoreCoffeeProduct) => {
    setDeleteConfirm({
      show: true,
      productId: product.id,
      productName: product.name
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await firestoreService.delete(COLLECTIONS.COFFEE_PRODUCTS, deleteConfirm.productId);
      setProducts(prev => prev.filter(p => p.id !== deleteConfirm.productId));
      setDeleteConfirm({ show: false, productId: '', productName: '' });
    } catch (error) {
      console.error('원두 제품 삭제 실패:', error);
      alert('원두 제품 삭제 중 오류가 발생했습니다.');
    }
  };

  const getSaleStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">판매중</span>;
      case 'discontinued':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">판매종료</span>;
      case 'limited':
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">한정판매</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-brown mx-auto mb-4"></div>
          <p className="text-gray-600">원두 제품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
                ← 어드민 대시보드
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-coffee-brown" />
                <h1 className="text-xl font-bold text-gray-900">원두 제품 관리</h1>
              </div>
            </div>
            
            <Link 
              href="/admin/products/new"
              className="inline-flex items-center px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 원두 제품
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 제품</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <Coffee className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">판매중</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.saleStatus === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">한정판매</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.saleStatus === 'limited').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">판매종료</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.saleStatus === 'discontinued').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="원두 제품명, 원산지, 로스터리로 검색..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
            />
          </div>
        </div>

        {/* 원두 제품 목록 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              원두 제품 목록 ({filteredProducts.length}개)
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">원두 제품이 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 원두 제품을 추가해보세요.</p>
              <Link 
                href="/admin/products/new"
                className="inline-flex items-center px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 원두 제품 추가
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        {getSaleStatusBadge(product.saleStatus)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">로스터리:</span>{' '}
                          {roasteries[product.roasteryId]?.name || 'Unknown'}
                        </div>
                        <div>
                          <span className="font-medium">원산지:</span>{' '}
                          {product.origin} - {product.region}
                        </div>
                        <div>
                          <span className="font-medium">가격:</span>{' '}
                          {product.price.toLocaleString()}원 ({product.weight})
                        </div>
                        <div>
                          <span className="font-medium">로스팅:</span>{' '}
                          {product.roastLevel}
                        </div>
                      </div>

                      {product.tastingNotes && product.tastingNotes.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {product.tastingNotes.slice(0, 4).map((note, index) => (
                              <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {note}
                              </span>
                            ))}
                            {product.tastingNotes.length > 4 && (
                              <span className="inline-block px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded-full">
                                +{product.tastingNotes.length - 4}개
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 text-gray-600 hover:text-coffee-brown hover:bg-gray-100 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 삭제 확인 모달 */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">원두 제품 삭제</h3>
              <p className="text-gray-600 mb-4">
                '{deleteConfirm.productName}' 원두 제품을 삭제하시겠습니까?<br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, productId: '', productName: '' })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 