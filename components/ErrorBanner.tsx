import * as React from 'react';
import { Image, View } from 'react-native';
import { Banner } from 'react-native-paper';

type Props = {
  errorMessage: string;
};
export default function ErrorBanner({ errorMessage }: Props) {
  const [visible, setVisible] = React.useState(true);

  return (
    <View>
      {' '}
      <Banner
        visible={visible}
        actions={[
          {
            label: 'Fix it',
            onPress: () => setVisible(false),
          },
          {
            label: 'Learn more',
            onPress: () => setVisible(false),
          },
        ]}
      >
        {errorMessage}
      </Banner>
      <></>
    </View>
  );
}
