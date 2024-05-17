"use client";

import React from "react";
import { Result, Button } from "antd";
import { useRouter } from "next/navigation";

const NotFoundPage: React.FC = () => {
  const router = useRouter();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Maaf, halaman yang anda coba kunjungi tidak ditemukan."
      extra={
        <Button type="primary" onClick={() => router.push("/")}>
          Kembali ke Beranda
        </Button>
      }
    />
  );
};

export default NotFoundPage;
