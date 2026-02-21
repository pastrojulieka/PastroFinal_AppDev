import { useState, useEffect, useRef } from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES } from '../../utils';

const Login = () => {
  const [emailAdd, setEmailAdd] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = () => {
    if (!emailAdd || !password) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }

    Alert.alert('Success', 'Login button pressed!');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
        <Text style={styles.title}>Julieka</Text>
        <Text style={styles.subtitle}>Minimal. Modern. Secure.</Text>

        <View style={styles.card}>
          <CustomTextInput
            label={'Email'}
            placeholder={'Enter your email'}
            value={val => setEmailAdd(val)}
            containerStyle={styles.inputContainer}
            labelStyle={styles.label}
            textStyle={styles.inputText}
          />

          <CustomTextInput
            label={'Password'}
            placeholder={'Enter your password'}
            secureTextEntry
            value={val => setPassword(val)}
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

            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.socialText}>Facebook</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: '#000', 
  },
  title: {
    color: '#FF2D95',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 14,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,45,149,0.2)',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#FF2D95',
    fontWeight: '600',
    marginBottom: 5,
  },
  inputText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  glowWrapper: {
    shadowColor: '#FF2D95',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },
  button: {
    backgroundColor: '#FF2D95',
    borderRadius: 15,
    paddingVertical: 15,
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
  },
  orText: {
    color: '#777',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 12,
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialBtn: {
    flex: 1,
    backgroundColor: '#111',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#222',
  },
  socialText: {
    color: '#FFF',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#AAA',
  },
  registerText: {
    color: '#FF2D95',
    fontWeight: '700',
  },
});