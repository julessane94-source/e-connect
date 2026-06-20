export default function Parametres() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">⚙️ Paramètres</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">👤 Utilisateurs</h3>
          <p className="text-sm text-gray-500 mt-2">Gérer les utilisateurs et leurs accès</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Accéder
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">🔐 Rôles</h3>
          <p className="text-sm text-gray-500 mt-2">Gérer les rôles et permissions</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Accéder
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">🏢 Départements</h3>
          <p className="text-sm text-gray-500 mt-2">Gérer les départements et services</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Accéder
          </button>
        </div>
      </div>
    </div>
  );
}
