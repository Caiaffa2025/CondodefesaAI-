importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// These values are injected at runtime or can be hardcoded here.
// For the service worker, we need the basic config.
firebase.initializeApp({
  apiKey: "AIzaSyCn1WTWO_ChhrbxkBGzK_RQ-PidTXNeeYM",
  authDomain: "gen-lang-client-0332084757.firebaseapp.com",
  projectId: "gen-lang-client-0332084757",
  storageBucket: "gen-lang-client-0332084757.firebasestorage.app",
  messagingSenderId: "856837536102",
  appId: "1:856837536102:web:02b0764b98dd9e5827f0a7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
