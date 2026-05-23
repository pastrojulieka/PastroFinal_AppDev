import { Image, Text, View } from 'react-native';
import { IMG } from '../utils';

const ProfileScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'blue',
        borderWidth: 3,
      }}
    >
      <Image
        source={IMG.LOGO}
        style={{
          width: '80%',
          height: 150,
          resizeMode: 'contain',
          marginBottom: 20,
        }}
      />
      <Text>ProfileScreen</Text>
    </View>
  );
};

export default ProfileScreen;