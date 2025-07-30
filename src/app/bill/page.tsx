import React, { useEffect } from "react";
import BillPage from "../pages/Bill";
import { metadata } from "../layout";

export default function Bill() {
  metadata.title = "Xem hoá đơn order"
  return <BillPage />;
}
