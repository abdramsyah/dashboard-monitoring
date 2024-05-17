"use client";

import { Card } from "antd";
import React from "react";
import { Button, Layout } from "../../components";
import "react-toastify/dist/ReactToastify.css";
// import { faker } from "@faker-js/faker";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   BarElement,
//   Tooltip,
//   Legend,
//   ChartOptions,
// } from "chart.js";
// import { Line } from "react-chartjs-2";
// import { Bar } from "react-chartjs-2";
import { DatePicker } from "antd";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   BarElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const labels = [
//   "Januari",
//   "Februari",
//   "Maret",
//   "April",
//   "Mei",
//   "Juni",
//   "Juli",
//   "Agustus",
//   "September",
//   "November",
//   "Desember",
// ];
// const labelsBar = [
//   "AA",
//   "A",
//   "AB",
//   "B",
//   "BB",
//   "BC",
//   "C",
//   "CC",
//   "CD",
//   "DD",
//   "D",
//   "DE",
// ];
// export const options: ChartOptions = {
//   responsive: true,
//   plugins: {
//     legend: {
//       position: "bottom",
//     },
//     title: {
//       display: false,
//     },
//   },
// };
// export const data = {
//   labels,
//   datasets: [
//     {
//       label: "Sales",
//       data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
//       borderColor: "rgb(53, 162, 235)",
//       backgroundColor: "rgba(53, 162, 235, 0.5)",
//     },
//   ],
// };

// export const dataBar = {
//   labels,
//   datasets: [
//     {
//       label: "Growth",
//       data: labelsBar.map(() =>
//         faker.datatype.number({ min: -1000, max: 1000 })
//       ),
//       borderColor: "rgb(53, 162, 235)",
//       backgroundColor: "rgba(53, 162, 235, 0.5)",
//     },
//   ],
// };

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="dashboard">
        <Card className="card-heading">
          <div className="header">
            <div className="title">
              <p>Welcome back,</p>
              <h3>{/* {userRole?.name} <CofeeIcon /> */}</h3>
            </div>
            <div className="row">
              <Button>Refresh</Button>
            </div>
          </div>
        </Card>
        <div className="reporting">
          <div className="row-7">
            <Card className="card-box line-chart">
              <div className="heading">
                <div className="total">
                  <p>Total Sales</p>
                  <div className="sales">
                    <h3>Rp. 122.852.000.000,-</h3>
                  </div>
                </div>
                <div className="filter">
                  <DatePicker onChange={() => {}} picker="year" />
                </div>
              </div>
              {/* <Line options={options} data={data} /> */}
            </Card>
            <Card className="card-box bar-chart">
              <div className="heading">
                <div className="total">
                  <h3>Total Product</h3>
                  <p>By Grade</p>
                </div>
                <div className="filter">
                  <DatePicker onChange={() => {}} picker="year" />
                </div>
              </div>
              {/* <Bar options={options} data={dataBar} /> */}
            </Card>
          </div>
          <div className="row-3">
            <Card className="card-box ">
              <div className="heading">
                <div className="heading">
                  <h3>Total Produk Masuk</h3>
                  <div className="sales">
                    <h3>2.420.293</h3>
                    <p>Total</p>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="card-box ">
              <div className="heading">
                <div className="heading">
                  <h3>Total Produk Keluar</h3>
                  <div className="sales">
                    <h3>129.340.447</h3>
                    <p>Total</p>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="card-box ">
              <div className="heading">
                <div className="heading">
                  <h3>Coordinator</h3>
                  <div className="sales">
                    <h3>189</h3>
                    <p>People</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
