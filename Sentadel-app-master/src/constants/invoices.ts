import Colors from '@sentadell-src/config/Colors';
import { InvoiceDetail } from '@sentadell-src/types/invoices';
import { formatCurrency } from '@sentadell-src/utils/commons';
import dayjs from 'dayjs';

export const invoiceStatusLabel = {
  ON_PROGRESS: {
    label: 'Dalam Proses',
    color: Colors.invoiceStatus.onProgress
  },
  APPROVED: {
    label: 'Dalam Proses',
    color: Colors.invoiceStatus.approved
  },
  REJECTED: {
    label: 'Ditolak',
    color: Colors.invoiceStatus.approved
  },
  PRINTED: {
    label: 'Pembayaran Siap',
    color: Colors.invoiceStatus.markedByAdminAsPaid
  },
  CONFIRMED_BY_COORDINATOR: {
    label: 'Selesai',
    color: Colors.invoiceStatus.markedByCoordinatorAsPaid
  }
};

export const invoiceCardParamsList = (item: InvoiceDetail) => [
  {
    title: 'Jumlah Keranjang',
    value: item.bucket_quantity
  },
  {
    title: 'Total Jumlah',
    value: formatCurrency(item.purchase_price_accum, true)
  },
  {
    title: 'Potongan',
    value: formatCurrency(item.fee_price, true)
  },
  {
    title: 'Titipan',
    value: formatCurrency(item.tax_price, true)
  },
  {
    title: 'Pot. Pinjaman',
    value: formatCurrency(item.repayment_accum, true)
  },
  {
    title: 'Jumlah Diterima',
    value: formatCurrency(
      (item.purchase_price_accum || 0) -
        ((item.fee_price || 0) +
          (item.tax_price || 0) +
          (item.repayment_accum || 0)),
      true
    )
  }
];

export const headerDetail = (detail?: InvoiceDetail) => [
  {
    title: 'No.Invoice',
    value: detail?.invoice_number
  },
  {
    title: 'Tanggal',
    value: dayjs(detail?.invoice_date).locale('id').format('DD MMMM YYYY')
  },
  {
    title: 'Nama',
    value: `${detail?.coordinator_name} (${detail?.coordinator_code})`
  },
  {
    title: 'Jumlah Keranjang',
    value: detail?.bucket_quantity
  }
];
