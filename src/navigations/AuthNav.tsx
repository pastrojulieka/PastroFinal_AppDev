import { createStackNavigator } from '@react-navigation/stack';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import { ROUTES } from '../utils';

const Stack = createStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN}>
      <Stack.Screen name={ROUTES.LOGIN} component={Login} options={{ headerShown: false }} />
      <Stack.Screen name={ROUTES.REGISTER} component={Register} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;