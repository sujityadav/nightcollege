'use client';

import Link from "next/link";
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import CollegeBanner from "../college-banner";

export default function WebsiteTop() {
  const navigation = [
    { label: "Home", href: "/" },
    {
      label: "About",
      type: "dropdown",
      links: [
        { label: "College About Us", href: "/about-us" },
        { label: "Vision and Mission", href: "/vision-mission" },
        { label: "Principal Massage", href: "/principal-massage" },
      
      ],
    },
    
    {
      label: "Administration",
      type: "mega",
      sections: [
        {
          title: "Staff",
          links: [
            { label: "Teaching Staff", href: "/teaching-staff" },
            { label: "Non Teaching Staff", href: "/teaching-staff" },
            { label: "Anti Ragging Cell ", href: "/anti-ragging-cell " },
            // { label: "Custom logo", href: "/design/custom-logo" },
          ],
        },
        {
          title: "About Management",
          links: [
          { label: "Founder", href: "/founder" },
          { label: "Governing Council", href: "/governing-council" },
          { label: "NCI Organograme", href: "/nci-Organograme" },
          { label: "Code of Conduct and Quality Policy", href: "/nci-Organograme" },
          { label: "Institutional Distinctiveness", href: "/institutional-distinctiveness" },
          ],
        },
        {
          title: "Info",
          links: [
            { label: "Administrative Calendar", href: "/security/site-seal" },
            { label: "Admin Policies", href: "/security/vps" },
           
          ],
        },
      ],
    },
    {
      label: "Departments",
      type: "mega",
      sections: [
        {
          title: "Arts Department",
          links: [
            { label: "Marathi", href: "/teaching-staff" },
            { label: "Hindi", href: "/teaching-staff" },
            { label: "English", href: "/anti-ragging-cell " },
            { label: "History", href: "/anti-ragging-cell " },
            { label: "Geography", href: "/anti-ragging-cell " },
            { label: "Sociology", href: "/anti-ragging-cell " },
            { label: "Economics", href: "/anti-ragging-cell " },
            { label: "Political Science", href: "/anti-ragging-cell " },
            { label: "English", href: "/anti-ragging-cell " },
            
          ],
        },
        {
          title: "Commerce  Department",
          links: [
           { label: "Marathi", href: "/teaching-staff" },
            { label: "Hindi", href: "/teaching-staff" },
            { label: "English", href: "/anti-ragging-cell " },
            { label: "History", href: "/anti-ragging-cell " },
            { label: "Geography", href: "/anti-ragging-cell " },
            { label: "Sociology", href: "/anti-ragging-cell " },
            { label: "Economics", href: "/anti-ragging-cell " },
            { label: "Political Science", href: "/anti-ragging-cell " },
            { label: "English", href: "/anti-ragging-cell " },
          ],
        },
        {
          title: "Science Department",
          links: [
           { label: "Geography", href: "/anti-ragging-cell " },
            { label: "Sociology", href: "/anti-ragging-cell " },
           
          ],
        },
      ],
    },
    {
      label: "Courses",
      type: "dropdown",
      links: [
        { label: "Arts Faculty", href: "/dropdown/menu1" },
        { label: "Commerce Faculty", href: "/dropdown/menu2" },
      
      ],
    },
    {
      label: "Infrastructure",
      type: "dropdown",
      links: [
        { label: "College Infrastructure", href: "/dropdown/menu1" },
        { label: "Library", href: "/dropdown/menu2" },
        { label: "Health Centre", href: "/dropdown/menu2" },
        { label: "ICT facilities", href: "/dropdown/menu2" },
        { label: "IT Infrastructure", href: "/dropdown/menu2" },
        { label: "Campus Flora", href: "/dropdown/menu2" },
      
      ],
    },
      {
      label: "Research",
      type: "mega",
      sections: [
        {
          title: "Arts Department",
          links: [
            { label: "Marathi", href: "/teaching-staff" },
            { label: "Hindi", href: "/teaching-staff" },
            { label: "English", href: "/anti-ragging-cell " },
            { label: "History", href: "/anti-ragging-cell " },
            { label: "Geography", href: "/anti-ragging-cell " },
            { label: "Sociology", href: "/anti-ragging-cell " },
            { label: "Economics", href: "/anti-ragging-cell " },
            { label: "Political Science", href: "/anti-ragging-cell " },
            { label: "English", href: "/anti-ragging-cell " },
            
          ],
        },
        {
          title: "Commerce  Department",
          links: [
           { label: "Marathi", href: "/teaching-staff" },
            { label: "Hindi", href: "/teaching-staff" },
            { label: "English", href: "/anti-ragging-cell " },
            { label: "History", href: "/anti-ragging-cell " },
            { label: "Geography", href: "/anti-ragging-cell " },
            { label: "Sociology", href: "/anti-ragging-cell " },
            { label: "Economics", href: "/anti-ragging-cell " },
            { label: "Political Science", href: "/anti-ragging-cell " },
            { label: "English", href: "/anti-ragging-cell " },
          ],
        },
        {
          title: "Science Department",
          links: [
           { label: "Geography", href: "/anti-ragging-cell " },
            { label: "Sociology", href: "/anti-ragging-cell " },
           
          ],
        },
      ],
    },

     {
      label: "NAAC/IQAC",
      type: "dropdown",
      links: [
        { label: "About NAAC ", href: "/dropdown/menu1" },
        { label: "IQAC Committee", href: "/dropdown/menu2" },
        { label: "Minutes of IQAC", href: "/dropdown/menu2" },
        { label: "Audit Reports", href: "/dropdown/menu2" },
        { label: "AQARs", href: "/dropdown/menu2" },
        { label: "AQAR Data", href: "/dropdown/menu2" },
        { label: "NIRF AISHE", href: "/dropdown/menu2" },
        { label: "NAAC Certificate", href: "/dropdown/menu2" },
        { label: "Academic and Administrative Audit", href: "/dropdown/menu2" },
      
      ],
    },
    
     {
      label: "Student Corner",
      type: "dropdown",
      links: [
        { label: "Prospectus   ", href: "/dropdown/menu1" },
        { label: "Admission Form  ", href: "/dropdown/menu2" },
        { label: "Syllabus", href: "/dropdown/menu2" },
        { label: "Study Material ", href: "/dropdown/menu2" },
        { label: "Freeship / Scholarship  ", href: "/dropdown/menu2" },
        { label: "Bonafide Certificate Application Format ", href: "/dropdown/menu2" },
        { label: "T.C / L.C. Application Format  ", href: "/dropdown/menu2" },
        { label: "Code of Conduct  ", href: "/dropdown/menu2" },
        { label: "Academic Calendar  ", href: "/dropdown/menu2" },
        { label: "Time Table ", href: "/dropdown/menu2" },
      
      ],
    },
  
    { label: "Contact Us", href: "/contact-us" },
  ];

  return (
    <>
      <div className="bg-primarycolor p-2"></div>

      <CollegeBanner />

      <div>
        <nav className="bg-primarycolor lg:bg-[#F0F2F6] border-[#BECDE3] border-b  ease-linear duration-300 custom_header px300 font15">
          <div className="wrapper">
            <input type="radio" name="slider" id="menu-btn" />
            <input type="radio" name="slider" id="close-btn" />

            <ul className="nav-links">
              <label htmlFor="close-btn" className="btn close-btn">
                <i className="pi pi-times text-primarycolor"></i>
              </label>

              {navigation.map((nav, idx) => {
                if (nav.type === "dropdown" && nav.links) {
                  return (
                    <li key={idx}>
                      <span className="desktop-item xl:px-2 2xl:px-2 3xl:px-3 flex items-center gap-1 cursor-pointer">
                        {nav.label} <i className="pi pi-chevron-down text-xs  text-[#8d8d8d] ml-1"></i>
                      </span>
                      <input type="checkbox" id={`showDrop-${idx}`} />
                      <label htmlFor={`showDrop-${idx}`} className="mobile-item">{nav.label}</label>
                      <ul className="drop-menu">
                        {nav.links.map((item, i) => (
                          <li key={i}>
                            <Link href={item.href}>{item.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                }

                if (nav.type === "mega") {
                  return (
                    <li key={idx}>
                      <span className="desktop-item xl:px-2 2xl:px-2 3xl:px-3 flex items-center gap-1 cursor-pointer">
                        {nav.label} <i className="pi pi-chevron-down text-xs  text-[#8d8d8d] ml-1"></i>
                      </span>
                      <input type="checkbox" id={`showMega-${idx}`} />
                      <label htmlFor={`showMega-${idx}`} className="mobile-item">{nav.label}</label>
                      <div className="mega-box">
                        <div className="content">
                          {nav?.sections && nav?.sections.map((section, i) => (
                            <div className="row" key={i}>
                              <header>{section.title}</header>
                              <ul className="mega-links mt-2">
                                {section.links.map((link, j) => (
                                  <li key={j}>
                                    <Link href={link.href}>{link.label}</Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={idx}>
                    <Link href={nav.href ? nav.href : "#"}>{nav.label}</Link>
                  </li>
                );
              })}

            </ul>

            <label htmlFor="menu-btn" className="btn menu-btn">
              <i className="pi pi-bars"></i>
            </label>
          </div>
        </nav>
      </div>
    </>
  );
}
