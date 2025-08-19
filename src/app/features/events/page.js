"use client";

import React from "react";
import SubBanner from "./components/sub-banner";
import Events from "./components/events/index";




const Page = () => {
   const breadcrumbData = [
    { label: "Home", url: "/" },
    { label: "All Events", url: "/all-events" },
  ];
  return <>

      <SubBanner title="All Events" breadcrumbData={breadcrumbData} />
      <><Events /></>
    </>
 
};
export default Page
