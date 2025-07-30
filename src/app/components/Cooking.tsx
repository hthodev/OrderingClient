"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import Loading from "./Loading";
import TableService, { FullTable } from "../services/table";
import FoodService, { Food } from "../services/food";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import socket from "../lib/socket-io";
import { playVoice } from "../helpers/voiceOrder";

export interface NewOrder_Socket {
  data: {
    foods: Food[];
    table: FullTable;
  };
}

function OrderItem({ food, order_id }: { food: Food; order_id?: string }) {
  const [done, setDone] = useState(food.isCooked || false);
  const isMultiple = food.quantity > 1;

  const handleCookedFood = async () => {
    if (food.isCooked) return;
    if (order_id) {
      try {
        await FoodService.CookedFood(order_id, food._id);
        setDone(true);
        toast.success(`Món ăn ${food.name} đã được nấu xong`);
      } catch (error) {
        toast.error(`Có lỗi khi cập nhật món ăn ${food.name}`);
      }
    }
  };

  return (
    <li
      className={`flex items-center justify-between mb-2 ${
        done ? "line-through text-gray-400" : "text-gray-900"
      }`}
    >
      <div
        onClick={() => handleCookedFood()}
        className={`flex items-center space-x-2 select-none ${
          done ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className={isMultiple ? "font-bold text-red-600 text-lg" : ""}>
          {food.quantity}x
        </span>
        <span>{food.name}</span>
      </div>
      <Button
        className={`text-xs px-2 py-1 ml-4 ${
          done ? "text-green-600 bg-green-50 cursor-default" : "text-yellow-200"
        }`}
        onClick={() => !done && handleCookedFood()}
        disabled={done}
      >
        {done ? "Đã nấu xong" : "Đang nấu..."}
      </Button>
    </li>
  );
}

function OrderCard({ table }: { table: FullTable }) {
  const [expanded, setExpanded] = useState(true);
  const order = table.order;
  const createdAt = dayjs(order?.createdAt);
  const updatedAt = dayjs(order?.updatedAt);
  const now = dayjs();

  const isNewOrder = now.diff(createdAt, "minute") <= 3;
  const isUpdated = !createdAt.isSame(updatedAt, "minute");

  return (
    <Card className="rounded-xl shadow-lg border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold">{`Bàn ${table.name.toUpperCase()}`}</h2>
            <div className="flex gap-2 mt-1">
              {isNewOrder && (
                <span className="text-xs text-white bg-green-500 px-2 py-0.5 rounded-full">
                  Bàn mới vào
                </span>
              )}
              {isUpdated && (
                <span className="text-xs text-white bg-yellow-500 px-2 py-0.5 rounded-full">
                  Gọi thêm món
                </span>
              )}
            </div>
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </Button>
        </div>

        {expanded && (
          <ul className="mt-2">
            {order?.foods?.map((food, i) => (
              <OrderItem key={i} food={food} order_id={order?._id} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function KitchenDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState<FullTable[]>([]);
  const [canPlayAudio, setCanPlayAudio] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);

  const fetchTable = async () => {
    const tables = await TableService.tableWithFoodOrderForKitchen();
    setTables(tables);
  };

  let wakeLock: WakeLockSentinel | null = null;

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await (navigator as any).wakeLock.request("screen");
        console.log(
          "\ud83d\udd0b \u0110\u00e3 gi\u1eef m\u00e0n h\u00ecnh lu\u00f4n s\u00e1ng"
        );

        wakeLock?.addEventListener("release", () => {
          console.log("\u23f8\ufe0f WakeLock b\u1ecb h\u1ee7y");
        });
      } else {
        console.warn("Wake Lock API không được hỗ trợ trên trình duyệt này");
      }
    } catch (err) {
      console.error("Không thể kích hoạt Wake Lock:", err);
    }
  };

  useEffect(() => {
    fetchTable().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!canPlayAudio) return;

    const handleNewOrder = async (payload: NewOrder_Socket) => {
      await fetchTable();
      const messages = payload.data.foods.map((f) => `${f.quantity} ${f.name}`);
      const fullText = `${messages.join(". ")} - Bàn ${
        payload.data.table.name
      }`;
      await playVoice(fullText);
    };

    socket.on("NEW_ORDER", handleNewOrder);
    return () => {
      socket.off("NEW_ORDER", handleNewOrder);
    };
  }, [canPlayAudio]);

  useEffect(() => {
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wakeLock?.release();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {showIntroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg max-w-xs p-6 text-center">
            <h2 className="text-lg font-semibold">
              Bắt đầu theo dõi đơn hàng mới
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Nhấn vào nút bên dưới để bật thông báo bằng âm thanh.
            </p>
            <Button
              className="mt-4 bg-blue-600 text-white"
              onClick={() => {
                setCanPlayAudio(true);
                setShowIntroModal(false);
                toast.success("Đã bật âm thanh thông báo!");
              }}
            >
              Bấm vào đây để bắt đầu theo dõi đơn hàng mới 🎧
            </Button>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
      {isLoading ? (
        <Loading />
      ) : tables.length === 0 ? (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-700">
            ✅ Không có món nào đang nấu!
          </h2>
          <p className="text-gray-500">Bếp có thể nghỉ tay một chút 😉</p>
        </div>
      ) : (
        <div className="w-full max-w-sm p-4 space-y-4">
          {tables.map((table, i) => (
            <OrderCard key={i} table={table} />
          ))}
        </div>
      )}
    </div>
  );
}
