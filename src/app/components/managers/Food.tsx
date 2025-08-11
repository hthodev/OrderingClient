"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import FOOD from "@/app/constants/foods";
import { Pencil, Trash2 } from "lucide-react";
import Manager from "./Manager";
import FoodService, { Food } from "@/app/services/food";
import Modal from "../Modal";
import ManagerService from "@/app/services/manager";
import { useConfirm } from "../shared/ConfirmProvider";

export default function FoodManagement() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState("");
  const confirm = useConfirm();

  const fetchFoods = async () => {
    const foods = await FoodService.List();
    setFoods(foods);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleOnClose = async () => {
    await fetchFoods();
    setModalOpen(false);
  };

  const handleEdit = (food: Food) => {
    setModalTitle(`Chỉnh sửa - ${food.name}`);
    setModalContent(<FormInput formData={food} onClose={handleOnClose} />);
    setModalOpen(true);
  };

  const handleDelete = async (food: Food) => {
    const processDelete = async () => {
      try {
        const res = await ManagerService.DeleteFood(food._id);
        if (res.success) {
          await fetchFoods();
        }
      } catch (error) {}
    };

    confirm({
      message: `Xác nhận xóa ${food.name}?`,
      onConfirm: async () => await processDelete(),
    });
  };

  return (
    <div className="flex">
      <Manager />

      <div className="flex-1 w-full">
        <div className="p-4 space-y-6 w-full mt-18">
          <FormInput onClose={handleOnClose} />
        </div>

        <div className="p-4 space-y-6 w-full">
          {Object.entries(FOOD.CATEGORY).map(([key, label]) => {
            const filteredFoods = foods.filter(
              (food: Food) => food.category === label
            );

            if (filteredFoods.length === 0) return null;

            return (
              <div key={key} className="space-y-2 mb-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{label}</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 border">Tên món</th>
                        <th className="p-2 border">Giá</th>
                        <th className="p-2 border">Đơn vị</th>
                        <th className="p-2 border">Tình trạng</th>
                        <th className="p-2 border">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFoods.map((food: Food, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 border">{food.name}</td>
                          <td className="p-2 border">{food.price}</td>
                          <td className="p-2 border">{food.unit}</td>
                          <td className="p-2 border">
                            {food.isSell ? "Đang bán" : "Ngưng bán"}
                          </td>
                          <td className="p-2 border">
                            <div className="flex gap-2">
                              <Button onClick={() => handleEdit(food)}>
                                <Pencil size={16} />
                              </Button>
                              <Button onClick={() => handleDelete(food)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
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

function FormInput({
  formData,
  onClose,
}: {
  formData?: Food;
  onClose?: () => void;
}) {
  const [form, setForm] = useState(
    formData || {
      _id: "",
      name: "",
      price: 0,
      unit: "",
      quantity: 0,
      category: "" as any,
      isSell: true,
    }
  );

  const handleSave = async () => {
    if (!formData) {
      try {
        const res = await ManagerService.NewFood(form);
        if (res.success) {
          onClose && onClose();
          setForm({
            _id: "",
            name: "",
            price: 0,
            unit: "",
            quantity: 0,
            category: "" as any,
            isSell: true,
          });
        }
      } catch (error) {}
    } else {
      try {
        const res = await ManagerService.UpdateFood(form._id, form);
        if (res.success) {
          onClose && onClose();
        }
      } catch (error) {}
    }
  };
  return (
    <Card className="p-4">
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Tên món"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Giá"
          value={form.price || ""}
          onChange={(e) => setForm({ ...form, price: +e.target.value })}
        />
        <Select
          value={form.unit}
          onValueChange={(value) => setForm({ ...form, unit: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn đơn vị" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FOOD.UNIT).map(([key, label]) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={form.category}
          onValueChange={(value) =>
            setForm({ ...form, category: value as any })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại món" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FOOD.CATEGORY).map(([key, label]) => (
              <SelectItem key={label} value={label}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSave} className="w-full md:col-span-2">
          {formData ? "Chỉnh sửa món" : "Thêm món"}
        </Button>
      </CardContent>
    </Card>
  );
}
