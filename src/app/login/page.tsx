import React from "react";
import { metadata } from "../layout";
import LoginPage from "../pages/Login";

export default function Login() {
  metadata.title = "Login"
  return (
    <LoginPage/>
  );
}