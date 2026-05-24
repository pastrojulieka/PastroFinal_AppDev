import { useState, useEffect, useRef } from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES, IMG } from '../../utils';
import { userRegister, resetRegister } from '../../app/reducers/auth';
import styles from './styles';

const Register = () => {
  const [name, setName] = useState('');
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { registerLoading, registerError, registerErrorMessage } = useSelector((state: any) => state.auth);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (registerError && registerErrorMessage) {
      Alert.alert('Registration Failed', registerErrorMessage);
      dispatch(resetRegister());
    }
  }, [registerError, registerErrorMessage, dispatch]);

  const handleRegister = () => {
    if (!name || !emailAdd || !password || !confirmPass) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('Password Mismatch', 'Passwords do not match!');
      return;
    }
    dispatch(userRegister({ email: emailAdd, password }));
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
            label={'Full Name'}
            placeholder={'Enter your full name'}
            value={name}
            onChangeText={setName}
            containerStyle={styles.inputContainer}
            labelStyle={styles.label}
            textStyle={styles.inputText}
            secureTextEntry={false}
          />

          <CustomTextInput
            label={'Email'}
            placeholder={'Enter your email'}
            value={emailAdd}
            onChangeText={setEmailAdd}
            containerStyle={styles.inputContainer}
            labelStyle={styles.label}
            textStyle={styles.inputText}
            secureTextEntry={false}
          />

          <CustomTextInput
            label={'Password'}
            placeholder={'Enter your password'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            containerStyle={styles.inputContainer}
            labelStyle={styles.label}
            textStyle={styles.inputText}
          />

          <CustomTextInput
            label={'Confirm Password'}
            placeholder={'Confirm password'}
            secureTextEntry
            value={confirmPass}
            onChangeText={setConfirmPass}
            containerStyle={styles.inputContainer}
            labelStyle={styles.label}
            textStyle={styles.inputText}
          />

          <View style={styles.glowWrapper}>
            <CustomButton
              label={'REGISTER'}
              containerStyle={styles.button}
              textStyle={styles.buttonText}
              onPress={handleRegister}
            />
          </View>

          <Text style={styles.orText}>OR REGISTER WITH</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate(ROUTES.LOGIN)}
          >
            <Text style={styles.registerText}> Login</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
    
  );
};

export default Register;
