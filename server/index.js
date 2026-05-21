const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const { getCoordinatesFromAddress, getRoadMatrix, getRouteDetails, optimizeWithMatrix } = require('./utils/routeOptimizer');

app.get('/', (req, res) => {
  res.json({ message: 'Serveur GPS Livraison actif' });
});

app.post('/api/optimize-route', async (req, res) => {
  try {
    const { addresses } = req.body;

    if (!addresses || addresses.length === 0) {
      return res.status(400).json({ error: 'Au moins une adresse est requise' });
    }

    // 1. Géocodage (Nominatim, 1 req/s)
    const coordinates = [];
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      try {
        if (i > 0) await new Promise(r => setTimeout(r, 1100));
        const coords = await getCoordinatesFromAddress(address);
        coordinates.push({ address, lat: coords.lat, lng: coords.lng });
      } catch (err) {
        console.error(`Geocoding failed for "${address}":`, err.message);
        return res.status(400).json({
          error: `Adresse introuvable : "${address}". Essayez d'être plus précis (ville, pays).`
        });
      }
    }

    // 2. Matrice des durées réelles sur routes
    const matrix = await getRoadMatrix(coordinates);

    // 3. Optimisation (plus proche voisin + 2-opt) avec les durées réelles
    const optimizedRoute = optimizeWithMatrix(coordinates, matrix);

    // 4. Géométrie et stats du trajet réel
    const { geometry, distanceKm, durationMinutes } = await getRouteDetails(optimizedRoute);

    res.json({
      success: true,
      optimizedRoute,
      totalDistance: distanceKm,
      estimatedMinutes: durationMinutes,
      routeGeometry: geometry,
      waypoints: optimizedRoute.length
    });
  } catch (error) {
    console.error('Erreur:', error.message);
    res.status(500).json({ error: 'Erreur serveur : ' + error.message });
  }
});

app.post('/api/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Adresse requise' });
    const coords = await getCoordinatesFromAddress(address);
    res.json({ success: true, ...coords });
  } catch (error) {
    res.status(400).json({ error: 'Impossible de géolocaliser cette adresse' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
