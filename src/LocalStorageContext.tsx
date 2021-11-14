import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext } from 'react';

type LocalStorageState = {
  setItem: (key: string, item: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  setObjectItem: (key: string, item: any) => Promise<void>;
  getObjectItem: <T>(key: string) => Promise<T>;
};

type Props = {
  children?: React.ReactNode;
};

const LocalStorageContext = React.createContext<LocalStorageState | undefined>(
  undefined,
);

const LocalStorageProvider: React.FC<Props> = ({ children }) => {
  const setItem = async (key: string, item: string) => {
    await AsyncStorage.setItem(key, item);
  };

  const getItem = async (key: string) => {
    const value = AsyncStorage.getItem(key);
    return value;
  };

  const removeItem = async (key: string) => {
    await AsyncStorage.removeItem(key);
  };

  const setObjectItem = async (key: string, item: any) => {
    const json = JSON.stringify(item);
    await setItem(key, json);
  };

  const getObjectItem = async (key: string) => {
    const value = (await getItem(key)) as string;
    if (value) {
      return JSON.parse(value);
    }
    return null;
  };

  const data = {
    setItem,
    getItem,
    removeItem,
    setObjectItem,
    getObjectItem,
  };

  return (
    <LocalStorageContext.Provider value={data}>
      {children}
    </LocalStorageContext.Provider>
  );
};

const useLocalStorage = () => {
  const context = useContext(LocalStorageContext);
  if (context === undefined) {
    throw new Error(
      'useLocalStorage can only be used inside LocalStorageProvider',
    );
  }

  return context;
};

export default LocalStorageContext;
export { LocalStorageProvider, useLocalStorage };
