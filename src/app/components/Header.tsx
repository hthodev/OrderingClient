// components/Header.tsx
"use client";
import React, { useState } from "react";
import { Menu } from "lucide-react";
import { userDecode } from "../helpers/decodeJwt";
import Image from "next/image";
import USER from "../constants/users";

const user = userDecode();

export default function Header({ title }: { title: string }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <header className="bg-white shadow-md px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Left side: Hamburger icon */}
      <div className="relative">
        <button onClick={toggleDropdown} className="text-gray-700">
          <Menu size={24} />
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <ul className="py-2">
              <div className="flex justify-between">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Hi,{" "}
                  <span className="text-red-400 bold">{user?.username}</span>
                </li>
                <Image
                  height={20}
                  width={20}
                  src={"logout.svg"}
                  alt="logout"
                  title="Đăng xuất"
                  className="mr-4 cursor-pointer"
                />
              </div>
              {user?.position &&
                [USER.POSITION.OWNER, USER.POSITION.MANAGER].includes(
                  (user as any).position
                ) && (
                  <div>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      Quản lý
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      Thống kê - báo cáo
                    </li>
                  </div>
                )}
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                Tài khoản
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Right side (optional: title/logo...) */}
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
    </header>
  );
}
