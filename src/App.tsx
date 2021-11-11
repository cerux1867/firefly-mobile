import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import Home from './Home';
import Onboarding from './Onboarding';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const theme = {
  ...NavigationDefaultTheme,
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#1e6581',
    accent: '#ff715d ',
  },
  roundness: 2,
};

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Onboarding">
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Onboarding" component={Onboarding} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
