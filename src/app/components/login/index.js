'use client';


function SignIn(){
    return (
        <main className=" min-h-screen ">
            <div className="grid grid-cols-12 md:grid-cols-11 lg:grid-cols-11 xl:grid-cols-12 2xl:grid-cols-12 items-center">
                <div className='col-span-9'>
                    <div className='bg_login'></div>
                </div>
                <div className='bg-[#f2f2f2] h-full col-span-3'>
                    <div className='flex flex-col items-center h-full justify-center'>
                        <div className='h-full'>
                        <div>
                            <h2>Login </h2>
                            <p>Provide your credentials to proceed, please.</p>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
export default SignIn;