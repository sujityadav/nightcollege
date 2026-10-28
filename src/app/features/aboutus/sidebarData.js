// features/aboutus/sidebarData.js
import AboutEditor from './components/AboutEditor';
import AboutUs from './components/AboutEditor';
import CollegeGlance from './components/CollegeGlance';
import VisionMission from './components/VisionMission';
import PrincipalDesk from './components/PrincipalDesk';
import ChairmanDesk from './components/ChairmanDesk';
import CollegeStatistics from './components/CollegeStatistics';
import IDP from './components/IDP';
import Distinctiveness from './components/Distinctiveness';

export const aboutUsNavItems = [
  { label: 'About Us', key: 'about', component: <AboutUs /> },
  { label: 'College at a Glance', key: 'glance', component: <CollegeGlance /> },
  { label: 'Vision & Mission', key: 'vision' },
  { label: 'Principal Desk', key: 'desk' },
  { label: 'Chairman Desk', key: 'chairman_desk' },
  { label: 'College Statistics', key: 'college_statistics' },
  { label: 'IDP', key: 'idp' },
  { label: 'Institutional Distinctiveness', key: 'distinct' },
];

export const componentMap = {
  about: <AboutUs />,
  glance: <CollegeGlance />,
  vision: <VisionMission />,
  desk: <PrincipalDesk />,
  chairman_desk: <ChairmanDesk />,
  college_statistics: <CollegeStatistics />,
  idp: <IDP />,
  distinct: <Distinctiveness />,
};