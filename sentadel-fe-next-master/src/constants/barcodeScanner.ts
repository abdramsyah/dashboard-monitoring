import { Result } from "@zxing/library";
import moment from "moment";
import { Router } from "next/router";
import { AnyAction, Dispatch } from "redux";

export const barcodeScannerRouteParams = (params: any) => ({
  scanIn: {
    title: "Scan Barang Masuk",
    onResult: (
      result: Result,
      dispatch: Dispatch<AnyAction>,
      navigate: Router
    ) => {
      dispatch({
        type: "barcodeScanner/SCAN_IN",
        param: {
          barcodes: [
            {
              barcode: result.getText(),
              string_date_in: moment().format(),
            },
          ],
        },
      });
      navigate.back();
    },
  },
  scanOut: {
    title: "Scan Barang Keluar",
    onResult: (
      result: Result,
      dispatch: Dispatch<AnyAction>,
      navigate: Router
    ) => {
      dispatch({
        type: "barcodeScanner/SCAN_OUT",
        param: {
          barcodes: [
            {
              barcode: result.getText(),
              string_date_in: moment().format(),
            },
          ],
        },
      });
      navigate.back();
    },
  },
  scanClientBarcodeInWeight: {
    title: "Scan Client Barcode",
    onResult: (
      result: Result,
      dispatch: Dispatch<AnyAction>,
      navigate: Router
    ) => {
      dispatch({
        type: "barcodeScanner/SCAN_CLIENT_BARCODE",
        param: {
          client_barcode: result.getText(),
          id: params.id,
          company_barcode: params.company_barcode,
        },
      });
    },
  },
  scanCompanyBarcodeInWeight: {
    title: "Scan Company Barcode",
    onResult: (
      result: Result,
      dispatch: Dispatch<AnyAction>,
      navigate: Router
    ) => {
      dispatch({
        type: "barcodeScanner/SCAN_COMPANY_BARCODE",
        param: {
          company_barcode: result.getText(),
        },
      });
      navigate.back();
    },
  },
});
