import { db } from './firebase';
import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';

export const trackPageView = async (path: string) => {
  try {
    const cleanPath = path.replace(/\//g, '_') || 'home';
    const pageRef = doc(db, 'analytics', 'pageViews');
    
    // Ensure document exists
    const docSnap = await getDoc(pageRef);
    if (!docSnap.exists()) {
      await setDoc(pageRef, { [cleanPath]: 1 });
    } else {
      await updateDoc(pageRef, {
        [cleanPath]: increment(1)
      });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

export const trackVisitorEntry = async (isAnonymous: boolean) => {
  try {
    const statsRef = doc(db, 'analytics', 'visitorStats');
    
    // Ensure document exists
    const docSnap = await getDoc(statsRef);
    if (!docSnap.exists()) {
      await setDoc(statsRef, { 
        totalVisitors: 1, 
        anonymousVisitors: isAnonymous ? 1 : 0,
        registeredUsers: isAnonymous ? 0 : 1
      });
    } else {
      await updateDoc(statsRef, {
        totalVisitors: increment(1),
        [isAnonymous ? 'anonymousVisitors' : 'registeredUsers']: increment(1)
      });
    }
  } catch (error) {
    console.error('Error tracking visitor entry:', error);
  }
};
