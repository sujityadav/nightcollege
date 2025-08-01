"use client";

import React from "react";
import  WebsitebannerComponent  from './components/main-banner/WebsitebannerComponent'
import  NewsSilder  from './components/news-silder/index'
import  AboutUs  from './components/about-us/index'


 const Homepage = () => {
  return <>
  
  <div className=" p-0 m-0 ">
    <WebsitebannerComponent />
  </div>
  <div>  <NewsSilder/></div>
  <>
  <AboutUs/>
  </>
    </>;
};
export default Homepage
