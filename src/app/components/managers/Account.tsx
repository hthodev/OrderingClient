"use client";

import React, { useEffect, useMemo, useState } from "react";
import { addDays, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Filter } from "lucide-react";

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
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import ManagerSidebarLeft from "./Manager";
import ManagerService, { Users } from "@/app/services/manager";
import Loading from "../Loading";
import Modal from "../Modal";
import USER, { UserPosition } from "@/app/constants/users";
import { notFound, useRouter } from "next/navigation";
import { userDecode } from "@/app/helpers/decodeJwt";

export default function AccountManagement() {
  const [users, setUsers] = useState<Users[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [positionFilter, setPositionFilter] = useState<UserPosition | "all">(
    "all"
  );
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>(searchFilter);
  const user = useMemo(() => userDecode(), []);
  if (user?.position !== USER.POSITION.OWNER) {
    notFound();
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchFilter);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchFilter]);

  useEffect(() => {
    const fetchAPI = async () => {
      try {
        const [res1] = await Promise.all([
          ManagerService.Accounts(positionFilter, debouncedSearch),
        ]);

        if (res1) setUsers(res1);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAPI();
  }, [positionFilter, debouncedSearch]);

  const resetFilters = () => {
    setPositionFilter("all");
    setSearchFilter("");
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
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Filter className="h-4 w-4" /> Bộ lọc
                </CardTitle>
                <div className="flex items-end gap-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => {}}
                  >
                    Thêm tài khoản mới
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">
                    Vị trí
                  </label>
                  <Select
                    value={positionFilter}
                    onValueChange={setPositionFilter as any}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Chọn bàn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {[
                        USER.POSITION.COOKING,
                        USER.POSITION.MANAGER,
                        USER.POSITION.OWNER,
                        USER.POSITION.STAFF,
                      ].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">
                    Tìm kiếm
                  </label>
                  <Input
                    inputMode="search"
                    className="rounded-xl"
                    placeholder="Sdt, tên, username"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                  />
                </div>

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
            </CardContent>
          </Card>

          {/* Data view */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Tên</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead className="text-right">Hoạt động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Không có dữ liệu phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      return (
                        <TableRow
                          key={user._id}
                          className="hover:bg-slate-50/60 cursor-pointer"
                        >
                          <TableCell>
                            <div className="font-medium">
                              {user.fullName}{" "}
                              {user.itsMe && (
                                <Badge
                                  variant="outline"
                                  className="rounded-xl text-red-500 font-semibold"
                                >
                                  Đang đăng nhập
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-xl">
                              {user.position}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="rounded-xl">
                              {user.phone}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {user.isActive
                              ? "🔵 Đang hoạt động"
                              : "🔴 Đã khóa tài khoản"}
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
                  {users.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                      Không có dữ liệu phù hợp.
                    </div>
                  ) : (
                    users.map((user) => {
                      return (
                        <motion.div
                          key={user._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex">
                              <div className="font-semibold">
                                {user.fullName}
                              </div>
                              {user.itsMe && (
                                <Badge
                                  variant="outline"
                                  className="rounded-xl text-red-500 font-semibold ml-2"
                                >
                                  Đang đăng nhập
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.username}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="mt-2 flex items-center justify-between">
                              <Badge variant="outline" className="rounded-xl">
                                {user.position}
                              </Badge>
                              {user.phone && (
                                <Badge variant="outline" className="rounded-xl">
                                  {user.phone}
                                </Badge>
                              )}
                            </div>
                            <div className="text-base font-semibold">
                              {user.isActive
                                ? "🔵 Đang hoạt động"
                                : "🔴 Đã khóa tài khoản"}
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
        </div>
      </div>
    </div>
  );
}
