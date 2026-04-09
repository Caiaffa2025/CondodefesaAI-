import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance, db } from './firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';

// Replace with your actual VAPID key from Firebase Console -> Project Settings -> Cloud Messaging
// This is a public key.
const VAPID_KEY = 'BC_PLACEHOLDER_VAPID_KEY_FROM_FIREBASE_CONSOLE';

export async function requestNotificationPermission(userId: string) {
  try {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      console.warn('Notification API is not available.');
      return null;
    }
    
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        console.log('FCM Token:', token);
        // Store the token in the user's profile in Firestore
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token)
        });
        return token;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
      }
    } else {
      console.warn('Notification permission denied.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
  return null;
}

export async function onForegroundMessage() {
  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.warn('Firebase Messaging is not available in this environment.');
    return;
  }
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    if (payload.notification) {
      toast.info(payload.notification.title, {
        description: payload.notification.body,
        action: {
          label: 'Ver',
          onClick: () => {
            // Handle notification click, e.g., navigate to the case
            if (payload.data?.caseId) {
              window.location.href = `/caso/${payload.data.caseId}`;
            }
          }
        }
      });
    }
  });
}
