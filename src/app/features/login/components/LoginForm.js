'use client';
import { InputText } from 'primereact/inputtext';
import { useLoginForm } from '../hooks/useLoginForm';
import { loginAction } from '../actions/loginAction';
import { useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import Cookies from 'js-cookie';
import { setAuth } from '@/redux/authSlice';
import { useDispatch } from "react-redux";
import { Button } from 'primereact/button';


export default function LoginForm() {
  const { register, handleSubmit, errors } = useLoginForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await loginAction(data);
      const response = await loginAction(data);
    if(response.data.success){
        const token = response?.data?.updatedUser?.token;
        setLoading(false);
        dispatch(setAuth({ token, user: response.data.updatedUser }));
        Cookies.set("token", token, { expires: 7 });
    }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    } 
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative">
      <div className="flex flex-col items-start mb-6 w-full">
        <label className="text-sm font-medium text-[#2d2d2d] mb-1">Username</label>
        <InputText
          type="text"
          {...register('username', { required: 'Username is required' })}
          className="p-inputtext-sm w-full"
          placeholder="Enter username"
          disabled={loading}
        />
        {errors.username && (
          <span className="text-red-500 text-xs mt-1">{errors.username.message}</span>
        )}
      </div>

      <div className="flex flex-col items-start mb-6 w-full">
        <label className="text-sm font-medium text-[#2d2d2d] mb-1">Password</label>
        <InputText
          type="password"
          {...register('password', { required: 'Password is required' })}
          className="p-inputtext-sm w-full"
          placeholder="Enter password"
          disabled={loading}
        />
        {errors.password && (
          <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>
        )}
      </div>

         <Button 
        type="submit"
        className="w-full flex justify-center items-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <ProgressSpinner
              style={{ width: '20px', height: '20px' }}
              strokeWidth="4"
              fill="var(--surface-ground)"
              animationDuration=".5s"
            />
            <span>Logging in...</span>
          </>
        ) : (
          'Login'
        )}
      </Button>
    </form>
  );
}
