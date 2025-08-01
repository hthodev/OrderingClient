"use client";
import { useEffect, useMemo } from "react";
import Manager from "../components/managers/Manager";
import { userDecode } from "../helpers/decodeJwt";
import { useRouter } from "next/navigation";
import USER from "../constants/users";

export default function ManagerPage() {
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

  return <Manager />;
}
