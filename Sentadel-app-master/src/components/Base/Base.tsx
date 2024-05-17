import {
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ViewStyle,
  Platform,
  TouchableOpacity,
  Linking,
  AppState
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './Base.styles';
import { alignStyle, flexiStyle } from '@sentadell-src/utils/moderateStyles';
import TextBase from '../Text/TextBase';
import Colors from '@sentadell-src/config/Colors';
import { ArrowLeft, BurgerMenu } from '@sentadell-src/config/Svgs';
import {
  CommonActions,
  DrawerActions,
  useNavigation
} from '@react-navigation/native';
import { LOG } from '@sentadell-src/utils/commons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@sentadell-src/database/reduxStore';
import { useCameraPermission } from 'react-native-vision-camera';
import { setIsStartUp } from '@sentadell-src/stores/rtk/actions/auth';
import { STORAGE_KEYS, storage } from '@sentadell-src/database/mmkv';
import { routes } from '@sentadell-src/navigation/RootNavigationParams';

interface BaseProps {
  children: React.ReactNode;
  centerView?: boolean;
  noScroll?: boolean;
  customContainerStyle?: ViewStyle | ViewStyle[];
  refreshControl?: {
    refreshing: boolean;
    onRefresh: () => void;
  };
  headerTitle?: string;
  customHeader?: React.ReactNode;
}

const Base = (props: BaseProps) => {
  const {
    children,
    centerView,
    noScroll,
    customContainerStyle,
    refreshControl,
    headerTitle,
    customHeader
  } = props;

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { hasPermission, requestPermission } = useCameraPermission();
  const { isAuth, isStartUp } = useSelector((state: RootState) => state.auth);

  const [checkPermission, setCheckPermission] = useState(true);

  const userData = storage.getString(STORAGE_KEYS.USER);

  useEffect(() => {
    dispatch(setIsStartUp(false));
  }, []);

  const permissionChecker = useCallback((check: boolean) => {
    if (isAuth && !isStartUp) {
      if (!hasPermission) {
        requestPermission()
          .then(res => {
            if (!res && check) {
              Linking.openSettings();
            }
          })
          .catch();
      }
    }
  }, []);

  useEffect(() => {
    let check = true;

    permissionChecker(check);
    return () => {
      check = false;
    };
  }, [isAuth, isStartUp, hasPermission, checkPermission]);

  useEffect(() => {
    const listener = AppState.addEventListener('focus', () => {
      if (!hasPermission) setCheckPermission(state => !state);
    });

    return () => listener.remove();
  }, [hasPermission]);

  useEffect(() => {
    if (!userData) {
      const routeList = navigation.getState().routes;

      if (routeList[routeList.length - 1].name !== routes.LOGIN_SCREEN) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routes.LOGIN_SCREEN }]
          })
        );
      }
    }
  }, [userData]);

  const renderRefreshControl = () => {
    if (refreshControl) {
      return (
        <RefreshControl
          enabled
          refreshing={refreshControl.refreshing}
          onRefresh={refreshControl.onRefresh}
        />
      );
    }
  };

  const renderChildrenContainer = () => {
    if (noScroll) {
      return (
        <View
          style={[
            styles.noScrollView,
            customContainerStyle,
            centerView && alignStyle.allCenter
          ]}>
          {children}
        </View>
      );
    }

    return (
      <ScrollView
        refreshControl={renderRefreshControl()}
        style={styles.scrollView}
        contentContainerStyle={customContainerStyle}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    );
  };

  const renderHeader = () => {
    if (customHeader) return customHeader;

    if (headerTitle) {
      const handleBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          LOG.info(`there weren't another page to go back`);
        }
      };

      const handleToogleDrawer = () => {
        LOG.info('open drawer');
        navigation.dispatch(DrawerActions.openDrawer());
      };

      return (
        <View style={styles.headerContainer}>
          <TextBase.XXL style={styles.headerTitleText} ellipsizeMode="tail">
            {headerTitle}
          </TextBase.XXL>
          <TouchableOpacity
            style={styles.drawerToogleButton}
            onPress={handleToogleDrawer}
            activeOpacity={0.8}>
            <BurgerMenu height={30} width={30} fill={Colors.base.fullWhite} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            disabled={!navigation.canGoBack()}
            onPress={handleBackPress}
            activeOpacity={0.8}>
            <ArrowLeft height={30} width={30} stroke={Colors.base.fullWhite} />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      {renderHeader()}
      <KeyboardAvoidingView
        style={flexiStyle.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {renderChildrenContainer()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Base;
