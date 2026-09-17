import { TestAccount, Platform } from '../types';
import { getCurrentUserSync } from './authService';

const ACCOUNTS_STORAGE_PREFIX = 'ctl_user_accounts_v2_';
const ACTIVE_ACCOUNT_PREFIX = 'ctl_user_active_account_v2_';

const INITIAL_TEST_ACCOUNTS: TestAccount[] = [
  {
    id: 'acc_yt_01',
    platform: 'youtube',
    email: 'yt_research_temp@testlab.io',
    username: 'algo_explorer_yt',
    displayName: 'YouTube Algorithm Scout',
    bio: 'Dedicated test channel exploring technical programming retention curves and short-form pacing.',
    notes: 'Used specifically for short-form retention experiments and lifestyle hook evaluation.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    mode: 'manual',
    isActive: true,
    status: 'connected',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'acc_ig_02',
    platform: 'instagram',
    email: 'ig_scout_clean@testlab.io',
    username: 'creator_lab_test',
    displayName: 'Instagram Reels Lab',
    bio: 'Unbiased clean-slate test account for testing video hooks and visual shock openings.',
    notes: 'Kept isolated from personal Google subscriptions so recommendations stay unskewed.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    mode: 'manual',
    isActive: false,
    status: 'connected',
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'acc_fb_03',
    platform: 'facebook',
    email: 'fb_tester_feed@testlab.io',
    username: 'meta_testing_bench',
    displayName: 'Facebook Watch Monitor',
    bio: 'Observational test account tracking broad-audience video retention and community discussions.',
    notes: 'Focus on middle-funnel video shares and comment thread debates.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    mode: 'manual',
    isActive: false,
    status: 'connected',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'acc_tg_04',
    platform: 'telegram',
    email: 'tg_intel_bot@testlab.io',
    username: 'tg_feed_monitor',
    displayName: 'Telegram Channel Scout',
    bio: 'Channel monitor observing broadcast announcements, news speed, and developer updates.',
    notes: 'Used to benchmark instant broadcast engagement and community commentary.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    mode: 'manual',
    isActive: false,
    status: 'connected',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1,
  },
];

function getStorageKey(uid?: string): string {
  const userId = uid || getCurrentUserSync().uid;
  return `${ACCOUNTS_STORAGE_PREFIX}${userId}`;
}

function getActiveKey(uid?: string): string {
  const userId = uid || getCurrentUserSync().uid;
  return `${ACTIVE_ACCOUNT_PREFIX}${userId}`;
}

export async function getTestAccounts(uid?: string): Promise<TestAccount[]> {
  try {
    const key = getStorageKey(uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to get test accounts:', err);
  }

  // Seed default accounts
  const key = getStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(INITIAL_TEST_ACCOUNTS));
  localStorage.setItem(getActiveKey(uid), INITIAL_TEST_ACCOUNTS[0].id);
  return INITIAL_TEST_ACCOUNTS;
}

export async function getTestAccountById(id: string, uid?: string): Promise<TestAccount | null> {
  const accounts = await getTestAccounts(uid);
  return accounts.find((a) => a.id === id) || null;
}

export async function saveTestAccount(account: TestAccount, uid?: string): Promise<TestAccount> {
  const accounts = await getTestAccounts(uid);
  const now = Date.now();
  const updatedAccount = {
    ...account,
    updatedAt: now,
    createdAt: account.createdAt || now,
  };

  const existingIdx = accounts.findIndex((a) => a.id === account.id);
  if (existingIdx >= 0) {
    accounts[existingIdx] = updatedAccount;
  } else {
    accounts.push(updatedAccount);
  }

  // If set to active, unset others
  if (updatedAccount.isActive) {
    accounts.forEach((a) => {
      if (a.id !== updatedAccount.id) a.isActive = false;
    });
    localStorage.setItem(getActiveKey(uid), updatedAccount.id);
  }

  const key = getStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(accounts));
  return updatedAccount;
}

export const createTestAccount = saveTestAccount;
export const updateTestAccount = saveTestAccount;

export async function deleteTestAccount(id: string, uid?: string): Promise<void> {
  const accounts = await getTestAccounts(uid);
  const filtered = accounts.filter((a) => a.id !== id);
  const key = getStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(filtered));

  const activeKey = getActiveKey(uid);
  if (localStorage.getItem(activeKey) === id && filtered.length > 0) {
    filtered[0].isActive = true;
    localStorage.setItem(activeKey, filtered[0].id);
    localStorage.setItem(key, JSON.stringify(filtered));
  }
}

export async function getActiveAccount(uid?: string): Promise<TestAccount | null> {
  const accounts = await getTestAccounts(uid);
  if (accounts.length === 0) return null;

  const activeId = localStorage.getItem(getActiveKey(uid));
  if (activeId) {
    const found = accounts.find((a) => a.id === activeId);
    if (found) return found;
  }

  const firstActive = accounts.find((a) => a.isActive);
  if (firstActive) return firstActive;

  return accounts[0] || null;
}

export async function setActiveAccount(id: string, uid?: string): Promise<void> {
  const accounts = await getTestAccounts(uid);
  accounts.forEach((a) => {
    a.isActive = a.id === id;
  });
  localStorage.setItem(getActiveKey(uid), id);
  localStorage.setItem(getStorageKey(uid), JSON.stringify(accounts));
}
