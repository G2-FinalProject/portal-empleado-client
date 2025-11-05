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

  // 📡 Cargar datos iniciales (roles, departamentos, localizaciones)
  useEffect(() => {
    fetchRoles();
    fetchDepartments();
    fetchLocations();
  }, [fetchRoles, fetchDepartments, fetchLocations]);

  // 🧩 Manejar el envío del formulario
  const handleCreateUser = async (data) => {
    try {
      await createUser(data);
      toast.success("Empleado creado correctamente 🎉");
      navigate("/employees"); // Redirige al listado tras éxito
    } catch (error) {
      toast.error("Error al crear empleado 😞");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 flex justify-center">
      <div className="max-w-5xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-cohispania-blue mb-4">
          Alta de Nuevo Empleado
        </h1>
        <EmployeeForm
          roles={roles}
          departments={departments}
          locations={locations}
          onSubmit={handleCreateUser}
        />
      </div>
    </div>
  );
}
