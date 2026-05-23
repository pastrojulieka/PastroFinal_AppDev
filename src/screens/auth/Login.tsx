import { useState, useEffect, useRef } from 'react';
import {Alert, Text, TouchableOpacity, View, StatusBar, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES, IMG } from '../../utils';
import styles from './styles';

import { useDispatch, useSelector } from 'react-redux';
import { userLogin } from '../../app/reducers/auth';

const Login = () => {
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const { isLoading, isError, errorMessage } = useSelector(state => state.auth);

  const navigation = useNavigation();
   const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isError && errorMessage) {
      Alert.alert('Login Failed', errorMessage);
    }
  }, [isError, errorMessage]);

  const handleLogin = () => {
    if (!emailAdd || !password) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }
    dispatch(userLogin({ emailAdd, password }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
        <View style={styles.logoWrapper}>
          <Image source={IMG.LOGO} style={styles.logo} />
        </View>

        <View style={styles.card}>
          <CustomTextInput
            label={'Email'}
            placeholder={'Enter your email'}
            value={emailAdd}
            onChangeText={setEmailAdd}
            containerStyle={styles.inputContainer}
            labelStyle={styles.label}
            textStyle={styles.inputText}
          />

          <CustomTextInput
            label={'Password'}
            placeholder={'Enter your password'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            containerStyle={styles.inputContainer}
            labelStyle={styles.label}
            textStyle={styles.inputText}
          />

          <View style={styles.glowWrapper}>
            <CustomButton
              label={'LOGIN'}
              containerStyle={styles.button}
              textStyle={styles.buttonText}
              onPress={handleLogin}
            />
          </View>

          <Text style={styles.orText}>OR CONTINUE WITH</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Not registered yet?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
          >
            <Text style={styles.registerText}> Register</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default Login;
