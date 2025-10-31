import VacationRequestCalendar from '../../components/vacation/VacationRequestCalendar';

export default function UserPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-cohispania-blue">Mi Portal</h1>
      <p className="text-gray-600 mt-2">Bienvenido al Portal del Empleado</p>
      <VacationRequestCalendar/>
    </div>
  );
}
