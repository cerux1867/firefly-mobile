import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { AuthProvider } from './AuthContext';
import NavStack from './NavStack';
import { LocalStorageProvider } from './LocalStorageContext';

const theme = {
  ...NavigationDefaultTheme,
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#1e6581',
    accent: '#53baff',
    background: '#fafafa',
  },
  roundness: 6,
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <LocalStorageProvider>
        <AuthProvider>
          <NavigationContainer theme={theme}>
            <NavStack />
          </NavigationContainer>
        </AuthProvider>
      </LocalStorageProvider>
    </PaperProvider>
  );
};

export default App;
