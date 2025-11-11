
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Pencil, ArrowLeft } from "lucide-react";
import toast from "../../services/toast";
import * as userApi from "../../services/userApi";
import * as vacationApi from "../../services/vacationApi";
import { Card, Button } from "../../components/ui";


const getRoleDisplayName = (roleName) => {
  const roleTranslations = {
    employee: "Empleado",
    manager: "Responsable",
    admin: "Administrador",
  };
  return roleTranslations[roleName?.toLowerCase()] || roleName;
};


export default function DetailEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams();


  const [employeeData, setEmployeeData] = useState(null);
  const [vacationStats, setVacationStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await userApi.getById(id);
        const employee = response.data || response;
        setEmployeeData(employee);


        try {
          const stats = await vacationApi.getVacationSummary(id);
          setVacationStats(stats);
        } catch (statsError) {
          console.warn("No se pudo cargar el resumen de vacaciones:", statsError);
        }

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


  const availableDays = vacationStats?.remaining_days ?? employeeData?.available_days ?? 0;
  const usedDays = vacationStats?.used_days ?? 0;
  const totalDays = availableDays + usedDays;


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cohispania-blue" />
      </div>
    );
  }

  if (error || !employeeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-400 rounded-lg p-6 max-w-md">
          <p className="text-red-600 font-medium">
            {error || "Empleado no encontrado"}
          </p>
          <button
            onClick={() => navigate("/employees")}
            className="mt-4 px-4 py-2 bg-cohispania-blue text-white rounded-lg hover:opacity-90 cursor-pointer"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Botón volver */}
      <button
        onClick={() => navigate("/employees")}
        className="text-cohispania-blue hover:underline mb-4 flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al listado
      </button>

{/* Encabezado */}
<div>
  <h1 className="text-3xl font-bold text-cohispania-blue">
    {employeeData.first_name} {employeeData.last_name}
  </h1>
  <p className="text-sm text-gray-400 mt-1">
    Información del empleado
  </p>
</div>

      {/* Grid de Cards con la información */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📧 Card: Datos Personales */}
        <Card>
          <h2 className="text-lg font-bold text-cohispania-blue mb-4 pb-3 border-b border-gray-stroke">
            Datos Personales
          </h2>

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Nombre</p>
              <p className="text-base font-medium text-cohispania-blue">
                {employeeData.first_name}
              </p>
            </div>

            {/* Apellidos */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Apellidos</p>
              <p className="text-base font-medium text-cohispania-blue">
                {employeeData.last_name}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Correo Electrónico</p>
              <p className="text-base font-medium text-cohispania-blue break-all">
                {employeeData.email}
              </p>
            </div>
          </div>
        </Card>

        {/* 💼 Card: Datos Laborales */}
        <Card>
          <h2 className="text-lg font-bold text-cohispania-blue mb-4 pb-3 border-b border-gray-stroke">
            Datos Laborales
          </h2>

          <div className="space-y-4">
            {/* Rol */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Rol</p>
              <p className="text-base font-medium text-cohispania-blue">
                {getRoleDisplayName(employeeData.role?.role_name)}
              </p>
            </div>

            {/* Departamento */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Departamento</p>
              <p className="text-base font-medium text-cohispania-blue">
                {employeeData.department?.department_name || "Sin asignar"}
              </p>
            </div>

            {/* Población */}
            <div>
              <p className="text-sm text-gray-400 mb-1">Población</p>
              <p className="text-base font-medium text-cohispania-blue">
                {employeeData.location?.location_name || "Sin asignar"}
              </p>
            </div>
          </div>
        </Card>

        {/* Card: Información de Vacaciones*/}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold text-cohispania-blue mb-6 pb-3 border-b border-gray-stroke">
            Información de Vacaciones
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Días Disponibles */}
            <div className="text-center p-6 bg-light-background rounded-lg border border-gray-stroke">
              <p className="text-sm font-semibold text-gray-400 mb-2">
                Días Disponibles
              </p>
              <p className="text-4xl font-bold text-cohispania-blue">
                {availableDays}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Restantes este año
              </p>
            </div>

            {/* Días Usados */}
            <div className="text-center p-6 bg-light-background rounded-lg border border-gray-stroke">
              <p className="text-sm font-semibold text-gray-400 mb-2">
                Días Usados
              </p>
              <p className="text-4xl font-bold text-cohispania-blue">
                {usedDays}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Aprobados este año
              </p>
            </div>

            {/* Días Totales del Año */}
            <div className="text-center p-6 bg-light-background rounded-lg border border-gray-stroke">
              <p className="text-sm font-semibold text-gray-400 mb-2">
                Días Totales (Año)
              </p>
              <p className="text-4xl font-bold text-cohispania-blue">
                {totalDays}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Asignados anualmente
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Botones de acción inferiores */}
<div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 ">
        <Button
          variant="ghost"
          onClick={() => navigate("/employees")}
          className="flex-1 sm:flex-none"
        >
          Volver al listado
        </Button>
        <Link to={`/employees/${id}/edit`} className="flex-1 sm:flex-none">
          <Button variant="secondary" fullWidth className="w-full">
            Editar Empleado
          </Button>
        </Link>
      </div>
    </div>
  );
}
