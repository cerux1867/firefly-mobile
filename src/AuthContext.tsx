import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { authorize } from 'react-native-app-auth';
import axios, { AxiosInstance } from 'axios';
import { useLocalStorage } from './LocalStorageContext';

type AuthState = {
  initialLoadDone: boolean;
  fireflyUrl: string;
  accessToken: string;
  accessTokenExpiry?: Date;
  httpClient?: AxiosInstance;
  loggedIn: boolean;
  authorizeWithToken: (
    fireflyUrl: string,
    personalAccessToken: string,
    rememberMe: boolean,
  ) => Promise<void>;
  authorizeWithOAuth: (
    fireflyUrl: string,
    clientId: string,
    clientSecret: string,
  ) => Promise<void>;
  logout: () => void;
};

type Props = {
  children?: React.ReactNode;
};

type LocalStorageAuthData = {
  fireflyUrl: string;
  accessToken: string;
};

const axiosInstance = axios.create();

const AuthContext = React.createContext<AuthState | undefined>(undefined);

const AuthProvider: React.FC<Props> = ({ children }) => {
  const [auth, setAuth] = useState({
    fireflyUrl: '',
    accessToken: '',
    accessTokenExpiry: undefined,
    loggedIn: false,
    initialLoadDone: false,
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
          fireflyUrl: storedAuth.fireflyUrl,
          accessToken: storedAuth.accessToken,
          loggedIn: true,
          initialLoadDone: true,
        });
      }
    };
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${auth.accessToken}`;
    axiosInstance.defaults.baseURL = auth.fireflyUrl;
  }, [auth.accessToken, auth.fireflyUrl]);

  const handleOAuth = useCallback(
    async (fireflyUrl: string, clientId: string, clientSecret: string) => {
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
        Alert.alert(`Token expires ${result.accessTokenExpirationDate}`);
      } catch (error) {
        console.error(error);
      }

      setAuth({
        ...auth,
        fireflyUrl,
      });
    },
    [auth],
  );

  const handleToken = useCallback(
    async (
      fireflyUrl: string,
      personalAccessToken: string,
      rememberMe: boolean,
    ) => {
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
            accessToken: personalAccessToken,
            fireflyUrl: fireflyUrl,
            loggedIn: true,
          });
          if (rememberMe) {
            await setObjectItem('auth', {
              fireflyUrl,
              accessToken: personalAccessToken,
            });
          }
        }
      } catch (error: any) {
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
      loggedIn: false,
      accessToken: '',
      fireflyUrl: '',
      initialLoadDone: true,
      accessTokenExpiry: undefined,
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
