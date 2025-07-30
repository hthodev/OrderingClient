"use client";
import React, { useEffect, useState } from "react";
import { CheckInvoice } from "../services/food";
import LocalStorage from "../helpers/localstorage";
import Loading from "./Loading";

export default function BillPrint(
  
) {
  const [billData, setBillData] = useState<CheckInvoice>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = LocalStorage.Bill.get();
    if (data) {
      setBillData(JSON.parse(data));
    }
    setIsLoading(false);
  }, []);

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
    <div className="flex items-center justify-center bg-white px-4">
      <div className="bill-print mx-auto text-[13px] font-[monospace] text-black p-4 border border-black print:w-[80mm]">
        <div className="text-center font-bold">
          <div className="text-[16px] uppercase">Quán nhậu Mỹ Tiên</div>
          <div>ĐC: Duy Thành - Duy Xuyên - Quảng Nam</div>
          <div>ĐT: 07-6666-1056</div>
        </div>

        <div className="text-center my-2 font-bold">
          <div className="text-[16px] uppercase underline">HÓA ĐƠN</div>
        </div>

        <div className="flex justify-between text-sm">
          <div>Ngày: {new Date().toLocaleString()}</div>
          <div>Bàn: {billData?.tableName}</div>
        </div>

        <table className="w-full border border-black border-collapse my-2">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black w-6">STT</th>
              <th className="border-r border-black">Tên hàng</th>
              <th className="border-r border-black w-10">ĐVT</th>
              <th className="border-r border-black w-10">SL</th>
              <th className="border-r border-black">Đơn giá</th>
              <th className="border-r border-black">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {billData?.bills?.map((item: any, index: number) => (
              <tr
                key={item._id}
                className="border-b border-dashed border-black"
              >
                <td className="border-r border-black text-center">
                  {index + 1}
                </td>
                <td className="border-r border-black px-1">{item.name}</td>
                <td className="border-r border-black text-center">
                  {item.unit || ""}
                </td>
                <td className="border-r border-black text-center">
                  {item.quantity}
                </td>
                <td className="border-r border-black text-right pr-1">
                  {item.price.toLocaleString()}
                </td>
                <td className="text-right pr-1">
                  {item.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right font-semibold">
          <div className="mb-1">
            Tổng tiền hàng: {billData?.totalBill?.toLocaleString()} đ
          </div>
          <div className="mb-1">Chiết khấu: 0%</div>
          <div className="text-[15px]">
            Tổng cộng: {billData?.totalBill?.toLocaleString()} đ
          </div>
        </div>
      </div>
    </div>
  );
}
