import ClipLoader from "@/components/ActivityIndicator/ClipLoader";
import React, { ReactNode } from "react";

type ReactButtonTheme = "solid-blue" | "solid-red" | "outlined-red";
type ReactButtonThemeObj = {
  active: string;
  disabled: string;
};

export interface ReactButtonProps {
  title?: string;
  theme?: ReactButtonTheme;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  newClassName?: string;
  customClassName?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

const ReactButton: React.FC<ReactButtonProps> = (props: ReactButtonProps) => {
  const {
    title,
    theme,
    loading,
    type,
    newClassName,
    customClassName,
    style,
    disabled,
    onClick,
    children,
  } = props;

  const selectedTheme: () => ReactButtonThemeObj = () => {
    switch (theme) {
      case "solid-red":
        return {
          active: "react-button-red",
          disabled: "react-button-solid-disabled",
        };

      case "outlined-red":
        return {
          active: "react-button-red-outlined",
          disabled: "react-button-outlined-disabled",
        };

      default:
        return {
          active: "react-button-blue",
          disabled: "react-button-solid-disabled",
        };
    }
  };

  const renderChildren = () => {
    if (loading) return <ClipLoader loading={loading} size={20} color="#eee" />;

    if (children) return <div>{children}</div>;

    return title;
  };

  return (
    <button
      type={type}
      style={style}
      className={
        newClassName ||
        `${
          disabled ? selectedTheme().disabled : selectedTheme().active
        } ${customClassName} ${
          (disabled || loading) && "react-button-pointer-disabled"
        }`
      }
      disabled={disabled}
      onClick={() => {
        if (type === "button" && onClick) {
          onClick();
        }
      }}
    >
      {renderChildren()}
    </button>
  );
};

export default ReactButton;
