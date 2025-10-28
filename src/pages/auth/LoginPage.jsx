// ✅ Página de login
// En LoginPage.jsx, después de login exitoso:
// const handleLoginSuccess = () => {
//   const { isAdmin, isManager, isEmployee } = useAuthStore.getState();

//   if (isAdmin()) {
//     navigate('/users'); // Admin → Gestión de usuarios
//   } else if (isManager()) {
//     navigate('/requests/team'); // Manager → Aprobar solicitudes
//   } else {
//     navigate('/requests/my'); // Employee → Sus solicitudes (la página del prototipo)
//   }
// };



function LoginPage() {
  return (
    <div>
      <h1>Login Page</h1>
    </div>
  );
}

export default LoginPage;
