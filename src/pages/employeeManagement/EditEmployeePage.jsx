import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useAdminStore from "../../stores/useAdminStore";
import { showSuccess, showError } from "../../utils/notifications";
import EmployeeForm from "../../components/form/EmployeeForm";
import * as userApi from "../../services/userApi";
import { Button } from "../../components/ui";


export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    roles,
    departments,
    locations,
    fetchRoles,
    fetchDepartments,
    fetchLocations,
    updateUser,
  } = useAdminStore();

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
    fetchLocations();
  }, [fetchRoles, fetchDepartments, fetchLocations]);

  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await userApi.getById(id);
        const employee = response.data || response;
        
        setEmployeeData(employee);
      } catch (err) {
        console.error("Error al cargar empleado:", err);
        setError("No se pudo cargar la información del empleado");
        showError("Error al cargar el empleado");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEmployeeData();
    }
  }, [id]);

  /**
   * Maneja la actualización del empleado
   * @param {Object} formData - Datos del formulario
   */

    const handleUpdateEmployee = async (formData) => {
    try {
      const { password, ...dataWithoutPassword } = formData;
      
      const dataToSend = {
        first_name: dataWithoutPassword.first_name,
        last_name: dataWithoutPassword.last_name,
        email: dataWithoutPassword.email,
        role_id: Number(dataWithoutPassword.role_id),
        department_id: Number(dataWithoutPassword.department_id),
        location_id: Number(dataWithoutPassword.location_id),
        available_days: Number(dataWithoutPassword.available_days),
      };
      await updateUser(id, dataToSend);
      showSuccess("Empleado actualizado correctamente");
      navigate(`/employees/${id}`);
      
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      console.log("Respuesta del backend:", error.response?.data);

      const errorMessage = error.response?.data?.errors?.[0]?.msg 
        || error.response?.data?.message
        || "Error al actualizar el empleado";
      
      showError(errorMessage);
      throw error;
    }
  };

  const handleCancel = () => {
    navigate(`/employees/${id}`);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cohispania-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-400 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-medium">{error}</p>
          <Button
            variant="ghost"
            onClick={() => navigate("/employees")}
            className="mt-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/employees/${id}`)}
          className="mb-4 flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a detalles
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-cohispania-blue">
          Editar Empleado
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-2">
          Modifica la información de{" "}
          <span className="font-semibold text-cohispania-blue">
            {employeeData?.first_name} {employeeData?.last_name}
          </span>
        </p>
      </div>

      {/* Formulario */}
      <EmployeeForm
        roles={roles}
        departments={departments}
        locations={locations}
        onSubmit={handleUpdateEmployee}
        onCancel={handleCancel}
        initialData={employeeData}
        isEditMode={true}
      />
    </div>
  );
}
