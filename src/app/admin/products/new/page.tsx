"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { firestoreService, COLLECTIONS } from "@/lib/firestore";
import { FirestoreRoastery } from "@/data/firestoreSearchService";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductForm {
  roasteryId: string;
  name: string;
  origin: string;
  region: string;
  farm: string;
  processing: string;
  roastLevel: string;
  description: string;
  price: number;
  weight: string;
  url: string;
  saleStatus: 'active' | 'discontinued' | 'limited';
  tastingNotes: string[];
  altitude: string;
  variety: string;
}

const initialForm: ProductForm = {
  roasteryId: '',
  name: '',
  origin: '',
  region: '',
  farm: '',
  processing: '',
  roastLevel: '',
  description: '',
  price: 0,
  weight: '200g',
  url: '',
  saleStatus: 'active',
  tastingNotes: [],
  altitude: '',
  variety: ''
};

const commonOrigins = [
  '에티오피아', '콜롬비아', '브라질', '과테말라', '케냐', '코스타리카', 
  '파나마', '자메이카', '하와이', '예멘', '인도네시아', '페루'
];

const commonProcessing = [
  '워시드', '내추럴', '허니', '세미워시드', '애너로빅', '카보닉'
];

const commonRoastLevels = [
  '라이트', '미디엄 라이트', '미디엄', '미디엄 다크', '다크', '프렌치'
];

const commonWeights = [
  '100g', '200g', '250g', '500g', '1kg'
];

export default function NewProductPage() {
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [roasteries, setRoasteries] = useState<FirestoreRoastery[]>([]);
  const [newTastingNote, setNewTastingNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadRoasteries();
  }, []);

  const loadRoasteries = async () => {
    try {
      setIsLoading(true);
      const roasteriesData = await firestoreService.getAll<FirestoreRoastery>(COLLECTIONS.ROASTERIES);
      setRoasteries(roasteriesData);
    } catch (error) {
      console.error('로스터리 로드 실패:', error);
      alert('로스터리 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roasteryId || !form.name.trim() || !form.origin.trim()) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        ...form,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await firestoreService.create(COLLECTIONS.COFFEE_PRODUCTS, productData);
      router.push('/admin/products');
    } catch (error) {
      console.error('원두 제품 생성 실패:', error);
      alert('원두 제품 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTastingNote = () => {
    if (newTastingNote.trim() && !form.tastingNotes.includes(newTastingNote.trim())) {
      setForm(prev => ({
        ...prev,
        tastingNotes: [...prev.tastingNotes, newTastingNote.trim()]
      }));
      setNewTastingNote("");
    }
  };

  const removeTastingNote = (index: number) => {
    setForm(prev => ({
      ...prev,
      tastingNotes: prev.tastingNotes.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTastingNote();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-brown mx-auto mb-4"></div>
          <p className="text-gray-600">로스터리 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/products" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>원두 제품 목록으로</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">새 원두 제품 추가</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">기본 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  로스터리 *
                </label>
                <select
                  value={form.roasteryId}
                  onChange={(e) => setForm(prev => ({ ...prev, roasteryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  required
                >
                  <option value="">로스터리를 선택하세요</option>
                  {roasteries.map((roastery) => (
                    <option key={roastery.id} value={roastery.id}>
                      {roastery.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제품명 *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="예: Ethiopian Yirgacheffe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  원산지 *
                </label>
                <input
                  type="text"
                  value={form.origin}
                  onChange={(e) => setForm(prev => ({ ...prev, origin: e.target.value }))}
                  list="origins"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="예: 에티오피아"
                  required
                />
                <datalist id="origins">
                  {commonOrigins.map((origin) => (
                    <option key={origin} value={origin} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지역
                </label>
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => setForm(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="예: 예가체프"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  농장/협동조합
                </label>
                <input
                  type="text"
                  value={form.farm}
                  onChange={(e) => setForm(prev => ({ ...prev, farm: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="예: Worka Cooperative"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                placeholder="원두에 대한 상세 설명을 입력하세요"
              />
            </div>
          </div>

          {/* 가공 및 로스팅 정보 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">가공 및 로스팅</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가공 방식
                </label>
                <input
                  type="text"
                  value={form.processing}
                  onChange={(e) => setForm(prev => ({ ...prev, processing: e.target.value }))}
                  list="processing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="예: 워시드"
                />
                <datalist id="processing">
                  {commonProcessing.map((method) => (
                    <option key={method} value={method} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  로스팅 레벨
                </label>
                <input
                  type="text"
                  value={form.roastLevel}
                  onChange={(e) => setForm(prev => ({ ...prev, roastLevel: e.target.value }))}
                  list="roastLevels"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="예: 미디엄 라이트"
                />
                <datalist id="roastLevels">
                  {commonRoastLevels.map((level) => (
                    <option key={level} value={level} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  품종
                </label>
                <input
                  type="text"
                  value={form.variety}
                  onChange={(e) => setForm(prev => ({ ...prev, variety: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="예: 헤어룸"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                고도
              </label>
              <input
                type="text"
                value={form.altitude}
                onChange={(e) => setForm(prev => ({ ...prev, altitude: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                placeholder="예: 1800-2000m"
              />
            </div>
          </div>

          {/* 판매 정보 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">판매 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가격 (원)
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="25000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  중량
                </label>
                <input
                  type="text"
                  value={form.weight}
                  onChange={(e) => setForm(prev => ({ ...prev, weight: e.target.value }))}
                  list="weights"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="200g"
                />
                <datalist id="weights">
                  {commonWeights.map((weight) => (
                    <option key={weight} value={weight} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  판매 상태
                </label>
                <select
                  value={form.saleStatus}
                  onChange={(e) => setForm(prev => ({ ...prev, saleStatus: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                >
                  <option value="active">판매중</option>
                  <option value="limited">한정판매</option>
                  <option value="discontinued">판매종료</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구매 링크
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                placeholder="https://example.com/product-page"
              />
            </div>
          </div>

          {/* 테이스팅 노트 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">테이스팅 노트</h2>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTastingNote}
                  onChange={(e) => setNewTastingNote(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="테이스팅 노트 입력 (예: 꽃향기, 레몬, 초콜릿)"
                />
                <button
                  type="button"
                  onClick={addTastingNote}
                  className="px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.tastingNotes.map((note, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {note}
                  <button
                    type="button"
                    onClick={() => removeTastingNote(index)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/products"
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? '저장 중...' : '제품 추가'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 