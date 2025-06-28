"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { firestoreService, COLLECTIONS } from "@/lib/firestore";
import { FirestoreRoastery } from "@/data/firestoreSearchService";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

interface RoasteryForm {
  name: string;
  description: string;
  website: string;
  location: string;
  founded: number;
  specialties: string[];
  logoUrl: string;
  brandColor: string;
  isUnspecialtyPartner: boolean;
}

const predefinedColors = [
  "#8B4513", "#003d82", "#00754a", "#ff6b35", "#c41e3a",
  "#1f2937", "#7c3aed", "#059669", "#dc2626", "#ea580c"
];

export default function EditRoasteryPage() {
  const [form, setForm] = useState<RoasteryForm | null>(null);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const roasteryId = params.id as string;

  useEffect(() => {
    loadRoastery();
  }, [roasteryId]);

  const loadRoastery = async () => {
    try {
      setIsLoading(true);
      const roastery = await firestoreService.getById<FirestoreRoastery>(COLLECTIONS.ROASTERIES, roasteryId);
      
      if (!roastery) {
        alert('로스터리를 찾을 수 없습니다.');
        router.push('/admin/roasteries');
        return;
      }

      setForm({
        name: roastery.name,
        description: roastery.description,
        website: roastery.website,
        location: roastery.location,
        founded: roastery.founded,
        specialties: roastery.specialties,
        logoUrl: roastery.logoUrl,
        brandColor: roastery.brandColor,
        isUnspecialtyPartner: roastery.isUnspecialtyPartner
      });
    } catch (error) {
      console.error('로스터리 로드 실패:', error);
      alert('로스터리를 불러올 수 없습니다.');
      router.push('/admin/roasteries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.name.trim()) {
      alert('로스터리 이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData = {
        ...form,
        updatedAt: new Date()
      };

      await firestoreService.update(COLLECTIONS.ROASTERIES, roasteryId, updatedData);
      router.push('/admin/roasteries');
    } catch (error) {
      console.error('로스터리 수정 실패:', error);
      alert('로스터리 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSpecialty = () => {
    if (!form) return;
    
    if (newSpecialty.trim() && !form.specialties.includes(newSpecialty.trim())) {
      setForm(prev => prev ? ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }) : null);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index: number) => {
    if (!form) return;
    
    setForm(prev => prev ? ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }) : null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-brown mx-auto mb-4"></div>
          <p className="text-gray-600">로스터리 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로스터리를 찾을 수 없습니다.</p>
          <Link href="/admin/roasteries" className="text-coffee-brown hover:text-coffee-light">
            로스터리 목록으로 돌아가기
          </Link>
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
              <Link href="/admin/roasteries" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>로스터리 목록으로</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">로스터리 수정</h1>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  로스터리 이름 *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="예: 블루보틀"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  위치
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="예: 서울, 한국"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설립년도
                </label>
                <input
                  type="number"
                  value={form.founded}
                  onChange={(e) => setForm(prev => prev ? ({ ...prev, founded: parseInt(e.target.value) || new Date().getFullYear() }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  웹사이트
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm(prev => prev ? ({ ...prev, website: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                placeholder="로스터리에 대한 간단한 설명을 입력하세요"
              />
            </div>
          </div>

          {/* 브랜딩 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">브랜딩</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  로고 URL
                </label>
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => setForm(prev => prev ? ({ ...prev, logoUrl: e.target.value }) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="/logos/roastery-logo.svg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  브랜드 색상
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={form.brandColor}
                    onChange={(e) => setForm(prev => prev ? ({ ...prev, brandColor: e.target.value }) : null)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.brandColor}
                    onChange={(e) => setForm(prev => prev ? ({ ...prev, brandColor: e.target.value }) : null)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                    placeholder="#8B4513"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(prev => prev ? ({ ...prev, brandColor: color }) : null)}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 미리보기 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미리보기
              </label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                    style={{ backgroundColor: form.brandColor + '20', borderColor: form.brandColor }}
                  >
                    <span 
                      className="text-lg font-bold"
                      style={{ color: form.brandColor }}
                    >
                      {form.name.charAt(0) || 'R'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{form.name || '로스터리 이름'}</h3>
                    <p className="text-sm text-gray-600">{form.location || '위치'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 전문 분야 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">전문 분야</h2>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown"
                  placeholder="전문 분야 입력 (예: 싱글 오리진)"
                />
                <button
                  type="button"
                  onClick={addSpecialty}
                  className="px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.specialties.map((specialty, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(index)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 기타 설정 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">기타 설정</h2>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={form.isUnspecialtyPartner}
                  onChange={(e) => setForm(prev => prev ? ({ ...prev, isUnspecialtyPartner: e.target.checked }) : null)}
                  className="w-4 h-4 text-coffee-brown border-gray-300 rounded focus:ring-coffee-brown focus:ring-2"
                />
                <span className="text-sm text-gray-700">
                  <span className="text-blue-600 font-medium">언스페셜티</span> 파트너
                </span>
              </label>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/roasteries"
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
              {isSubmitting ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
} 