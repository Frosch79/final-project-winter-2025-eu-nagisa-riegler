import * as React from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

type Props = {
  label: string;
  placeholder: string;
  textLength: string;
  errorMessage: string;
  value: string;
  onChangeText?: (((text: string) => void) & Function) | undefined;
};

const [isFocused, setIsFocused] = React.useState(false);
const [hasError, setHasError] = React.useState(false);

const handleFocus = () => {
  setIsFocused(true);
};

const handleBlur = () => {
  setIsFocused(false);
  // ここで入力値をチェックして、エラーがある場合は setHasError(true) を設定します
};
export default function InputField(props: Props) {
  return (
    <View>
      {' '}
      <TextInput
        mode="outlined"
        onFocus={() => handleFocus}
        onBlur={() => handleBlur}
        label={props.label}
        placeholder={props.placeholder}
        right={<TextInput.Affix text={props.textLength} />}
        value={props.value}
        onChangeText={props.onChangeText}
      />
      {isFocused && hasError && (
        <Text style={{ color: 'red' }}>{props.errorMessage}</Text>
      )}
    </View>
  );
}
