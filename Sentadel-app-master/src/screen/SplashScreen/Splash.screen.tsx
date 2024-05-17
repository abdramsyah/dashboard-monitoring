import { View, Text } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootNavigationParams,
  routes
} from '@sentadell-src/navigation/RootNavigationParams';
import { STORAGE_KEYS, storage } from '@sentadell-src/database/mmkv';
import {
  authChecker,
  getInitialNavigation
} from '@sentadell-src/utils/commons';
import { RoleEnum } from '@sentadell-src/types/auth';

type NavigationProps = StackNavigationProp<
  RootNavigationParams,
  routes.SPLASH_SCREEN
>;

interface SplashScreenProps {
  navigation: NavigationProps;
}

const SplashScreen: React.FC<SplashScreenProps> = (
  props: SplashScreenProps
) => {
  const { navigation } = props;

  const decodedTokenString = storage.getString(STORAGE_KEYS.DECODED_TOKEN);

  const authCheckerCallback = useCallback(
    (isAuth: boolean, roles?: RoleEnum[]) => {
      if (isAuth) {
        if (roles) {
          const route = getInitialNavigation(roles);

          if (route) navigation.replace(route);
        }
      } else {
        navigation.replace(routes.LOGIN_SCREEN);
      }
    },
    []
  );

  useEffect(() => {
    authChecker(decodedTokenString || '', authCheckerCallback);
  }, [decodedTokenString, authCheckerCallback]);

  return (
    <View>
      <Text
        style={{
          color: '#000'
        }}>
        SplashScreen
      </Text>
    </View>
  );
};

export default SplashScreen;
