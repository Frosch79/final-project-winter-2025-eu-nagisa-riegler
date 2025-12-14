import { View } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';
import { spacing } from '../constants/Spacing';

export default function VisibilitySelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <View style={{ marginTop: spacing.md }}>
      {[
        { key: 'public', label: 'Public' },
        { key: 'followersOnly', label: 'Followers Only' },
        { key: 'private', label: 'Private' },
      ].map((item) => (
        <View
          key={item.key}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
          }}
        >
          <RadioButton
            value={item.key}
            status={value === item.key ? 'checked' : 'unchecked'}
            onPress={() => onChange(item.key)}
          />
          <Text>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
