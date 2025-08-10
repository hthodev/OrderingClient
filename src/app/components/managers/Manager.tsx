"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { userDecode } from "@/app/helpers/decodeJwt";
import { useRouter, usePathname } from "next/navigation";

const sections = [
  { lable: "Báo cáo doanh số", slug: "report" },
  { lable: "Báo cáo hoá đơn", slug: "report-invoice" },
  { lable: "Quản lý món ăn", slug: "food" },
  // { lable: "Quản lý tài khoản nhân viên", slug: "account" },
  // { lable: "Quán lý bàn ăn", slug: "table" },
  // { lable: "Quản lý nhập hàng", slug: "" }
];

export default function ManagerSidebarLeft() {
  const [showSidebar, setShowSidebar] = useState(false);
  const user = useMemo(() => userDecode(), []);
  const router = useRouter();
  const pathname = usePathname();

  // Lấy slug cuối trong URL (/manager/food => "food")
  const activeSlug = pathname?.split("/")[2] || "";

  const navigation = (slug: string) => {
    if (slug) {
      router.push(`/manager/${slug}`);
    }
  };

  return (
    <div className="flex relative bg-slate-100">
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white shadow flex items-center justify-between px-4 z-30">
        <div className="flex items-center">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-2xl text-gray-700 mr-4"
          >
            ☰
          </button>
          <h1 className="text-lg font-semibold">Quản lý</h1>
        </div>
        <h1 className="text-lg font-semibold text-gray-800 cursor-pointer" onClick={() => { router.push('/') }}>
          Quay về trang chủ
        </h1>
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
        {sections.map((section) => (
          <button
            key={section.slug}
            onClick={() => {
              setShowSidebar(false);
              navigation(section.slug);
            }}
            className={clsx(
              "w-full text-left px-4 py-2 rounded-lg transition",
              section.slug === activeSlug
                ? "bg-blue-600 text-white shadow"
                : "hover:bg-blue-100 text-gray-700"
            )}
          >
            {section.lable}
          </button>
        ))}
      </aside>
    </div>
  );
}
