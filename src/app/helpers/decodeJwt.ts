import { jwtDecode } from "jwt-decode";
import { UserPosition } from "../constants/users";

interface User {
  _id: string;
  username: string;
  fullName: string;
  image: string;
  position: UserPosition;
}

export function userDecode(token: string) {
  const user: User = jwtDecode(token);
  return user;
}
