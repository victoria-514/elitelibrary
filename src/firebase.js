import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0RouQ7YldfPlQy6_5t1fGJtCPpauBA1Y",
  authDomain: "elitelibrary-5bb30.firebaseapp.com",
  projectId: "elitelibrary-5bb30",
  storageBucket: "elitelibrary-5bb30.appspot.com",
  messagingSenderId: "44024935707",
  appId: "1:44024935707:web:303d877448d192f36e8fbe"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Firestore 초기화 후 persistence 설정 단 한 번만
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('⚠️ Persistence failed: Multiple tabs open.');
  } else if (err.code === 'unimplemented') {
    console.warn('❌ Persistence not supported on this browser.');
  }
});

export { db };
