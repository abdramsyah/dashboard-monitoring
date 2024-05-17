"use client";

import { BellOutlined, SettingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { BarcodeScannerCamera } from "@/components/BarcodeScannerCamera";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";

const BarcodeScanner = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const barcodeScanner = useSelector(({ barcodeScanner }) => barcodeScanner);

  const {
    scanDesc: { title, onResult },
  } = barcodeScanner;

  return (
    <div className="scanner">
      <div className="layout">
        <div className="section-content">
          <div className="header-content">
            <div>{title}</div>
            <div className="icon-button">
              {/* <MailOutlined /> */}
              <div
                className="button-menu"
                onClick={() => router.push("/profile")}
              >
                <SettingOutlined />
              </div>
            </div>
            <div className="icon-button">
              <BellOutlined />
            </div>
          </div>
          <div className="content">
            <BarcodeScannerCamera
              onResult={(result) => {
                console.log("barcode-scanner - result", result.getText());
                if (onResult) {
                  onResult(result, dispatch, router);
                } else {
                  // throw {
                  //   err
                  // }
                }
              }}
              onError={(error) =>
                console.log("barcode-scanner - error", error.message)
              }
              timeBetweenDecodingAttempts={2000}
              videoStyle={{
                width: "200px",
                height: "100vh",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
