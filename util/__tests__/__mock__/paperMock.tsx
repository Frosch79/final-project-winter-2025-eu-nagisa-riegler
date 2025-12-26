import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import * as Paper from 'react-native-paper';

// react native paper mock
const cardTitleMock: any = (props: any) => (
  <View>
    <Text>{props}</Text>
  </View>
);
const avatarTextMock: any = ({ label }: any) => (
  <View testID="avatar">
    <Text>{label}</Text>
  </View>
);
const PaperProviderMock: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const buttonMock: React.FC<any> = ({ children, onPress, testID }) => {
  return (
    <Text testID={testID} onPress={onPress}>
      {children}
    </Text>
  );
};

const iconButtonMock: React.FC<any> = ({ onPress, testID }) => (
  <Text testID={testID} onPress={onPress}>
    Icon
  </Text>
);

export const paperMock = () =>
  jest.mock('react-native-paper', () => {
    return {
      Provider: PaperProviderMock,
      Card: {
        Title: cardTitleMock,
        Content: cardTitleMock,
      },
      Portal: PaperProviderMock,
      Avatar: {
        Text: avatarTextMock,
      },
      Button: buttonMock,
      IconButton: iconButtonMock,
    };
  }) as unknown as jest.Mocked<typeof Paper>;
//  mock end
