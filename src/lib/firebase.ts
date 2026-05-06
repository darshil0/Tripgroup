import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, Timestamp } from 'firebase/firestore';
import firebaseConfigFile from '../../firebase-applet-config.json';

// Support both environment variables and the config file
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFile.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFile.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFile.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFile.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigFile.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFile.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFile.messagingSenderId,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

/**
 * Normalizes Firestore data by converting all Timestamps to numbers (ms) recursively.
 */
export function normalizeData<T>(data: any): T {
  if (!data || typeof data !== 'object') return data;
  
  if (data instanceof Timestamp) {
    return data.toMillis() as any;
  }

  // Handle plain objects that look like Timestamps
  if ('seconds' in data && 'nanoseconds' in data && Object.keys(data).length === 2) {
    try {
      return new Timestamp(data.seconds, data.nanoseconds).toMillis() as any;
    } catch {
      // Not a real timestamp, proceed
    }
  }

  if (Array.isArray(data)) {
    return data.map(item => normalizeData(item)) as any;
  }

  const result: any = {};
  for (const key in data) {
    result[key] = normalizeData(data[key]);
  }
  return result as T;
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  
  // Predictable error message for logging and UI consumption
  const message = `[FirestoreError] ${operationType.toUpperCase()} on ${path || 'unknown'}: ${errInfo.error}`;
  console.error(message, errInfo);
  
  // Throwing a standardized error object
  const finalError = new Error(message);
  (finalError as any).details = errInfo;
  throw finalError;
}
