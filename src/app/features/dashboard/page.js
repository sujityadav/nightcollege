"use client";

import React from "react";
import { useSelector } from "react-redux";
import { LoginPage } from "../login/page";
export const DashBoard = () => {
  const user = useSelector((state) => state.auth.user);
  return <>{!user ? <LoginPage /> : <div>page</div>}</>;
};
