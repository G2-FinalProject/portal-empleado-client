import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";

/**
 * 🎯 EmployeeForm - Alta de nuevo empleado
 * Igual al Figma (sin calendario, botones azul y gris)
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
      available_days: 23,
    },
  });

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
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
      {/* 🧾 Formulario de empleado */}
      <Card>
        <h2 className="text-xl font-semibold text-cohispania-blue mb-2">
          Información del Empleado
        </h2>
        <p className="text-sm text-gray-300 mb-6">
          Completa los datos del nuevo empleado
        </p>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Nombre */}
          <Input
            label="Nombre"
            name="first_name"
            placeholder="Juan"
            register={register}
            validation={{ required: "El nombre es obligatorio" }}
            errors={errors}
            required
          />

          {/* Apellidos */}
          <Input
            label="Apellidos"
            name="last_name"
            placeholder="García López"
            register={register}
            validation={{ required: "Los apellidos son obligatorios" }}
            errors={errors}
            required
          />

          {/* Email */}
          <div className="md:col-span-2">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="juan.garcia@cohispania.com"
              register={register}
              validation={{
                required: "El email es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "El email no es válido",
                },
              }}
              errors={errors}
              required
            />
          </div>

          {/* Contraseña */}
          <div className="md:col-span-2">
            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="********"
              register={register}
              validation={{
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 8,
                  message: "Debe tener al menos 8 caracteres",
                },
              }}
              errors={errors}
              required
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Rol <span className="text-red-400">*</span>
            </label>
            <select
              {...register("role_id", { required: "Selecciona un rol" })}
              className="w-full px-4 py-3 rounded-lg bg-light-background text-cohispania-blue border border-gray-stroke focus:ring-2 focus:ring-cohispania-orange focus:border-cohispania-orange outline-none transition"
            >
              <option value="">Selecciona un rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p className="mt-2 text-sm text-red-400">
                {errors.role_id.message}
              </p>
            )}
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Departamento <span className="text-red-400">*</span>
            </label>
            <select
              {...register("department_id", {
                required: "Selecciona un departamento",
              })}
              className="w-full px-4 py-3 rounded-lg bg-light-background text-cohispania-blue border border-gray-stroke focus:ring-2 focus:ring-cohispania-orange focus:border-cohispania-orange outline-none transition"
            >
              <option value="">Selecciona departamento</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <p className="mt-2 text-sm text-red-400">
                {errors.department_id.message}
              </p>
            )}
          </div>

          {/* Población */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Población <span className="text-red-400">*</span>
            </label>
            <select
              {...register("location_id", {
                required: "Selecciona una localización",
              })}
              className="w-full px-4 py-3 rounded-lg bg-light-background text-cohispania-blue border border-gray-stroke focus:ring-2 focus:ring-cohispania-orange focus:border-cohispania-orange outline-none transition"
            >
              <option value="">Selecciona una localización</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.location_name}
                </option>
              ))}
            </select>
            {errors.location_id && (
              <p className="mt-2 text-sm text-red-400">
                {errors.location_id.message}
              </p>
            )}
          </div>

          {/* Días disponibles */}
          <div className="md:col-span-2">
            <Input
              label="Días de Vacaciones Disponibles"
              name="available_days"
              type="number"
              placeholder="23"
              register={register}
              validation={{
                required: true,
                min: 0,
                valueAsNumber: true,
              }}
              errors={errors}
            />
          </div>

          {/* Botones */}
          <div className="col-span-2 flex justify-end gap-4 mt-4">
            <Button
              type="button"
              variant="ghost"
              className="border border-gray-stroke text-cohispania-blue bg-white hover:bg-gray-100"
              onClick={() => reset()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="bg-cohispania-blue text-white hover:opacity-90"
            >
              Guardar Empleado
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
