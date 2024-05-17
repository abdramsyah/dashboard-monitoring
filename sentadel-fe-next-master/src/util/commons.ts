import { useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
import { sKey } from "@/constants/commons";

export const convertDateTimeDBtoIndo = (value: string) => {
  if (value) {
    const date = new Date(value);
    const dateFormatter = new Intl.DateTimeFormat("id", {
      day: "numeric",
      month: "long",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      year: "numeric",
    });

    return dateFormatter.format(date);
  }

  return "-";
};

export const roundToNearestThousand = (amount: number) => {
  return Math.ceil(amount / 1000) * 1000;
};

export function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const formatCurrency = (amount?: number, withoutPrevix?: boolean) => {
  if (!amount) return;
  if (withoutPrevix) return Intl.NumberFormat("id-ID").format(amount);

  let currencyReplaced = false;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    // currencyDisplay: 'code',
    minimumFractionDigits: 0,
  })
    .formatToParts(amount)
    .map((item, idx, arr) => {
      if (
        (item.type === "currency" || item.type === "literal") &&
        currencyReplaced
      )
        return "";

      const nextCurrency =
        arr[idx + 1] && arr[idx + 1].type === "currency" && arr[idx + 1].value;
      if (item.type === "minusSign" && nextCurrency && !currencyReplaced) {
        currencyReplaced = true;
        return `${nextCurrency} ${item.value}`;
      }
      return `${item.value}`;
    })
    .join("");
};

export const deformatCurrency = (val?: string) => {
  if (val) {
    const num = val.replace(/[^0-9]/g, "");

    if (!num.length) return 1;
    return parseInt(num);
  }
  return 0;
};

export const getInitialName = (value?: string) => {
  const name = value;

  return name
    ?.split(" ")
    .map((str) => str[0])
    .join("")
    .toUpperCase();
};

export const snakeToFirstCapital = (val: string, isReverse?: boolean) => {
  if (val) {
    if (isReverse) {
      const list = val.split(" ");
      const newList = list.map((e) => e.toUpperCase());

      return newList.join("_");
    } else {
      const list = val.split("_");
      const newList = list.map(
        (e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()
      );

      return newList.join(" ");
    }
  }

  return "";
};

export const encryptData = (val: any) =>
  CryptoJS.AES.encrypt(JSON.stringify(val), sKey).toString();

export const decryptData = (val: any) => {
  const bytes = CryptoJS.AES.decrypt(val, sKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export const formatDateTime = (dt: string) => {
  if (!dt) return "";

  const currDateClass = new Date(dt);
  const currDateLocale = currDateClass.getDate();
  const todayDate = new Date().getDate();
  const currDate = () => {
    if (currDateLocale === todayDate) return "Hari ini";
    if (currDateLocale === todayDate - 1) return "Kemarin";
    return currDateClass.toLocaleDateString();
  };
  const currTime = currDateClass
    .toLocaleTimeString()
    .split(":")
    .slice(0, 2)
    .join(":");

  return `${currDate()}, ${currTime}`;
};
