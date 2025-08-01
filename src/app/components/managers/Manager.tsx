"use client";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import ReportManagement from "./Report";
import FoodManagement from "./Food";
import AccountManagement from "./Account";
import { userDecode } from "@/app/helpers/decodeJwt";

const sections = [
  "Báo cáo doanh số",
  "Quản lý món ăn",
  "Quản lý tài khoản nhân viên",
  "Thống kê món ăn",
  "Quán lý bàn ăn",
  "Quản lý nhập hàng",
];

export default function Manager() {
  const [activeSection, setActiveSection] = useState(sections[0]);
  const [showSidebar, setShowSidebar] = useState(false);
  const user = useMemo(() => userDecode(), []);

  return (
    <div className="min-h-screen flex relative bg-slate-100">
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white shadow flex items-center px-4 z-30">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="text-2xl text-gray-700"
        >
          ☰
        </button>
        <h1 className="ml-4 text-lg font-semibold">Quản lý</h1>
      </header>

      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/30 z-10 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed md:static z-20 top-0 left-0 h-full w-64 bg-white shadow-md p-4 space-y-2 transform transition-transform duration-300",
          showSidebar ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:top-0"
        )}
        style={{ paddingTop: "3.5rem" }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Xin chào, {user?.username}
        </h2>
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => {
              setActiveSection(section);
              setShowSidebar(false);
            }}
            className={clsx(
              "w-full text-left px-4 py-2 rounded-lg transition",
              activeSection === section
                ? "bg-blue-600 text-white shadow"
                : "hover:bg-blue-100 text-gray-700"
            )}
          >
            {section}
          </button>
        ))}
      </aside>

      <main
        className={clsx(
          "flex-1 p-6 transition-all duration-300",
          "pt-16 md:pt-6",
          "md:ml-64"
        )}
        onClick={() => {
          if (!showSidebar) return;
          setShowSidebar(false);
        }}
      >
        {activeSection === "Báo cáo doanh số" && <ReportManagement />}
        {activeSection === "Quản lý món ăn" && <FoodManagement />}
        {activeSection === "Quản lý tài khoản nhân viên" && (
          <AccountManagement />
        )}
      </main>
    </div>
  );
}
