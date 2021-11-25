import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useAuth } from './AuthContext';
import Home from './Home';
import Onboarding from './Onboarding';
import TokenLogin from './login/TokenLogin';
import OAuthLogin from './login/OAuthLogin';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  TokenLogin: undefined;
  OAuthLogin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const NavStack = () => {
  const { loggedIn } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {loggedIn ? (
        <>
          <Stack.Screen name="Home" component={Home} />
        </>
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="TokenLogin" component={TokenLogin} />
          <Stack.Screen name="OAuthLogin" component={OAuthLogin} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default NavStack;
