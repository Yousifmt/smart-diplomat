//src\providers\auth-provider.tsx
'use client';

import { createContext, useContext } from 'react';
import type { UserProfile } from '@/lib/types';
import type { User } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Mock user data since we are removing real authentication for now.
const mockUser: User = {
  uid: 'mock-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'password',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    expirationTime: '',
    authTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
};

const mockUserProfile: UserProfile = {
  uid: 'mock-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'Admin',
  defaultCountry: 'US',
  language: 'en',
  onboardingComplete: true,
  createdAt: {} as any, // Mock timestamp
};


type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // All auth and routing logic removed as per request.
  // We provide a mock user to prevent other components from breaking.

  const value = {
    user: mockUser,
    userProfile: mockUserProfile,
    loading: false,
  };

  return (
    <AuthContext.Provider value={value}>
      <FirebaseErrorListener />
      {children}
    </AuthContext.Provider>
  );
}
