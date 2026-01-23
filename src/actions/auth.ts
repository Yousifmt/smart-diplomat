//src\actions\auth.ts
'use server';

import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';
import { db } from '@/lib/firebase/config';
import { ROLES, COUNTRIES, LANGUAGES } from '@/lib/constants';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const OnboardingSchema = z.object({
  uid: z.string(),
  role: z.enum(ROLES),
  defaultCountry: z.string().refine(val => COUNTRIES.some(c => c.code === val)),
  language: z.string().refine(val => LANGUAGES.some(l => l.code === val)),
});

export async function completeOnboarding(data: z.infer<typeof OnboardingSchema>) {
    const validatedData = OnboardingSchema.safeParse(data);
    if (!validatedData.success) {
        return { error: 'Invalid data provided.' };
    }

    const { uid, ...updateData } = validatedData.data;
    const userDocRef = doc(db, 'users', uid);
    const dataToSave = { ...updateData, onboardingComplete: true };

    updateDoc(userDocRef, dataToSave)
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

    return { success: true };
}

const CreateUserSchema = z.object({
    uid: z.string(),
    email: z.string().email(),
    displayName: z.string().nullable(),
});

export async function createUserProfile(data: z.infer<typeof CreateUserSchema>) {
    const validatedData = CreateUserSchema.safeParse(data);
    if (!validatedData.success) {
        return { error: 'Invalid user data.' };
    }

    const { uid, email, displayName } = validatedData.data;
    const userDocRef = doc(db, 'users', uid);
    const dataToSave = {
        uid: uid,
        email: email,
        displayName: displayName || email.split('@')[0],
        role: 'Analyst', // Default role
        defaultCountry: 'US', // Default country
        language: 'en', // Default language
        createdAt: serverTimestamp(),
        onboardingComplete: false,
    };

    setDoc(userDocRef, dataToSave)
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
        
    return { success: true };
}
