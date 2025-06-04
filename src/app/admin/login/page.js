
'use client';
import { InputText } from "primereact/inputtext";


export default function Login() {
    return (
       <>
        <main className=" min-h-screen ">
            <div className="grid grid-cols-12 md:grid-cols-11 lg:grid-cols-11 xl:grid-cols-12 2xl:grid-cols-12 items-center">
                <div className='col-span-9'>
                    <div className='bg_login'></div>
                </div>
                <div className='bg-[#fff] h-full col-span-3'>
                    <div className='flex flex-col h-full justify-center px-[20px] xl:px-[30px] 2xl:px-[30px] 3xl:px-[2.083vw]'>
                        <div className=''>
                        <div>
                            <h2 className="text-[22px] xl:text-[22px] 2xl:text-[26px] 3xl:text-[1.56vw] font-[600] text-[#2d2d2d]">Login </h2>
                            <p className=" text-[14px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[0.833vw] font-[300] text-[#a5a5a5]">Provide your credentials to proceed, please.</p>
                        </div>
                        </div>

                        <div className="mt-10">
                            <div className="flex flex-col items-start">
                                <label className=" text-[14px] xl:text-[14px] 2xl:text-[16px] 3xl:text-[0.833vw] font-[500] text-[#2d2d2d] text-right">Username</label>
                                <InputText type="text" className="p-inputtext-sm" placeholder="Small" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
       </>
       
    )
}