import React, { useState } from 'react';

function POISelector({ pois, loading, error, onSearch, onAddToRoute }) {
  const [selected, setSelected] = useState({});
  const [open, setOpen] = useState(true);

  const toggle = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const selectedList = pois ? pois.filter(p => selected[p.id]) : [];
  const count = selectedList.length;

  // Grouper par catégorie
  const groups = {};
  if (pois) {
    pois.forEach(p => {
      if (!groups[p.categoryLabel]) groups[p.categoryLabel] = [];
      groups[p.categoryLabel].push(p);
    });
  }

  return (
    <div className="poi-panel">
      {/* En-tête cliquable */}
      <button className="poi-header" onClick={() => setOpen(o => !o)}>
        <span>🏞️ Lieux à visiter sur le chemin</span>
        <span className="poi-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="poi-body">

          {/* État initial : pas encore cherché */}
          {!loading && !error && pois === null && (
            <div className="poi-idle">
              <p>Découvrez des lacs, châteaux, parcs et points de vue à proximité de votre trajet.</p>
              <button className="btn-search-pois" onClick={onSearch}>
                🔍 Rechercher des lieux à visiter
              </button>
            </div>
          )}

          {/* Chargement */}
          {loading && (
            <p className="poi-status">🔍 Recherche en cours…</p>
          )}

          {/* Erreur */}
          {error && !loading && (
            <div className="poi-error-box">
              <p>{error}</p>
              <button className="btn-search-pois" onClick={onSearch}>
                🔄 Réessayer
              </button>
            </div>
          )}

          {/* Aucun résultat */}
          {!loading && !error && pois !== null && pois.length === 0 && (
            <div className="poi-idle">
              <p>Aucun lieu d'intérêt trouvé à proximité. Essayez avec un trajet plus long.</p>
              <button className="btn-search-pois" onClick={onSearch}>
                🔄 Réessayer
              </button>
            </div>
          )}

          {/* Liste des POIs */}
          {!loading && pois && pois.length > 0 && (
            <>
              <div className="poi-list">
                {Object.entries(groups).map(([category, items]) => (
                  <div key={category} className="poi-group">
                    <p className="poi-group-label">{items[0].icon} {category}</p>
                    {items.map(poi => (
                      <label
                        key={poi.id}
                        className={`poi-item${selected[poi.id] ? ' poi-item--checked' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={!!selected[poi.id]}
                          onChange={() => toggle(poi.id)}
                          style={{ accentColor: '#FF9800', cursor: 'pointer' }}
                        />
                        <span className="poi-name">{poi.name}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>

              <button
                className="btn-add-pois"
                disabled={count === 0}
                onClick={() => {
                  onAddToRoute(selectedList);
                  setSelected({});
                }}
              >
                {count === 0
                  ? 'Cochez des lieux pour les ajouter'
                  : `➕ Ajouter ${count} lieu${count > 1 ? 'x' : ''} au trajet`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default POISelector;
