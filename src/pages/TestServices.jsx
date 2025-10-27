import { useState } from 'react';
import * as authApi from '../services/authApi.js';
import * as usersApi from '../services/userApi.js';
import * as vacationsApi from '../services/vacationApi.js';
import * as departmentsApi from '../services/departmentsApi.js';
import * as holidaysApi from '../services/holidaysApi.js';

function TestServices() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (testFunction, ...args) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await testFunction(...args);
      setResult(response);
      console.log('✅ Success:', response);
    } catch (err) {
      setError(err.message || 'Error desconocido');
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🧪 Test de Servicios API</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
        <strong>Estado:</strong> {loading ? '⏳ Cargando...' : '✅ Listo'}
      </div>

      {/* AUTH API */}
      <section style={{ marginBottom: '30px' }}>
        <h2>🔐 Auth API</h2>
        <button onClick={() => handleTest(authApi.login, { email: 'test@example.com', password: '123456' })}>
          Test Login
        </button>
        <button onClick={() => handleTest(authApi.register, { email: 'nuevo@example.com', password: '123456', name: 'Nuevo Usuario' })}>
          Test Register
        </button>
        <button onClick={() => handleTest(authApi.getProfile)}>
          Test Get Profile
        </button>
        <button onClick={() => { authApi.logout(); alert('Logout ejecutado'); }}>
          Test Logout
        </button>
      </section>

      {/* USERS API */}
      <section style={{ marginBottom: '30px' }}>
        <h2>👥 Users API</h2>
        <button onClick={() => handleTest(usersApi.getAll)}>
          Test Get All Users
        </button>
        <button onClick={() => handleTest(usersApi.getById, 1)}>
          Test Get User by ID (1)
        </button>
        <button onClick={() => handleTest(usersApi.create, { email: 'user@example.com', password: '123456', name: 'Test User' })}>
          Test Create User
        </button>
        <button onClick={() => handleTest(usersApi.update, 1, { name: 'Usuario Actualizado' })}>
          Test Update User (1)
        </button>
        <button onClick={() => handleTest(usersApi.deleteUser, 1)}>
          Test Delete User (1)
        </button>
      </section>

      {/* VACATIONS API */}
      <section style={{ marginBottom: '30px' }}>
        <h2>🏖️ Vacations API</h2>
        <button onClick={() => handleTest(vacationsApi.create, { startDate: '2025-11-01', endDate: '2025-11-10' })}>
          Test Create Request
        </button>
        <button onClick={() => handleTest(vacationsApi.getMyRequests)}>
          Test Get My Requests
        </button>
        <button onClick={() => handleTest(vacationsApi.getAll)}>
          Test Get All Requests
        </button>
        <button onClick={() => handleTest(vacationsApi.approve, 1)}>
          Test Approve Request (1)
        </button>
        <button onClick={() => handleTest(vacationsApi.reject, 1, { reason: 'No disponible' })}>
          Test Reject Request (1)
        </button>
      </section>

      {/* DEPARTMENTS API */}
      <section style={{ marginBottom: '30px' }}>
        <h2>🏢 Departments API</h2>
        <button onClick={() => handleTest(departmentsApi.getAll)}>
          Test Get All Departments
        </button>
        <button onClick={() => handleTest(departmentsApi.create, { name: 'IT', description: 'Tecnología' })}>
          Test Create Department
        </button>
        <button onClick={() => handleTest(departmentsApi.update, 1, { name: 'IT Actualizado' })}>
          Test Update Department (1)
        </button>
        <button onClick={() => handleTest(departmentsApi.deleteDepartment, 1)}>
          Test Delete Department (1)
        </button>
      </section>

      {/* HOLIDAYS API */}
      <section style={{ marginBottom: '30px' }}>
        <h2>🎉 Holidays API</h2>
        <button onClick={() => handleTest(holidaysApi.getAll)}>
          Test Get All Holidays
        </button>
        <button onClick={() => handleTest(holidaysApi.getMyHolidays)}>
          Test Get My Holidays
        </button>
        <button onClick={() => handleTest(holidaysApi.create, { name: 'Navidad', date: '2025-12-25' })}>
          Test Create Holiday
        </button>
        <button onClick={() => handleTest(holidaysApi.update, 1, { name: 'Navidad Actualizada' })}>
          Test Update Holiday (1)
        </button>
        <button onClick={() => handleTest(holidaysApi.deleteHoliday, 1)}>
          Test Delete Holiday (1)
        </button>
      </section>

      {/* RESULTS */}
      {error && (
        <div style={{ padding: '15px', background: '#ffebee', borderRadius: '5px', marginTop: '20px' }}>
          <h3 style={{ color: '#c62828', margin: '0 0 10px 0' }}>❌ Error:</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {result && (
        <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '5px', marginTop: '20px' }}>
          <h3 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>✅ Resultado:</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <style>{`
        button {
          margin: 5px;
          padding: 10px 15px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }
        button:hover {
          background: #1565c0;
        }
        button:active {
          background: #0d47a1;
        }
      `}</style>
    </div>
  );
}

export default TestServices;