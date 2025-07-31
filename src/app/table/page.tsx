import React from "react";
import { metadata } from "../layout";
import TablePage from "../pages/Table";

export default function Table() {
  metadata.title = "Danh sách các bàn nhậu"
  return (
    <TablePage/>
  );
}