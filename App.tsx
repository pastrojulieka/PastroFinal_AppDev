import { StatusBar, useColorScheme } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';

import createStore from './src/app/reducers';
import rootSaga from './src/app/sagas';
import Navigation from './src/navigations';

const { store, runSaga } = createStore();
runSaga(rootSaga);

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ReduxProvider store={store}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Navigation />
    </ReduxProvider>
  );
}

export default App;
