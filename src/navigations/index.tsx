import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import AuthNav from './AuthNav';
import MainNav from './MainNav';
import { loginSuccess, resetLogin } from '../app/reducers/auth';
import { authService } from '../services';
import { setUnauthorizedHandler } from '../services/api';
import mercureService from '../services/mercureService';
import notificationService from '../services/notificationService';
import orderWatchService from '../services/orderWatchService';

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#ffb347',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#333333',
    notification: '#ffb347',
  },
};

export default () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: any) => state.auth?.data != null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#121212', true);
    }
    StatusBar.setBarStyle('light-content', true);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(resetLogin());
    });
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;

    authService.restoreSession().then((session) => {
      if (mounted && session) {
        dispatch(loginSuccess(session));
      }
      if (mounted) {
        setIsReady(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (isLoggedIn) {
      mercureService.fetchSubscriberToken().then(() => {
        console.log('[Navigation] Mercure subscriber token fetched');
      });
      notificationService.initialize().then(() => {
        orderWatchService.start();
        console.log('[Navigation] Live order notifications started');
      }).catch((error) => {
        console.log('[Navigation] Push notification init failed:', error);
        orderWatchService.start();
      });
    } else {
      mercureService.destroy();
      notificationService.shutdown();
      orderWatchService.stop();
    }
  }, [isLoggedIn, isReady]);

  if (!isReady) {
    return (
      <View style={styles.bootContainer}>
        <ActivityIndicator size="large" color="#ffb347" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      {isLoggedIn ? <MainNav /> : <AuthNav />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  bootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});
