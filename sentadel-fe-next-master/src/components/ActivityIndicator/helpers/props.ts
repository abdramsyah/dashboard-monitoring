import { CSSProperties, DetailedHTMLProps, HTMLAttributes } from "react";

export type LengthType = number | string;

interface CommonProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  color?: string;
  loading?: boolean;
  cssOverride?: CSSProperties;
  speedMultiplier?: number;
}

export interface LoaderSizeProps extends CommonProps {
  size?: LengthType;
}
