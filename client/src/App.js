import React, { useState, useRef } from 'react';
import './App.css';
import MapComponent from './components/MapComponent';
import AddressForm from './components/AddressForm';
import RouteResults from './components/RouteResults';

function App() {
  const [addresses, setAddresses] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  const handleAddAddress = (address) => {
    setAddresses([...addresses, address]);
    setError(null);
  };

  const handleRemoveAddress = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleOptimizeRoute = async () => {
    if (addresses.length < 2) {
      setError('Veuillez entrer au moins 2 adresses');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addresses })
      });

      if (!response.ok) {
        let message = 'Erreur lors de l\'optimisation';
        try {
          const data = await response.json();
          message = data.error || message;
        } catch {}
        throw new Error(message);
      }

      const data = await response.json();
      setOptimizedRoute(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setAddresses([]);
    setOptimizedRoute(null);
    setError(null);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h1>🚚 GPS Livraison</h1>
        <p className="subtitle">Optimisez vos tournées de livraison</p>
        
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
            {loading ? 'Optimisation en cours...' : '🔄 Optimiser la route'}
          </button>
          <button
            onClick={handleClearAll}
            className="btn btn-secondary"
          >
            🗑️ Effacer tout
          </button>
        </div>

        {optimizedRoute && (
          <RouteResults route={optimizedRoute} />
        )}
      </div>

      <div className="map-container">
        <MapComponent
          ref={mapRef}
          optimizedRoute={optimizedRoute}
        />
      </div>
    </div>
  );
}

export default App;
