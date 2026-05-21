const axios = require('axios');

const OSRM = 'http://router.project-osrm.org';

async function getCoordinatesFromAddress(address) {
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: address, format: 'json', limit: 1 },
    headers: { 'User-Agent': 'GPSLivraison/1.0' }
  });
  if (response.data.length === 0) throw new Error('Adresse non trouvée');
  const { lat, lon } = response.data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}

// Matrice des durées réelles sur routes (OSRM Table API)
async function getRoadMatrix(points) {
  const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
  const res = await axios.get(`${OSRM}/table/v1/driving/${coords}`, {
    params: { annotations: 'duration' },
    timeout: 15000
  });
  if (res.data.code !== 'Ok') throw new Error('OSRM table: ' + res.data.code);
  return res.data.durations; // matrice N×N en secondes
}

// Géométrie et stats réelles du trajet (OSRM Route API)
async function getRouteDetails(orderedPoints) {
  const coords = orderedPoints.map(p => `${p.lng},${p.lat}`).join(';');
  const res = await axios.get(`${OSRM}/route/v1/driving/${coords}`, {
    params: { overview: 'full', geometries: 'geojson' },
    timeout: 15000
  });
  if (res.data.code !== 'Ok') throw new Error('OSRM route: ' + res.data.code);
  const route = res.data.routes[0];
  return {
    geometry: route.geometry,
    distanceKm: Math.round(route.distance / 10) / 100,
    durationMinutes: Math.round(route.duration / 60)
  };
}

// Optimisation par plus proche voisin + 2-opt en utilisant la matrice de durées
function optimizeWithMatrix(coordinates, matrix) {
  const n = coordinates.length;
  if (n <= 1) return coordinates;

  // Étape 1 : Plus proche voisin
  const visited = new Set([0]);
  const idx = [0];
  while (idx.length < n) {
    const last = idx[idx.length - 1];
    let best = -1, bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && matrix[last][i] < bestDist) {
        bestDist = matrix[last][i];
        best = i;
      }
    }
    idx.push(best);
    visited.add(best);
  }

  // Étape 2 : 2-opt
  let improved = true;
  let iter = 0;
  while (improved && iter < 50) {
    improved = false;
    iter++;
    for (let i = 1; i < n - 1; i++) {
      for (let k = i + 1; k < n; k++) {
        const before = matrix[idx[i - 1]][idx[i]] + matrix[idx[k]][idx[(k + 1) % n]];
        const after  = matrix[idx[i - 1]][idx[k]] + matrix[idx[i]][idx[(k + 1) % n]];
        if (after < before) {
          idx.splice(i, k - i + 1, ...idx.slice(i, k + 1).reverse());
          improved = true;
        }
      }
    }
  }

  return idx.map(i => coordinates[i]);
}

module.exports = { getCoordinatesFromAddress, getRoadMatrix, getRouteDetails, optimizeWithMatrix };
