export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

const LOCAL_USER_KEY = 'ctl_current_user_v2';

const DEFAULT_USER: AuthUser = {
  uid: 'user_lab_primary_01',
  email: 'roneyavinashsingh@gmail.com',
  displayName: 'Lead Researcher',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  isAnonymous: false,
};

/**
 * Service to manage authenticated user session.
 */
export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const stored = localStorage.getItem(LOCAL_USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error fetching current user:', err);
  }
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(DEFAULT_USER));
  return DEFAULT_USER;
}

export function getCurrentUserSync(): AuthUser {
  try {
    const stored = localStorage.getItem(LOCAL_USER_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fallback
  }
  return DEFAULT_USER;
}

export async function setCurrentUser(user: AuthUser): Promise<void> {
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
}
