"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Coffee, Shield, AlertTriangle } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩이 완료되고 사용자가 없거나 관리자가 아닌 경우 메인 페이지로 리다이렉트
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-brown mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">관리자 페이지에 접근하려면 로그인해주세요.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors"
          >
            메인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 관리자 권한이 없는 경우
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-2">관리자 권한이 필요한 페이지입니다.</p>
          <p className="text-sm text-gray-500 mb-6">
            현재 계정: {user.email} ({user.role})
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors"
          >
            메인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 관리자인 경우 컨텐츠 렌더링
  return (
    <div>
      {/* 관리자 표시 헤더 */}
      <div className="bg-coffee-brown text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Shield className="w-4 h-4" />
            <span>관리자 모드 - {user.displayName || user.email}</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
} 