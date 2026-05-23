import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { IMG, ROUTES } from '../utils';

import { useDispatch } from 'react-redux';
import { resetLogin } from '../app/reducers/auth';
import CustomCard from '../components/CustomCard';


const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
      <CustomCard 
      label="Welcome to the Home Screen!" 
      btnText="Click Me 123"
       alertMe="You clicked the button!" />

      <Text>HomeScreen</Text>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate(ROUTES.PROFILE);
        }}
      >
        <View
          style={{
            padding: 20,
            backgroundColor: '#ffb347',
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 40, color: 'white' }}>
            GO TO PROFILE SCREEN
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          dispatch(resetLogin());
        }}
        style={{ marginTop: 20 }}
      >
        <View
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            backgroundColor: 'crimson',
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 20, color: 'white' }}>LOGOUT</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;