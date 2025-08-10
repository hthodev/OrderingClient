"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import OrderForm from "./Order";
import FoodService, { Food } from "../services/food";
import TableService, { FullTable } from "../services/table";
import TABLE from "../constants/tables";
import Loading from "./Loading";
import socket from "../lib/socket-io";
import SOCKET_GATEWAY from "../constants/socket";
import toast, { Toaster } from "react-hot-toast";
import { useConfirm } from "./shared/ConfirmProvider";

export default function TableLayout() {
  const [showOfficial, setShowOfficial] = useState(true);
  const [showExtended, setShowExtended] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [officialTables, setOfficialTables] = useState<string[][]>([]);
  const [extendedTables, setExtendedTables] = useState<string[][]>([]);
  const [fullTables, setFullTables] = useState<FullTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const confirm = useConfirm();

  const fetchTableLayout = async () => {
    try {
      const [layouts, tables] = await Promise.all([
        TableService.LayoutTable([TABLE.TYPE.OFFICIAL, TABLE.TYPE.EXTENDED]),
        TableService.Tables(),
      ]);

      layouts.forEach((layout) => {
        if (layout.type == TABLE.TYPE.OFFICIAL) {
          setOfficialTables(layout.layouts);
        } else {
          setExtendedTables(layout.layouts);
        }
      });

      setFullTables(tables);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const fetchFood = async () => {
      try {
        const response = await FoodService.List("", {});
        setFoods(response);
      } catch (error) {}
    };

    fetchTableLayout();
    fetchFood();

    socket.on(SOCKET_GATEWAY.KEY.UPDATE_TABLE, () => {
      fetchTableLayout();
    });

    return () => {
      socket.off(SOCKET_GATEWAY.KEY.UPDATE_TABLE);
    };
  }, []);

  const handleOnClose = async ({
    closeModal = true,
  }: {
    closeModal?: boolean;
  }) => {
    await fetchTableLayout();
    closeModal && setModalOpen(false);
  };

  const handleSelect = async (table: FullTable, action: string) => {
    setSelectedTable(null);
    switch (action) {
      case "order":
        setModalTitle(`Order món - Bàn ${table.name}`);
        setModalContent(
          <OrderForm
            foods={foods}
            table={table}
            onClose={handleOnClose}
            toast={toast}
          />
        );
        setModalOpen(true);
        break;
      case "add":
        setModalTitle(`Order thêm - Bàn ${table.name}`);
        setModalContent(
          <OrderForm
            foods={foods}
            table={table}
            order={table.order}
            checkout={false}
            onClose={handleOnClose}
            toast={toast}
          />
        );
        setModalOpen(true);
        break;
      case "checkout":
        setModalTitle(`Xem bill, Tính tiền - Bàn ${table.name}`);
        setModalContent(
          <OrderForm
            foods={foods}
            table={table}
            order={table.order}
            checkout={true}
            onClose={handleOnClose}
            toast={toast}
          />
        );
        setModalOpen(true);
        break;
      case "checkOrder":
        setModalTitle(`Xem các món đã order - Bàn ${table.name}`);
        setModalContent(
          <OrderForm
            foods={foods}
            table={table}
            order={table.order}
            checkout={false}
            watchOrder={true}
            onClose={() => setModalOpen}
          />
        );
        setModalOpen(true);
        break;
      case "done":
        try {
          const handleOrder = async () => {
            if (table?.order?._id)
              await FoodService.CustomerPaid(table.order._id);
            await handleOnClose({ closeModal: true });
            toast.success(`Khách hàng đã thanh toán - Bàn ${table.name}`);
          };
          confirm({
            message: `Xác nhận BÀN ${table.name} đã thanh toán?`,
            onConfirm: async () => await handleOrder(),
          });
        } catch (error) {
          alert("Có lỗi xảy ra khi gửi đơn hàng.");
          console.error(error);
        }
        break;
    }
  };

  function formatDay(iso?: string | Date) {
    if (!iso) return;
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);

    const get = (t: any) => parts.find((p) => p.type === t)?.value || "";
    return `${get("day")}/${get("month")} ${get("hour")}:${get("minute")}`;
  }

  const renderTableSection = (tables: string[][]) => (
    <div className="space-y-4 mt-2">
      {tables.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-6">
          {row.map((tableNumber) => {
            let table: FullTable | undefined = fullTables?.find(
              (t) => t.name == tableNumber
            );
            if (!table) return;
            return (
              <div className="relative" key={tableNumber}>
                <div
                  onClick={() =>
                    setSelectedTable((prev) =>
                      prev === tableNumber ? null : tableNumber
                    )
                  }
                  className={`flex flex-col items-center space-x-2 min-h-20 ${
                    table?.havingGuests ? "bg-green-500" : "bg-gray-100"
                  } px-7 py-2 rounded shadow-sm w-24 justify-center cursor-pointer"`}
                >
                  <div className="flex">
                    <Image
                      src="g_table.svg"
                      alt={`Table ${tableNumber}`}
                      width={36}
                      height={36}
                      className={`${
                        table?.havingGuests &&
                        "filter brightness-0 invert sepia saturate-1000 hue-rotate-[90deg]"
                      }`}
                    />
                    <span
                      className={`font-semibold ml-2 ${
                        table?.havingGuests ? "text-white" : "text-gray-800"
                      } text-lg text-center`}
                    >
                      {tableNumber}
                    </span>
                  </div>
                  <span className="whitespace-nowrap text-white mt-2 font-bold">
                    {formatDay(table.order?.createdAt)}
                  </span>{" "}
                </div>

                {/* Dropdown menu */}
                {selectedTable === tableNumber && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fade-in">
                    {!table?.havingGuests ? (
                      <MenuItem
                        label="Order mới"
                        onClick={() => handleSelect(table, "order")}
                      />
                    ) : (
                      <>
                        <MenuItem
                          label="Trả hàng - Tính tiền"
                          onClick={() => handleSelect(table, "checkout")}
                        />

                        <MenuItem
                          label="Order thêm món"
                          onClick={() => handleSelect(table, "add")}
                        />

                        <MenuItem
                          label="Xem món đã order"
                          onClick={() => handleSelect(table, "checkOrder")}
                        />
                        <MenuItem
                          label="Đánh dấu đã tính tiền"
                          onClick={() => handleSelect(table, "done")}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm">
          <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-20">
            <Loading />
          </div>
        </div>{" "}
      </div>
    );

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center">
      <Toaster position="top-right" />
      <div className="w-full flex justify-center mb-6">
        <div className="flex items-center space-x-2">
          <Image src="r_table.svg" alt="Cashier" width={40} height={40} />
          <span className="text-xl font-bold">Bàn thu ngân</span>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div
          onClick={() => setShowOfficial(!showOfficial)}
          className="cursor-pointer font-semibold text-gray-800 bg-gray-100 px-4 py-2 rounded shadow flex justify-between items-center"
        >
          <span>Bàn chính thức</span>
          <span>{showOfficial ? "−" : "+"}</span>
        </div>
        {showOfficial && renderTableSection(officialTables)}
      </div>

      <div className="w-full max-w-md mt-6">
        <div
          onClick={() => setShowExtended(!showExtended)}
          className="cursor-pointer font-semibold text-gray-800 bg-gray-100 px-4 py-2 rounded shadow flex justify-between items-center"
        >
          <span>Bàn mở rộng</span>
          <span>{showExtended ? "−" : "+"}</span>
        </div>
        {showExtended && renderTableSection(extendedTables)}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
      >
        {modalContent}
      </Modal>
    </div>
  );
}

const MenuItem = ({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 hover:text-black cursor-pointer transition-all rounded"
  >
    {label}
  </div>
);
