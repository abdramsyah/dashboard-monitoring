import isDateObject from "@/components/BarcodeScannerCamera/utils/isDateObject";
import isNullOrUndefined from "@/components/BarcodeScannerCamera/utils/isNullOrUndefined";

export const isObjectType = (value) => typeof value === "object";

const isObject = (value) =>
  !isNullOrUndefined(value) &&
  !Array.isArray(value) &&
  isObjectType(value) &&
  !isDateObject(value);

export default isObject;
