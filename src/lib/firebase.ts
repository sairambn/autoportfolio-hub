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
  collectionGroup,
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
  username?: string;
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

// In-memory token cache for Google Workspace integration (Mandatory: do not store in localStorage)
let cachedGoogleAccessToken: string | null = null;

export function getCachedGoogleAccessToken(): string | null {
  return cachedGoogleAccessToken;
}

export function setCachedGoogleAccessToken(token: string | null) {
  cachedGoogleAccessToken = token;
}

if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedGoogleAccessToken = null;
    }
  });
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
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedGoogleAccessToken = credential.accessToken;
    }

    // Persist real user profile in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userDocRef);

    const now = new Date().toISOString();
    const profileData: UserProfileDoc = {
      id: user.uid,
      email: user.email || "",
      name: resolveUserDisplayName(user.email, user.displayName),
      username: resolveUsername(user.email),
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

/** Authenticate or escalate permissions for Google Workspace Sheets & Drive */
export async function signInWithGoogleWorkspace(): Promise<{
  user: FirebaseUser;
  accessToken: string;
}> {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  provider.addScope("https://www.googleapis.com/auth/spreadsheets");
  provider.addScope("https://www.googleapis.com/auth/drive.file");
  provider.setCustomParameters({ prompt: "consent" });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || null;

    if (!accessToken) {
      throw new Error(
        "Could not acquire Google Workspace access token. Please grant permissions in the Google dialog.",
      );
    }

    cachedGoogleAccessToken = accessToken;

    const userDocRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userDocRef);

    const now = new Date().toISOString();
    const profileData: UserProfileDoc = {
      id: user.uid,
      email: user.email || "",
      name: resolveUserDisplayName(user.email, user.displayName),
      username: resolveUsername(user.email),
      avatarUrl: user.photoURL || "",
      provider: "google.com",
      createdAt: existingSnap.exists() ? (existingSnap.data().createdAt as string) || now : now,
      lastLoginAt: now,
    };

    await setDoc(userDocRef, profileData, { merge: true });
    return { user, accessToken };
  } catch (error) {
    console.error("Google Workspace OAuth error:", error);
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

    const resolvedUsername = resolveUsername(user.email, screenName);
    const resolvedDisplayName = resolveUserDisplayName(
      user.email,
      user.displayName || resolvedUsername,
    );

    const userDocRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userDocRef);

    const now = new Date().toISOString();
    const profileData: UserProfileDoc = {
      id: user.uid,
      email: user.email || "",
      name: resolvedDisplayName,
      username: resolvedUsername,
      avatarUrl: user.photoURL || "",
      provider: "github.com",
      githubUsername: resolvedUsername,
      createdAt: existingSnap.exists() ? (existingSnap.data().createdAt as string) || now : now,
      lastLoginAt: now,
    };

    await setDoc(userDocRef, profileData, { merge: true });
    return {
      user,
      accessToken,
      githubUsername: resolvedUsername,
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
      name: resolveUserDisplayName(cleanEmail, user.displayName),
      username: resolveUsername(cleanEmail),
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
      return await signUpWithEmail(cleanEmail, pass, "bnsairam");
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
    const finalDisplayName = resolveUserDisplayName(cleanEmail, displayName || user.displayName);
    if (finalDisplayName) {
      try {
        await updateProfile(user, { displayName: finalDisplayName });
      } catch {
        // non-blocking
      }
    }

    const userDocRef = doc(db, "users", user.uid);
    const now = new Date().toISOString();
    const profileData: UserProfileDoc = {
      id: user.uid,
      email: user.email || cleanEmail,
      name: finalDisplayName,
      username: resolveUsername(cleanEmail),
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
        const data = snapshot.data() as UserProfileDoc;
        const normalizedName = resolveUserDisplayName(data.email, data.name);
        const normalizedUsername = resolveUsername(
          data.email,
          data.username || data.githubUsername,
        );
        onUpdate({
          ...data,
          name: normalizedName,
          username: normalizedUsername,
        });
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
    // Non-blocking sync to global placement candidate registry for admin overview
    syncPortfolioToPlacementCandidate(userId, portfolio).catch((err) => {
      console.warn("Non-blocking candidate sync warning:", err);
    });
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
  cachedGoogleAccessToken = null;
  await fbSignOut(auth);
}

export { onAuthStateChanged };

/**
 * -------------------------------------------------------------
 * Executive Portfolio & Candidate Talent Suite (Admin Suite)
 * Designed for bnsairam14@gmail.com to track created portfolios,
 * graduation departments, batches, and candidate analytics.
 * -------------------------------------------------------------
 */

export const PRIMARY_ADMIN_EMAIL = "bnsairam14@gmail.com";
export const PRIMARY_ADMIN_USERNAME = "bnsairam";

/** Resolve clean display name, defaulting to bnsairam for the placement administrator */
export function resolveUserDisplayName(email?: string | null, rawName?: string | null): string {
  const cleanEmail = email?.trim().toLowerCase() || "";
  if (cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() || cleanEmail === "sdesairam@gmail.com") {
    if (
      rawName &&
      rawName !== "bnsairam14" &&
      rawName !== "bnsairam14@gmail.com" &&
      rawName !== "User" &&
      rawName !== "Developer"
    ) {
      return rawName;
    }
    return PRIMARY_ADMIN_USERNAME;
  }
  return rawName || (email ? email.split("@")[0] : "User");
}

/** Resolve username handle, defaulting to bnsairam for the placement administrator */
export function resolveUsername(email?: string | null, rawUsername?: string | null): string {
  const cleanEmail = email?.trim().toLowerCase() || "";
  if (cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() || cleanEmail === "sdesairam@gmail.com") {
    return PRIMARY_ADMIN_USERNAME;
  }
  if (rawUsername && rawUsername.trim()) {
    return rawUsername
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
  }
  return email ? email.split("@")[0] : "user";
}

/** Check if current user is the placement administrator */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === PRIMARY_ADMIN_EMAIL.toLowerCase() || clean === "sdesairam@gmail.com";
}

export interface PlacementCandidateDoc {
  id: string; // matches portfolioId or candidateId
  portfolioId: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  department: string; // e.g. "Computer Science & Engineering", "Information Technology", "AI & Data Science"
  batch: string; // e.g. "2025", "2026", "2027", "2024"
  college: string;
  title: string;
  slug: string;
  published: boolean;
  github_repo: string | null;
  skills: string[];
  projectsCount: number;
  readinessScore: number; // 0 - 100
  placementStatus:
    "Placed" | "Interviewing" | "Ready for Referral" | "Review Pending" | "Profile In Progress";
  placedCompany?: string; // e.g. "Google", "Amazon", "Microsoft", "Infosys"
  placedPackage?: string; // e.g. "32 LPA", "24 LPA"
  targetRole?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Calculate portfolio readiness index based on industry recruitment standards */
export function calculateReadinessScore(portfolio: FirebasePortfolioDoc): number {
  let score = 0;
  const content = portfolio.content as {
    name?: string;
    headline?: string;
    bio?: string;
    skills?: string[];
    projects?: unknown[];
    experience?: unknown[];
    contact?: { email?: string; github?: string; linkedin?: string };
  };

  if (!content) return 20;

  if (content.name && content.name.trim().length > 2) score += 15;
  if (content.headline && content.headline.trim().length > 5) score += 10;
  if (content.bio && content.bio.trim().length > 30) score += 10;
  if (Array.isArray(content.skills) && content.skills.length >= 3) score += 15;
  if (Array.isArray(content.projects) && content.projects.length >= 1) score += 20;
  if (Array.isArray(content.projects) && content.projects.length >= 2) score += 10;
  if (content.contact?.email || content.contact?.github || content.contact?.linkedin) score += 10;
  if (portfolio.published || portfolio.github_repo) score += 10;

  return Math.min(100, score);
}

/** Infer academic department from skills and education */
export function inferDepartment(skills: string[] = []): string {
  const text = skills.join(" ").toLowerCase();
  if (
    text.includes("ai") ||
    text.includes("machine learning") ||
    text.includes("data science") ||
    text.includes("pytorch")
  ) {
    return "Artificial Intelligence & Data Science";
  }
  if (
    text.includes("embedded") ||
    text.includes("iot") ||
    text.includes("verilog") ||
    text.includes("vlsi") ||
    text.includes("arduino")
  ) {
    return "Electronics & Communication Engineering";
  }
  if (
    text.includes("cloud") ||
    text.includes("aws") ||
    text.includes("devops") ||
    text.includes("kubernetes")
  ) {
    return "Information Technology";
  }
  return "Computer Science & Engineering";
}

/** Synchronize a portfolio document to the global placement directory */
export async function syncPortfolioToPlacementCandidate(
  userId: string,
  portfolio: FirebasePortfolioDoc,
  userEmail?: string,
) {
  try {
    const candidateDocRef = doc(db, "placement_candidates", portfolio.id);
    const existingSnap = await getDoc(candidateDocRef);
    const existingData = existingSnap.exists()
      ? (existingSnap.data() as PlacementCandidateDoc)
      : null;

    const content = portfolio.content as {
      name?: string;
      skills?: string[];
      projects?: unknown[];
      contact?: { email?: string };
    };

    const skills = Array.isArray(content?.skills) ? content.skills : [];
    const readiness = calculateReadinessScore(portfolio);
    const now = new Date().toISOString();

    const candidateDoc: PlacementCandidateDoc = {
      id: portfolio.id,
      portfolioId: portfolio.id,
      userId,
      candidateName: content?.name?.trim() || existingData?.candidateName || "Student Candidate",
      candidateEmail: content?.contact?.email || userEmail || existingData?.candidateEmail || "",
      department: existingData?.department || inferDepartment(skills),
      batch: existingData?.batch || "2025",
      college: existingData?.college || "Institute of Technology",
      title: portfolio.title || "Engineering Portfolio",
      slug: portfolio.slug,
      published: portfolio.published || false,
      github_repo: portfolio.github_repo || null,
      skills,
      projectsCount: Array.isArray(content?.projects) ? content.projects.length : 0,
      readinessScore: readiness,
      placementStatus:
        existingData?.placementStatus ||
        (readiness >= 75 ? "Ready for Referral" : "Review Pending"),
      placedCompany: existingData?.placedCompany || "",
      placedPackage: existingData?.placedPackage || "",
      targetRole: existingData?.targetRole || "Software Development Engineer (SDE-1)",
      notes: existingData?.notes || "",
      createdAt: existingData?.createdAt || now,
      updatedAt: now,
    };

    await setDoc(candidateDocRef, candidateDoc, { merge: true });

    // Also update global metrics counter
    const metricsRef = doc(db, "global_stats", "metrics");
    const metricsSnap = await getDoc(metricsRef);
    const totalCount =
      (metricsSnap.exists() ? metricsSnap.data().totalPortfolios || 0 : 0) +
      (existingSnap.exists() ? 0 : 1);
    await setDoc(
      metricsRef,
      {
        totalPortfolios: Math.max(1, totalCount),
        lastUpdated: now,
      },
      { merge: true },
    );
  } catch (err) {
    console.warn("Failed to sync placement candidate record:", err);
  }
}

/** Subscribe to placement candidates in real-time */
export function subscribePlacementCandidates(
  onUpdate: (candidates: PlacementCandidateDoc[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const collRef = collection(db, "placement_candidates");
  return onSnapshot(
    collRef,
    (snapshot) => {
      const list: PlacementCandidateDoc[] = [];
      snapshot.forEach((snap) => {
        list.push({ id: snap.id, ...(snap.data() as Omit<PlacementCandidateDoc, "id">) });
      });
      // Sort by updated descending
      list.sort(
        (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
      );
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      console.warn("Error listening to placement candidates:", error);
    },
  );
}

/** Update placement candidate status and company notes */
export async function updateCandidatePlacementDetails(
  candidateId: string,
  patch: Partial<PlacementCandidateDoc>,
) {
  const candidateDocRef = doc(db, "placement_candidates", candidateId);
  await updateDoc(candidateDocRef, {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

/** Manually register a candidate in the placement directory */
export async function createDirectPlacementCandidate(
  candidate: Omit<PlacementCandidateDoc, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const id = `cand-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const candidateDocRef = doc(db, "placement_candidates", id);
  const now = new Date().toISOString();
  await setDoc(candidateDocRef, {
    ...candidate,
    id,
    portfolioId: id,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}
