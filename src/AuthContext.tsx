import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { authorize } from 'react-native-app-auth';
import axios, { AxiosInstance } from 'axios';
import { useLocalStorage } from './LocalStorageContext';

type LocalState = {
  initialLoadDone: boolean;
  fireflyUrl: string;
  accessToken: string;
  authType: 'token' | 'oauth' | '';
  clientId?: string;
  clientSecret?: string;
  accessTokenExpiry?: Date;
  refreshToken?: string;
  httpClient?: AxiosInstance;
  loggedIn: boolean;
  isLoggingIn: boolean;
};

type AuthState = LocalState & {
  authorizeWithToken: (
    fireflyUrl: string,
    personalAccessToken: string,
    rememberMe: boolean,
  ) => Promise<void>;
  authorizeWithOAuth: (
    fireflyUrl: string,
    clientId: string,
    rememberMe: boolean,
    clientSecret?: string,
  ) => Promise<void>;
  logout: () => void;
};

type Props = {
  children?: React.ReactNode;
};

type LocalStorageAuthData = {
  fireflyUrl: string;
  accessToken: string;
  authType: 'token' | 'oauth';
  clientId?: string;
  clientSecret?: string;
  accessTokenExpiry?: number;
  refreshToken?: string;
};

const axiosInstance = axios.create();

const AuthContext = React.createContext<AuthState | undefined>(undefined);

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [auth, setAuth] = useState<LocalState>({
    fireflyUrl: '',
    accessToken: '',
    accessTokenExpiry: undefined,
    authType: '',
    clientId: undefined,
    clientSecret: undefined,
    refreshToken: '',
    loggedIn: false,
    initialLoadDone: false,
    isLoggingIn: false,
  });

  const { removeItem, setObjectItem, getObjectItem } = useLocalStorage();

  useEffect(() => {
    const initialLoad = async () => {
      const storedAuth = await getObjectItem<LocalStorageAuthData>('auth');
      if (!storedAuth || (!storedAuth.fireflyUrl && !storedAuth.accessToken)) {
        setAuth({
          ...auth,
          initialLoadDone: true,
        });
      } else if (storedAuth.fireflyUrl && storedAuth.accessToken) {
        setAuth({
          ...auth,
          authType: storedAuth.authType,
          clientSecret: storedAuth.clientSecret,
          clientId: storedAuth.clientSecret,
          fireflyUrl: storedAuth.fireflyUrl,
          accessToken: storedAuth.accessToken,
          accessTokenExpiry: storedAuth.accessTokenExpiry
            ? new Date(storedAuth.accessTokenExpiry)
            : undefined,
          refreshToken: storedAuth.refreshToken,
          loggedIn: true,
          initialLoadDone: true,
        });
      }
    };
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  axiosInstance.interceptors.request.use(async config => {
    if (
      auth.authType === 'oauth' &&
      auth.accessTokenExpiry &&
      auth.accessTokenExpiry < new Date()
    ) {
      try {
        const result = await axios.post(
          `${auth.fireflyUrl}/oauth/token?grant_type=refresh_token&refresh_token=${auth.refreshToken}&client_id=${auth.clientId}&client_secret=${auth.clientSecret}`,
        );
        setAuth({
          ...auth,
          accessToken: result.data.access_token,
          accessTokenExpiry: new Date(
            Date.now() + result.data.expires_in * 1000,
          ),
          refreshToken: result.data.refresh_token,
        });
      } catch (err) {
        console.log(err);
      }
    }
    return config;
  });

  useEffect(() => {
    if (auth.accessToken && auth.fireflyUrl) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${auth.accessToken}`;
      axiosInstance.defaults.baseURL = auth.fireflyUrl;
    }
  }, [auth.accessToken, auth.fireflyUrl]);

  const handleOAuth = useCallback(
    async (
      fireflyUrl: string,
      clientId: string,
      rememberMe: boolean,
      clientSecret?: string,
    ) => {
      setAuth({
        ...auth,
        isLoggingIn: true,
      });
      const providerConfig = {
        serviceConfiguration: {
          authorizationEndpoint: `${fireflyUrl}/oauth/authorize`,
          tokenEndpoint: `${fireflyUrl}/oauth/token`,
        },
        clientId,
        clientSecret,
        redirectUrl: 'https://app.firefly.cerux.dev/oauth',
      };
      try {
        const result = await authorize(providerConfig as any);
        setAuth({
          ...auth,
          authType: 'oauth',
          accessToken: result.accessToken,
          accessTokenExpiry: new Date(result.accessTokenExpirationDate),
          refreshToken: result.refreshToken,
          clientId,
          clientSecret,
          fireflyUrl: fireflyUrl,
          isLoggingIn: false,
          loggedIn: true,
        });
        if (rememberMe) {
          await setObjectItem('auth', {
            fireflyUrl,
            authType: 'oauth',
            refreshToken: result.refreshToken,
            accessTokenExpiry: result.accessTokenExpirationDate,
            clientId,
            clientSecret,
            accessToken: result.accessToken,
          });
        }
      } catch (error) {
        setAuth({
          ...auth,
          isLoggingIn: false,
        });
        console.error(error);
      }
    },
    [auth, setObjectItem],
  );

  const handleToken = useCallback(
    async (
      fireflyUrl: string,
      personalAccessToken: string,
      rememberMe: boolean,
    ) => {
      setAuth({
        ...auth,
        isLoggingIn: true,
      });
      try {
        const result = await axiosInstance.get(
          `${fireflyUrl}/api/v1/about/user`,
          {
            headers: {
              Authorization: `Bearer ${personalAccessToken}`,
            },
          },
        );
        if (result.data.data.type === 'users') {
          setAuth({
            ...auth,
            authType: 'token',
            accessToken: personalAccessToken,
            fireflyUrl: fireflyUrl,
            loggedIn: true,
            isLoggingIn: false,
          });
          if (rememberMe) {
            await setObjectItem('auth', {
              fireflyUrl,
              accessToken: personalAccessToken,
            });
          }
        }
      } catch (error: any) {
        setAuth({
          ...auth,
          isLoggingIn: false,
        });
        const errMsg =
          error.status === 401 ? 'Incorrect login credentials' : '';
        Alert.alert('Sign-in failed', errMsg);
      }
    },
    [auth, setObjectItem],
  );

  const logout = useCallback(async () => {
    const storedAuth = await getObjectItem<LocalStorageAuthData>('auth');
    if (storedAuth && (storedAuth.fireflyUrl || storedAuth.accessToken)) {
      await removeItem('auth');
    }
    setAuth({
      authType: '',
      loggedIn: false,
      accessToken: '',
      fireflyUrl: '',
      initialLoadDone: true,
      accessTokenExpiry: undefined,
      isLoggingIn: false,
    });
  }, [getObjectItem, removeItem]);

  const authData = {
    ...auth,
    authorizeWithOAuth: handleOAuth,
    authorizeWithToken: handleToken,
    httpClient: axiosInstance,
    logout,
  };

  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth can only be used inside AuthProvider');
  }

  return context;
};

const useHttpClient = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useHttpClient can only be used inside AuthProvider');
  }

  return context.httpClient;
};

export default AuthContext;

export { AuthProvider, useAuth, useHttpClient };
