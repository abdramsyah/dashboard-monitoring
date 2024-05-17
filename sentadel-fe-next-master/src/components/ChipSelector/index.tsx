import React, { useCallback, useEffect, useState } from "react";
import Chip from "../Chip";
import styles from "./styles.module.scss";

export type ChipSelectorOption<TEnum = any> = {
  value: string | number;
  enum?: TEnum;
  label: string;
  selected: boolean;
};

export type ChipSelectorProps =
  | {
      isMultiple: true;
      title: string;
      options: ChipSelectorOption[];
      onChange: (val: ChipSelectorOption[]) => void;
    }
  | {
      isMultiple?: false;
      title: string;
      options: ChipSelectorOption[];
      onChange: (val: ChipSelectorOption) => void;
    };

const ChipSelector: React.FC<ChipSelectorProps> = (
  props: ChipSelectorProps
) => {
  const { title, options, onChange, isMultiple } = props;

  const [selectOption, setSelectOption] = useState([...options]);

  const renderSelection = useCallback(
    (item: ChipSelectorOption, idx: number) => {
      return (
        <Chip
          key={idx.toString()}
          theme={item.selected ? "solid-green" : "outlined-green"}
          onClick={() => {
            if (isMultiple) {
              selectOption[idx].selected = !selectOption[idx].selected;

              setSelectOption([...selectOption]);
              onChange(selectOption);
            } else {
              const newData = options.map((option) => ({
                ...option,
                selected: false,
              }));
              newData[idx].selected = !item.selected;

              setSelectOption([...newData]);

              onChange(item);
            }
          }}
        >
          {item.label}
        </Chip>
      );
    },
    [isMultiple, onChange, options, selectOption]
  );

  return (
    <div className={styles.chipSelector}>
      <div className={styles.container}>
        <div className={styles.title}>{title}</div>
        <div className={styles.selectorArea}>
          {/* {selectOption.map} */}
          {selectOption.map(renderSelection)}
        </div>
      </div>
    </div>
  );
};

export default ChipSelector;
