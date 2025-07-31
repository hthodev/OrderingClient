"use client";
import React, { useEffect, useState } from "react";
import AuthService from "../services/auth";
import LocalStorage from "../helpers/localstorage";
import Loading from "../components/Loading";
import { useRouter } from "next/navigation";
import { userDecode } from "../helpers/decodeJwt";
import USER from "../constants/users";

export default function LoginPage() {
  const router = useRouter();

  //area state
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isHided, setIsHided] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [msgError, setMsgError] = useState<string>("");

  //area effect
  useEffect(() => {
    const authStr = LocalStorage.JwtToken.get();
    if (authStr) {
      const auth = JSON.parse(authStr);
      if (auth?.token && auth?.refresh) {
        const user = userDecode();
        user?.position !== USER.POSITION.COOKING
          ? router.push("/table")
          : router.push("/cooking");
      }
    }
  }, [LocalStorage.JwtToken.get()]);

  //area logic
  const loginBtn = async () => {
    try {
      setIsLoading(true);
      const response = await AuthService.Login({ username, password });
      const { token, refresh } = response;
      LocalStorage.JwtToken.add(JSON.stringify({ token, refresh }));
      msgError && setMsgError("");
    } catch (error: any) {
      setMsgError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-300 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-1">
          Hello Again!
        </h2>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Đăng nhập vào tài khoản
        </p>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Tên tài khoản
          </label>
          <div
            className={`flex items-center border rounded px-3 py-2 ${
              msgError && "border-red-400"
            }`}
          >
            <span className="mr-2">📧</span>
            <input
              type="username"
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 outline-none"
              placeholder="quán_nhậu_Mỹ_Tiên"
            />
          </div>
        </div>

        <div className="mb-1">
          <label className="block text-sm text-gray-600 mb-1">Mật khẩu</label>
          <div
            className={`flex items-center border rounded px-3 py-2 ${
              msgError && "border-red-400"
            }`}
          >
            <span className="mr-2">🔒</span>
            <input
              type={isHided ? "password" : "text"}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none"
              placeholder="123 dzo dzo"
            />
            {password && (
              <span
                className="text-gray-500 cursor-pointer"
                onClick={() => setIsHided(!isHided)}
              >
                👁
              </span>
            )}
          </div>
        </div>
        {msgError && <p className="text-red-500 text-sm mt-1">⚠️ {msgError}</p>}

        <div
          className="text-right text-sm text-blue-500 mb-6 mt-1 cursor-pointer"
          onClick={() => alert("Liên hệ đến chủ quán để reset lại mật khẩu")}
        >
          Quên mật khẩu?
        </div>

        <button
          className="w-full bg-red-400 hover:bg-red-500 text-white py-3 rounded"
          onClick={loginBtn}
        >
          Đăng nhập
        </button>
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-20">
          <Loading text="Đang đăng nhập" />
        </div>
      )}
    </div>
  );
}
