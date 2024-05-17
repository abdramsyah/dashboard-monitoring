import isNullOrUndefined from "@/components/BarcodeScannerCamera/utils/isNullOrUndefined";
import { isObjectType } from "@/components/BarcodeScannerCamera/utils/isObject";

const isPrimitive = (value) => isNullOrUndefined(value) || !isObjectType(value);
export default isPrimitive;
