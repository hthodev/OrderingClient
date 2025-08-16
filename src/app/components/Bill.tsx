"use client";
import React, { useEffect, useMemo, useState } from "react";
import { CheckInvoice } from "../services/food";
import LocalStorage from "../helpers/localstorage";
import Loading from "./Loading";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const fmtDate = (d: Date) => format(d, "dd/MM/yyyy", { locale: vi });
const fmtTime = (d: Date) => format(d, "HH:mm", { locale: vi });

export default function BillPrint({ isViewFromCpn = false }) {
  const [billData, setBillData] = useState<CheckInvoice>();
  const [isLoading, setIsLoading] = useState(true);

  const paymentTime = useMemo(
    () =>
      billData?.paymentTime
        ? `${fmtDate(new Date(billData.paymentTime))} ${fmtTime(
            new Date(billData.paymentTime)
          )}`
        : null,
    [billData]
  );

  useEffect(() => {
    const data = LocalStorage.Bill.get();
    if (data) setBillData(JSON.parse(data));
    setIsLoading(false);
  }, []);

  function formatPrice(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + "K";
    }
    return value.toString();
  }

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm">
          <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-20">
            <Loading />
          </div>
        </div>
      </div>
    );

  return (
    // ⚠️ dùng print-safe để tắt flex khi in (tránh trang trắng)
    <div
      className={`print-safe flex items-center justify-center bg-white px-4`}
    >
      <div
        className={`bill-print mx-auto ${
          !isViewFromCpn ? "text-[70px]" : "text-[13px]"
        } font-[monospace] text-black p-4 border border-black`}
      >
        {/* Header */}
        <div className="text-center font-bold">
          <div
            className={`${
              !isViewFromCpn ? "text-[60px] mt-6" : "text-[16px]"
            } uppercase`}
          >
            Quán nhậu Mỹ Tiên
          </div>
          <div className={`${!isViewFromCpn ? "text-[40px]" : "text-[16px]"}`}>
            ĐC: Duy Thành - Duy Xuyên - Quảng Nam
          </div>
          <div className={`${!isViewFromCpn ? "text-[40px]" : "text-[16px]"}`}>
            ĐT: 07-6666-1056
          </div>
        </div>

        <div className="text-center my-2 font-bold">
          <div
            className={`${
              !isViewFromCpn ? "text-[70px]" : "text-[16px]"
            } uppercase underline`}
          >
            HÓA ĐƠN
          </div>
        </div>

        <div
          className={`flex justify-between ${
            !isViewFromCpn ? "text-[40px]" : "text-sm"
          }`}
        >
          <div>Ngày: {paymentTime || new Date().toLocaleString()}</div>
          <div>Bàn: {billData?.tableName}</div>
        </div>

        {/* Table */}
        <table className="w-full border-3 border-black border-collapse my-2">
          <thead>
            <tr className="border-b-3 border-black">
              <th className="border-r-3 border-black min-w-2/3">Tên hàng</th>
              <th className="border-r-3 border-black w-10">SL</th>
              <th className="border-r-3 border-black">Đơn giá</th>
              <th className="border-r-3 border-black">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {billData?.bills?.map((item: any) => (
              <tr
                key={item._id}
                className="border-b-3 border-solid border-black"
              >
                <td className="border-r-3 border-black px-1 min-w-2/3">
                  {item.name}
                </td>
                <td className="border-r-3 border-black text-center">
                  {item.quantity}
                </td>
                <td className="border-r-3 border-black text-right pr-1">
                  {formatPrice(item.price)}
                </td>
                <td className="text-right dddpr-1">{formatPrice(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Ngắt trang sau bảng, trước tổng kết */}
        <div className="page-break" />

        {/* Summary */}
        <div className="bill-summary">
          <div className="text-right font-semibold">
            {/* <div className="mb-1">
              Tổng tiền hàng: {billData?.totalBill?.toLocaleString()}đ
            </div>
            <div className="mb-1">Chiết khấu: 0%</div> */}
            <div
              className={`${!isViewFromCpn ? "text-[70px]" : "text-[15px]"}`}
            >
              Tổng cộng: {billData?.totalBill?.toLocaleString()}đ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
