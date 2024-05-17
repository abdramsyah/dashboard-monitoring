import { SummaryClientGroup, SummaryGradeClientGroup } from "@/types/stock";
import React, { useCallback, useMemo, useState } from "react";
import styles from "./styles.module.scss";
import Link from "next/link";
import nProgress from "nprogress";

interface ClientSummaruMainCard {
  data: SummaryClientGroup;
}

const MainCard: React.FC<ClientSummaruMainCard> = (
  props: ClientSummaruMainCard
) => {
  const { data } = props;

  const [showDetail, setShowDetail] = useState(false);

  const renderGradeItem = useCallback(
    (grade: SummaryGradeClientGroup, gdIdx: number) => (
      <div key={gdIdx.toString()}>
        <div>{grade.grade}</div>
        <div>{grade.total_goods}</div>
      </div>
    ),
    []
  );

  const renderGradeList = useMemo(
    () => (
      <div
        className={`${styles.gradeContainer} ${
          !showDetail ? "display-none" : ""
        }`}
      >
        {data.grade_recap_list.map(renderGradeItem)}
      </div>
    ),
    [data.grade_recap_list, renderGradeItem, showDetail]
  );

  return (
    <div
      className={styles.mainCard}
      onClick={() => setShowDetail((state) => !state)}
    >
      <div>{data.client_code}</div>
      <div>{data.total_goods}</div>
      <Link
        href={`/stock-goods-list?client_code_list=${data.client_code}`}
        className={styles.detailButton}
        onClick={nProgress.start}
      >
        Detail
      </Link>
      {renderGradeList}
    </div>
  );
};

const ClientSummaryMainCard = React.memo(MainCard);

export default ClientSummaryMainCard;
