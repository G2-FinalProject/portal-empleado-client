
import { useState } from 'react';
import { useForm } from 'react-hook-form'; //==> SE AÑADE FUNCIONES DE LA LIBRERÍA INSTALADA
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { login as apiLogin } from '../../services/authApi';
import useAuthStore from '../../stores/authStore';
import logo from '../../assets/cohispania_logo.svg';
import loginImage from '../../assets/images/login_image.jpg';
import toast from 'react-hot-toast'; //==> SE AÑADE FUNCIONES DE LA LIBRERÍA INSTALADA
import { Button } from '../../components/ui';

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
      //Toast de éxito
      toast.success('¡Bienvenido de vuelta!', {
        style: {
          background: '#1F2A44',
          color: '#fff',
        },
        iconTheme: {
          primary: '#F68D2E',
          secondary: '#fff',
        },
      });
      navigate('/myportal');

    } catch (error) {
      console.error('❌ Error en login:', error);
      // Toast de error
      toast.error(
      error.response?.data?.message || 'Email o contraseña incorrectos',
      {
        style: {
          background: '#1F2A44',
          color: '#fff',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      }
    );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F7FA' }}>
      {/* LEFT SIDE - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        {/* Logo */}
        <div className="justify">
          <img
            src={logo}
            alt="CoHispania Logo"
            className="h-24 w-auto"
          />
        </div>

        {/* Card del formulario */}
        <div
          className="bg-white rounded-2xl p-8 sm:p-10"
          style={{
            border: '1px solid #B3B3B3',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Título */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: '#1F2A44' }}
            >
              Iniciar sesión
            </h1>
            <p
              className="text-sm"
              style={{ color: '#767676' }}
            >
              Ingresa tus credenciales para acceder a la plataforma
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2"
                style={{ color: '#1F2A44' }}
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu.email@cohispania.com"
                disabled={isLoading}
                style={{
                  backgroundColor: '#F4F6FA',
                  color: '#1F2A44',
                  border: '1px solid #E0E4EA'
                }}
                className="w-full px-4 py-3 rounded-lg placeholder-[#1F2A44] placeholder-opacity-60 focus:ring-2 focus:ring-[#F68D2E] focus:border-[#F68D2E] outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="block text-sm font-semibold mb-2"
                style={{ color: '#1F2A44' }}
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="········"
                disabled={isLoading}
                style={{
                  backgroundColor: '#F4F6FA',
                  color: '#1F2A44',
                  border: '1px solid #E0E4EA'
                }}
                className="w-full px-4 py-3 rounded-lg placeholder-[#1F2A44] placeholder-opacity-60 focus:ring-2 focus:ring-[#F68D2E] focus:border-[#F68D2E] outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
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
             <Button
              type="submit"
              variant="primary"
              size="medium"
              fullWidth
              loading={isLoading}
            >
              Iniciar sesión
            </Button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE - Imagen con texto */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Imagen de fondo */}
        <img
          src={loginImage}
          alt="CoHispania workspace"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay con colores de marca */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              135deg,
              rgba(31, 42, 68, 0.90) 0%,
              rgba(31, 42, 68, 0.85) 50%,
              rgba(246, 141, 46, 0.12) 100%
            )`
          }}
        />

        {/* Texto sobre la imagen */}
        <div className="relative z-10 flex items-center justify-center px-16 py-16">
          <div className="max-w-2xl">
            <h2
              className="text-3xl font-bold text-white leading-tight"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              La plataforma de CoHispania para reservar tus vacaciones de manera ágil y sencilla
            </h2>
          </div>
        </div>

        {/* Círculos decorativos */}
        <div
          className="absolute top-20 right-20 w-48 h-48 rounded-full blur-3xl opacity-15"
          style={{ backgroundColor: '#F68D2E' }}
        />
        <div
          className="absolute bottom-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: '#F68D2E' }}
        />
      </div>
    </div>
  );
}
