// src/components/TestAuthStore.jsx

import useAuthStore from '../stores/authStore';

const TestAuthStore = () => {
  const { 
    token, 
    user, 
    login, 
    logout, 
    isAuthenticated,
    isAdmin,
    isManager,
    isEmployee 
  } = useAuthStore();

  // Token JWT falso para pruebas
  // Este token contiene: { id: 123, role: 2, iat: ..., exp: ... }
  const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJyb2xlIjoyLCJpYXQiOjE3MzAwMDAwMDAsImV4cCI6MTczMDEwMDAwMH0.fake";
  
  const fakeSesionData = {
    first_name: "Juan Pérez",
    role_id: 2  // 2 = Manager
  };

  const handleTestLogin = () => {
    console.log("🧪 Probando login...");
    login(fakeToken, fakeSesionData);
  };

  const handleTestLogout = () => {
    console.log("🧪 Probando logout...");
    logout();
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #333', 
      margin: '20px',
      fontFamily: 'monospace'
    }}>
      <h2>🧪 Test de AuthStore</h2>
      
      {/* Botones de prueba */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleTestLogin}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🔐 Simular Login
        </button>
        
        <button 
          onClick={handleTestLogout}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🚪 Simular Logout
        </button>
      </div>

      {/* Estado actual */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px',
        borderRadius: '5px'
      }}>
        <h3>📊 Estado actual del Store:</h3>
        
        <p>
          <strong>¿Autenticado?:</strong> {' '}
          <span style={{ color: isAuthenticated() ? 'green' : 'red' }}>
            {isAuthenticated() ? '✅ SÍ' : '❌ NO'}
          </span>
        </p>
        
        <p>
          <strong>Token:</strong> {' '}
          {token ? `${token.substring(0, 30)}...` : 'null'}
        </p>
        
        <p><strong>Usuario:</strong></p>
        <pre style={{ 
          backgroundColor: '#fff', 
          padding: '10px',
          overflow: 'auto'
        }}>
          {JSON.stringify(user, null, 2)}
        </pre>
        
        <h3>🎭 Roles:</h3>
        <ul>
          <li>Es Admin: {isAdmin() ? '✅ SÍ' : '❌ NO'}</li>
          <li>Es Manager: {isManager() ? '✅ SÍ' : '❌ NO'}</li>
          <li>Es Employee: {isEmployee() ? '✅ SÍ' : '❌ NO'}</li>
        </ul>
      </div>

      {/* LocalStorage */}
      <div style={{ 
        marginTop: '20px',
        backgroundColor: '#fff3cd',
        padding: '15px',
        borderRadius: '5px'
      }}>
        <h3>💾 LocalStorage:</h3>
        <p><strong>Token guardado:</strong></p>
        <pre style={{ 
          backgroundColor: '#fff', 
          padding: '10px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {localStorage.getItem('token') || 'null'}
        </pre>
        
        <p><strong>User guardado:</strong></p>
        <pre style={{ 
          backgroundColor: '#fff', 
          padding: '10px',
          overflow: 'auto'
        }}>
          {localStorage.getItem('user') || 'null'}
        </pre>
      </div>

      <div style={{ 
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#e3f2fd',
        borderRadius: '5px'
      }}>
        <h4>📝 Instrucciones:</h4>
        <ol>
          <li>Haz clic en "Simular Login" y verifica que aparecen los datos</li>
          <li>Recarga la página (F5) y verifica que los datos persisten</li>
          <li>Haz clic en "Simular Logout" y verifica que se limpia todo</li>
          <li>Abre DevTools → Application → Local Storage para ver los datos guardados</li>
        </ol>
      </div>
    </div>
  );
};

export default TestAuthStore;