'use client';
import LoginForm from './components/LoginForm';
import React from 'react'

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

 const LoginPage = () => {
  return (
    <main className="min-h-screen">
      <div className="grid grid-cols-12 items-center">
        <div className="col-span-9">
          <div className="bg_login"></div>
        </div>
        <div className="bg-[#fff] h-full col-span-3">
          <div className="flex flex-col h-full justify-center px-5 xl:px-7">
            <div>
              <h2 className="text-xl font-semibold text-[#2d2d2d]">Login</h2>
              <p className="text-sm font-light text-[#a5a5a5]">
                Provide your credentials to proceed, please.
              </p>
            </div>

            <div className="mt-5">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage

