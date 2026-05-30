import { useState, useEffect, useRef } from 'react';
import {Alert, Text, TouchableOpacity, View, StatusBar, Animated, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES, IMG } from '../../utils';
import styles from './styles';
import { googleAuthService } from '../../services';

import { useDispatch, useSelector } from 'react-redux';
import { userLogin, loginSuccess } from '../../app/reducers/auth';

const Login = () => {
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { isLoading, isError, errorMessage } = useSelector((state: any) => state.auth);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Debug: Check Google Play Services
    const checkServices = async () => {
      const available = await googleAuthService.checkPlayServices();
      console.log('Google Play Services available:', available);
    };
    checkServices();
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await googleAuthService.signInWithGoogle();
      if (result.success && result.data?.token) {
        dispatch(loginSuccess(result.data));
      } else {
        Alert.alert('Google Sign-In Failed', result.message || 'Could not sign in with Google');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during Google Sign-In');
    } finally {
      setGoogleLoading(false);
    }
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
            <TouchableOpacity
              style={[styles.socialBtn, googleLoading && { opacity: 0.7 }]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#121212" />
              ) : (
                <Text style={styles.socialText}>Google</Text>
              )}
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
