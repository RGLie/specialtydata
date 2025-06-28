"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Download, FileText, AlertCircle, CheckCircle, Coffee } from "lucide-react";
import { firestoreService, COLLECTIONS } from "@/lib/firestore";
import Link from "next/link";

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function BulkUploadPage() {
  const [selectedDataType, setSelectedDataType] = useState<'roasteries' | 'products' | 'standardCoffees'>('roasteries');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const dataTypeOptions = [
    { value: 'roasteries', label: '로스터리', collection: COLLECTIONS.ROASTERIES },
    { value: 'products', label: '원두 제품', collection: COLLECTIONS.COFFEE_PRODUCTS },
    { value: 'standardCoffees', label: '표준 원두', collection: COLLECTIONS.STANDARD_COFFEES }
  ];

  const sampleData = {
    roasteries: [
      {
        name: "샘플 로스터리",
        description: "샘플 로스터리 설명",
        website: "https://example.com",
        location: "서울, 한국",
        founded: 2020,
        specialties: ["싱글 오리진", "에스프레소"],
        logoUrl: "/test-logo.svg",
        brandColor: "#8B4513",
        isUnspecialtyPartner: false
      }
    ],
    products: [
      {
        roasteryId: "roastery-id",
        name: "샘플 원두",
        standardCoffeeId: "standard-coffee-id",
        origin: "에티오피아",
        region: "예가체프",
        farm: "샘플 농장",
        processing: "워시드",
        roastLevel: "미디엄 라이트",
        description: "샘플 원두 설명",
        price: 25000,
        weight: "200g",
        url: "https://example.com/product",
        inStock: true,
        saleStatus: "active",
        tastingNotes: ["꽃향기", "레몬", "베르가못"],
        altitude: "1800-2000m",
        variety: "헤어룸"
      }
    ],
    standardCoffees: [
      {
        primaryName: "에티오피아 예가체프",
        alternativeNames: ["Ethiopian Yirgacheffe", "Yergacheffe"],
        origin: "에티오피아",
        region: "예가체프",
        processing: ["워시드", "내추럴"],
        commonRoastLevels: ["라이트", "미디엄 라이트"],
        description: "밝은 산미와 꽃향기가 특징",
        commonTastingNotes: ["꽃향기", "레몬", "베르가못"],
        avgRating: 4.7,
        commonVarieties: ["헤어룸", "쿠루메"],
        altitudeRange: "1800-2000m",
        harvestSeason: "10월-1월",
        typicalPrice: { min: 25000, max: 35000 }
      }
    ]
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = async (file: File) => {
    try {
      const text = await file.text();
      let data: any[];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else {
        alert('지원하지 않는 파일 형식입니다. JSON 또는 CSV 파일을 업로드해주세요.');
        return;
      }

      setPreviewData(data.slice(0, 5)); // 처음 5개만 미리보기
    } catch (error) {
      console.error('파일 미리보기 실패:', error);
      alert('파일을 읽을 수 없습니다. 파일 형식을 확인해주세요.');
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      
      headers.forEach((header, index) => {
        let value: any = values[index] || '';
        
        // 숫자 변환 시도
        if (!isNaN(Number(value)) && value !== '') {
          value = Number(value);
        }
        // boolean 변환
        else if (value.toLowerCase() === 'true') {
          value = true;
        } else if (value.toLowerCase() === 'false') {
          value = false;
        }
        // 배열 변환 (쉼표로 구분된 문자열)
        else if (value.includes('|')) {
          value = value.split('|').map((item: string) => item.trim());
        }
        
        obj[header] = value;
      });
      
      return obj;
    });
  };

  const handleUpload = async () => {
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const text = await file.text();
      let data: any[];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else {
        data = parseCSV(text);
      }

      const result: UploadResult = { success: 0, failed: 0, errors: [] };
      
      for (const item of data) {
        try {
          const itemWithMetadata = {
            originalId: item.name?.toLowerCase().replace(/\s+/g, '-') || `item-${Date.now()}-${Math.random()}`,
            ...item,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await firestoreService.add(dataTypeOptions.find(opt => opt.value === selectedDataType)!.collection, itemWithMetadata);
          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push(`항목 ${result.success + result.failed}: ${error}`);
        }
      }

      setUploadResult(result);
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSample = () => {
    const data = sampleData[selectedDataType];
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample-${selectedDataType}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>대시보드로</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">대량 데이터 업로드</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">업로드 안내</h3>
                <p className="text-sm text-blue-700 mt-1">
                  JSON 또는 CSV 파일을 사용하여 대량의 데이터를 한 번에 업로드할 수 있습니다. 
                  업로드 전에 샘플 파일을 다운로드하여 형식을 확인해주세요.
                </p>
              </div>
            </div>
          </div>

          {/* 데이터 타입 선택 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">데이터 타입 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dataTypeOptions.map((option) => (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    name="dataType"
                    value={option.value}
                    checked={selectedDataType === option.value}
                    onChange={(e) => setSelectedDataType(e.target.value as any)}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedDataType === option.value
                      ? 'border-coffee-brown bg-coffee-brown bg-opacity-5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="text-center">
                      <Coffee className={`w-8 h-8 mx-auto mb-2 ${
                        selectedDataType === option.value ? 'text-coffee-brown' : 'text-gray-400'
                      }`} />
                      <p className="font-medium text-gray-900">{option.label}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 샘플 파일 다운로드 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">샘플 파일</h2>
            <p className="text-sm text-gray-600 mb-4">
              올바른 데이터 형식을 확인하기 위해 샘플 파일을 다운로드하세요.
            </p>
            <button
              onClick={downloadSample}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              샘플 파일 다운로드 (JSON)
            </button>
          </div>

          {/* 파일 업로드 */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">파일 업로드</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  데이터 파일 선택 (JSON 또는 CSV)
                </label>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-coffee-brown file:text-white hover:file:bg-coffee-light"
                />
              </div>

              {file && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                </div>
              )}

              {previewData.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">미리보기 (처음 5개)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(previewData[0] || {}).map((key) => (
                            <th key={key} className="px-2 py-1 text-left font-medium text-gray-700 border-b border-gray-200">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            {Object.values(row).map((value: any, i) => (
                              <td key={i} className="px-2 py-1 text-gray-600 max-w-xs truncate">
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="inline-flex items-center px-6 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? '업로드 중...' : '업로드 시작'}
              </button>
            </div>
          </div>

          {/* 업로드 결과 */}
          {uploadResult && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">업로드 결과</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">성공: {uploadResult.success}개</span>
                  </div>
                  {uploadResult.failed > 0 && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-gray-700">실패: {uploadResult.failed}개</span>
                    </div>
                  )}
                </div>

                {uploadResult.errors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">오류 목록</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
                        <p key={index} className="text-xs text-red-700 mb-1">{error}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Link
                    href={`/admin/${selectedDataType === 'roasteries' ? 'roasteries' : selectedDataType === 'products' ? 'products' : 'standard-coffees'}`}
                    className="inline-flex items-center px-4 py-2 bg-coffee-brown text-white rounded-lg hover:bg-coffee-light transition-colors"
                  >
                    업로드된 데이터 확인
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 