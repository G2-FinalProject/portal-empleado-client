import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdminStore from "../../stores/useAdminStore";
import { toast } from "react-hot-toast";
import EmployeeForm from "../../components/form/EmployeeForm";

export default function CreateEmployeePage() {
  const navigate = useNavigate();

  const {
    roles,
    departments,
    locations,
    fetchRoles,
    fetchDepartments,
    fetchLocations,
    createUser,
  } = useAdminStore();

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
    fetchLocations();
  }, [fetchRoles, fetchDepartments, fetchLocations]);

  const handleCreateUser = async (data) => {
    try {
      await createUser(data);
      toast.success("Empleado creado correctamente");
      navigate("/employees");
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.[0]?.msg ||
        error.response?.data?.message ||
        "Error al crear el empleado";
      toast.error(errorMessage);

      // ✅ solo muestra en consola si estás en modo desarrollo
      if (import.meta.env.MODE === "development") {
        console.warn("Error al crear empleado:", error);
      }
    }
  };

  const handleCancel = () => {
    navigate("/employees");
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={handleCancel}
          className="text-cohispania-blue hover:underline mb-4 flex items-center gap-2 cursor-pointer"
        >
          ← Volver al listado
        </button>
        <h1 className="text-3xl font-bold text-cohispania-blue">
          Alta de Nuevo Empleado
        </h1>
        <p className="text-sm text-gray-300 mt-2">
          Completa los datos para registrar un nuevo empleado en el sistema.
        </p>
      </div>

      <EmployeeForm
        roles={roles}
        departments={departments}
        locations={locations}
        onSubmit={handleCreateUser}
        onCancel={handleCancel}
        isEditMode={false}
      />
    </div>
  );
}
