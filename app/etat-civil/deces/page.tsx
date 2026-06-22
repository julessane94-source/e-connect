export default function Deces() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">??? Gestion des décès</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Liste des actes de décès</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">#2026-001 - Abdoulaye Ndiaye</p>
              <p className="text-sm text-gray-500">Décédé le 20/03/2026 - Statut: Validé</p>
            </div>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Voir
            </button>
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          + Nouvel acte de décès
        </button>
      </div>
    </div>
  );
}
