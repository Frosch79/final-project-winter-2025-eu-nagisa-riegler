import { fireEvent, render } from '@testing-library/react-native';
import VisibilitySelector from '../RadioGroup';

describe('VisibilitySelector', () => {
  const onChangeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all radio options', () => {
    const { getAllByTestId, getByTestId } = render(
      <VisibilitySelector value="public" onChange={onChangeMock} />,
    );

    // parent container exists
    expect(getByTestId('button-parent')).toBeTruthy();

    // radio buttons and labels exist
    const buttons = getAllByTestId('button');
    const labels = getAllByTestId('button-text');

    expect(buttons).toHaveLength(3);
    expect(labels).toHaveLength(3);
  });

  test('shows correct checked status based on value', () => {
    const { getAllByTestId } = render(
      <VisibilitySelector value="followersOnly" onChange={onChangeMock} />,
    );

    const buttons = getAllByTestId('button');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(buttons[0].props.accessibilityState.checked).toBe(false); // public
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(buttons[1].props.accessibilityState.checked).toBe(true); // followersOnly
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(buttons[2].props.accessibilityState.checked).toBe(false); // private
  });

  test('calls onChange when an option is pressed', () => {
    const { getAllByTestId } = render(
      <VisibilitySelector value="public" onChange={onChangeMock} />,
    );

    const buttons = getAllByTestId('button');

    fireEvent.press(buttons[2]); // press private
    expect(onChangeMock).toHaveBeenCalledWith('private');

    fireEvent.press(buttons[1]); // press followersOnly
    expect(onChangeMock).toHaveBeenCalledWith('followersOnly');
  });
});
