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
