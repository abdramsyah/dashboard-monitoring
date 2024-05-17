import React from "react";
import { Card, Button } from "antd";
import { transQueueStatus } from "../../../util/lang";

interface QueueRequestListMobileProps {
  params: any;
  dataSource: any;
  loading: boolean;
}

const QueueRequestListMobile: React.FC<QueueRequestListMobileProps> = (
  props: QueueRequestListMobileProps
) => {
  const { params, dataSource, loading } = props;

  if (loading) return "loading";
  if (!dataSource.length) return "Tidak ada data";

  return (
    <>
      {dataSource.map((row: any, index: number) => (
        <Card
          key={index}
          className="card-mobile-view"
          size="small"
          title={`No ${(params.page - 1) * (params.limit || 0) + index + 1}`}
        >
          <p>Nama Koordinator</p>
          <h5>{row.coordinator_name}</h5>
          <p>Nama Petani</p>
          <h5>{row.farmer_name}</h5>
          <p>Jenis Produk</p>
          <h5>{row.product_type}</h5>
          <p>Jumlah Keranjang</p>
          <h5>{row.request_quantity}</h5>
          <p>Status</p>
          <Button
            className={
              row.status === "APPROVED"
                ? "approved"
                : row.status === "ON_PROGRESS"
                ? "on-progress"
                : "another-status"
            }
          >
            {transQueueStatus(row.status)}
          </Button>
        </Card>
      ))}
    </>
  );
};

export default QueueRequestListMobile;
