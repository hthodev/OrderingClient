"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  addDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from "date-fns";
import { vi } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";

// shadcn/ui components (make sure you have them installed in your project)
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Calendar } from "@/app/components/ui/calendar";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import ManagerSidebarLeft from "./Manager";
import ManagerService, { InvoiceList } from "@/app/services/manager";
import Loading from "../Loading";
import TableService from "@/app/services/table";
import Modal from "../Modal";
import FoodService from "@/app/services/food";
import LocalStorage from "@/app/helpers/localstorage";
import BillPrint from "../Bill";

// Types
export type Invoice = {
  id: string;
  table: string; // "Bàn 1", "Bàn 2"...
  total: number; // VND
  createdAt: string; // ISO date
};

// Helpers
const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});
const fmtDate = (d: Date) => format(d, "dd/MM/yyyy", { locale: vi });
const fmtTime = (d: Date) => format(d, "HH:mm", { locale: vi });

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<InvoiceList[]>([]);
  const [tablesName, setTablesName] = useState<{ _id: string; name: string }[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [day, setDay] = useState<Date>(startOfDay(new Date()));
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [minTotal, setMinTotal] = useState<string>("");
  const [maxTotal, setMaxTotal] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const [res1, res2] = await Promise.all([
          ManagerService.InvoicesByDate(day.toISOString()),
          TableService.TablesName(),
        ]);

        if (res1) setInvoices(res1);
        if (res2) setTablesName(res2);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchAPI();
  }, [day]);

  const totalSum = useMemo(() => invoices.reduce((s, i) => s + i.total, 0), []);

  // Handlers
  const prevDay = () => setDay((d) => addDays(d, -1));
  const nextDay = () => setDay((d) => addDays(d, 1));
  const resetFilters = () => {
    setTableFilter("all");
    setMinTotal("");
    setMaxTotal("");
  };

  const handleViewInvoice = async (inv: InvoiceList) => {
    if (inv?._id) {
      const response = await FoodService.CheckInvoice(inv._id, []);
      LocalStorage.Bill.add(
        JSON.stringify({
          ...response,
          tableName: inv?.table?.name,
        })
      );
      setModalContent(
        <div>
          <BillPrint />{" "}
        </div>
      );
      setModalOpen(true);
    }
  };

  if (isLoading) {
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-20">
          <Loading />
        </div>
      </div>{" "}
    </div>;
  }

  return (
    <div className="flex">
      <ManagerSidebarLeft />
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white p-4 mt-15 md:p-8">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Lọc hoá đơn theo ngày, bàn và khoảng tổng tiền.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="rounded-2xl shadow"
                onClick={prevDay}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Ngày trước
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button className="rounded-2xl shadow" variant="default">
                    <CalendarIcon className="mr-2 h-4 w-4" /> {fmtDate(day)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={day}
                    onSelect={(d) => d && setDay(startOfDay(d))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="secondary"
                className="rounded-2xl shadow"
                onClick={nextDay}
              >
                Ngày sau <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Filter className="h-4 w-4" /> Bộ lọc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Table filter */}
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Bàn</label>
                  <Select value={tableFilter} onValueChange={setTableFilter}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Chọn bàn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {tablesName.map((t) => (
                        <SelectItem key={t._id} value={t.name}>
                          {`${t.name}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min total */}
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">
                    Tổng tiền từ
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ₫
                    </span>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="rounded-xl pl-7"
                      placeholder="VD: 100000"
                      value={minTotal}
                      onChange={(e) => setMinTotal(e.target.value)}
                    />
                  </div>
                </div>

                {/* Max total */}
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">
                    Tổng tiền đến
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ₫
                    </span>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="rounded-xl pl-7"
                      placeholder="VD: 500000"
                      value={maxTotal}
                      onChange={(e) => setMaxTotal(e.target.value)}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={resetFilters}
                  >
                    Xoá lọc
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="rounded-xl">
                  {fmtDate(day)}
                </Badge>
                <span>
                  {invoices.length} hoá đơn, tổng {currency.format(totalSum)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Data view */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Mã hoá đơn</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Bàn</TableHead>
                    <TableHead>Nhân viên tính tiền</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Không có dữ liệu phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => {
                      const paymentTime = new Date(inv.paymentTime);
                      return (
                        <TableRow
                          key={inv._id}
                          className="hover:bg-slate-50/60 cursor-pointer"
                          onClick={() => handleViewInvoice(inv)}
                        >
                          <TableCell>
                            <div className="font-medium">{inv._id}</div>
                          </TableCell>
                          <TableCell>{fmtTime(paymentTime)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-xl">
                              {inv.table.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="rounded-xl">
                              {inv?.cashier?.fullName}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {currency.format(inv.total)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden">
              <ScrollArea className="h-[68vh] px-3 py-3">
                <AnimatePresence mode="popLayout">
                  {invoices.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      Không có dữ liệu phù hợp.
                    </div>
                  ) : (
                    invoices.map((inv) => {
                      const paymentTime = new Date(inv.paymentTime);

                      return (
                        <motion.div
                          key={inv._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                          onClick={() => handleViewInvoice(inv)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">
                              {fmtDate(paymentTime)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {fmtTime(paymentTime)}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="mt-2 flex items-center justify-between">
                              <Badge variant="outline" className="rounded-xl">
                                Bàn {inv.table.name}
                              </Badge>
                              <Badge variant="outline" className="rounded-xl">
                                Cashier: {inv?.cashier?.fullName}
                              </Badge>
                            </div>
                            <div className="text-base font-semibold">
                              {currency.format(inv.total)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </ScrollArea>
            </div>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
              {modalContent}
            </Modal>
          </div>

          {/* Footer tip */}
          <p className="text-center text-xs text-muted-foreground">
            UI mẫu – thay dữ liệu demo bằng API của bạn. Hỗ trợ desktop &
            mobile, bo góc mềm, bóng nhẹ ✨
          </p>
        </div>
      </div>
    </div>
  );
}
