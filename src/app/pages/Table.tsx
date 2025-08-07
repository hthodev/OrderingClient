"use client";

import Header from "../components/shared/Header";
import TableLayout from "../components/TableLayout";

export default function TablePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header title={"Trang Order Món Ăn"}/>
      <main className="flex-1">
        <TableLayout />
      </main>
    </div>
  );
}
