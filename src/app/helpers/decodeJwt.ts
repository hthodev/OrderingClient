"use client";

import { jwtDecode } from "jwt-decode";
import { UserPosition } from "../constants/users";
import LocalStorage from "./localstorage";

interface User {
  _id: string;
  username: string;
  fullName: string;
  image: string;
  position: UserPosition;
}

export function userDecode() {
  const token = LocalStorage.JwtToken.get();
  if (token) {
    const user: User = jwtDecode(token);
    return user;
  }
  return null;
}
