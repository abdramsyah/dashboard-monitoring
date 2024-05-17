import { View, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DecodedTokenType } from '@sentadell-src/types/auth';
import { routes } from '@sentadell-src/navigation/RootNavigationParams';
import { STORAGE_KEYS, storage } from '@sentadell-src/database/mmkv';
import TextBase from '../Text/TextBase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@sentadell-src/database/reduxStore';
import { CommonActions } from '@react-navigation/native';
import { drawerNavigationData } from '@sentadell-src/navigation/RootNavigation';
import Colors from '@sentadell-src/config/Colors';
import styles from './SideDrawer.styles';
import { flexiStyle } from '@sentadell-src/utils/moderateStyles';
import { getInitialName } from '@sentadell-src/utils/commons';
import { setIsAuth } from '@sentadell-src/stores/rtk/actions/auth';

const SideDrawer = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const dispatch = useDispatch();

  const { isAuth, isStartUp } = useSelector((state: RootState) => state.auth);

  const decodedTokenString = storage.getString(STORAGE_KEYS.DECODED_TOKEN);
  const decodedToken: DecodedTokenType =
    decodedTokenString && JSON.parse(decodedTokenString);

  // LOG.warn('decodedToken', decodedToken);

  useEffect(() => {
    if (!isAuth && !isStartUp) {
      navigation.closeDrawer();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: routes.LOGIN_SCREEN
            }
          ]
        })
      );
    }
  }, [isAuth, navigation]);

  const renderMenuList = () => {
    if (isAuth && decodedToken) {
      return decodedToken?.rolesModules.map((e, idx) => {
        const moduleObj = drawerNavigationData[e.role_name];
        const moduleNode: React.ReactNode[] = [];

        if (moduleObj) {
          e.modules.forEach(module => {
            if (moduleObj[module.module_name]?.length) {
              moduleObj[module.module_name]?.forEach((menu, idxMenu) => {
                if (menu.isSideNav) {
                  moduleNode.push(
                    <TouchableOpacity
                      key={`${menu.title}-${idxMenu}`}
                      onPress={() => navigation.navigate(menu.route)}
                      style={styles.menuContainer}>
                      {menu.icon && (
                        <menu.icon
                          width={20}
                          height={20}
                          fill={Colors.base.fullWhite}
                        />
                      )}
                      <TextBase.L style={styles.menuText}>
                        {menu.title}
                      </TextBase.L>
                    </TouchableOpacity>
                  );
                }
              });
            }
          });
        }

        return (
          <View key={idx.toString()}>
            <TextBase.XL style={styles.roleText}>
              {e.role_description}
            </TextBase.XL>
            <View style={styles.menuRoleContainer}>{moduleNode}</View>
          </View>
        );
      });
    }

    return null;
  };

  return (
    <View style={flexiStyle.flex1}>
      <View style={styles.container}>{renderMenuList()}</View>
      <View style={styles.profileSection}>
        <View style={styles.userSection}>
          <View style={styles.useBadge}>
            <TextBase.L style={styles.textWhite700}>
              {getInitialName(decodedToken?.name)}
            </TextBase.L>
          </View>
          <TextBase.M style={styles.textWhite700}>
            {decodedToken?.name}
          </TextBase.M>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            storage.delete(STORAGE_KEYS.USER);
            storage.delete(STORAGE_KEYS.DECODED_TOKEN);
            dispatch(setIsAuth(false));
          }}>
          <TextBase.M style={styles.textWhite700}>Log Out</TextBase.M>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SideDrawer;
