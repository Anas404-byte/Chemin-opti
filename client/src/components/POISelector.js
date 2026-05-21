import React, { useState } from 'react';

function POISelector({ pois, loading, onAddToRoute }) {
  const [selected, setSelected] = useState({});
  const [open, setOpen] = useState(true);

  if (loading) {
    return (
      <div className="poi-panel">
        <div className="poi-header">
          <span>🔍 Recherche de lieux à visiter…</span>
        </div>
      </div>
    );
  }

  if (!pois || pois.length === 0) {
    return (
      <div className="poi-panel">
        <div className="poi-header">
          <span>🗺️ Lieux à visiter</span>
        </div>
        <p className="poi-empty">Aucun lieu d'intérêt trouvé à proximité du trajet.</p>
      </div>
    );
  }

  const toggle = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  const selectedList = pois.filter(p => selected[p.id]);
  const count = selectedList.length;

  // Grouper par catégorie
  const groups = {};
  pois.forEach(p => {
    if (!groups[p.categoryLabel]) groups[p.categoryLabel] = [];
    groups[p.categoryLabel].push(p);
  });

  return (
    <div className="poi-panel">
      <button className="poi-header" onClick={() => setOpen(o => !o)}>
        <span>🗺️ Lieux à visiter sur le chemin ({pois.length})</span>
        <span className="poi-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <>
          <div className="poi-list">
            {Object.entries(groups).map(([category, items]) => (
              <div key={category} className="poi-group">
                <p className="poi-group-label">{items[0].icon} {category}</p>
                {items.map(poi => (
                  <label key={poi.id} className={`poi-item${selected[poi.id] ? ' poi-item--checked' : ''}`}>
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
            onClick={() => onAddToRoute(selectedList)}
          >
            {count === 0
              ? 'Cochez des lieux pour les ajouter'
              : `➕ Ajouter ${count} lieu${count > 1 ? 'x' : ''} au trajet`}
          </button>
        </>
      )}
    </div>
  );
}

export default POISelector;
