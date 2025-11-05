import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAdminStore from "../../stores/useAdminStore";
import { toast } from "react-hot-toast";
import EmployeeForm from "../../components/form/EmployeeForm";
import * as userApi from "../../services/userApi";


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
        toast.error("Error al cargar el empleado");
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
      await updateUser(id, formData);
      toast.success("Empleado actualizado correctamente ✅");
      navigate(`/employees/${id}`);
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      toast.error("Error al actualizar el empleado 😞");
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
          <button
            onClick={() => navigate("/employees")}
            className="mt-4 px-4 py-2 bg-cohispania-blue text-white rounded-lg hover:opacity-90"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <button
          onClick={() => navigate(`/employees/${id}`)}
          className="text-cohispania-blue hover:underline mb-4 flex items-center gap-2"
        >
          ← Volver a detalles
        </button>
        <h1 className="text-3xl font-bold text-cohispania-blue">
          Editar Empleado
        </h1>
        <p className="text-sm text-gray-300 mt-2">
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
