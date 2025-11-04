import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

/**
 * 🎯 EmployeeForm
 * 
 * Formulario para crear un nuevo empleado.
 * 
 * Props esperadas:
 * - roles: lista de roles (array)
 * - departments: lista de departamentos (array)
 * - locations: lista de localizaciones (array)
 * - onSubmit: función que se ejecuta al crear empleado
 */

export default function EmployeeForm({
  roles = [],
  departments = [],
  locations = [],
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      available_days: 23, // Valor por defecto
    },
  });

  /**
   * ✅ Maneja el envío del formulario
   */
  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      toast.success("Empleado creado correctamente 🎉");
      reset();
    } catch (error) {
      console.error("Error al crear empleado:", error);
      toast.error("Hubo un problema al crear el empleado");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre *
        </label>
        <input
          type="text"
          {...register("first_name", { required: "El nombre es obligatorio" })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Juan"
        />
        {errors.first_name && (
          <p className="text-red-500 text-sm mt-1">
            {errors.first_name.message}
          </p>
        )}
      </div>

      {/* Apellidos */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Apellidos *
        </label>
        <input
          type="text"
          {...register("last_name", { required: "Los apellidos son obligatorios" })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="García López"
        />
        {errors.last_name && (
          <p className="text-red-500 text-sm mt-1">
            {errors.last_name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email *</label>
        <input
          type="email"
          {...register("email", {
            required: "El email es obligatorio",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "El email no es válido",
            },
          })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="juan.garcia@empresa.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contraseña *
        </label>
        <input
          type="password"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: {
              value: 8,
              message: "La contraseña debe tener al menos 8 caracteres",
            },
          })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="********"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Rol */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Rol *</label>
        <select
          {...register("role_id", { required: "Selecciona un rol" })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Selecciona un rol</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        {errors.role_id && (
          <p className="text-red-500 text-sm mt-1">{errors.role_id.message}</p>
        )}
      </div>

      {/* Departamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Departamento *
        </label>
        <select
          {...register("department_id", { required: "Selecciona un departamento" })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Selecciona departamento</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.department_name}
            </option>
          ))}
        </select>
        {errors.department_id && (
          <p className="text-red-500 text-sm mt-1">{errors.department_id.message}</p>
        )}
      </div>

      {/* Localización */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Población *
        </label>
        <select
          {...register("location_id", { required: "Selecciona una localización" })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">Selecciona una localización</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.location_name}
            </option>
          ))}
        </select>
        {errors.location_id && (
          <p className="text-red-500 text-sm mt-1">{errors.location_id.message}</p>
        )}
      </div>

      {/* Días disponibles */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Días de Vacaciones Disponibles
        </label>
        <input
          type="number"
          {...register("available_days", {
            required: true,
            min: 0,
            valueAsNumber: true,
          })}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="23"
        />
      </div>

      {/* Botones */}
      <div className="col-span-2 flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Crear Empleado
        </button>
      </div>
    </form>
  );
}
