import useVacationStore from '../../stores/useVacationStore';


const VacationSummaryCards = () => {
  // Obtenemos los datos del store de Zustand
  const { stats, loading } = useVacationStore();

  // Si está cargando, mostramos el skeleton
  if (loading) {
    return <VacationSummaryCardsSkeleton />;
  }

  // Porcentaje usado para la barra de progreso
  const percentageUsed = stats.total > 0 
    ? (stats.used / stats.total) * 100 
    : 0;

  return (
     <div className="bg-white rounded-lg border border-gray-stroke p-4 w-full max-w-xs">
      {/* Título de la card - más pequeño */}
      <h2 className="text-lg font-bold text-cohispania-blue mb-4">
        Balance de Vacaciones
      </h2>

      {/* Lista de estadísticas - espaciado reducido */}
      <div className="space-y-3">

        {/* Disponible */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Disponible</span>
          <span className="font-extrabold text-lg text-cohispania-orange">{stats.available}</span>
        </div>

        {/* Usado */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Usado</span>
          <span className="font-extrabold text-lg text-cohispania-blue">{stats.used}</span>
        </div>

        {/* Pendiente */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Pendiente</span>
          <span className="font-extrabold text-lg text-cohispania-blue">{stats.pending}</span>
        </div>
      </div>

      {/* Separador - más pequeño */}
      <div className="border-t border-gray-stroke my-4"></div>

      {/* Sección de progreso anual - más compacta */}
      <div className="bg-light-background rounded-lg p-3">
        <p className="text-sm font-bold text-gray-700 mb-2">
          Progreso Anual
        </p>

        {/* Barra de progreso - más pequeña */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
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
 * Ahora con 3 filas en lugar de 4
 */
const VacationSummaryCardsSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full max-w-sm animate-pulse">
      {/* Título skeleton - más pequeño */}
      <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>

      {/* Lista de estadísticas skeleton - 3 filas más compactas */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-5 bg-gray-200 rounded w-10"></div>
          </div>
        ))}
      </div>

      {/* Separador skeleton - más pequeño */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Progreso anual skeleton - más compacto */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
        <div className="w-full bg-gray-200 rounded-full h-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32 mt-2"></div>
      </div>
    </div>
  );
};

export default VacationSummaryCards;
