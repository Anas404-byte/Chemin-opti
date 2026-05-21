import React, { useState, useEffect } from 'react';

function formatTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function RouteResults({ route }) {
  const { optimizedRoute, totalDistance, estimatedMinutes, waypoints } = route;
  const [visited, setVisited] = useState([]);

  // Reset visited state when the route changes
  useEffect(() => {
    setVisited(new Array(optimizedRoute.length).fill(false));
  }, [optimizedRoute]);

  const toggleVisited = (index) => {
    setVisited(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const visitedCount = visited.filter(Boolean).length;

  return (
    <div className="results">
      <h3>Résultats de l'optimisation</h3>

      <div className="result-item">
        <span className="result-label">Distance totale :</span>
        <span className="result-value">{totalDistance} km</span>
      </div>

      <div className="result-item">
        <span className="result-label">Durée estimée :</span>
        <span className="result-value">{formatTime(estimatedMinutes)}</span>
      </div>

      <div className="result-item">
        <span className="result-label">Points visités :</span>
        <span className="result-value">{visitedCount} / {waypoints}</span>
      </div>

      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #c8e6c9' }}>
        <h4 style={{ fontSize: '12px', color: '#2e7d32', marginBottom: '10px' }}>Ordre optimal :</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {optimizedRoute.map((point, index) => {
            const done = visited[index];
            return (
              <div
                key={index}
                onClick={() => toggleVisited(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  marginBottom: '6px',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: done ? '#e8f5e9' : '#fff',
                  border: `1px solid ${done ? '#a5d6a7' : '#e0e0e0'}`,
                  transition: 'background 0.2s, border 0.2s',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => toggleVisited(index)}
                  onClick={e => e.stopPropagation()}
                  style={{ accentColor: '#4CAF50', width: '15px', height: '15px', flexShrink: 0, cursor: 'pointer' }}
                />
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  background: done ? '#a5d6a7' : '#4CAF50',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}>
                  {index + 1}
                </span>
                <span style={{
                  flex: 1,
                  wordBreak: 'break-word',
                  color: done ? '#888' : '#333',
                  textDecoration: done ? 'line-through' : 'none',
                  transition: 'color 0.2s',
                }}>
                  {point.address.length > 35
                    ? point.address.substring(0, 32) + '...'
                    : point.address}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RouteResults;
