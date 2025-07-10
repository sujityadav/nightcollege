// features/aboutus/sidebarData.js
import AboutEditor from './components/AboutEditor';
import AboutUs from './components/AboutEditor';
import CollegeGlance from './components/CollegeGlance';
import VisionMission from './components/VisionMission';
import PrincipalDesk from './components/PrincipalDesk';
import IDP from './components/IDP';
import Distinctiveness from './components/Distinctiveness';

export const aboutUsNavItems = [
  { label: 'About Us', key: 'about', component: <AboutUs /> },
  { label: 'College at a Glance', key: 'glance', component: <CollegeGlance /> },
  { label: 'Vision & Mission', key: 'vision' },
  { label: 'Principal Desk', key: 'desk' },
  { label: 'IDP', key: 'idp' },
  { label: 'Institutional Distinctiveness', key: 'distinct' },
];

export const componentMap = {
  about: <AboutUs />,
  glance: <CollegeGlance />,
  vision: <VisionMission />,
  desk: <PrincipalDesk />,
  idp: <IDP />,
  distinct: <Distinctiveness />,
};