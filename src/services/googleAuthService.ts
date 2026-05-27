import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import storage from './inMemoryStorage';
import api from './api';
import axios from 'axios';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from './storageKeys';
import { ApiResponse, AuthResponse } from './types';

const WEB_CLIENT_ID = '549158712104-3gigo7j35g5hurv74u2a6l12qff8rdk2.apps.googleusercontent.com';
let isGoogleSignInConfigured = false;

const configureGoogleSignIn = () => {
  if (!isGoogleSignInConfigured) {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
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

      // Send to backend for verification and get app JWT
      if (!userInfo.data?.user) {
        return { success: false, message: 'Failed to get user info from Google' };
      }

      console.log('Sending Google auth request to backend:', api.defaults.baseURL + '/staff/google/verify');
      let response;
      try {
        response = await api.post<AuthResponse>('/staff/google/verify', {
          id_token: idToken,
        });
      } catch (err: any) {
        console.log('Primary backend request failed:', err?.message || err);
        // If network error (no response), try emulator fallback host for Android emulators
        if (!err.response && api.defaults.baseURL) {
          try {
            const primary = api.defaults.baseURL as string;
            const fallback = primary.replace('192.168.1.20', '10.0.2.2');
            console.log('Attempting fallback backend URL:', fallback + '/staff/google/verify');
            response = await axios.post<AuthResponse>(fallback + '/staff/google/verify', {
              id_token: idToken,
            }, { timeout: 10000, headers: { 'Content-Type': 'application/json', Accept: 'application/ld+json' } });
          } catch (err2: any) {
            console.log('Fallback request also failed:', err2?.message || err2);
            throw err2;
          }
        } else {
          throw err;
        }
      }

      console.log('Backend auth response:', JSON.stringify(response.data, null, 2));

      // Store tokens same as regular login
      if (response.data.token) {
        await storage.setItem(AUTH_TOKEN_KEY, response.data.token);
        await storage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
        console.log('App token stored successfully');
        return { success: true, data: response.data };
      }

      return { success: false, message: 'Backend did not return token' };
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
