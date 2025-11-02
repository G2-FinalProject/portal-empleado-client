import useVacationStore from '../../stores/useVacationStore';


const VacationSummaryCards = () => {
  // Obtenemos los datos del store de Zustand
  const { stats, loading } = useVacationStore();

  // Si está cargando, mostramos el skeleton
  if (loading) {
    return <VacationSummaryCardsSkeleton />;
  }

  // Calculamos el porcentaje usado para la barra de progreso
  const percentageUsed = stats.total > 0 
    ? (stats.used / stats.total) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-stroke p-6">
      {/* Título de la card */}
      <h2 className="text-xl font-bold text-cohispania-blue mb-6">
        Balance de Vacaciones
      </h2>

      {/* Lista de estadísticas */}
      <div className="space-y-4">
        
        {/* Total asignado */}
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">Total asignado</span>
          <span className="font-extrabold text-xl text-cohispania-blue">{stats.total}</span>
        </div>

        {/* Disponible - */}
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">Disponible</span>
          <span className="font-extrabold text-xl text-cohispania-orange">{stats.available}</span>
        </div>

        {/* Usado */}
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">Usado</span>
          <span className="font-extrabold text-xl text-cohispania-blue">{stats.used}</span>
        </div>

        {/* Pendiente - */}
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-600">Pendiente</span>
          <span className="font-extrabold text-xl text-cohispania-blue">{stats.pending}</span>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-stroke my-6"></div>

      {/* Sección de progreso anual */}
      <div className="bg-light-background rounded-lg p-4">
        <p className="text-base font-bold text-gray-700 mb-3">
          Progreso Anual
        </p>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-cohispania-orange transition-all duration-300 ease-in-out"
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        {/* Texto informativo debajo de la barra */}
        <p className="text-xs text-gray-500 mt-2">
          {stats.used} de {stats.total} días utilizados
        </p>
      </div>
    </div>
  );
};

/**
 * Skeleton que se muestra mientras cargan los datos
 * Imita la estructura del componente real
 */
const VacationSummaryCardsSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      {/* Título skeleton */}
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>

      {/* Lista de estadísticas skeleton */}
      <div className="space-y-4">
        {/* Creamos 4 filas skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>

      {/* Separador skeleton */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Progreso anual skeleton */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
        <div className="w-full bg-gray-200 rounded-full h-3"></div>
        <div className="h-3 bg-gray-200 rounded w-40 mt-2"></div>
      </div>
    </div>
  );
};

export default VacationSummaryCards;
