// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,
         signInWithPopup,
         GoogleAuthProvider,
         onAuthStateChanged,
         User, 
       } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2tjHsSMvsHAr6lO8iUMFejLach0ISyVM",
  authDomain: "yt-clone-976f7.firebaseapp.com",
  projectId: "yt-clone-976f7",
  appId: "1:968262942835:web:67a6fbddfa587374ea6a06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

/**
 *  Signs the user in with a Google popup.
 *  @returns A promise that resolves with the user's credentials.
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 *  Signs the user out.
 *  @returns A promise that resolves when the user is signed out.
 */

export function signOut() {
    return auth.signOut();
}

/**
 *  Trigger a callback when user auth state changes.
 *  @returns a function to unsubscribe callback.
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}