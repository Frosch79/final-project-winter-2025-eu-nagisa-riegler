import { expect, test } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { mockBack } from '../../jest.setup';
import HeaderBackButton from '../HeaderBackButton';

test('calls router.back on press', () => {
  const { getByTestId } = render(<HeaderBackButton />);
  fireEvent.press(getByTestId('back-button'));

  expect(mockBack).toHaveBeenCalled();
});
