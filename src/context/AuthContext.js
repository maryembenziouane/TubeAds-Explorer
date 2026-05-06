// Cross-platform auth: same Firebase Auth project as the React Native app,
// so a user signed in on mobile can sign in on web with the same credentials
// and immediately see their UID-scoped data (favorites, chat threads, orders).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext({
  user: null,
  ready: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return off;
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
      signUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
      signOut: () => fbSignOut(auth),
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
