/** True when the stored value is a backend JWT (not a dev placeholder). */
export const isValidJwtToken = (token: string | null | undefined): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  if (token.startsWith('dev_')) {
    return false;
  }
  return token.length > 20;
};

export const isDevToken = (token: string | null | undefined): boolean =>
  typeof token === 'string' && token.startsWith('dev_');

/** Any token that keeps the user signed in (JWT or dev session). */
export const hasAuthToken = (token: string | null | undefined): boolean =>
  isValidJwtToken(token) || isDevToken(token);
