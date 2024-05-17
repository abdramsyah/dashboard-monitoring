import React, { CSSProperties } from "react";
import { Property } from "csstype";

interface CircularBadgeProps {
  children: React.ReactNode;
  onClick?: () => void;
  backgroundColor?: Property.BackgroundColor;
  size?: number;
}

const CircularBadge = (props: CircularBadgeProps) => {
  const { children, onClick, backgroundColor, size } = props;

  const touchableHandler = () => {
    if (onClick) {
      return {
        onClick,
        className: "chip-touchable",
      };
    }
  };

  const styles: CSSProperties = {
    color: "#FFF",
    backgroundColor: backgroundColor || "#F5222D",
    padding: "5px",
    borderRadius: (size || 26) / 2,
    justifyContent: "center",
    alignItems: "center",
    display: "inline-flex",
    width: size || 26,
    height: size || 26,
    fontSize: (size || 26) / 2,
    fontWeight: "600",
  };

  return (
    <div
      className={touchableHandler()?.className}
      style={styles}
      onClick={() => touchableHandler()?.onClick()}
    >
      {children}
    </div>
  );
};

export default CircularBadge;
