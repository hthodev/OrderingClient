"use client";
import Link from "next/link";
import { userDecode } from "../helpers/decodeJwt";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import USER from "../constants/users";

const pages = [
  { name: "Trang Order", href: "/table" },
  { name: "Trang Bếp", href: "/cooking" },
  { name: "Trang Báo Cáo", href: "/report" },
  { name: "Trang Quản lý", href: "/manager" },
];

export default function Home() {
  const user = useMemo(() => userDecode(), []);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }

    if (
      user &&
      ![USER.POSITION.OWNER, USER.POSITION.MANAGER].includes(
        (user as any).position
      )
    ) {
      if (USER.POSITION.COOKING === user.position) {
        router.push("/cooking");
      } else {
        router.push("/table");
      }
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-100 to-slate-300 px-6 py-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          🍽️ Quán nhậu Mỹ tiên
        </h1>
        <p className="text-sm text-gray-600">
          Xin chào, quản lý <span className="font-bold">{user?.username}.</span>{" "}
          Hãy chọn chức năng bên dưới
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          {pages.map((page, idx) => (
            <Link key={idx} href={page.href}>
              <div className="group rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center cursor-pointer transform hover:-translate-y-1">
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                  {page.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm mt-4">
        © {new Date().getFullYear()} Mỹ Tiên. All rights reserved.
      </footer>
    </div>
  );
}
