import Cookies from 'js-cookie';

/**
 * Token Storage Utilities using js-cookie
 *
 * Security Model:
 * - Tokens stored in cookies with security flags
 * - Secure flag: only transmitted over HTTPS (in production)
 * - SameSite: 'strict' to prevent CSRF attacks
 * - Domain-scoped for better security
 *
 * Cookie Names:
 * - accessToken: Short-lived (15 minutes)
 * - refreshToken: Long-lived (7 days)
 */

const COOKIE_CONFIG = {
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const, // CSRF protection
  path: '/', // Available across entire app
};

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Get access token from cookies
 */
export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

/**
 * Set access token in cookies (15 minutes expiry)
 */
export const setAccessToken = (token: string) => {
  Cookies.set(ACCESS_TOKEN_KEY, token, {
    ...COOKIE_CONFIG,
    expires: 1 / 96, // 15 minutes (1/96 of a day)
  });
};

/**
 * Get refresh token from cookies
 */
export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

/**
 * Set refresh token in cookies (7 days expiry)
 */
export const setRefreshToken = (token: string) => {
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    ...COOKIE_CONFIG,
    expires: 7, // 7 days
  });
};

/**
 * Clear access token from cookies
 */
export const clearAccessToken = () => {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
};

/**
 * Clear refresh token from cookies
 */
export const clearRefreshToken = () => {
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
};

/**
 * Clear all authentication tokens
 */
export const clearTokens = () => {
  clearAccessToken();
  clearRefreshToken();
};

/**
 * Check if user has valid authentication tokens
 */
export const hasTokens = (): boolean => {
  return !!getAccessToken() && !!getRefreshToken();
};
