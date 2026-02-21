import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils/index';

import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN}>
      <Stack.Screen name={ROUTES.LOGIN} component={Login} />
      <Stack.Screen name={ROUTES.REGISTER} component={Register} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;