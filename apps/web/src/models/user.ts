// RIGVERSE — User & Session Data Models

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  displayName: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  currency: 'INR';
  region: 'IN';
  reducedMotion: boolean;
  autoSaveBuilds: boolean;
  emailAlerts: boolean;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SavedBuild {
  id: string;
  buildId: string;
  title: string;
  isPublic: boolean;
  shareSlug?: string;
  thumbnailUrl?: string;
  createdAt: Date;
}