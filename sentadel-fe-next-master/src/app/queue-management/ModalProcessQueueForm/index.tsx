import React from "react";
import { queueDataBodyType } from "@/types/queue";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import { DatePicker } from "antd";
import locale from "antd/es/date-picker/locale/id_ID";
import dayjs from "dayjs";
import styles from "@/app/queue-management/ModalProcessQueueForm/styles.module.scss";

interface ModalRequestManagementFormProps {
  queueBody: queueDataBodyType;
  loading: boolean;
  isModalOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChangeDate: (date: dayjs.Dayjs | null, dateString: string) => void;
  title: string;
  confirm: string;
  cancelFocused?: boolean;
}

const ModalProcessQueueForm: React.FC<ModalRequestManagementFormProps> = (
  props: ModalRequestManagementFormProps
) => {
  const {
    queueBody,
    loading,
    isModalOpen,
    onClose,
    onSubmit,
    onChangeDate,
    title,
    confirm,
    cancelFocused,
  } = props;

  const defaultDate = dayjs(queueBody.date, "YYYY-MM-DD");

  return (
    <ConfirmationModal
      open={isModalOpen}
      onConfirm={onSubmit}
      confirm={confirm}
      onClose={onClose}
      cancel="Kembali"
      title={title}
      cancelFocused={cancelFocused}
      loading={loading}
      disabled={!queueBody.date}
    >
      <div className={styles.queueProcessModal}>
        <div className={styles.datePicker}>
          <div>Tanggal Kirim</div>
          <div>:</div>
          <DatePicker
            locale={locale}
            className="date-picker"
            onChange={onChangeDate}
            defaultValue={defaultDate}
          />
        </div>
        <div className={`${styles.queueCardRow} ${styles.queueCardHeader}`}>
          <div>Nama Petani</div>
          <div>Jenis Produk</div>
          <div>Jumlah Keranjang</div>
        </div>
        {queueBody?.list.map((e, idx) => {
          return (
            <div
              key={idx.toString()}
              className={`${styles.queueCardRow} ${
                idx % 2 !== 0 && styles.queueCardRowEven
              }`}
            >
              <div>{e.farmer_name}</div>
              <div>{e.product_type}</div>
              <div>{e.quantity_bucket}</div>
            </div>
          );
        })}
        <div className={`${styles.queueCardRow} ${styles.queueCardHeader}`}>
          <div className={styles.totalTitle}>Total Keranjang</div>
          <div>{queueBody.total}</div>
        </div>
      </div>
    </ConfirmationModal>
  );
};

export default ModalProcessQueueForm;
