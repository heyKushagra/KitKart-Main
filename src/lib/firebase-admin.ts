import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Format private key properly if set in environment variables (replacing escaped newlines)
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('[Firebase Admin] Successfully initialized Firebase Admin SDK');
    } catch (error) {
      console.error('[Firebase Admin] Error initializing Firebase Admin SDK:', error);
    }
  } else {
    console.warn(
      '[Firebase Admin] Missing environment variables for Firebase Admin SDK initialization. Please check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local.'
    );
  }
}

export const adminDb = getApps().length ? getFirestore() : null;
