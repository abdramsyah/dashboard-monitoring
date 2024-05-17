import React, { CSSProperties, ReactNode } from "react";
import { Button } from "antd";
import Styles from "@/components/Button/CustomButton/styles.module.scss";
import { BaseButtonProps } from "antd/es/button/button";

type ButtonComponentProps = {
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: BaseButtonProps["type"];
  className?: string;
  ghost?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  badge?: number;
};

const ButtonComponent = ({
  children,
  onClick,
  type,
  className,
  ghost,
  icon,
  loading,
  disabled,
  style,
  badge,
}: ButtonComponentProps) => {
  const badgeNumber = () => {
    if (badge)
      return (
        <div className={Styles.badgeContainer}>
          <span className={Styles.badgeNumber}>{badge}</span>
        </div>
      );

    return null;
  };

  return (
    <div className={Styles.container}>
      <Button
        data-testid="button-component"
        className={className}
        style={style}
        type={type || "primary"}
        onClick={onClick}
        ghost={ghost || false}
        icon={icon || null}
        loading={loading}
        disabled={disabled}
      >
        {children}
      </Button>
      {badgeNumber()}
    </div>
  );
};

export default ButtonComponent;
