'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Throwing the error here will cause it to be caught by Next.js's
      // development error overlay, which is what we want.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);
  }, []);

  return null; // This component doesn't render anything
}
