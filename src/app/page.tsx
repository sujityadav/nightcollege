
import Image from 'next/image'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { DashBoard } from "../app/features/dashboard/page";

import { useSelector } from 'react-redux';

export default function Home() {
  return (
      <>
       <DashBoard /> 
    </>
  )
}
