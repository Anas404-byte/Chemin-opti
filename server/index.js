const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const { getCoordinatesFromAddress, getRoadMatrix, getRouteDetails, optimizeWithMatrix } = require('./utils/routeOptimizer');
const { getNearbyPOIs } = require('./utils/poiFinder');

app.get('/', (req, res) => {
  res.json({ message: 'Serveur GPS Livraison actif' });
});

app.post('/api/optimize-route', async (req, res) => {
  try {
    const { addresses, mode = 'driving', extraWaypoints = [] } = req.body;

    const validModes = ['driving', 'cycling', 'walking', 'transit'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({ error: 'Mode de transport invalide' });
    }
    if (!addresses || addresses.length === 0) {
      return res.status(400).json({ error: 'Au moins une adresse est requise' });
    }

    // 1. Géocodage des adresses saisies (Nominatim, 1 req/s)
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

    // 2. Ajouter les points d'intérêt choisis par l'utilisateur (déjà géocodés)
    const allCoordinates = [
      ...coordinates,
      ...extraWaypoints.map(p => ({ address: p.name, lat: p.lat, lng: p.lng, isPOI: true })),
    ];

    // 3. Matrice des durées réelles + optimisation
    const matrix = await getRoadMatrix(allCoordinates, mode);
    const optimizedRoute = optimizeWithMatrix(allCoordinates, matrix);

    // 4. Géométrie et stats réelles du trajet
    const { geometry, distanceKm, durationMinutes } = await getRouteDetails(optimizedRoute, mode);

    res.json({
      success: true,
      optimizedRoute,
      totalDistance: distanceKm,
      estimatedMinutes: durationMinutes,
      routeGeometry: geometry,
      mode,
      waypoints: optimizedRoute.length,
    });
  } catch (error) {
    console.error('Erreur:', error.message);
    res.status(500).json({ error: 'Erreur serveur : ' + error.message });
  }
});

// Recherche de lieux d'intérêt autour du trajet
app.post('/api/pois', async (req, res) => {
  try {
    const { bounds } = req.body;
    if (!bounds) return res.status(400).json({ error: 'Bounds requis' });
    const pois = await getNearbyPOIs(bounds);
    res.json({ success: true, pois });
  } catch (error) {
    console.error('POI error:', error.message);
    res.status(500).json({ error: 'Impossible de récupérer les lieux : ' + error.message });
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
