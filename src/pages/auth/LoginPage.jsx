import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../../services/authApi';
import useAuthStore from '../../stores/authStore';
import { showLoading, updateToastSuccess, updateToastError } from '../../utils/notifications';
import { emailValidation, passwordValidation, defaultFormConfig } from '../../utils/validations';
import logo from '../../assets/cohispania_logo.svg';
import loginImage from '../../assets/images/login_image.jpg';
import { Button, Input } from '../../components/ui';

/**
 *  PÁGINA DE LOGIN CON VALIDACIONES
 *
 * Página de autenticación que incluye:
 * - Validaciones en tiempo real con react-hook-form
 * - Manejo robusto de errores de API
 * - Toasts centralizados para feedback
 * - Diseño responsive y accesible
 * - Logout automático en errores 401
 *
 * @component
 * @example
 * // Uso básico (protegido por router)
 * <Route path="/login" element={<LoginPage />} />
 *
 *
 */

export default function LoginPage() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Configuración de react-hook-form con validaciones
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    ...defaultFormConfig,
    defaultValues: {
      email: '',
      password: '',
    }
  });
  /**
     * Maneja el envío del formulario de login
     *
     * @param {Object} data - Datos del formulario
     * @param {string} data.email - Email del usuario
     * @param {string} data.password - Contraseña del usuario
     * @returns {Promise<void>}
     */
  const onSubmit = async (data) => {
    setIsLoading(true);
    const loadingToast = showLoading('Iniciando sesión...');

    try {
      // 1. Validaciones adicionales del lado cliente
      if (!data.email.trim()) {
        setError('email', {
          type: 'manual',
          message: 'El email no puede estar vacío'
        });
        return;
      }

      if (!data.password.trim()) {
        setError('password', {
          type: 'manual',
          message: 'La contraseña no puede estar vacía'
        });
        return;
      }

      // 2. Llamar a la API de autenticación
      const response = await apiLogin({
        email: data.email,
        password: data.password,
      });

      // 3. Validar que la respuesta tenga la estructura esperada
      if (!response.token || !response.sesionData) {
        throw new Error('Respuesta inválida del servidor');
      }

      // 4. Guardar en el store (incluye toast de éxito)
      loginStore(response.token, response.sesionData);

      // 5. Actualizar toast de loading a éxito
      updateToastSuccess(loadingToast, '¡Bienvenido de vuelta!');

      // 6. Navegar al dashboard
      navigate('/myportal');

    } catch (error) {
      console.error('❌ Error en login:', error);

      // Manejo específico de errores de login
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            // Datos inválidos - mostrar errores específicos en los campos
            if (data.errors && Array.isArray(data.errors)) {
              data.errors.forEach(err => {
                if (err.param === 'email') {
                  setError('email', { type: 'manual', message: err.msg });
                } else if (err.param === 'password') {
                  setError('password', { type: 'manual', message: err.msg });
                }
              });
            } else {
              updateToastError(loadingToast, 'Por favor, revisa los datos ingresados');
            }
            break;

          case 401:
            // Credenciales incorrectas
            updateToastError(loadingToast, 'Email o contraseña incorrectos');
            // Limpiar campos sensibles
            setError('password', {
              type: 'manual',
              message: 'Credenciales incorrectas'
            });
            break;

          case 429:
            // Demasiadas tentativas
            updateToastError(loadingToast, 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo');
            break;

          default:
            // Error genérico
            const errorMessage = data?.message || 'Error al iniciar sesión. Intenta de nuevo';
            updateToastError(loadingToast, errorMessage);
        }
      } else {
        // Error de red o timeout
        updateToastError(loadingToast, 'Error de conexión. Verifica tu internet y vuelve a intentar');
      }

    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el evento Enter en los campos de input
    *
   * @param { KeyboardEvent } event - Evento del teclado
    */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen flex bg-light-background">
      {/* LEFT SIDE - Formulario de login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        {/* Logo corporativo */}
        <div className="mb-8">
          <img
            src={logo}
            alt="CoHispania Logo"
            className="h-24 w-auto"
          />
        </div>

        {/* Card contenedora del formulario */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-stroke shadow-sm animate-fadeIn">
          {/* Título y subtítulo */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-cohispania-blue">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-300">
              Ingresa tus credenciales para acceder a la plataforma
            </p>
          </div>

          {/* Formulario de autenticación */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Campo de email */}
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="tu.email@cohispania.com"
              register={register}
              validation={{
                ...emailValidation,
                // Validación adicional para dominio corporativo (opcional futuro)
                // pattern: {
                //   value: /^[A-Z0-9._%+-]+@cohispania\.com$/i,
                //   message: 'Debe usar tu email corporativo (@cohispania.com)'
                // }
              }}
              errors={errors}
              disabled={isLoading || isSubmitting}
              required
              autoFocus
              autoComplete="email"
              onKeyPress={handleKeyPress}
            />

            {/* Campo de contraseña */}
            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="········"
              register={register}
              validation={{
                required: {
                  value: true,
                  message: 'La contraseña es obligatoria'
                },
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                },
                maxLength: {
                  value: 50,
                  message: 'La contraseña es demasiado larga'
                }
              }}
              errors={errors}
              disabled={isLoading || isSubmitting}
              required
              autoComplete="current-password"
              onKeyPress={handleKeyPress}
            />

            {/* Botón de envío */}
            <Button
              type="submit"
              variant="primary"
              size="medium"
              fullWidth
              loading={isLoading || isSubmitting}
              disabled={isLoading || isSubmitting}
              className='cursor-pointer'
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
            {/* Enlaces adicionales (futuro) */}
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-gray-300 hover:text-cohispania-blue transition-colors cursor-pointer"
                disabled
                title="Funcionalidad próximamente disponible"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        {/* Footer informativo */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-300">
            Portal del Empleado CoHispania
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Imagen promocional */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Imagen de fondo */}
        <img
          src={loginImage}
          alt="CoHispania workspace"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay con gradiente corporativo */}
        <div className="absolute inset-0 bg-linear-to-br from-cohispania-blue/90 via-cohispania-blue/85 to-cohispania-orange/12" />"

        {/* Texto promocional */}
        <div className="relative z-10 flex items-center justify-center px-16 py-16">
          <div className="max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              La plataforma de CoHispania para reservar tus vacaciones de manera ágil y sencilla
            </h2>
            <p className="text-white/80 text-lg">
              Solicita, gestiona y consulta el estado de tus vacaciones desde un solo lugar
            </p>
          </div>
        </div>

        {/* Círculos decorativos */}
        <div className="absolute top-20 right-20 w-48 h-48 rounded-full blur-3xl opacity-15 bg-cohispania-orange animate-pulse" />
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10 bg-cohispania-orange animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div >
  );
}
