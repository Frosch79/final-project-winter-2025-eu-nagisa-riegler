import { Link } from 'expo-router';
import { FlatList, Image, SafeAreaView, Text, View } from 'react-native';

export default function Feed() {
  const DATA = [
    {
      id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
      title: 'First Item',
    },
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      title: 'Second Item',
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e29d72',
      title: 'Third Item',
    },
  ];
  type ItemProps = { title: string };
  const Item = ({ title }: ItemProps) => (
    <View>
      <Image
        source={{
          uri: 'https://',
        }}
      />
      <Link href={'/'}></Link>
      <Text>{title}</Text>
    </View>
  );
  return (
    <SafeAreaView>
      <FlatList
        data={DATA}
        renderItem={({ item }) => <Item title={item.title} />}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}
