'use client';

import Image from 'next/image';
import { Roboto_Slab } from 'next/font/google';
const roboto_slab = Roboto_Slab({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
});
export default function Footer() {
  return (
    <footer className="bg-primarycolor text-white px-4 py-10 md:px-12 xl:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-b border-white/30 pb-10">
          {/* Logo & Contact */}
          <div className='flex gap-3'>
            <div>
            <Image src="/images/whitelogo.png" alt="University Logo" width={200} height={200} />

            </div>
           <div>
              
            <h1 className="text-2xl font-bold uppercase">Night College of Arts & Commerce, Ichalkaranji</h1>
            <div className="mt-4 text-sm leading-6">
              <p><i className="pi pi-map-marker mr-2" />18/324 Industrial Estate Ichalkaranji </p>
              <p><i className="pi pi-phone mr-2" />0230(2437666)</p>
              <p><i className="pi pi-envelope mr-2" />nightich@gmail.com</p>
            </div>
            </div>
          </div>

          {/* Social & Newsletter */}
          <div className="">
            {/* Social Icons */}
            
            <div className='flex justify-end'>
              <div>
              <h3 className="text-lg font-semibold mb-3">Social Media</h3>
              <div className="flex gap-3 text-white">
                <div className="bg-white/20 p-2 rounded-full hover:bg-white/40 cursor-pointer">
                  <i className="pi pi-facebook" />
                </div>
                <div className="bg-white/20 p-2 rounded-full hover:bg-white/40 cursor-pointer">
                  <i className="pi pi-twitter" />
                </div>
                <div className="bg-white/20 p-2 rounded-full hover:bg-white/40 cursor-pointer">
                  <i className="pi pi-instagram" />
                </div>
                <div className="bg-white/20 p-2 rounded-full hover:bg-white/40 cursor-pointer">
                  <i className="pi pi-linkedin" />
                </div>
              </div>
              </div>
            </div>

           
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-10 text-sm">
          {[
            {
              title: 'About',
              links: [
                'Academics',
                'Campus administrations',
                'Campus safety',
                'Office chancellor',
                'Facility services',
                'Human resources',
              ],
            },
            {
              title: 'Educations',
              links: [
                'Academic departments',
                'Undergraduate programs',
                'Graduate programs',
                'Institutes and Centers',
                'Academic policy',
                'Academic calendar',
              ],
            },
            {
              title: 'Admission',
              links: [
                'Undergraduate admission',
                'Graduate admission',
                'International affairs office',
                'Special students',
                'Financial aid',
                'Prospective students',
              ],
            },
            {
              title: 'Research',
              links: [
                'Research overview',
                'eLink research',
                'Development center',
                'Research center',
                'Laboratorium center',
                'Information technology',
              ],
            },
            {
              title: 'Campus Life',
              links: [
                'Campus locations',
                'Class timetables',
                'Faculties and Schools',
                'Staff and Members',
                'Campus events',
              ],
            },
          ].map((col, i) => (
            <div key={i}>
             <div className={roboto_slab.className}> <h4 className="font-semibold mb-4 font20 ">{col.title}</h4></div>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j} className="hover:underline cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center text-xs mt-10 pt-6 border-t border-white/20">
          © 2025 All rights reserved. Powered by <span className="underline">Sujit Yadav</span>.
        </div>
      </div>
    </footer>
  );
}
