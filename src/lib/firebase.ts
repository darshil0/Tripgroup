import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface AppError {
  message: string;
  code?: string;
  operation?: OperationType;
  raw?: any;
}

export function handleAppError(error: unknown, operation?: OperationType): AppError {
  console.error('App Error:', error);

  if (error instanceof Error) {
    if (error.message.includes('permission-denied')) {
      return { message: "Access Denied: You don't have permission for this action.", code: 'PERMISSION_DENIED', operation };
    }
    if (error.message.includes('not-found')) {
      return { message: "Resource not found.", code: 'NOT_FOUND', operation };
    }
    return { message: error.message, operation, raw: error };
  }

  return { message: String(error), operation, raw: error };
}

// Deprecated - kept for compatibility during migration
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const err = handleAppError(error, operationType);
  throw new Error(JSON.stringify(err));
}
