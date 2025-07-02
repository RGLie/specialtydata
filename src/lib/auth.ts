import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// 관리자 이메일 목록 (환경변수로 관리)
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [
  'admin@specialtydata.com', // 기본 관리자 이메일
];

const googleProvider = new GoogleAuthProvider();

// 구글 로그인
export const signInWithGoogle = async (): Promise<AppUser | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // 사용자 정보를 Firestore에 저장/업데이트
    const appUser = await createOrUpdateUser(user);
    return appUser;
  } catch (error) {
    console.error('구글 로그인 실패:', error);
    throw error;
  }
};

// 이메일/비밀번호 로그인
export const signInWithEmail = async (email: string, password: string): Promise<AppUser | null> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const appUser = await getUserData(result.user.uid);
    return appUser;
  } catch (error) {
    console.error('이메일 로그인 실패:', error);
    throw error;
  }
};

// 이메일/비밀번호 회원가입
export const signUpWithEmail = async (email: string, password: string, displayName: string): Promise<AppUser | null> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // 사용자 정보를 Firestore에 저장
    const appUser = await createOrUpdateUser(user, displayName);
    return appUser;
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

// 로그아웃
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};

// 사용자 정보 생성/업데이트
const createOrUpdateUser = async (firebaseUser: FirebaseUser, displayName?: string): Promise<AppUser> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  
  const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
  const now = new Date();
  
  const userData: AppUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: displayName || firebaseUser.displayName || '',
    role: isAdmin ? 'admin' : 'user',
    createdAt: userSnap.exists() ? userSnap.data().createdAt.toDate() : now,
    updatedAt: now
  };
  
  await setDoc(userRef, userData);
  return userData;
};

// 사용자 데이터 가져오기
export const getUserData = async (uid: string): Promise<AppUser | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as AppUser;
    }
    return null;
  } catch (error) {
    console.error('사용자 데이터 로드 실패:', error);
    return null;
  }
};

// 인증 상태 변화 감지
export const onAuthStateChange = (callback: (user: AppUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const appUser = await getUserData(firebaseUser.uid);
      callback(appUser);
    } else {
      callback(null);
    }
  });
};

// 관리자 권한 확인
export const isAdmin = (user: AppUser | null): boolean => {
  return user?.role === 'admin';
};

// 로그인 여부 확인
export const isAuthenticated = (user: AppUser | null): boolean => {
  return user !== null;
}; 