import { expect, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import * as Paper from 'react-native-paper';

// react native paper mock
const cardTitleMock: any = (props: any) => (
  <View>
    <Text>{props}</Text>
  </View>
);

jest.mock('react-native-paper', () => ({
  Card: {
    Title: cardTitleMock,
  },
})) as unknown as jest.Mocked<typeof Paper>;
//  mock end

const mockNavigate = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
