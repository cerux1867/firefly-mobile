import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = (props: any) => {
  const { isOnboardingComplete, navigation } = props;
  useEffect(() => {
    // Check if the onboarding is complete, if not navigate to the dedicated page
    if (!isOnboardingComplete) {
      navigation.navigate('Onboarding');
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [isOnboardingComplete, navigation]);
  return (
    <SafeAreaView>
      <Text>Hello</Text>
    </SafeAreaView>
  );
};

export default Home;
