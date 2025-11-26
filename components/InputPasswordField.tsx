import * as React from 'react';
import { TextInput } from 'react-native-paper';

export default function InputPasswordField() {
  const [text, setText] = React.useState('');

  return (
    <TextInput
      label="Password"
      secureTextEntry
      right={<TextInput.Icon icon="eye" />}
    />
  );
}
