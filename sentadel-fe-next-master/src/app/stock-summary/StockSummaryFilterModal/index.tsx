import React, { useState } from "react";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import DatePickerComponent from "@/components/DatePicker";
import { GetStockListNewParams } from "@/types/stock";
import ChipSelector from "@/components/ChipSelector";
import {
  goodsStatusOptions,
  invoiceStatusOptions,
  invoiceStatusSimplified,
  invoiceStatusSimplifiedKey,
} from "@/constants/stock";
import { DeliveryStatusAccumModel } from "@/types/purchase";
import dayjs from "dayjs";
import useGetClientList from "@/util/hooks/useGetClientList";

interface StockSummaryFilterModalProps {
  isOpen: boolean;
  params: Omit<GetStockListNewParams, "sort_by">;
  onClose: () => void;
  onConfirm: (params: Omit<GetStockListNewParams, "sort_by">) => void;
}

const StockSummaryFilterModal: React.FC<StockSummaryFilterModalProps> = (
  props: StockSummaryFilterModalProps
) => {
  const { isOpen, params, onClose, onConfirm } = props;

  const clientOptions = useGetClientList(params.client_code_list);

  const [goodsDate, setGoodsDate] = useState(params.goods_date || "");
  const [purchaseDate, setPurchaseDate] = useState(params.purchase_date || "");
  const [goodsDateTo, setGoodsDateTo] = useState(params.goods_date_to || "");
  const [purchaseDateTo, setPurchaseDateTo] = useState(
    params.purchase_date_to || ""
  );
  const [goodsStatus, setGoodsStatus] = useState<
    GetStockListNewParams["goods_status_list"]
  >(params.goods_status_list || []);
  const [invoiceStatus, setInvoiceStatus] = useState<
    GetStockListNewParams["invoice_status_list"]
  >(params.invoice_status_list || []);
  const [clientCodes, setClientCodes] = useState<
    GetStockListNewParams["client_code_list"]
  >(params.invoice_status_list || []);

  return (
    <ConfirmationModal
      open={isOpen}
      title="Edit Grade"
      onConfirm={() => {
        onConfirm({
          goods_date: goodsDate,
          purchase_date: purchaseDate,
          goods_status: goodsStatus?.join(","),
          invoice_status: invoiceStatus?.join(","),
          client_code: clientCodes?.join(","),
          goods_status_list: goodsStatus,
          invoice_status_list: invoiceStatus,
          client_code_list: clientCodes,
        });
      }}
      onClose={onClose}
      width={500}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div>Tanggal Tumplek</div>
          <DatePickerComponent
            label="dari"
            value={goodsDate ? dayjs(goodsDate) : undefined}
            onChange={(_, date) => setGoodsDate(date)}
          />
          <DatePickerComponent
            label="Sampai"
            value={goodsDateTo ? dayjs(goodsDateTo) : undefined}
            onChange={(_, date) => setGoodsDateTo(date)}
          />
        </div>
        <div>
          <div>Tanggal Beli</div>
          <DatePickerComponent
            label="dari"
            value={purchaseDate ? dayjs(purchaseDate) : undefined}
            onChange={(_, date) => setPurchaseDate(date)}
          />
          <DatePickerComponent
            label="Sampai"
            value={purchaseDateTo ? dayjs(purchaseDateTo) : undefined}
            onChange={(_, date) => setPurchaseDateTo(date)}
          />
        </div>
      </div>
      <ChipSelector
        isMultiple
        title="Status Invoice"
        options={invoiceStatusOptions}
        onChange={(vals) => {
          let data: GetStockListNewParams["invoice_status_list"] = [];
          vals.forEach((e) => {
            if (!e.selected) return;
            const item =
              invoiceStatusSimplified[e.value as invoiceStatusSimplifiedKey];

            if (item && data) data = [...data, ...item];
          });
          setInvoiceStatus(data);
        }}
      />
      <ChipSelector
        isMultiple
        title="Status Barang"
        options={goodsStatusOptions}
        onChange={(vals) => {
          const data: GetStockListNewParams["goods_status_list"] = [];
          vals.forEach((e) => {
            if (!e.selected) return;
            data.push(e.value as keyof DeliveryStatusAccumModel);
          });
          setGoodsStatus(data);
        }}
      />
      {!!clientOptions.length && (
        <ChipSelector
          isMultiple
          title="Client"
          options={clientOptions}
          onChange={(vals) => {
            const data: GetStockListNewParams["client_code_list"] = [];
            vals.forEach((e) => {
              if (!e.selected) return;
              data.push(e.value as string);
            });
            setClientCodes(data);
          }}
        />
      )}
    </ConfirmationModal>
  );
};

export default StockSummaryFilterModal;
