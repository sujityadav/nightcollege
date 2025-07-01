'use client';

import Link from "next/link";
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import CollegeBanner from "../college-banner";

export default function WebsiteTop() {
  const navigation = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    {
      label: "Dropdown Menu",
      type: "dropdown",
      items: [
        { label: "Drop menu 1", href: "/dropdown/menu1" },
        { label: "Drop menu 2", href: "/dropdown/menu2" },
        { label: "Drop menu 3", href: "/dropdown/menu3" },
        { label: "Drop menu 4", href: "/dropdown/menu4" },
      ],
    },
    {
      label: "Mega Menu",
      type: "mega",
      sections: [
        {
          title: "Design Services",
          links: [
            { label: "Graphics", href: "/design/graphics" },
            { label: "Vectors", href: "/design/vectors" },
            { label: "Business cards", href: "/design/business-cards" },
            { label: "Custom logo", href: "/design/custom-logo" },
          ],
        },
        {
          title: "Email Services",
          links: [
            { label: "Personal Email", href: "/email/personal" },
            { label: "Business Email", href: "/email/business" },
            { label: "Mobile Email", href: "/email/mobile" },
            { label: "Web Marketing", href: "/email/marketing" },
          ],
        },
        {
          title: "Security Services",
          links: [
            { label: "Site Seal", href: "/security/site-seal" },
            { label: "VPS Hosting", href: "/security/vps" },
            { label: "Privacy Seal", href: "/security/privacy" },
            { label: "Website design", href: "/security/web-design" },
          ],
        },
      ],
    },
    { label: "Feedback", href: "/feedback" },
  ];

  return (
    <>
      <div className="bg-primarycolor p-2"></div>

      <CollegeBanner/>

      <div>
        <nav className="bg-[#F0F2F6] border-[#BECDE3] border-b px-[15px] lg:px-[20px] xl:px-[1.04vw] ease-linear duration-300">
          <div className="wrapper">
            <input type="radio" name="slider" id="menu-btn" />
            <input type="radio" name="slider" id="close-btn" />

            <ul className="nav-links">
              <label htmlFor="close-btn" className="btn close-btn">
                <i className="pi pi-times"></i>
              </label>

              {navigation.map((nav, idx) => {
                if (nav.type === "dropdown") {
                  return (
                    <li key={idx}>
                      <a href="#" className="desktop-item">{nav.label}</a>
                      <input type="checkbox" id="showDrop" />
                      <label htmlFor="showDrop" className="mobile-item">{nav.label}</label>
                      <ul className="drop-menu">
                        {nav.items.map((item, i) => (
                          <li key={i}><Link href={item.href}>{item.label}</Link></li>
                        ))}
                      </ul>
                    </li>
                  );
                }

                if (nav.type === "mega") {
                  return (
                    <li key={idx}>
                      <a href="#" className="desktop-item">{nav.label}</a>
                      <input type="checkbox" id="showMega" />
                      <label htmlFor="showMega" className="mobile-item">{nav.label}</label>
                      <div className="mega-box">
                        <div className="content">
                          {nav.sections.map((section, i) => (
                            <div className="row" key={i}>
                              <header>{section.title}</header>
                              <ul className="mega-links">
                                {section.links.map((link, j) => (
                                  <li key={j}><Link href={link.href}>{link.label}</Link></li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                }

                // Normal link
                return (
                  <li key={idx}>
                    <Link href={nav.href}>{nav.label}</Link>
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
