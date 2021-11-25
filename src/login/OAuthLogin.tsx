import React, { useCallback } from 'react';
import { Image, StyleSheet, View } from 'react-native';
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
  fireflyClientId: string;
  fireflyClientSecret?: string;
  rememberMe: boolean;
};

const OAuthLogin = () => {
  const { authorizeWithOAuth, isLoggingIn } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fireflyUrl: '',
      fireflyClientId: '',
      fireflyClientSecret: '',
      rememberMe: false,
    },
  });

  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const onSubmit = useCallback(
    async (data: FormData) => {
      await authorizeWithOAuth(
        data.fireflyUrl,
        data.fireflyClientId,
        data.rememberMe,
        data.fireflyClientSecret,
      );
    },
    [authorizeWithOAuth],
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
          <Headline style={styles.signInHeader}>OAuth2.0</Headline>
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
                keyboardType="url"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
            name="fireflyUrl"
          />
          <HelperText type="error" visible={errors.fireflyUrl ? true : false}>
            {errors.fireflyUrl?.message}
          </HelperText>
          <Controller
            control={control}
            rules={{
              required: {
                value: true,
                message: 'Client ID is required',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                error={errors.fireflyClientId ? true : false}
                style={styles.textField}
                keyboardType="numeric"
                label="Client ID"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
            name="fireflyClientId"
          />
          <HelperText
            type="error"
            visible={errors.fireflyClientId ? true : false}>
            {errors.fireflyClientId?.message}
          </HelperText>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                error={errors.fireflyClientSecret ? true : false}
                style={{ ...styles.textField, ...styles.formFieldMargin }}
                label="Client secret"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
            name="fireflyClientSecret"
          />
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <View
                style={{
                  ...styles.checkBoxContainer,
                  ...styles.formFieldMargin,
                }}>
                <Checkbox
                  color={colors.primary}
                  status={value ? 'checked' : 'unchecked'}
                  onPress={() => onChange(value ? false : true)}
                />
                <Text style={{ marginLeft: 5 }}>Remember me</Text>
              </View>
            )}
            name="rememberMe"
          />

          <Button
            contentStyle={styles.signInButton}
            loading={isLoggingIn}
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

export default OAuthLogin;
