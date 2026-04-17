import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import VisibilitySelector from '../RadioGroup';

describe('VisibilitySelector', () => {
  const onChangeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all radio options', () => {
    const { getByTestId } = render(
      <VisibilitySelector value="public" onChange={onChangeMock} />,
    );

    expect(getByTestId('button-parent')).toBeTruthy();

    expect(getByTestId('button-text-public')).toBeTruthy();
    expect(getByTestId('button-text-followersOnly')).toBeTruthy();
    expect(getByTestId('button-text-private')).toBeTruthy();

    expect(getByTestId('button-public')).toBeTruthy();
    expect(getByTestId('button-followersOnly')).toBeTruthy();
    expect(getByTestId('button-private')).toBeTruthy();
  });

  test('changes selection when pressed', () => {
    const { getByText } = render(
      <VisibilitySelector value="followersOnly" onChange={onChangeMock} />,
    );

    fireEvent.press(getByText('Public'));
    expect(onChangeMock).toHaveBeenCalledWith('public');
  });

  test('calls onChange when an option is pressed', () => {
    const { getByTestId } = render(
      <VisibilitySelector value="public" onChange={onChangeMock} />,
    );

    fireEvent.press(getByTestId('button-private'));
    expect(onChangeMock).toHaveBeenCalledWith('private');

    fireEvent.press(getByTestId('button-followersOnly'));
    expect(onChangeMock).toHaveBeenCalledWith('followersOnly');
  });
});
