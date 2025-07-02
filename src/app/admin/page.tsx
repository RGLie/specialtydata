"use client";

import { useState, useEffect } from "react";
import { Plus, Coffee, Store, Database, BarChart3, Upload, Edit, Trash2 } from "lucide-react";
import { firestoreService, COLLECTIONS } from "@/lib/firestore";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

interface DashboardStats {
  totalRoasteries: number;
  totalProducts: number;
  totalStandardCoffees: number;
  recentlyAdded: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRoasteries: 0,
    totalProducts: 0,
    totalStandardCoffees: 0,
    recentlyAdded: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const [roasteries, products, standardCoffees] = await Promise.all([
        firestoreService.getAll(COLLECTIONS.ROASTERIES),
        firestoreService.getAll(COLLECTIONS.COFFEE_PRODUCTS),
        firestoreService.getAll(COLLECTIONS.STANDARD_COFFEES)
      ]);

      // 최근 7일 내 추가된 항목 계산
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const recentItems = [...roasteries, ...products, ...standardCoffees].filter((item: any) => {
        const createdAt = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        return createdAt > weekAgo;
      });

      setStats({
        totalRoasteries: roasteries.length,
        totalProducts: products.length,
        totalStandardCoffees: standardCoffees.length,
        recentlyAdded: recentItems.length
      });
    } catch (error) {
      console.error('대시보드 통계 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, description, href }: {
    title: string;
    value: number;
    icon: any;
    description: string;
    href?: string;
  }) => {
    const content = (
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {isLoading ? '-' : value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="p-3 bg-coffee-brown bg-opacity-10 rounded-full">
            <Icon className="w-6 h-6 text-coffee-brown" />
          </div>
        </div>
      </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
  };

  const QuickActionButton = ({ title, description, icon: Icon, href, color = "coffee-brown" }: {
    title: string;
    description: string;
    icon: any;
    href: string;
    color?: string;
  }) => (
    <Link href={href}>
      <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-${color} group`}>
        <div className="flex items-start space-x-4">
          <div className={`p-3 bg-${color} bg-opacity-10 rounded-full group-hover:bg-${color} group-hover:bg-opacity-20 transition-colors`}>
            <Icon className={`w-6 h-6 text-${color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-coffee-brown hover:text-coffee-light transition-colors">
                <Coffee className="w-6 h-6" />
                <span className="text-lg font-semibold">SpecialtyData</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                사이트로 돌아가기
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="총 로스터리"
            value={stats.totalRoasteries}
            icon={Store}
            description="등록된 로스터리 수"
            href="/admin/roasteries"
          />
          <StatCard
            title="총 원두 제품"
            value={stats.totalProducts}
            icon={Coffee}
            description="등록된 원두 제품 수"
            href="/admin/products"
          />
          <StatCard
            title="표준 원두"
            value={stats.totalStandardCoffees}
            icon={Database}
            description="표준화된 원두 종류"
            href="/admin/standard-coffees"
          />
          <StatCard
            title="최근 추가"
            value={stats.recentlyAdded}
            icon={BarChart3}
            description="지난 7일간 추가된 항목"
          />
        </div>

        {/* 빠른 작업 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionButton
              title="로스터리 추가"
              description="새로운 커피 로스터리를 등록합니다"
              icon={Plus}
              href="/admin/roasteries/new"
            />
            <QuickActionButton
              title="원두 제품 추가"
              description="개별 원두 제품을 등록합니다"
              icon={Coffee}
              href="/admin/products/new"
            />
            <QuickActionButton
              title="일괄 데이터 업로드"
              description="CSV/JSON 파일로 대량 데이터를 업로드합니다"
              icon={Upload}
              href="/admin/bulk-upload"
              color="blue-600"
            />
          </div>
        </div>

        {/* 관리 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 로스터리 관리 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">로스터리 관리</h3>
                <Link 
                  href="/admin/roasteries"
                  className="text-sm text-coffee-brown hover:text-coffee-light transition-colors"
                >
                  전체 보기 →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link 
                  href="/admin/roasteries" 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Edit className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">로스터리 목록 관리</span>
                  </div>
                </Link>
                <Link 
                  href="/admin/roasteries/new"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">새 로스터리 추가</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 원두 관리 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">원두 관리</h3>
                <Link 
                  href="/admin/products"
                  className="text-sm text-coffee-brown hover:text-coffee-light transition-colors"
                >
                  전체 보기 →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <Link 
                  href="/admin/products"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Edit className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">원두 제품 목록</span>
                  </div>
                </Link>
                <Link 
                  href="/admin/products/new"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">새 원두 추가</span>
                  </div>
                </Link>
                <Link 
                  href="/admin/bulk-upload"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">대량 업로드</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </AdminGuard>
  );
} 