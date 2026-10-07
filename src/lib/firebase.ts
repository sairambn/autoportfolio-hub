import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocFromServer,
  type Unsubscribe,
} from "firebase/firestore";
import firebaseConfig from "./firebase-config";

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Firestore connection on boot (Skill requirement)
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore connection check: client is offline or initializing.");
    }
  }
}
if (typeof window !== "undefined") {
  testFirestoreConnection();
}

// Error handling conforming to Firebase skill specs
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfileDoc {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  provider: string;
  bio?: string;
  githubUsername?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface FirebasePortfolioDoc {
  id: string;
  userId: string;
  slug: string;
  title: string;
  published: boolean;
  github_repo: string | null;
  auto_push: boolean;
  last_pushed_at: string | null;
  content: unknown;
  theme: unknown;
  sections: unknown;
  createdAt: string;
  updatedAt: string;
}

/** Authenticate using Real Google OAuth via Firebase Popup */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Persist real user profile in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userDocRef);

    const now = new Date().toISOString();
    const profileData: UserProfileDoc = {
      id: user.uid,
      email: user.email || "",
      name: user.displayName || user.email?.split("@")[0] || "User",
      avatarUrl: user.photoURL || "",
      provider: "google.com",
      createdAt: existingSnap.exists() ? (existingSnap.data().createdAt as string) || now : now,
      lastLoginAt: now,
    };

    await setDoc(userDocRef, profileData, { merge: true });
    return user;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw error;
  }
}

/** Authenticate using Real GitHub OAuth via Firebase Popup */
export async function signInWithGithub(): Promise<FirebaseUser> {
  const provider = new GithubAuthProvider();
  provider.addScope("read:user");
  provider.addScope("user:email");
  provider.addScope("public_repo");

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userDocRef);

    const now = new Date().toISOString();
    const profileData: UserProfileDoc = {
      id: user.uid,
      email: user.email || "",
      name: user.displayName || user.email?.split("@")[0] || "Developer",
      avatarUrl: user.photoURL || "",
      provider: "github.com",
      createdAt: existingSnap.exists() ? (existingSnap.data().createdAt as string) || now : now,
      lastLoginAt: now,
    };

    await setDoc(userDocRef, profileData, { merge: true });
    return user;
  } catch (error) {
    console.error("GitHub sign in error:", error);
    throw error;
  }
}

/** Subscribe to realtime User Profile Document */
export function subscribeUserProfile(
  userId: string,
  onUpdate: (profile: UserProfileDoc | null) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const path = `users/${userId}`;
  const docRef = doc(db, "users", userId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as UserProfileDoc);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    },
  );
}

/** Update user profile fields */
export async function updateUserProfile(
  userId: string,
  patch: Partial<Omit<UserProfileDoc, "id" | "email" | "createdAt">>,
) {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, { ...patch, lastLoginAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/** Subscribe to user's portfolios in Firestore */
export function subscribeUserPortfolios(
  userId: string,
  onUpdate: (portfolios: FirebasePortfolioDoc[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const path = `users/${userId}/portfolios`;
  const collRef = collection(db, "users", userId, "portfolios");
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: FirebasePortfolioDoc[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<FirebasePortfolioDoc, "id">) });
      });
      items.sort(
        (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
      );
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    },
  );
}

/** Create or update a portfolio in Firestore */
export async function savePortfolioToFirestore(userId: string, portfolio: FirebasePortfolioDoc) {
  const path = `users/${userId}/portfolios/${portfolio.id}`;
  try {
    const docRef = doc(db, "users", userId, "portfolios", portfolio.id);
    await setDoc(docRef, portfolio, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/** Delete portfolio from Firestore */
export async function deletePortfolioFromFirestore(userId: string, portfolioId: string) {
  const path = `users/${userId}/portfolios/${portfolioId}`;
  try {
    const docRef = doc(db, "users", userId, "portfolios", portfolioId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/** Sign out */
export async function signOutUser() {
  await fbSignOut(auth);
}

export { onAuthStateChanged };
