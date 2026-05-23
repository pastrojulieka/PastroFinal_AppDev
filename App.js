import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';

import createStore from './src/app/reducers';
import rootSaga from './src/app/sagas';
import AppNavigationNi from './src/navigations';

const { store, runSaga } = createStore();
runSaga(rootSaga);

const App = () => {
  return (
    <Provider store={store}>
      <View style={{ flex: 1 }}>
        <AppNavigationNi />
      </View>
    </Provider>
  );
};

export default App;