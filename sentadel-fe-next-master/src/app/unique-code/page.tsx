"use client";

import { Card, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { Button, Layout } from "../../components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UniqueCodeGenerator = () => {
  const dispatch = useDispatch();

  const params: any = {
    limit: 5,
    page: 1,
    keyword: null,
  };

  const { uniqueCode } = useSelector(
    ({ uniqueCodeGenerator }) => uniqueCodeGenerator
  );

  let dataSource: any[] = [];
  uniqueCode?.data.map((item: any, key: number) =>
    dataSource.push({
      ...item,
      key: key + 1,
    })
  );

  const currentUniqueCodes = () => {
    const currentUniqueCode: string[] = [];

    dataSource.forEach((e) => e.is_current && currentUniqueCode.push(e.code));

    if (currentUniqueCode.length) {
      return currentUniqueCode.join(" | ");
    }
    return "-";
  };

  useEffect(() => {
    dispatch({ type: "uniqueCodeGenerator/GET_DATA", param: params });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <Layout>
      <ToastContainer autoClose={2000} hideProgressBar={true} />

      <Card className="card-box">
        <div className="header">
          <div className="title">
            <h3>Unique Code</h3>
          </div>
          <div className="button">
            {/* <h3>1.127</h3> */}
            <Button
              className="btn-add"
              onClick={() =>
                dispatch({
                  type: "uniqueCodeGenerator/POST_DATA",
                  param: params,
                })
              }
            >
              Generate New Unique Code
            </Button>
          </div>
        </div>
        <div className="information">
          <Card className="information-card-full">
            <div className="title">
              <h3>Current Unique Code</h3>
            </div>
            <Typography className="jumlah">{currentUniqueCodes()}</Typography>
          </Card>
        </div>
      </Card>

      <Card className="card-box">
        <div className="header">
          <div className="title">
            <h3>Unique Code Precaution</h3>
          </div>
        </div>
        <div className="detail">
          Unique Code yang digenerate pada menu ini akan digunakan oleh
          Administrator Sales untuk melakukan revisi data product grouping yang
          sudah diinput sebelumnya
        </div>
      </Card>
      <Card className="card-box">
        <div className="header">
          <div className="title">
            <h3>Unique Code History</h3>
          </div>
        </div>
        {dataSource.map((item, index) => {
          if (item.is_current) {
            return null;
          }

          return (
            <div className="header" key={index}>
              <div className="code-history">
                <h2>{item.code} </h2>
              </div>
              <div className="row-history">
                <h3 className="">
                  {moment(item.created_at).format("DD MMMM YYYY")}
                </h3>
              </div>
            </div>
          );
        })}
      </Card>
    </Layout>
  );
};

export default UniqueCodeGenerator;
