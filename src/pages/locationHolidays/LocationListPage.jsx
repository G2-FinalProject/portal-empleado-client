import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAdminStore from '../../stores/useAdminStore';

export default function LocationListPage() {
  const navigate = useNavigate();
  const { locations, fetchLocations, loading, error } = useAdminStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations || [];
    return (locations || []).filter(l =>
      (l.location_name || '').toLowerCase().includes(q)
    );
  }, [locations, query]);

  return (
    <main className="p-6">
      {/*Header*/}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Festivos Poblaciones</h1>
          <p className="text-sm text-slate-500">Gestiona las poblaciones configuradas</p>
        </div>

 <Link
          to="/locations/create"
          className="rounded-xl px-4 py-2 shadow-sm border bg-white hover:bg-slate-50"
        >
          + Nueva Población
        </Link>
      </div>

      {/* Search */}
      <div className="mt-6">
        <input
          aria-label="Buscar población"
          placeholder="Buscar por nombre"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-xl rounded-xl border px-3 py-2"
        />
      </div>

      {/* States */}
      {loading?.locations && <p className="mt-6">Cargando poblaciones…</p>}
      {error && <p className="mt-6 text-red-600">Error: {error}</p>}
      {!loading?.locations && !error && filtered.length === 0 && (
        <p className="mt-6 text-slate-500">
          {query ? `No se encontraron poblaciones con “${query}”.` : 'No hay poblaciones todavía.'}
        </p>
      )}
      {/* List */}
      {!loading?.locations && !error && filtered.length > 0 && (
        <ul className="mt-6 divide-y rounded-xl border bg-white">
          {filtered.map((loc) => (
            <li key={loc.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium">{loc.location_name}</span>
              <button
                aria-label={`Ver ${loc.location_name}`}
                onClick={() => navigate(`/locations/${loc.id}`)}
                className="rounded-lg px-3 py-1.5 border hover:bg-slate-50"
              >
                Ver
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
