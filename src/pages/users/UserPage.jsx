import { useEffect } from 'react';
import VacationRequestCalendar from '../../components/vacation/VacationRequestCalendar';
import VacationSummaryCards from '../../components/vacation/VacationSummaryCard';
import useVacationStore from '../../stores/useVacationStore';

export default function UserPage() {

  const fetchMyRequests = useVacationStore((state) => state.fetchMyRequests);
  useEffect(() => {
    fetchMyRequests();
  }, []); 
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cohispania-blue">Mi Portal</h1>
        <p className="text-gray-600 mt-2">Bienvenido al Portal del Empleado</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          <VacationRequestCalendar />
        </div>
        <div>
          <VacationSummaryCards />
        </div>
      </div>
    </div>
  );
}
