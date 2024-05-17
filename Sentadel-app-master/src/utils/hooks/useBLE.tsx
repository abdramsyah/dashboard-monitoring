// import { PermissionsAndroid, Platform } from 'react-native';
// import { BleManager } from 'react-native-ble-plx';

// type permissionCallback = (result: boolean) => void;

// interface BluetoothLowEnergyAPI {
//   requestPermissions(callback: permissionCallback): Promise<void>;
// }

// export default function useBLE(): BluetoothLowEnergyAPI {
//   const bleManager = new BleManager();

//   // bleManager.

//   const requestPermissions = async (callback: permissionCallback) => {
//     if (Platform.OS === 'android') {
//       const grantedStatus = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: 'Location Permission',
//           message: 'Bluetooth Low Energy Needs Location Permission',
//           buttonNegative: 'cancel',
//           buttonPositive: 'Ok',
//           buttonNeutral: 'Maybe Later'
//         }
//       );

//       callback(grantedStatus === PermissionsAndroid.RESULTS.GRANTED);
//     } else {
//       callback(true);
//     }
//   };

//   return {
//     requestPermissions
//   };
// }
