import { useEffect } from 'react';
import useAdminStore from '../../stores/useAdminStore';

export default function LocationListPage() {
  const { locations, fetchLocations, loading, error } = useAdminStore();

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  console.log('locations:', locations);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Festivos Poblaciones</h1>
      {loading?.locations && <p className="mt-4">Cargando poblaciones…</p>}
      {error && <p className="mt-4 text-red-600">Error: {error}</p>}
      {!loading?.locations && !error && (
        <p className="mt-4 text-slate-500">Abre la consola para ver los datos.</p>
      )}
    </main>
  );
}
