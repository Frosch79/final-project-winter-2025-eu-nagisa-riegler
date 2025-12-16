import { Redirect, useFocusEffect } from 'expo-router';
import { useState } from 'react';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useFocusEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/user');
      const data = await response.json();
      if (!('error' in data)) {
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    };
    checkAuth().catch((error) => console.log(error));
  });

  if (isLoading) return null;

  return isLoggedIn ? (
    <Redirect href="/(tabs)/(user)/user" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
