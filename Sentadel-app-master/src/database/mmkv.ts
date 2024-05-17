import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'sentadel-storage'
});

export enum STORAGE_KEYS {
  USER = 'USER_DATA',
  DECODED_TOKEN = 'DECODED_TOKEN',
  GRADER = 'GRADER',
  BARCODE_SALES_DAILY_REFETCH = 'BARCODE_SALES_DAILY_REFETCH',
  GRADES_DAILY_REFETCH = 'GRADES_DAILY_REFETCH'
}
