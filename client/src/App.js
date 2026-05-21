import React, { useState, useRef } from 'react';
import './App.css';
import MapComponent from './components/MapComponent';
import AddressForm from './components/AddressForm';
import RouteResults from './components/RouteResults';
import POISelector from './components/POISelector';

const TRANSPORT_MODES = [
  { id: 'driving',  label: 'Voiture',             icon: '🚗' },
  { id: 'cycling',  label: 'Vélo',                icon: '🚲' },
  { id: 'walking',  label: 'À pied',              icon: '🚶' },
  { id: 'transit',  label: 'Transport en commun', icon: '🚌' },
];

function getBounds(route, padding = 0.08) {
  const lats = route.map(p => p.lat);
  const lngs = route.map(p => p.lng);
  return {
    south: Math.min(...lats) - padding,
    north: Math.max(...lats) + padding,
    west:  Math.min(...lngs) - padding,
    east:  Math.max(...lngs) + padding,
  };
}

function App() {
  const [addresses, setAddresses]           = useState([]);
  const [mode, setMode]                     = useState('driving');
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [pois, setPois]                     = useState(null);       // null = pas encore cherché
  const [poisLoading, setPoisLoading]       = useState(false);
  const [poisError, setPoisError]           = useState(null);
  const currentRoute                        = useRef(null);
  const mapRef                              = useRef(null);

  const handleAddAddress = (address) => {
    setAddresses(prev => [...prev, address]);
    setError(null);
  };

  const handleRemoveAddress = (index) => {
    setAddresses(prev => prev.filter((_, i) => i !== index));
  };

  async function callOptimize(extraWaypoints = []) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses, mode, extraWaypoints }),
      });
      if (!response.ok) {
        let message = "Erreur lors de l'optimisation";
        try { message = (await response.json()).error || message; } catch {}
        throw new Error(message);
      }
      return await response.json();
    } finally {
      setLoading(false);
    }
  }

  const handleOptimizeRoute = async () => {
    if (addresses.length < 2) {
      setError('Veuillez entrer au moins 2 adresses');
      return;
    }
    setPois(null);
    setPoisError(null);
    try {
      const data = await callOptimize();
      setOptimizedRoute(data);
      currentRoute.current = data.optimizedRoute;
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearchPOIs = async () => {
    if (!currentRoute.current) return;
    setPoisLoading(true);
    setPoisError(null);
    setPois(null);
    try {
      const bounds = getBounds(currentRoute.current);
      const res = await fetch('/api/pois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bounds }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      const data = await res.json();
      setPois(data.pois || []);
    } catch (err) {
      setPoisError("Impossible de récupérer les lieux. Réessayez dans quelques secondes.");
      setPois([]);
    } finally {
      setPoisLoading(false);
    }
  };

  const handleAddPOIs = async (selectedPois) => {
    try {
      const data = await callOptimize(selectedPois);
      setOptimizedRoute(data);
      currentRoute.current = data.optimizedRoute;
      setPois(null);
      setPoisError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClearAll = () => {
    setAddresses([]);
    setOptimizedRoute(null);
    setPois(null);
    setPoisError(null);
    setError(null);
    currentRoute.current = null;
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h1>🗺️ GPS Livraison</h1>
        <p className="subtitle">Optimisez vos tournées de livraison</p>

        <div className="mode-selector">
          <p className="mode-label">Moyen de transport</p>
          <div className="mode-buttons">
            {TRANSPORT_MODES.map((m) => (
              <button
                key={m.id}
                className={`mode-btn${mode === m.id ? ' mode-btn--active' : ''}`}
                onClick={() => { setMode(m.id); setOptimizedRoute(null); setPois(null); currentRoute.current = null; }}
                title={m.label}
              >
                <span className="mode-icon">{m.icon}</span>
                <span className="mode-text">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AddressForm
          addresses={addresses}
          onAddAddress={handleAddAddress}
          onRemoveAddress={handleRemoveAddress}
        />

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button
            onClick={handleOptimizeRoute}
            disabled={addresses.length < 2 || loading}
            className="btn btn-primary"
          >
            {loading ? 'Calcul en cours…' : '🔄 Optimiser la route'}
          </button>
          <button onClick={handleClearAll} className="btn btn-secondary">
            🗑️ Effacer tout
          </button>
        </div>

        {optimizedRoute && <RouteResults route={optimizedRoute} />}

        {/* Section lieux à visiter — toujours visible après optimisation */}
        {optimizedRoute && (
          <POISelector
            pois={pois}
            loading={poisLoading}
            error={poisError}
            onSearch={handleSearchPOIs}
            onAddToRoute={handleAddPOIs}
          />
        )}
      </div>

      <div className="map-container">
        <MapComponent ref={mapRef} optimizedRoute={optimizedRoute} pois={pois} />
      </div>
    </div>
  );
}

export default App;
