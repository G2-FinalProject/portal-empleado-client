import { useForm } from "react-hook-form";
import React, { useEffect } from "react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";

/**
 * 🎯 EmployeeForm - Alta de nuevo empleado
 * Bordes finos y discretos, al estilo del resto de la interfaz.
 */
export default function EmployeeForm({
  roles = [],
  departments = [],
  locations = [],
  onSubmit,
  initialData = null,
  isEditMode = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role_id: "",
      department_id: "",
      location_id: "",
      available_days: "",
    },
  });

  //Pre-rellenar formulario en modo edición
  useEffect(() => {
    if (initialData && isEditMode) {
      setValue("first_name", initialData.first_name || "");
      setValue("last_name", initialData.last_name || "");
      setValue("email", initialData.email || "");
      setValue("role_id", initialData.role_id || "");
      setValue("department_id", initialData.department_id || "");
      setValue("location_id", initialData.location_id || "");
      setValue("available_days", initialData.available_days || "");
    }
  }, [initialData, isEditMode, setValue]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      if (!isEditMode) {
        reset();
      }
    } catch (error) {
      console.error("Error al procesar el formulario de empleado:", error);
      throw error;
    }
  };

  // 🎨 Clase base para inputs/selects: borde fino y elegante
  const inputBase =
    "w-full px-4 py-3 rounded-md bg-white text-cohispania-blue border border-gray-300 focus:border-[var(--color-cohispania-orange)] focus:ring-0 outline-none transition-all duration-150";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
      <Card>
        <h2 className="text-xl font-semibold text-cohispania-blue mb-2">
          Información del Empleado
        </h2>
        <p className="text-sm text-gray-400 mb-6">
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
            placeholder="Introduce el nombre del empleado"
            register={register}
            validation={{ required: "El nombre es obligatorio" }}
            errors={errors}
            required
          />

          {/* Apellidos */}
          <Input
            label="Apellidos"
            name="last_name"
            placeholder="Introduce los apellidos del empleado"
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
              placeholder="Introduce el correo corporativo"
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
              placeholder="Crea una contraseña segura"
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
            <label 
            htmlFor="role_id"
            className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Rol <span className="text-red-400">*</span>
            </label>
            <select
            id="role_id"
              {...register("role_id", { required: "Selecciona un rol" })}
              className={inputBase}
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
            <label 
            htmlFor="department_id"
            className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Departamento <span className="text-red-400">*</span>
            </label>
            <select
            id="department_id"
              {...register("department_id", {
                required: "Selecciona un departamento",
              })}
              className={inputBase}
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
            <label 
            htmlFor="location_id"
            className="block text-sm font-semibold mb-2 text-cohispania-blue">
              Población <span className="text-red-400">*</span>
            </label>
            <select
            id="location_id"
              {...register("location_id", {
                required: "Selecciona una localización",
              })}
              className={inputBase}
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
              placeholder="Introduce los días disponibles"
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
              className="border border-gray-300 text-cohispania-blue bg-white hover:bg-gray-100"
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
