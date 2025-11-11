import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useAdminStore from "../../stores/useAdminStore";
import { showSuccess, showError } from "../../utils/notifications";
import EmployeeForm from "../../components/form/EmployeeForm";
import { Button } from "../../components/ui";

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
      showSuccess("Empleado creado correctamente");
      navigate("/employees");
    } catch (error) {
      const errorMessage =
        error.response?.data?.errors?.[0]?.msg ||
        error.response?.data?.message ||
        "Error al crear el empleado";
      showError(errorMessage);

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
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-4 flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al listado
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-cohispania-blue">
          Alta de Nuevo Empleado
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-2">
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
