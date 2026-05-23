import { Text, View, Alert } from 'react-native';
import CustomButton from './CustomButton';

const CustomCard = ({ label, btnText, alertMe }) => {
  return (
    <View

    >
      <Text className="card-title">{label}</Text>
      <CustomButton
        label={btnText}
        onPress={() => {
          Alert.alert(`${alertMe}`);
        }}
      />
    </View>
  );
};

export default CustomCard;