import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import storage from './inMemoryStorage';
import api from './api';
import { isValidJwtToken } from './authToken';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './storageKeys';
import { ApiResponse, AuthResponse, User } from './types';

const parseGoogleLoginResponse = (data: Record<string, unknown>): AuthResponse | null => {
  const token =
    (data.token as string | undefined) ||
    (data.access_token as string | undefined) ||
    (data.jwt as string | undefined);
  const user =
    (data.user as User | undefined) ||
    ((data.data as { user?: User } | undefined)?.user);

  if (!isValidJwtToken(token) || !user) {
    return null;
  }
  return { token: token!, user };
};

const WEB_CLIENT_ID = '549158712104-3gigo7j35g5hurv74u2a6l12qff8rdk2.apps.googleusercontent.com';
let isGoogleSignInConfigured = false;

const configureGoogleSignIn = () => {
  if (!isGoogleSignInConfigured) {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID, // Must be the WEB client ID!
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      scopes: ['profile', 'email'],
    });
    isGoogleSignInConfigured = true;
    console.log('Google Sign-In configured with webClientId:', WEB_CLIENT_ID);
  }
};

export const googleAuthService = {
  /**
   * Sign in with Google and authenticate with backend
   */
  signInWithGoogle: async (): Promise<ApiResponse<AuthResponse>> => {
    try {
      console.log('Starting Google Sign-In...');

      configureGoogleSignIn();

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In successful:', userInfo);

      // Get ID token from Google
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;

      if (!idToken) {
        return { success: false, message: 'Failed to get ID token from Google' };
      }

      // Create Firebase credential
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase
      const firebaseUserCredential = await auth().signInWithCredential(googleCredential);
      console.log('Firebase Sign-In successful:', firebaseUserCredential.user.email);

      // Get Firebase ID token to send to backend
      const firebaseToken = await firebaseUserCredential.user.getIdToken();
      console.log('Firebase ID token obtained');

      console.log('Sending tokens to backend: /login/google');
      try {
        const response = await api.post<Record<string, unknown>>('/login/google', {
          idToken,
          firebaseToken,
        });
        const session = parseGoogleLoginResponse(response.data);
        if (session) {
          await storage.setItem(AUTH_TOKEN_KEY, session.token);
          await storage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
          return { success: true, data: session };
        }
        const message =
          (response.data.message as string | undefined) ||
          'Google sign-in succeeded but the server did not return a valid session. Try email login.';
        return { success: false, message };
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        console.log('Backend Google login failed:', axiosError.response?.data || err);
        return {
          success: false,
          message:
            axiosError.response?.data?.message ||
            'Failed to connect to the server. Check your connection and try again.',
        };
      }
    } catch (error: any) {
      console.log('Google Sign-In error:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      console.log('Error request:', error.request);
      console.log('Error response:', error.response);

      // Handle specific error codes
      if (error.code === 'SIGN_IN_CANCELLED') {
        return { success: false, message: 'Sign in was cancelled' };
      } else if (error.code === 'IN_PROGRESS') {
        return { success: false, message: 'Sign in already in progress' };
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        return { success: false, message: 'Google Play Services not available' };
      } else if (error.code === 'DEVELOPER_ERROR') {
        console.log('DEVELOPER_ERROR: Check these common causes:');
        console.log('1. SHA-1 fingerprint not registered in Google Cloud Console');
        console.log('2. Package name mismatch (should be: com.appdev)');
        console.log('3. Web Client ID is incorrect');
        console.log('4. Google Sign-In API not enabled');
        console.log('Configured webClientId:', WEB_CLIENT_ID);
        return {
          success: false,
          message: 'Google Sign-In configuration error. Verify the Android app SHA-1 and OAuth web client ID in Firebase/Google Cloud Console.'
        };
      }

      return {
        success: false,
        message: error?.message || 'Google Sign-In failed'
      };
    }
  },

  /**
   * Sign out from Google and Firebase
   */
  signOut: async (): Promise<void> => {
    try {
      // Sign out from Google
      await GoogleSignin.signOut();
      // Sign out from Firebase
      await auth().signOut();
      // Clear local storage
      await storage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
      console.log('Google Sign-Out successful');
    } catch (error) {
      console.log('Google Sign-Out error:', error);
    }
  },

  /**
   * Check if user is currently signed in (using Firebase)
   */
  isSignedIn: (): boolean => {
    return !!auth().currentUser;
  },

  /**
   * Get current Firebase user
   */
  getCurrentUser: () => {
    return auth().currentUser;
  },

  /**
   * Debug: Check Google Play Services availability and configuration
   */
  checkPlayServices: async (): Promise<boolean> => {
    try {
      configureGoogleSignIn();
      console.log('Checking Google Play Services...');
      const available = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: false });
      console.log('Google Play Services available:', available);
      return available;
    } catch (error: any) {
      console.log('Google Play Services check failed:', error);
      return false;
    }
  },

  /**
   * Debug: Get current user info if signed in
   */
  getCurrentGoogleUser: async () => {
    try {
      configureGoogleSignIn();
      const user = await GoogleSignin.getCurrentUser();
      console.log('Current Google user:', user);
      return user;
    } catch (error: any) {
      console.log('Get current user failed:', error);
      return null;
    }
  },
};

export default googleAuthService;
