"use client";

import { Card } from "antd";
import React, { useEffect, useState } from "react";
import { Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactButton from "@/components/ReactHookForm/ReactButton";
import "dayjs/locale/id";
import { getStockSummary } from "@/api/queries/fetch";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/api/queries/key";
import { GetStockListNewParams } from "@/types/stock";
import StockSummaryFilterModal from "./StockSummaryFilterModal";
import FilterSVG from "@/assets/svg/icon/filter-svg";
import ClientSummaryMainCard from "./ClientSummaryMainCard";

const PurchasePaymentManagement: React.FC = () => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [payload, setPayload] = useState<
    Omit<GetStockListNewParams, "sort_by">
  >({});

  const { data, isFetching, refetch } = useQuery({
    queryFn: () => getStockSummary(payload),
    queryKey: [QUERY_KEY.GET_STOCK_LIST],
    refetchInterval: 7200000,
  });

  useEffect(() => {
    refetch();
  }, [payload, refetch]);

  const renderModal = () => {
    return (
      <>
        {isFilterModalOpen && (
          <StockSummaryFilterModal
            isOpen={isFilterModalOpen}
            params={payload}
            onClose={() => {
              setIsFilterModalOpen(false);
            }}
            onConfirm={(params) => {
              setPayload((state) => ({ ...state, ...params }));
              setIsFilterModalOpen(false);
            }}
          />
        )}
      </>
    );
  };

  return (
    <Layout>
      <ToastContainer autoClose={2000} hideProgressBar={true} />
      <Card className="card-box">
        <div className="filter-search">
          <ReactButton
            type="button"
            onClick={() => {
              setIsFilterModalOpen(true);
            }}
          >
            <span>Filter</span>
            <FilterSVG height={14} strokeWidth={3} />
          </ReactButton>
        </div>
      </Card>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Card>
          <div
            style={{
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "700",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "35vw",
            }}
          >
            <div>Client</div>
            {data?.data.data.client_group_list?.map((client, idx) => (
              <ClientSummaryMainCard key={idx.toString()} data={client} />
            ))}
          </div>
        </Card>
        <Card>
          <div
            style={{
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "700",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "35vw",
            }}
          >
            <div>Coordinator</div>
            {/* {data?.data.data.coordinator_group_list.map((client, idx) => (
              <ClientSummaryMainCard key={idx.toString()} data={client} />
            ))} */}
          </div>
        </Card>
        <Card>
          <div
            style={{
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "700",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "35vw",
            }}
          >
            <div>Status Barang</div>
            {/* {data?.data.data.coordinator_group_list.map((client, idx) => (
              <ClientSummaryMainCard key={idx.toString()} data={client} />
            ))} */}
          </div>
        </Card>
        <Card>
          <div
            style={{
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "700",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "35vw",
            }}
          >
            <div>Status Invoice</div>
            {/* {data?.data.data.coordinator_group_list.map((client, idx) => (
              <ClientSummaryMainCard key={idx.toString()} data={client} />
            ))} */}
          </div>
        </Card>
      </div>
      {renderModal()}
    </Layout>
  );
};

export default PurchasePaymentManagement;
