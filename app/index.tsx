import { Redirect } from 'expo-router';

//tokenの有無を調べて(auth)と(tabs)分岐
export default function Index() {
  return <Redirect href={'/(auth)/login'} />;
}
