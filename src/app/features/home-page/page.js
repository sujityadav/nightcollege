"use client";

import React from "react";
import WebsitebannerComponent from './components/main-banner/WebsitebannerComponent'
import NewsSilder from './components/news-silder/index'
import AboutUs from './components/about-us/index'
import Desk from './components/desk/index'
import Summary from './components/summary/index'
import Events from './components/events/index'
import QuickLinks from './components/quick-links/index'
import DepartmentEvents from './components/deparment-events/index'
import Placement from './components/placement/index'
import CampusTour from './components/campus-tour/index'



const Homepage = () => {
  return <>

    <div className=" p-0 m-0 ">
      <WebsitebannerComponent />
    </div>
    <div><NewsSilder /></div>
    <>
      <AboutUs />
    </>
    <>
      <Desk />
    </>
    <><Summary /></>
    <><Events />
      <><QuickLinks /></>
      <>
        <DepartmentEvents />
      </>
      <><CampusTour /></>
      <><Placement /></>
    
    </>
  </>;
};
export default Homepage
