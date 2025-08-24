"use client";
import React, { useEffect, useMemo, useState } from "react";
import { CheckInvoice } from "../services/food";
import LocalStorage from "../helpers/localstorage";
import Loading from "./Loading";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const fmtDate = (d: Date) => format(d, "dd/MM/yyyy", { locale: vi });
const fmtTime = (d: Date) => format(d, "HH:mm", { locale: vi });
const money = (n?: number) => (n ?? 0).toLocaleString("vi-VN");

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm">
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
            <Loading />
          </div>
        </div>
      </div>
    );
  }
  const previewScale = !isViewFromCpn ? "scale-[4.5]" : "scale-100";

  return (
    <div className="bg-white flex justify-center py-6 print:py-0 font-[monospace]">
      <div className={`origin-top ${previewScale}`}>
        <div className="w-[58mm] bg-white text-gray-900 font-sans text-[12px] leading-tight print:shadow-none print:m-0 print:p-0">
          <div className="text-center px-3 pt-3">
            <div className="text-[20px] font-semibold">Quán nhậu Mỹ Tiên</div>
            <div className="text-[13px]">
              ĐC: Duy Thành - Duy Xuyên - Quảng Nam
            </div>
            <div className="text-[13px]">ĐT: 07-6666-1056</div>
          </div>

          <div className="px-3 mt-2 text-center">
            <div className="font-extrabold uppercase text-[15px]">
              HÓA ĐƠN BÁN HÀNG
            </div>
            <div className="text-[13px] mt-1">
              {paymentTime || `${fmtDate(new Date())} ${fmtTime(new Date())}`}
            </div>
          </div>

          <div className="px-3 mt-2 text-[13px]">
            <div className="flex justify-between">
              <span>
                Bàn: <b>{billData?.tableName || "-"}</b>
              </span>
            </div>
          </div>

          <div className="px-3 mt-2">
            <div className="border-t border-dashed border-gray-700" />
            <div className="flex items-baseline pt-1 text-[15px] font-semibold uppercase">
              <div className="basis-[30%] grow text-right pr-1">Giá</div>
              <div className="basis-[20%] shrink-0 text-center">SL</div>
              <div className="basis-[50%] grow text-right">Thành tiền</div>
            </div>
            <div className="border-t border-dashed border-gray-300 mt-1" />

            {billData?.bills?.map((item: any) => (
              <div key={item._id} className="py-1">
                <div className="text-[23px] font-bold leading-snug break-words">
                  {item.name}
                </div>

                <div className="flex items-baseline mt-0.5 text-[20px]">
                  <div className="basis-[40%] grow text-right pr-1">
                    {(item.price ?? 0).toLocaleString("vi-VN")}
                  </div>
                  <div className="basis-[20%] shrink-0 text-center">
                    {item.quantity}
                  </div>
                  <div className="basis-[40%] grow text-right">
                    {(item.total ?? 0).toLocaleString("vi-VN")}
                  </div>
                </div>

                <div className="border-b border-dashed border-gray-300 mt-1" />
              </div>
            ))}
          </div>

          <div className="page-break-before px-3 mt-2">
            <div className="border-t border-dashed border-gray-700" />
            <div className="mt-2 space-y-1 text-[20px]">
              <div className="flex justify-between text-[20px]">
                <span className="font-semibold">Tổng: </span>
                <span className="font-extrabold">
                  {money(billData?.totalBill)} đ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
