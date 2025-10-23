/*
APP.JSX:
- Organizar la estructura de tu aplicación
- Manejar rutas (Router) --> Esta función va en AppRouter.jsx
- Contener la lógica principal
- Poder crecer sin problemas
*/


//COMPONENTE DE EJEMPLO. Luego borrar
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-4">
          🎉 Portal del Empleado
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Configuración de Tailwind CSS completada con éxito
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-500 text-white p-4 rounded-lg text-center">
            <h3 className="font-bold mb-2">✅ Colores</h3>
            <p className="text-sm">bg-blue-500 funcionando</p>
          </div>

          <div className="bg-green-500 text-white p-4 rounded-lg text-center">
            <h3 className="font-bold mb-2">✅ Padding</h3>
            <p className="text-sm">p-4 aplicado correctamente</p>
          </div>

          <div className="bg-purple-500 text-white p-4 rounded-lg text-center">
            <h3 className="font-bold mb-2">✅ Flexbox</h3>
            <p className="text-sm">flex items-center</p>
          </div>

          <div className="bg-pink-500 text-white p-4 rounded-lg text-center">
            <h3 className="font-bold mb-2">✅ Grid</h3>
            <p className="text-sm">grid-cols-2 activo</p>
          </div>
        </div>

        <div className="text-center">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105">
            Tailwind CSS está funcionando 🚀
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-sm text-yellow-700">
            <span className="font-bold">✓ Proyecto configurado:</span> Vite + React + Tailwind CSS v4
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
