"use client";

import { Card } from "antd";
import React, { ReactNode, useState } from "react";
import { Layout } from "@/components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./styles.module.scss";
import ScannerBarcode from "@/assets/svg/icon/barcode";
import ScanGoodsInModal from "./modal/ScanGoodsInModal";

type ButtonSelectionCardType = {
  title: string;
  icon?: ReactNode;
  onClick?: () => void;
};

const ScannerSystem = () => {
  const [goodsInModal, setGoodsInModal] = useState(false);

  const buttonSelectionCard: ButtonSelectionCardType[] = [
    { title: "Barang Masuk", onClick: () => setGoodsInModal(true) },
    { title: "Pengiriman" },
    { title: "Cek Informasi" },
    { title: "Masuk Gudang" },
    { title: "Keluar Gudang" },
  ];

  const renderModal = () => {
    return (
      <>
        {goodsInModal && (
          <ScanGoodsInModal
            isOpen={goodsInModal}
            onClose={() => setGoodsInModal(false)}
          />
        )}
      </>
    );
  };

  return (
    <Layout>
      <ToastContainer autoClose={2000} hideProgressBar={true} />
      <Card className="card-box">
        <div className={styles.scanSelectionContainer}>
          {buttonSelectionCard.map((e, idx) => (
            <div
              key={idx.toString()}
              className={`${styles.selectionCard} ${styles.sectionTouchable}`}
              onClick={e.onClick}
            >
              <ScannerBarcode
                fill="#fff"
                width={200}
                height={200}
                opacity={0.8}
              />
              <div>{e.title}</div>
            </div>
          ))}
        </div>
      </Card>
      {renderModal()}
    </Layout>
  );
};

export default ScannerSystem;
