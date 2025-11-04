import useVacationStore from "../../stores/useVacationStore";

const VacationSummaryCards = () => {
  const { stats, loading } = useVacationStore();
  if (loading) {
    return <VacationSummaryCardsSkeleton />;
  }
  // Porcentaje usado para la barra de progreso
  const percentageUsed = stats.total > 0 ? (stats.used / stats.total) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-stroke p-4 sm:p-6 w-full h-fit">
      {/* Título de la card */}
      <h2 className="text-xl sm:text-2xl font-bold text-cohispania-blue mb-4">
        Balance de Vacaciones
      </h2>

      {/* Lista de estadísticas */}
      <div className="space-y-3">
        {/* Total Asignado */}
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">
            Total Asignados
          </span>
          <span className="font-extrabold text-xl text-cohispania-blue">
            {stats.total}
          </span>
        </div>

        {/* Disponible */}
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">Disponibles</span>
          <span className="font-extrabold text-xl text-cohispania-orange">
            {stats.available}
          </span>
        </div>

        {/* Usado */}
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">Usados</span>
          <span className="font-extrabold text-xl text-cohispania-blue">
            {stats.used}
          </span>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-stroke my-4"></div>

      {/* Sección de progreso anual */}
      <div className="bg-light-background rounded-lg p-3">
        <p className="text-sm font-bold text-gray-700 mb-2">Progreso Anual</p>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-cohispania-orange transition-all duration-500 ease-in-out"
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        {/* Texto informativo debajo de la barra */}
        <p className="text-xs text-gray-500 mt-2">
          {stats.used} de {stats.total} días utilizados ({Math.round(percentageUsed)}%)
        </p>
      </div>
    </div>
  );
};

const VacationSummaryCardsSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-stroke p-4 sm:p-6 w-full h-fit animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      <div className="bg-gray-50 rounded-lg p-3">
        <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
        <div className="w-full bg-gray-200 rounded-full h-3"></div>
        <div className="h-3 bg-gray-200 rounded w-32 mt-2"></div>
      </div>
    </div>
  );
};

export default VacationSummaryCards;


