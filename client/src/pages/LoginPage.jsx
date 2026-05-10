import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values) => {
    setServerError('');

    try {
      const response = await api.post('/auth/login', values);
      login(response.data);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(error?.response?.data?.message || 'Unable to login');
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Welcome back">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Mail className="h-4 w-4 text-blue-600" />
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-black outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="you@example.com"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email ? <p className="mt-2 flex items-center gap-1 text-sm text-red-600"><AlertCircle className="h-3 w-3" />{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Lock className="h-4 w-4 text-blue-600" />
            Password
          </label>
          <input
            type="password"
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-black outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password ? <p className="mt-2 flex items-center gap-1 text-sm text-red-600"><AlertCircle className="h-3 w-3" />{errors.password.message}</p> : null}
        </div>
        {serverError ? <p className="flex items-start gap-2 rounded-lg border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />{serverError}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-sm text-gray-600">
        Need an account?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
