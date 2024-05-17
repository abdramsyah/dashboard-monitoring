import React from "react";
import styles from "./styles.module.scss";
import { PlusCircleOutlined } from "@ant-design/icons";

interface FieldArrayContainerProps {
  title?: string;
  children: React.ReactNode;
  onClickAdd: () => void;
  disabled?: boolean;
}

const FieldArrayContainer: React.FC<FieldArrayContainerProps> = (
  props: FieldArrayContainerProps
) => {
  const { title, children, onClickAdd, disabled } = props;
  return (
    <div className={styles.fieldArrayContainer}>
      <div className={styles.headerContainer}>
        {title && <span className={styles.title}>{title}</span>}
        <PlusCircleOutlined
          style={{ fontSize: 24, color: disabled ? "#ddd" : "#000" }}
          onClick={disabled ? undefined : onClickAdd}
        />
      </div>
      <div className={styles.horizontalLine} />
      <div className={styles.formContainer}>{children}</div>
    </div>
  );
};

export default FieldArrayContainer;
