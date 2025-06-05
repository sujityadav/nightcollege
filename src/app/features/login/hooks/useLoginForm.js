'use client';
import { useForm } from 'react-hook-form';

export const useLoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return {
    register,
    handleSubmit,
    errors,
  };
};
