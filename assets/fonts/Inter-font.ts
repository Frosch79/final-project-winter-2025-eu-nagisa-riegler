import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'Inter-Regular': Inter_400Regular,
  'Inter-Medium': Inter_500Medium,
  'Inter-Bold': Inter_700Bold,
  'Montserrat-Bold': Montserrat_700Bold,
});

if (!fontsLoaded) null;
