/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';
import { name as appName } from './app.json';
import { handleBackgroundRemoteMessage } from './src/services/notificationService';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  await handleBackgroundRemoteMessage(remoteMessage);
});

const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ffb347',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2A2A2A',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#AAAAAA',
  },
};

const Root = () => (
  <SafeAreaProvider>
    <PaperProvider theme={paperTheme}>
      <App />
    </PaperProvider>
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => Root);
