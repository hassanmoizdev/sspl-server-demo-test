import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 * This will be called once when the server starts
 */
export function initializeFirebase(): admin.app.App | null {
  try {
    // Check if already initialized
    if (firebaseApp) {
      return firebaseApp;
    }

    // Load from environment variable (JSON string)
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountJson) {
      // Initialize from JSON string
      const serviceAccount = JSON.parse(serviceAccountJson);
      
      // Validate it's a service account
      if (!serviceAccount.type || serviceAccount.type !== 'service_account') {
        console.warn('⚠️  Invalid Firebase service account JSON.');
        console.warn('   Push notifications will be disabled.');
        return null;
      }

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized from environment variable');
    } else {
      console.warn('⚠️  Firebase credentials not configured. Push notifications will be disabled.');
      console.warn('   Set FIREBASE_SERVICE_ACCOUNT_JSON in .env');
      return null;
    }

    return firebaseApp;
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    console.warn('   Push notifications will be disabled.');
    return null;
  }
}

/**
 * Get Firebase Messaging instance
 */
export function getMessaging(): admin.messaging.Messaging | null {
  try {
    if (!firebaseApp) {
      firebaseApp = initializeFirebase();
    }
    
    if (!firebaseApp) {
      return null;
    }

    return admin.messaging(firebaseApp);
  } catch (error) {
    console.error('Failed to get Firebase Messaging instance:', error);
    return null;
  }
}

export default { initializeFirebase, getMessaging };
