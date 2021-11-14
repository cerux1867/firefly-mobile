import React, { useState } from 'react';
import { StatusBar, Text } from 'react-native';
import { FAB, Portal, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';

const Home = () => {
  const [fabOpen, setFabOpen] = useState(false);
  const { logout } = useAuth();
  const { colors } = useTheme();

  return (
    <SafeAreaView>
      <StatusBar
        hidden={true}
        backgroundColor={colors.primary}
        animated={true}
      />
      <Text>Hello</Text>
      <Portal>
        <FAB.Group
          color={colors.background}
          fabStyle={{
            backgroundColor: fabOpen ? colors.primary : colors.accent,
          }}
          visible={true}
          open={fabOpen}
          icon={fabOpen ? 'cash' : 'cash-multiple'}
          actions={[{ icon: 'logout-variant', onPress: () => logout() }]}
          onStateChange={({ open }) => setFabOpen(open)}
        />
      </Portal>
    </SafeAreaView>
  );
};

export default Home;
