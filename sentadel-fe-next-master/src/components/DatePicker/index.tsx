import React from "react";
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import locale from "antd/es/date-picker/locale/id_ID";
import { PickerSharedProps } from "rc-picker/lib/Picker";
import styles from "./styles.module.scss";

interface DatePickerProps extends PickerSharedProps<Dayjs> {
  label?: string;
  error?: { message: string };
  value?: any;
}

const DatePickerComponent: React.FC<DatePickerProps> = (
  props: DatePickerProps
) => {
  const { label, error, value } = props;

  return (
    <div className={styles.container}>
      {label && <label htmlFor="label">{label}</label>}
      <DatePicker {...props} locale={locale} value={value} />
      {error && <div className="err-message">{error.message}</div>}
    </div>
  );
};

export default DatePickerComponent;
