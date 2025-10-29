// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { login as apiLogin } from '../../services/authApi';
import useAuthStore from '../../stores/authStore';
import logo from '../../assets/logo.jpg'; // 👈 Importar el logo

export default function LoginPage() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await apiLogin({
        email: data.email,
        password: data.password,
      });

      loginStore(response.token, response.sesionData);
      navigate('/myportal');

    } catch (error) {
      console.error('❌ Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white">
        {/* Logo */}
        <div className="mb-12">
          <img
            src={logo}
            alt="CoHispania Logo"
            className="h-12"
          />
        </div>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[--color-cohispania-blue] mb-2">
            Iniciar sesión
          </h1>
          <p className="text-gray-600 text-sm">
            Ingresa tus credenciales para acceder a la plataforma
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[--color-cohispania-blue] mb-2"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu.email@cohispania.com"
              disabled={isLoading}
              style={{
                '--tw-ring-color': 'var(--color-cohispania-orange)',
              }}
              className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-[--color-cohispania-blue] placeholder-gray-400 focus:ring-2 focus:bg-white outline-none transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              {...register('email', {
                required: 'El email es obligatorio',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-[--color-cohispania-blue] mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="········"
              disabled={isLoading}
              style={{
                '--tw-ring-color': 'var(--color-cohispania-orange)',
              }}
              className={`w-full px-4 py-3 bg-gray-50 border-0 rounded-lg text-[--color-cohispania-blue] placeholder-gray-400 focus:ring-2 focus:bg-white outline-none transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres',
                },
              })}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[--color-cohispania-orange] hover:bg-[#e57e1f] text-white font-semibold rounded-lg transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Iniciar sesión</span>
            )}
          </button>
        </form>
      </div>

      {/* RIGHT SIDE - Imagen con texto */}
      <div className="hidden lg:flex lg:w-1/2 bg-[--color-cohispania-blue] relative overflow-hidden">
        {/* Overlay con gradiente */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom right, rgba(31, 42, 68, 0.95), rgba(31, 42, 68, 0.8))'
          }}
        />

        {/* Texto sobre la imagen */}
        <div className="relative z-10 flex items-center justify-center px-12">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold text-white leading-tight">
              La plataforma de CoHispania para reservar tus vacaciones de manera{' '}
              <span className="text-[--color-cohispania-orange]">ágil y sencilla</span>
            </h2>
          </div>
        </div>

        {/* Decoración opcional - círculos */}
        <div
          className="absolute top-10 right-10 w-32 h-32 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(246, 141, 46, 0.1)' }}
        />
        <div
          className="absolute bottom-10 left-10 w-40 h-40 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(246, 141, 46, 0.05)' }}
        />
      </div>
    </div>
  );
}
