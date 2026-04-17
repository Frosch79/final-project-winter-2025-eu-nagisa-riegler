import { TouchableOpacity, View } from 'react-native';
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
    <View testID="button-parent" style={{ marginTop: spacing.md }}>
      {[
        { key: 'public', label: 'Public' },
        { key: 'followersOnly', label: 'Followers Only' },
        { key: 'private', label: 'Private' },
      ].map((item) => (
        <View
          testID={`button-text-${item.key}`}
          key={`key-${item.key}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
          }}
        >
          <TouchableOpacity
            testID={`button-container-${item.key}`}
            key={`key-${item.key}`}
            onPress={() => onChange(item.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <RadioButton
              testID={`button-${item.key}`}
              value={item.key}
              status={value === item.key ? 'checked' : 'unchecked'}
              onPress={() => onChange(item.key)}
            />
            <Text>{item.label}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
