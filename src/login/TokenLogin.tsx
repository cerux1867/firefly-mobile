import React, { useCallback, useState } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import {
  Button,
  Checkbox,
  Headline,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../AuthContext';

type FormData = {
  fireflyUrl: string;
  fireflyToken: string;
};

const TokenLogin = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { authorizeWithToken } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fireflyUrl: '',
      fireflyToken: '',
    },
  });

  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const onSubmit = useCallback(
    async (data: FormData) => {
      setIsSigningIn(true);
      await authorizeWithToken(data.fireflyUrl, data.fireflyToken, rememberMe);
    },
    [authorizeWithToken, rememberMe],
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          source={{
            uri: 'https://www.firefly-iii.org/assets/logo/color.png',
          }}
          resizeMode="contain"
        />
      </View>
      <View style={styles.signInContainer}>
        <View style={styles.signInBox}>
          <Headline style={styles.signInHeader}>Token</Headline>
          <Controller
            control={control}
            rules={{
              required: {
                value: true,
                message: 'URL is required',
              },
              pattern: {
                value: /^https?:\/\//,
                message: 'URL must be a HTTP/HTTPS URL',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                error={errors.fireflyUrl ? true : false}
                style={styles.textField}
                label="Firefly URL"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
            name="fireflyUrl"
          />
          <HelperText
            style={styles.formFieldMargin}
            type="error"
            visible={errors.fireflyUrl ? true : false}>
            {errors.fireflyUrl?.message}
          </HelperText>
          <Controller
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Token is required',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{
                  ...styles.textField,
                  ...styles.textArea,
                }}
                error={errors.fireflyToken ? true : false}
                label="Token"
                multiline={true}
                numberOfLines={Platform.OS === 'ios' ? 0 : 6}
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
            name="fireflyToken"
          />
          <HelperText type="error" visible={errors.fireflyToken ? true : false}>
            Personal access token is required
          </HelperText>

          <View
            style={{ ...styles.checkBoxContainer, ...styles.formFieldMargin }}>
            <Checkbox
              color={colors.primary}
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
            />
            <Text style={{ marginLeft: 5 }}>Remember me</Text>
          </View>

          <Button
            contentStyle={styles.signInButton}
            loading={isSigningIn}
            mode="contained"
            onPress={handleSubmit(onSubmit)}>
            Sign in
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (colors: ReactNativePaper.ThemeColors) => {
  return StyleSheet.create({
    logoContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    signInContainer: {
      flex: 2,
      alignItems: 'center',
    },
    signInBox: {
      width: '90%',
      height: '80%',
      backgroundColor: '#fafafa',
      bottom: '5%',
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      alignItems: 'center',
      elevation: 6,
    },
    signInHeader: {
      color: colors.primary,
      marginTop: 15,
      marginBottom: 10,
    },
    formFieldMargin: {
      marginBottom: 10,
    },
    textField: {
      width: '90%',
    },
    textArea: {
      minHeight: Platform.OS === 'ios' && 6 ? 20 * 6 : 0,
      maxHeight: 150,
    },
    signInButton: {
      width: '90%',
      height: 50,
      alignSelf: 'center',
    },
    checkBoxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logo: {
      width: 60,
      height: 100,
    },
  });
};

export default TokenLogin;
