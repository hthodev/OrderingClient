import { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Select from "react-select";
import FOOD from "../constants/foods";
import FoodService, { Food, Order } from "../services/food";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import TableService, { FullTable } from "../services/table";
import BillPrint from "./Bill";
import LocalStorage from "../helpers/localstorage";
import { useRouter } from "next/navigation";
import Modal from "./Modal";

export default function OrderForm({
  foods,
  table,
  order,
  checkout = false,
  watchOrder = false,
  toast,
  onClose,
  onTableUpdate,
}: {
  foods: Food[];
  table: FullTable;
  order?: Order;
  checkout?: boolean;
  watchOrder?: boolean;
  toast?: any;
  onClose: () => void;
  onTableUpdate?: any;
}) {
  const defaultItems: any[] = [];

  if (order?.foods?.length) {
    defaultItems.push(...order.foods.map((item) => ({ ...item, return: 0 })));
  } else {
    defaultItems.push({
      _id: FOOD.BANH_TRANG._id,
      name: FOOD.BANH_TRANG.name,
      quantity: 1,
      price: FOOD.BANH_TRANG.price,
      unit: FOOD.BANH_TRANG.unit,
      return: 0,
      category: FOOD.CATEGORY.BANH_TRANG,
    });
  }

  const [items, setItems] = useState<Food[]>(defaultItems);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const handleChange = (index: number, field: string, value: any) => {
    const updated: any[] = [...items];
    updated[index][field] = +value;
    setItems(updated);
  };

  const getAvailableFoodOptions = (currentIndex: number) => {
    const selectedIds = items
      .filter((_, i) => i !== currentIndex)
      .map((item) => item._id);

    return foods
      .filter((food) => !selectedIds.includes(food._id))
      .map((food) => ({
        value: food._id,
        label: food.name,
      }));
  };

  const handleSelectFood = (index: number, foodId: string) => {
    const food = foods.find((f) => f._id === foodId);
    if (food) {
      const updated = [...items];
      updated[index]._id = food._id;
      updated[index].name = food.name;
      updated[index].price = food.price;
      updated[index].unit = food.unit;
      updated[index].category = food.category;
      updated[index].return = 0;

      if (updated[index].category === FOOD.CATEGORY.BIA) {
        updated[index].quantity = 24;
      }

      setItems(updated);
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        _id: "",
        name: "",
        quantity: 1,
        price: 0,
        unit: "",
        category: undefined,
        return: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((acc, item) => {
    const actualQty = Math.max(0, item.quantity - (item.return || 0));
    return acc + actualQty * item.price;
  }, 0);

  const confirmBtn = async () => {
    const handleOrder = async () => {
      try {
        // Logic này là phần cho order thêm
        if (!checkout && order?.orderer?.length) {
          if (table?.order?._id) {
            await FoodService.OrderMore(
              table.order._id,
              items.map((item) => ({
                ...item,
                quantity: Math.max(0, item.quantity - (item.return || 0)),
              }))
            );
            toast.success("Đã order thêm món thành công!");
          } else {
            throw Error();
          }
        } else {
          // ngược lại là order mới
          await FoodService.Order(
            items.map((item) => ({
              ...item,
              quantity: Math.max(0, item.quantity - (item.return || 0)),
            })),
            table._id
          );
          toast.success("Order thành công!");
        }
        onClose();
      } catch (error: any) {
        alert("Có lỗi xảy ra khi gửi đơn hàng.");
        toast.error(error?.message);
      }
    };

    confirmAlert({
      message:
        "Việc xác nhận đơn sẽ được thông báo xuống bếp. Nếu đã xác nhận sau đó có sự thay đổi order của khách. Vui lòng xuống bếp để thông báo sự thay đổi, hệ thống sẽ không đọc hủy order?",
      buttons: [
        {
          label: "Xác nhận",
          onClick: async () => await handleOrder(),
        },
        {
          label: "Hủy",
        },
      ],
    });
  };

  const checkoutBtn = async () => {
    const handleOrder = async () => {
      try {
        const returnQuantity = items
          .filter((i) => i.return)
          .map((item) => ({
            _id: item._id,
            returnQuantity: item.return,
          }));
        const order_id = table?.order?._id;
        if (order_id) {
          const response = await FoodService.CheckInvoice(
            order_id,
            returnQuantity
          );
          LocalStorage.Bill.add(
            JSON.stringify({ ...response, tableName: table.name })
          );

          setModalContent(
            <div>
              <BillPrint />
              <div className="flex justify-end space-x-4 px-3 pb-3 mt-2">
                <Button
                  onClick={() => router.push("/bill")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  In hóa đơn
                </Button>
              </div>
            </div>
          );
          setModalOpen(true);
          const tableUpdate = await TableService.TableDetail(table._id);
          if (tableUpdate.order?.foods) setItems(tableUpdate.order.foods);

        }
      } catch (error: any) {
        alert("Có lỗi xảy ra khi gửi đơn hàng.");
        toast.error(error?.message);
      }
    };

    const isNoDrink = !items.some((item) =>
      [FOOD.CATEGORY.BIA, FOOD.CATEGORY.NUOC].includes(item.category as any)
    );
    const isNoBanhTrang = !items.some(
      (item) => item.name === FOOD.BANH_TRANG.name
    );
    const messages = [];
    if (isNoBanhTrang) {
      messages.push(`KHÔNG CÓ bánh tráng`);
    }

    if (isNoDrink) {
      messages.push(`KHÔNG CÓ BẤT KỲ thức uống gì`);
    }

    if (isNoBanhTrang || isNoDrink) {
      confirmAlert({
        message: `Hoá đơn ở bàn này ${messages.join(" và ")}`,
        buttons: [
          {
            label: "Bàn này không sử dụng",
            onClick: async () => await handleOrder(),
          },
          {
            label: "Kiểm tra lại",
          },
        ],
      });
    } else {
      confirmAlert({
        message: "Đã chắc chắn nhập đúng số lượng trả về chưa?",
        buttons: [
          {
            label: "Chắc chắn",
            onClick: async () => await handleOrder(),
          },
          {
            label: "Chưa",
          },
        ],
      });
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {items.map((item, index) => (
          <Card key={index} className="p-3 space-y-1 relative">
            <div className="flex items-center space-x-2">
              <div className="w-2/3">
                <Select
                  className="text-sm"
                  options={getAvailableFoodOptions(index)}
                  value={
                    getAvailableFoodOptions(index).find(
                      (opt) => opt.value === item._id
                    ) || null
                  }
                  onChange={(selectedOption: any) => {
                    if (selectedOption) {
                      handleSelectFood(index, selectedOption.value);
                    }
                  }}
                  isDisabled={checkout}
                  placeholder="Chọn món ăn"
                  isSearchable
                  styles={{
                    control: (base: any) => ({
                      ...base,
                      minHeight: "38px",
                      borderRadius: "0.5rem",
                    }),
                    menu: (base: any) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  filterOption={(option, inputValue) =>
                    option.label
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                />
              </div>
              <div className="w-1/3 flex items-center space-x-1">
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    handleChange(index, "quantity", e.target.value)
                  }
                  disabled={checkout}
                  className={`!py-1.5 ${checkout && "bg-[#edecec]"}`}
                />
                {!checkout &&
                  !order?.foods?.some((f) => f._id === item._id) && (
                    <Trash2
                      className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => removeItem(index)}
                    />
                  )}
              </div>
            </div>

            <div className="flex justify-between text-xs italic text-gray-500">
              <div>
                NV order:{" "}
                {[...new Set(item?.user?.map((u: any) => u.name))].join(", ")}
              </div>
              <div>Giá: {item.price.toLocaleString()} đ</div>
            </div>

            {checkout && (
              <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                <span>Trả lại:</span>
                <input
                  type="number"
                  min={0}
                  value={item.return === 0 ? "" : item.return}
                  onChange={(e) =>
                    handleChange(index, "return", e.target.value)
                  }
                  className="w-12 border-b border-gray-400 focus:outline-none focus:border-green-600 text-sm text-right bg-transparent"
                />
              </div>
            )}
          </Card>
        ))}

        {!checkout && !watchOrder && (
          <div className="flex">
            <Button
              className="text-green-600 hover:bg-green-50 flex items-center"
              onClick={addItem}
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Thêm món ăn
            </Button>
          </div>
        )}
      </div>

      <div className="border-t pt-3 space-y-3 bg-white sticky bottom-0 z-10">
        <div className="text-right text-sm font-semibold text-gray-700 px-3">
          Tổng tiền tạm tính:{" "}
          <span className="text-green-600">{total.toLocaleString()} đ</span>
        </div>

        {!watchOrder && (
          <div className="flex justify-end space-x-4 px-3 pb-3">
            <Button onClick={onClose} className="bg-gray-100 text-gray-700">
              Huỷ
            </Button>
            {checkout ? (
              <Button
                onClick={checkoutBtn}
                className="bg-green-600 hover:bg-green-700"
              >
                Xem hóa đơn
              </Button>
            ) : (
              <Button
                onClick={confirmBtn}
                className="bg-green-600 hover:bg-green-700"
              >
                Xác nhận
              </Button>
            )}
          </div>
        )}

        {watchOrder && (
          <div className="flex justify-end space-x-4 px-3 pb-3">
            <Button
              onClick={() => {
                setModalContent(
                  <div>
                    <BillPrint />{" "}
                  </div>
                );
                setModalOpen(true);
              }}
              className="bg-gray-100 text-gray-700"
            >
              Xem hóa đơn tạm tính
            </Button>
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          {modalContent}
        </Modal>
      </div>
    </div>
  );
}
