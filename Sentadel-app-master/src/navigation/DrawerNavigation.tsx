import {
  NavigationContainer,
  useNavigationContainerRef
} from '@react-navigation/native';
import { RootNavigation } from './RootNavigation';
import { RootNavigationParams } from './RootNavigationParams';
import React from 'react';
import {
  DrawerContentComponentProps,
  createDrawerNavigator
} from '@react-navigation/drawer';
import { screenWidth } from '@sentadell-src/config/Sizes';
import SideDrawer from '@sentadell-src/components/Drawer/SideDrawer';
import Colors from '@sentadell-src/config/Colors';
import { StyleSheet } from 'react-native';
const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  const navigationRef = useNavigationContainerRef<RootNavigationParams>();

  return (
    <NavigationContainer ref={navigationRef}>
      <Drawer.Navigator
        initialRouteName="RootNavigation"
        screenOptions={{
          headerShown: false,
          drawerPosition: 'left',
          swipeEnabled: false,
          drawerStyle: styles.drawerStyles
        }}
        drawerContent={(props: DrawerContentComponentProps) => (
          <SideDrawer {...props} />
        )}>
        <Drawer.Screen name="RootNavigation" component={RootNavigation} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  drawerStyles: {
    width: screenWidth * 0.8,
    backgroundColor: Colors.drawerMenu.bgColor
  }
});

export default DrawerNavigation;
