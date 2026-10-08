import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
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
  query,
  where,
  getDocs,
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

export interface GithubAuthResult {
  user: FirebaseUser;
  accessToken: string | null;
  githubUsername: string;
}

/** Authenticate using Real GitHub OAuth via Firebase Popup */
export async function signInWithGithub(): Promise<GithubAuthResult> {
  const provider = new GithubAuthProvider();
  provider.addScope("read:user");
  provider.addScope("user:email");
  provider.addScope("public_repo");
  provider.addScope("repo");
  provider.setCustomParameters({
    allow_signup: "true",
  });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const credential = GithubAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || null;

    // Extract GitHub login/username from auth provider metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData = result as any;
    const screenName =
      rawData?._tokenResponse?.screenName ||
      rawData?.additionalUserInfo?.username ||
      user.displayName?.replace(/\s+/g, "").toLowerCase() ||
      user.email?.split("@")[0] ||
      "developer";

    const userDocRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userDocRef);

    const now = new Date().toISOString();
    const profileData: UserProfileDoc = {
      id: user.uid,
      email: user.email || "",
      name: user.displayName || screenName || "Developer",
      avatarUrl: user.photoURL || "",
      provider: "github.com",
      githubUsername: screenName,
      createdAt: existingSnap.exists() ? (existingSnap.data().createdAt as string) || now : now,
      lastLoginAt: now,
    };

    await setDoc(userDocRef, profileData, { merge: true });
    return {
      user,
      accessToken,
      githubUsername: screenName,
    };
  } catch (error) {
    console.error("GitHub sign in error:", error);
    throw error;
  }
}

/** Authenticate using Email and Password via Firebase Auth */
export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const user = cred.user;

    const userDocRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userDocRef);
    const now = new Date().toISOString();
    const profileData: UserProfileDoc = {
      id: user.uid,
      email: user.email || cleanEmail,
      name: user.displayName || cleanEmail.split("@")[0] || "Developer",
      avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
      provider: "password",
      createdAt: existingSnap.exists() ? (existingSnap.data().createdAt as string) || now : now,
      lastLoginAt: now,
    };
    await setDoc(userDocRef, profileData, { merge: true });
    return user;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // Auto-provision if test account not yet registered
    if (
      (err?.code === "auth/user-not-found" || err?.code === "auth/invalid-credential") &&
      cleanEmail === "test@folio.dev"
    ) {
      return await signUpWithEmail(cleanEmail, pass, "Test User");
    }
    console.error("Email sign in error:", error);
    throw error;
  }
}

/** Register new user via Email and Password in Firebase Auth */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName?: string,
): Promise<FirebaseUser> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const user = cred.user;
    if (displayName) {
      try {
        await updateProfile(user, { displayName });
      } catch {
        // non-blocking
      }
    }

    const userDocRef = doc(db, "users", user.uid);
    const now = new Date().toISOString();
    const profileData: UserProfileDoc = {
      id: user.uid,
      email: user.email || cleanEmail,
      name: displayName || user.displayName || cleanEmail.split("@")[0] || "Developer",
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
      provider: "password",
      createdAt: now,
      lastLoginAt: now,
    };
    await setDoc(userDocRef, profileData, { merge: true });
    return user;
  } catch (error) {
    console.error("Email sign up error:", error);
    throw error;
  }
}

/** Pre-configured 1-Click Test & Demo Account */
export async function signInWithTestAccount(): Promise<FirebaseUser> {
  const TEST_EMAIL = "test@folio.dev";
  const TEST_PASS = "TestPassword123!";

  try {
    return await signInWithEmail(TEST_EMAIL, TEST_PASS);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === "auth/user-not-found" || error?.code === "auth/invalid-credential") {
      try {
        return await signUpWithEmail(TEST_EMAIL, TEST_PASS, "Test User");
      } catch (signupErr) {
        console.warn(
          "Could not register test account, falling back to anonymous session:",
          signupErr,
        );
      }
    }

    // High resilience fallback: if password auth is disabled or restricted in project, sign in anonymously
    try {
      const anon = await signInAnonymously(auth);
      const user = anon.user;
      const userDocRef = doc(db, "users", user.uid);
      const now = new Date().toISOString();
      const profileData: UserProfileDoc = {
        id: user.uid,
        email: TEST_EMAIL,
        name: "Test Developer",
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
        provider: "demo",
        createdAt: now,
        lastLoginAt: now,
      };
      await setDoc(userDocRef, profileData, { merge: true });
      return user;
    } catch {
      throw err;
    }
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

/** Get a single portfolio from Firestore */
export async function getPortfolioDocFromFirestore(
  userId: string,
  portfolioId: string,
): Promise<FirebasePortfolioDoc | null> {
  const path = `users/${userId}/portfolios/${portfolioId}`;
  try {
    const docRef = doc(db, "users", userId, "portfolios", portfolioId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<FirebasePortfolioDoc, "id">) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/** Find a portfolio by slug or ID for a user in Firestore */
export async function findPortfolioInFirestore(
  userId: string,
  slugOrId: string,
): Promise<FirebasePortfolioDoc | null> {
  if (!userId || !slugOrId) return null;
  const collRef = collection(db, "users", userId, "portfolios");
  try {
    // 1. Direct ID check
    const docRef = doc(db, "users", userId, "portfolios", slugOrId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as Omit<FirebasePortfolioDoc, "id">) };
    }

    // 2. Query by slug
    const q = query(collRef, where("slug", "==", slugOrId));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const match = querySnap.docs[0];
      return { id: match.id, ...(match.data() as Omit<FirebasePortfolioDoc, "id">) };
    }

    return null;
  } catch (error) {
    console.warn("Could not find portfolio in Firestore:", error);
    return null;
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
