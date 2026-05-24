/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import App from './App';
import { name as appName } from './app.json';

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
  <PaperProvider theme={paperTheme}>
    <App />
  </PaperProvider>
);

AppRegistry.registerComponent(appName, () => Root);
