import React from 'react';
import { StyleSheet, View, Image, StatusBar } from 'react-native';
import { Button, Caption, Headline, Text, useTheme } from 'react-native-paper';

const App = () => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar
        hidden={true}
        backgroundColor={colors.primary}
        animated={true}
      />
      <Image
        style={styles.logo}
        source={{
          uri: 'https://www.firefly-iii.org/assets/logo/color.png',
        }}
        resizeMode="contain"
      />
      <Headline style={styles.title}>Welcome to{'\n'}Firefly Mobile</Headline>
      <Text style={styles.subtitle}>Please choose your{'\n'}login method</Text>
      <View style={styles.buttonContainer}>
        <Button
          onPress={() => console.log('OAuth2.0 login')}
          style={styles.button}
          mode="outlined">
          OAuth2.0
        </Button>
        <Button
          style={styles.button}
          onPress={() => console.log('Token login')}
          mode="outlined">
          Token
        </Button>
      </View>
      <Caption
        onPress={() => console.log('Navigating to help...')}
        style={styles.navCaption}>
        How does it work?
      </Caption>
    </View>
  );
};

const makeStyles = (colors: ReactNativePaper.ThemeColors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      alignSelf: 'center',
      width: 105,
      height: 133,
      marginBottom: 50,
    },
    title: {
      textAlign: 'center',
    },
    subtitle: {
      marginBottom: 80,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      margin: 10,
      minWidth: 130,
      minHeight: 41,
    },
    navCaption: {
      top: 130,
      color: colors.primary,
      textDecorationLine: 'underline',
    },
  });
};

export default App;
