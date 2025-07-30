"use client";
import React, { useEffect, useState } from "react";
import KitchenDashboard from "../components/Cooking";
import Header from "../components/Header";

export default function CookingPage() {


  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <KitchenDashboard />
      </main>
    </div>
  );
}
