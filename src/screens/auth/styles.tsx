import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: '#000',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: '80%',
    height: 120,
    resizeMode: 'contain',
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
    color: '#ffb347',
    fontWeight: '600',
    marginBottom: 5,
  },
  inputText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  glowWrapper: {
    shadowColor: '#ffb347',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },
  button: {
    backgroundColor: '#ffb347',
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
    color: '#ffb347',
    fontWeight: '700',
  },
});

export default styles;

