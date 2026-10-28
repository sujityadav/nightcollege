'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import CollegeBanner from "../college-banner";
import { getPublicAboutUsNavLinks } from "@/app/lib/publicAboutUsSections";

type MegaLink = { label: string; href: string; disabled?: boolean };
type MegaSection = { title: string; links: MegaLink[]; disabled?: boolean };

type NavLink = { label: string; href: string };

export default function WebsiteTop() {
  const [departmentMegaSections, setDepartmentMegaSections] = useState<MegaSection[]>([]);
  const [infrastructureLinks, setInfrastructureLinks] = useState<NavLink[]>([]);
  const [publicationLinks, setPublicationLinks] = useState<NavLink[]>([]);
  const [studentCornerLinks, setStudentCornerLinks] = useState<NavLink[]>([]);
  const [committeeLinks, setCommitteeLinks] = useState<NavLink[]>([]);

  useEffect(() => {
    const loadCommitteesMenu = async () => {
      try {
        const response = await axios.get("/api/commities/public");
        if (!response.data?.success) return;

        const links: NavLink[] = (response.data.data || []).map(
          (item: { title: string; slug: string; id: string }) => ({
            label: item.title,
            href: `/committees/${item.slug}?id=${item.id}`,
          })
        );

        setCommitteeLinks(links);
      } catch (error) {
        console.error("Failed to load committees navigation:", error);
      }
    };

    loadCommitteesMenu();
  }, []);

  useEffect(() => {
    const loadStudentCornerMenu = async () => {
      try {
        const response = await axios.get("/api/student-corner/public");
        if (!response.data?.success) return;

        const links: NavLink[] = (response.data.data || []).map(
          (item: { id: string; title: string }) => ({
            label: item.title,
            href: `/student-corner/${item.id}`,
          })
        );

        setStudentCornerLinks(links);
      } catch (error) {
        console.error("Failed to load student corner navigation:", error);
      }
    };

    loadStudentCornerMenu();
  }, []);

  useEffect(() => {
    const loadPublicationMenu = async () => {
      try {
        const response = await axios.get("/api/college-publication/public");
        if (!response.data?.success) return;

        const links: NavLink[] = (response.data.data || []).map(
          (item: { id: string; title: string }) => ({
            label: item.title,
            href: `/college-publication/${item.id}`,
          })
        );

        setPublicationLinks(links);
      } catch (error) {
        console.error("Failed to load college publication navigation:", error);
      }
    };

    loadPublicationMenu();
  }, []);

  useEffect(() => {
    const loadInfrastructureMenu = async () => {
      try {
        const response = await axios.get("/api/infrastructure-facilities/public");
        if (!response.data?.success) return;

        const links: NavLink[] = (response.data.data || []).map(
          (item: { id: string; title: string }) => ({
            label: item.title,
            href: `/infrastructure/${item.id}`,
          })
        );

        setInfrastructureLinks(links);
      } catch (error) {
        console.error("Failed to load infrastructure navigation:", error);
      }
    };

    loadInfrastructureMenu();
  }, []);

  useEffect(() => {
    const loadDepartmentsMenu = async () => {
      try {
        const response = await axios.get("/api/departments/navigation");
        if (!response.data?.success) return;

        const sections: MegaSection[] = (response.data.data || []).map(
          (department: { id: string; title: string; subjects: { id: string; title: string }[] }) => ({
            title: department.title,
            links: (department.subjects || []).map((subject) => ({
              label: subject.title,
              href: `/departments?departmentId=${department.id}&subjectId=${subject.id}`,
            })),
          })
        );

        setDepartmentMegaSections(sections);
      } catch (error) {
        console.error("Failed to load departments navigation:", error);
      }
    };

    loadDepartmentsMenu();
  }, []);

  const navigation = useMemo(() => [
    { label: "Home", href: "/" },
    {
      label: "About",
      type: "dropdown",
      links: getPublicAboutUsNavLinks(),
    },
    
    {
      label: "Administration",
      type: "mega",
      sections: [
        {
          title: "Staff",
          links: [
            { label: "Teaching Staff", href: "/staff?type=teaching" },
            { label: "Non Teaching Staff", href: "/staff?type=non-teaching" },
          ],
        },
        {
          title: "About Management",
          disabled: true,
          links: [
            { label: "Founder", href: "/founder", disabled: true },
            { label: "Governing Council", href: "/governing-council", disabled: true },
            { label: "NCI Organograme", href: "/nci-Organograme", disabled: true },
            {
              label: "Code of Conduct and Quality Policy",
              href: "/nci-Organograme",
              disabled: true,
            },
            {
              label: "Institutional Distinctiveness",
              href: "/institutional-distinctiveness",
              disabled: true,
            },
          ],
        },
        {
          title: "Info",
          disabled: true,
          links: [
            { label: "Administrative Calendar", href: "/security/site-seal", disabled: true },
            { label: "Admin Policies", href: "/security/vps", disabled: true },
          ],
        },
      ],
    },
    {
      label: "Departments",
      type: "mega",
      megaVariant: "departments",
      sections: departmentMegaSections,
    },
    {
      label: "Infrastructure",
      type: "dropdown",
      links: infrastructureLinks.length
        ? infrastructureLinks
        : [{ label: "No facilities listed", href: "#" }],
    },
    {
      label: "College Publication",
      type: "dropdown",
      links: publicationLinks.length
        ? publicationLinks
        : [{ label: "No publications listed", href: "/college-publication" }],
    },
    {
      label: "Committees",
      type: "dropdown",
      links: committeeLinks.length
        ? committeeLinks
        : [{ label: "No committees listed", href: "#" }],
    },
     {
      label: "NAAC/IQAC",
      type: "dropdown",
      links: [
        { label: "About NAAC ", href: "/naac/menu/iqac-composition" },
        { label: "IQAC Committee", href: "/naac/menu/iqac-composition" },
        { label: "Minutes of IQAC", href: "/naac/menu/iqac-meetings" },
        { label: "Audit Reports", href: "/naac/menu/green-energy-audit" },
        { label: "AQARs", href: "/naac/aqar" },
        { label: "AQAR Data", href: "/naac/aqar" },
        { label: "NIRF AISHE", href: "/naac/menu/ssr" },
        { label: "NAAC Certificate", href: "/naac/menu/naac-accreditation" },
        { label: "Academic and Administrative Audit", href: "/naac/menu/aaa" },
      
      ],
    },
    
    {
      label: "Student Corner",
      type: "dropdown",
      links: studentCornerLinks.length
        ? studentCornerLinks
        : [{ label: "No items listed", href: "/student-corner" }],
    },
  
    { label: "Contact Us", href: "/contact-us" },
  ], [departmentMegaSections, infrastructureLinks, publicationLinks, studentCornerLinks, committeeLinks]);

  return (
    <>
      

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
                      <div className={`mega-box${nav.megaVariant === "departments" ? " mega-box--departments" : ""}`}>
                        <div className={`content${nav.megaVariant === "departments" ? " mega-box-content--scroll" : ""}`}>
                          {nav?.sections && nav?.sections.map((section, i) => (
                            <div
                              className={`row${section.disabled ? " mega-row--disabled" : ""}`}
                              key={section.title || i}
                            >
                              <header className={section.disabled ? "mega-header--disabled" : ""}>
                                {section.title}
                              </header>
                              <ul className="mega-links mt-2 mega-links--scroll">
                                {section.links?.length ? (
                                  section.links.map((link, j) => (
                                    <li
                                      key={`${link.label}-${j}`}
                                      className={link.disabled || section.disabled ? "mega-link--disabled" : ""}
                                    >
                                      {link.disabled || section.disabled ? (
                                        <span aria-disabled="true">{link.label}</span>
                                      ) : (
                                        <Link href={link.href}>{link.label}</Link>
                                      )}
                                    </li>
                                  ))
                                ) : (
                                  <li className="mega-links-empty">No subjects listed</li>
                                )}
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
