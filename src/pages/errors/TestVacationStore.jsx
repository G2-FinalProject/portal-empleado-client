import { useEffect } from 'react';
import useVacationStore from '../../stores/useVacationStore';

export default function TestVacationStore() {
  const { 
    myRequests, 
    stats, 
    loading, 
    error,
    fetchMyRequests,
    createRequest,
    clearError
  } = useVacationStore();

  useEffect(() => {
    // Cargar solicitudes al montar
    fetchMyRequests().catch(err => console.error('Error inicial:', err));
  }, []);

  const handleCreateTest = async () => {
    try {
      await createRequest({
        startDate: '2025-11-01',
        endDate: '2025-11-05',
        reason: 'Prueba desde test component'
      });
      alert('Solicitud creada exitosamente!');
    } catch (err) {
      console.error('Error creando:', err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Vacation Store</h1>

      {/* Estado */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Estado del Store:</h2>
        <p>Loading: {loading ? '✅ Sí' : '❌ No'}</p>
        <p>Error: {error || '✅ Ninguno'}</p>
        <p>Solicitudes cargadas: {myRequests.length}</p>
      </div>

      {/* Estadísticas */}
      <div className="bg-blue-50 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Estadísticas:</h2>
        <p>Total: {stats.total} días</p>
        <p>Disponibles: {stats.available} días</p>
        <p>Usados: {stats.used} días</p>
        <p>Pendientes: {stats.pending} días</p>
      </div>

      {/* Botones de prueba */}
      <div className="space-x-4 mb-6">
        <button 
          onClick={() => fetchMyRequests()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          🔄 Recargar Solicitudes
        </button>
        
        <button 
          onClick={handleCreateTest}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          ➕ Crear Solicitud Test
        </button>

        {error && (
          <button 
            onClick={clearError}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            🧹 Limpiar Error
          </button>
        )}
      </div>

      {/* Lista de solicitudes */}
      <div className="bg-white border rounded">
        <h2 className="font-bold p-4 border-b">Mis Solicitudes:</h2>
        
        {loading && (
          <div className="p-4 text-center text-gray-500">Cargando...</div>
        )}
        
        {!loading && myRequests.length === 0 && (
          <div className="p-4 text-center text-gray-500">No hay solicitudes</div>
        )}
        
        {!loading && myRequests.map(req => (
          <div key={req.id} className="p-4 border-b last:border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {req.startDate} → {req.endDate}
                </p>
                <p className="text-sm text-gray-600">
                  {req.requestedDays} días - {req.status}
                </p>
                {req.reason && (
                  <p className="text-sm text-gray-500 mt-1">{req.reason}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                req.status === 'approved' ? 'bg-green-100 text-green-800' :
                req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {req.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}