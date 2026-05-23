import { Text, TouchableOpacity, View } from 'react-native';

const CustomButton = ({
  label = '',onPress, containerStyle, textStyle,}) => {
  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          {
            margin: 10,
            backgroundColor: 'pink',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          },
          containerStyle,
        ]}
      >
        <View style={{ padding: 10 }}>
          <Text
            style={[
              {
                color: 'white',
                fontSize: 15,
                textAlign: 'center',
              },
              textStyle,
            ]}
          >
            {label ?? ''}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;