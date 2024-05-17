import {
  DropdownItemEnum,
  DropdownItemProps
} from '@sentadell-src/components/Dropdown/Dropdown';
import Colors from '@sentadell-src/config/Colors';
import {
  GroupByQueueGroupDetailEnum,
  ProgressStatus,
  QueueRequestDataEnum,
  QueueRequestEnum,
  ScannedStatusEnum,
  QueueRequestProps,
  QueueDetailModel,
  InvoiceCardType
} from '@sentadell-src/types/queue';
import { ReactFormType } from '@sentadell-src/types/reactForm';
import { formatCurrency } from '@sentadell-src/utils/commons';
import { UseFieldArrayReturn } from 'react-hook-form';

export const bucketStatusTranslate: {
  [K in ScannedStatusEnum]: string;
} = {
  [ScannedStatusEnum.Approve]: 'Diterima',
  [ScannedStatusEnum.AlreadyApproved]: 'Kesalahan',
  [ScannedStatusEnum.Reject]: 'Ditolak',
  [ScannedStatusEnum.AlreadyRejected]: 'Kesalahan'
};

export const productTypeList: DropdownItemProps[] = [
  { value: 1, label: 'Kemitraan', selected: false },
  { value: 2, label: 'Lokal', selected: false },
  { value: 3, label: 'Dagang', selected: false }
];

export const groupByDetailList: DropdownItemProps<GroupByQueueGroupDetailEnum>[] =
  [
    {
      value: 1,
      label: 'Petani',
      selected: false,
      enum: GroupByQueueGroupDetailEnum.FARMER
    },
    {
      value: 2,
      label: 'Jenis Produk',
      selected: false,
      enum: GroupByQueueGroupDetailEnum.PRODUCT
    },
    {
      value: 3,
      label: 'Nomor Invoice',
      selected: false,
      enum: GroupByQueueGroupDetailEnum.INVOICE
    }
  ];

export const queueStatusTrans: { [K in ProgressStatus]: string } = {
  APPROVED: 'Diterima',
  ON_PROGRESS: 'Dalam Proses',
  REJECTED: 'Ditolak'
};

export const queueStatusList: DropdownItemProps[] = [
  {
    value: 1,
    label: queueStatusTrans[ProgressStatus.ON_PROGRESS],
    enum: ProgressStatus.ON_PROGRESS,
    selected: false
  },
  {
    value: 2,
    label: queueStatusTrans[ProgressStatus.APPROVED],
    enum: ProgressStatus.APPROVED,
    selected: false
  },
  {
    value: 3,
    label: queueStatusTrans[ProgressStatus.REJECTED],
    enum: ProgressStatus.REJECTED,
    selected: false
  }
];

export const queueFormList: (
  fieldArray: UseFieldArrayReturn<
    QueueRequestProps,
    QueueRequestEnum.QUEUES,
    'id'
  >,
  partnerData?: DropdownItemProps[]
) => ReactFormType<QueueRequestEnum>[] = (fieldArray, partnerData) => [
  {
    name: QueueRequestEnum.QUEUES,
    formType: {
      type: 'fieldArray',
      fieldArray,
      title: 'Tambah Antrian',
      max: 40,
      shouldFocus: false,
      useIndex: true,
      form: [
        {
          name: QueueRequestDataEnum.FARMER,
          formType: {
            type: 'dynamic',
            form1: {
              isMultiple: false,
              type: 'select',
              label: 'Mitra',
              title: 'Mitra',
              options: partnerData || [],
              returnedKey: DropdownItemEnum.DATA,
              containerStyle: { width: '100%' }
            },
            form2: {
              type: 'input',
              label: 'Nama Petani',
              customStyle: {
                container: {
                  width: '100%'
                }
              }
            },
            listenTo: QueueRequestDataEnum.PRODUCT_TYPE,
            condition: 'Kemitraan'
          },
          rules: { required: 'Nama petani tidak boleh kosong' }
        },
        {
          name: QueueRequestDataEnum.PRODUCT_TYPE,
          formType: {
            isMultiple: false,
            type: 'select',
            label: 'Jenis Produk',
            title: 'Jenis Produk',
            options: JSON.parse(JSON.stringify(productTypeList)),
            returnedKey: DropdownItemEnum.LABEL
          },
          rules: { required: 'Pilih salah satu jenis produk' }
        },
        {
          name: QueueRequestDataEnum.REQUEST_QUANTITY,
          formType: {
            type: 'input',
            label: 'Jumlah',
            keyboardType: 'numeric',
            customStyle: {
              container: {
                flex: 1.2
              }
            }
          },
          rules: {
            required: 'Jumlah keranjang tidak boleh kosong',
            min: { value: 1, message: 'Jumlah keranjang harus 1 atau lebih' }
          }
        }
      ]
    }
  }
];

export const progressStatusTheme: {
  [K in ProgressStatus]: string;
} = {
  [ProgressStatus.APPROVED]: Colors.base.greenApproved,
  [ProgressStatus.ON_PROGRESS]: Colors.base.blueOnProgress,
  [ProgressStatus.REJECTED]: Colors.base.redRejected
};

export const bucketStatusTheme: {
  [K in ScannedStatusEnum]: string;
} = {
  [ScannedStatusEnum.Approve]: Colors.chip.green,
  [ScannedStatusEnum.AlreadyApproved]: Colors.chip.red,
  [ScannedStatusEnum.Reject]: Colors.chip.green,
  [ScannedStatusEnum.AlreadyRejected]: Colors.chip.red
};

export const invoiceCardParamsList: (
  item: QueueDetailModel
) => InvoiceCardType[] = item => [
  {
    title: 'Harga Unit',
    value: formatCurrency(item.unit_price, true)
  },
  {
    title: 'Berat',
    value: item.purchase_gross_weight / 1000,
    suffix: 'Kg.'
  },
  {
    title: 'Harga Total',
    value: formatCurrency(item.purchase_price, true)
  }
];

export const conditionalContent: (queue: QueueDetailModel) => {
  [K in GroupByQueueGroupDetailEnum]?: {
    title: string;
    value: string;
  }[];
} = queue => ({
  [GroupByQueueGroupDetailEnum.FARMER]: [
    {
      title: 'No. Invoice',
      value: queue.invoice_number || ''
    },
    {
      title: 'Jenis',
      value: queue.product_type
    }
  ],
  [GroupByQueueGroupDetailEnum.PRODUCT]: [
    {
      title: 'No. Invoice',
      value: queue.invoice_number || ''
    },
    {
      title: 'Petani',
      value: queue.farmer_name
    }
  ],
  [GroupByQueueGroupDetailEnum.INVOICE]: [
    {
      title: 'Petani',
      value: queue.farmer_name
    },
    {
      title: 'Jenis',
      value: queue.product_type
    }
  ]
});
