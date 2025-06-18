

import React, { useRef } from "react";
import Image from "next/image";
import 'simplebar-react/dist/simplebar.min.css';
import 'primeicons/primeicons.css';
import { TieredMenu } from 'primereact/tieredmenu';
import { useMsal } from "@azure/msal-react";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setUserData } from "@store/slices/userSlice";

export default function Profile({ ...pageProps }) {

    const menu = useRef(null);
    const dispatch = useDispatch();
    const { instance } = useMsal();
    const items = [
        {
            label: 'Switch Context',
            icon: 'icon swtich_icon',
            items: [
                {
                    label: 'ASG',

                },
                {
                    label: 'NSA',
                },
                {
                    label: 'DSA',

                },
                {
                    label: 'SHS',

                },
                {
                    label: 'FSL',

                },
                {
                    label: 'ASH',

                },
                {
                    label: 'CSA',

                },
            ]
        },
        {
            label: 'Logout',
            icon: 'icon monitor_icon',
            command: () => handleLogout(), // Logout handler
        },
    ];


    const handleLogout = async () => {
        try {
            // Check if the user is logged in with Microsoft (via msal instance)
            if (instance && instance.getAllAccounts().length > 0) {
                await instance.logoutPopup();
                console.log("Logged out from Microsoft account.");
            }
    
            // Clear session and local storage items
            sessionStorage.removeItem('emailId');
            sessionStorage.removeItem('is_role');
            localStorage.removeItem('emailId');
            localStorage.removeItem('is_role');
            
            // Remove cookies
            Cookies.remove("userData");
    
            // Dispatch to reset user data
            dispatch(setUserData(null)); // This should now work safely
    
            // Redirect to homepage
            window.location.href = '/';
        } catch (error) {
            console.log("Logout failed: ", error);
        }
    };



    return (
        <div className="custom_menu">
            <TieredMenu model={items} className="cust-menuitems" popup ref={menu} breakpoint="767px" />
            <div><Image src={'/images/profile.png'} width={38.4} height={38.4} alt="" onClick={(e) => menu.current.toggle(e)} className="2xl:w-[2vw] 2xl:h-[2vw] rounded-full" /></div>
        </div>
    );
}