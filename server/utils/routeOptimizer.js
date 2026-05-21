const axios = require('axios');

// Chaque mode utilise un serveur OSRM dédié avec le bon profil de routage.
// - driving : évite les zones piétonnes, emprunte les autoroutes
// - cycling  : évite les autoroutes, utilise les pistes cyclables
// - foot     : chemins piétons, interdit aux véhicules
// transit n'est pas géré nativement par OSRM → approximation pied
const OSRM_CONFIGS = {
  driving: { base: 'https://router.project-osrm.org',              profile: 'driving' },
  cycling: { base: 'https://routing.openstreetmap.de/routed-bike', profile: 'cycling' },
  walking: { base: 'https://routing.openstreetmap.de/routed-foot', profile: 'foot'    },
  transit: { base: 'https://routing.openstreetmap.de/routed-foot', profile: 'foot'    },
};

function osrmConfig(mode) {
  return OSRM_CONFIGS[mode] || OSRM_CONFIGS.driving;
}

async function getCoordinatesFromAddress(address) {
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: address, format: 'json', limit: 1 },
    headers: { 'User-Agent': 'GPSLivraison/1.0' },
  });
  if (response.data.length === 0) throw new Error('Adresse non trouvée');
  const { lat, lon } = response.data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}

// Matrice des durées réelles (secondes) entre chaque paire de points
async function getRoadMatrix(points, mode = 'driving') {
  const { base, profile } = osrmConfig(mode);
  const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
  const res = await axios.get(`${base}/table/v1/${profile}/${coords}`, {
    params: { annotations: 'duration' },
    timeout: 20000,
  });
  if (res.data.code !== 'Ok') throw new Error('OSRM table error: ' + res.data.code);
  return res.data.durations;
}

// Géométrie GeoJSON + distance et durée réelles du trajet complet
async function getRouteDetails(orderedPoints, mode = 'driving') {
  const { base, profile } = osrmConfig(mode);
  const coords = orderedPoints.map(p => `${p.lng},${p.lat}`).join(';');
  const res = await axios.get(`${base}/route/v1/${profile}/${coords}`, {
    params: { overview: 'full', geometries: 'geojson' },
    timeout: 20000,
  });
  if (res.data.code !== 'Ok') throw new Error('OSRM route error: ' + res.data.code);
  const route = res.data.routes[0];
  return {
    geometry: route.geometry,
    distanceKm: Math.round(route.distance / 10) / 100,
    durationMinutes: Math.round(route.duration / 60),
  };
}

// Optimisation : plus proche voisin + 2-opt sur la matrice de durées
function optimizeWithMatrix(coordinates, matrix) {
  const n = coordinates.length;
  if (n <= 1) return coordinates;

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

  let improved = true, iter = 0;
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
