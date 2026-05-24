import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';

import AuthNav from './AuthNav';
import MainNav from './MainNav';

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
  const isLoggedIn = useSelector((state: any) => state.auth?.data != null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#121212', true);
    }
    StatusBar.setBarStyle('light-content', true);
  }, []);

  return (
    <NavigationContainer theme={DarkTheme}>
      {isLoggedIn ? <MainNav /> : <AuthNav />}
    </NavigationContainer>
  );
};