"use client";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { userDecode } from "@/app/helpers/decodeJwt";
import { useRouter, usePathname, notFound } from "next/navigation";
import USER from "@/app/constants/users";
import Image from "next/image";
import LocalStorage from "@/app/helpers/localstorage";

const user = userDecode();
const sections = [
  { lable: "Báo cáo doanh số", slug: "report" },
  { lable: "Báo cáo hoá đơn", slug: "report-invoice" },
  { lable: "Quản lý món ăn", slug: "food" },
  // { lable: "Quán lý bàn ăn", slug: "table" },
  // { lable: "Quản lý nhập hàng", slug: "" }
];

if (user?.position === USER.POSITION.OWNER) {
  sections.push({ lable: "Quản lý tài khoản nhân viên", slug: "account" });
}

export default function ManagerSidebarLeft() {
  const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  if (!user) {
    notFound();
  }

  // Lấy slug cuối trong URL (/manager/food => "food")
  const activeSlug = pathname?.split("/")[2] || "";

  const navigation = (slug: string) => {
    if (slug) {
      router.push(`/manager/${slug}`);
    }
  };

  const handleLogout = () => {
    LocalStorage.JwtToken.remove();
    router.push("/login");
  };

  return (
    <div className="flex bg-slate-100">
      <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow flex items-center justify-between px-4 z-30">
        <div className="flex items-center">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-2xl text-gray-700 mr-4"
          >
            ☰
          </button>
          <h1 className="text-lg font-semibold">Quản lý</h1>
        </div>
        <h1
          className="text-lg font-semibold text-gray-800 cursor-pointer"
          onClick={() => {
            router.push("/");
          }}
        >
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
        <div className="flex justify-between mt-3">
          <h1 className="text-xl font-bold text-gray-800">
            Hi,{" "}
            <span className="text-red-400 font-bold">{user.username}</span>
          </h1>
          <Image
            height={20}
            width={20}
            src="/logout.svg"
            alt="logout"
            title="Đăng xuất"
            className="mr-4 cursor-pointer"
            onClick={handleLogout}
          />
        </div>

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
