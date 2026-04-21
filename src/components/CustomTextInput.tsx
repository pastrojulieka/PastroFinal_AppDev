import { Text, TextInput, View } from 'react-native';

const CustomTextInput = ({
  placeholder = '',
  label = '',
  labelStyle,
  value,
  onChangeText,
  containerStyle,
  textStyle,
  secureTextEntry,
}) => {
  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label ?? ''}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={[
          textStyle,
          {
            width: '80%',
            borderBottomWidth: 1,
          },
        ]}
      />
    </View>
  );
};

export default CustomTextInput;