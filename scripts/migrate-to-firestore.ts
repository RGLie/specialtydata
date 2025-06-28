#!/usr/bin/env tsx

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { roasteries } from '../src/data/roasteryData';
import { standardCoffees } from '../src/data/standardCoffees';
import { coffeeProducts } from '../src/data/coffeeProducts';

// Firebase 설정 (환경변수 또는 직접 설정)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCollectionExists(collectionName: string): Promise<boolean> {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error checking collection ${collectionName}:`, error);
    return false;
  }
}

async function migrateData() {
  console.log('🚀 Firestore 데이터 마이그레이션을 시작합니다...\n');
  
  try {
    // 1. 로스터리 데이터 마이그레이션
    console.log('📍 로스터리 데이터 마이그레이션 중...');
    const roasteriesExists = await checkCollectionExists('roasteries');
    
    if (roasteriesExists) {
      console.log('⚠️  로스터리 컬렉션이 이미 존재합니다. 건너뜁니다.');
    } else {
      for (const roastery of roasteries) {
        const { id, ...roasteryData } = roastery;
        await addDoc(collection(db, 'roasteries'), {
          originalId: id,
          ...roasteryData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      console.log(`✅ ${roasteries.length}개의 로스터리 데이터 마이그레이션 완료`);
    }

    // 2. 표준 커피 데이터 마이그레이션
    console.log('\n☕ 표준 커피 데이터 마이그레이션 중...');
    const standardCoffeesExists = await checkCollectionExists('standardCoffees');
    
    if (standardCoffeesExists) {
      console.log('⚠️  표준 커피 컬렉션이 이미 존재합니다. 건너뜁니다.');
    } else {
      for (const coffee of standardCoffees) {
        const { id, ...coffeeData } = coffee;
        await addDoc(collection(db, 'standardCoffees'), {
          originalId: id,
          ...coffeeData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      console.log(`✅ ${standardCoffees.length}개의 표준 커피 데이터 마이그레이션 완료`);
    }

    // 3. 커피 제품 데이터 마이그레이션
    console.log('\n🛍️  커피 제품 데이터 마이그레이션 중...');
    const coffeeProductsExists = await checkCollectionExists('coffeeProducts');
    
    if (coffeeProductsExists) {
      console.log('⚠️  커피 제품 컬렉션이 이미 존재합니다. 건너뜁니다.');
    } else {
      for (const product of coffeeProducts) {
        const { id, lastUpdated, ...productData } = product;
        await addDoc(collection(db, 'coffeeProducts'), {
          originalId: id,
          ...productData,
          lastUpdated: lastUpdated,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      console.log(`✅ ${coffeeProducts.length}개의 커피 제품 데이터 마이그레이션 완료`);
    }

    console.log('\n🎉 모든 데이터 마이그레이션이 완료되었습니다!');
    console.log('\n📊 마이그레이션된 데이터:');
    console.log(`   - 로스터리: ${roasteries.length}개`);
    console.log(`   - 표준 커피: ${standardCoffees.length}개`);
    console.log(`   - 커피 제품: ${coffeeProducts.length}개`);
    
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('\n✨ 마이그레이션 스크립트가 성공적으로 완료되었습니다.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 중 오류:', error);
      process.exit(1);
    });
}

export { migrateData }; 