import TrashIcon from "@/assets/svg/icon/trash";
import React from "react";
import styles from "./styles.module.scss";

interface DisposableContainer {
  index?: number;
  children: React.ReactNode;
  className?: string;
  customClassName?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const DisposableContainer: React.FC<DisposableContainer> = (
  props: DisposableContainer
) => {
  const { index, children, className, customClassName, onClick, disabled } =
    props;

  return (
    <div
      className={`${
        className || styles.disposableContainer
      } ${customClassName}`}
    >
      {index && (
        <div className={styles.indexContainer}>
          <span className={styles.indexNumber}>{index}</span>
        </div>
      )}
      {children}
      <TrashIcon
        className={styles.disposeButton}
        onClick={disabled ? undefined : onClick}
        stroke={disabled ? "#ccc" : "red"}
      />
    </div>
  );
};

export default DisposableContainer;
