const axios = require('axios');

// Miroirs Overpass testés et fonctionnels dans cet environnement
const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];

// Cache en mémoire : évite de rappeler Overpass pour la même zone (TTL 10 min)
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function bboxKey(bbox) {
  // Arrondi à 2 décimales (~1 km) pour réutiliser le cache sur des zones proches
  return [bbox.south, bbox.west, bbox.north, bbox.east]
    .map(v => v.toFixed(2))
    .join(',');
}

function categorize(tags) {
  if (tags.natural === 'lake' || (tags.natural === 'water' && tags.water === 'lake'))
    return { label: "Lac",                icon: '💧' };
  if (tags.natural === 'waterfall')     return { label: "Cascade",            icon: '🌊' };
  if (tags.natural === 'peak')          return { label: "Sommet",              icon: '⛰️' };
  if (tags.natural === 'beach')         return { label: "Plage",               icon: '🏖️' };
  if (tags.tourism === 'viewpoint')     return { label: "Point de vue",        icon: '🔭' };
  if (tags.tourism === 'attraction')    return { label: "Attraction",          icon: '⭐' };
  if (tags.tourism === 'museum')        return { label: "Musée",               icon: '🏛️' };
  if (tags.historic === 'castle')       return { label: "Château",             icon: '🏰' };
  if (tags.historic === 'monument')     return { label: "Monument",            icon: '🗿' };
  if (tags.historic === 'ruins')        return { label: "Ruines",              icon: '🏚️' };
  if (tags.leisure === 'park')          return { label: "Parc",                icon: '🌳' };
  if (tags.leisure === 'nature_reserve') return { label: "Réserve naturelle", icon: '🦋' };
  return                                       { label: "Lieu d'intérêt",      icon: '📍' };
}

async function queryOverpass(query) {
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const res = await axios.get(mirror, {
        params: { data: query },
        timeout: 35000,
        headers: { 'User-Agent': 'GPSLivraison/1.0' },
      });
      return res;
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        // Rate-limit : attendre 3 s puis réessayer ce miroir une fois
        console.warn(`Overpass ${mirror} → 429, retry in 3s…`);
        await new Promise(r => setTimeout(r, 3000));
        try {
          const retry = await axios.get(mirror, {
            params: { data: query },
            timeout: 35000,
            headers: { 'User-Agent': 'GPSLivraison/1.0' },
          });
          return retry;
        } catch (retryErr) {
          console.warn(`Overpass ${mirror} retry failed:`, retryErr.message);
        }
      } else {
        console.warn(`Overpass ${mirror} failed (${status}):`, err.message);
      }
    }
  }
  throw new Error('Tous les serveurs Overpass sont inaccessibles');
}

async function getNearbyPOIs(bbox) {
  const key = bboxKey(bbox);

  // Retourner le cache si encore valide
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    console.log('POI: cache hit pour', key);
    return cached.pois;
  }

  const { south, west, north, east } = bbox;
  const b = `(${south},${west},${north},${east})`;

  const query = `[out:json][timeout:30];(node["natural"~"^(lake|waterfall|peak|beach)$"]["name"]${b};node["tourism"~"^(attraction|viewpoint|museum)$"]["name"]${b};node["historic"~"^(castle|monument|ruins|archaeological_site)$"]["name"]${b};node["leisure"~"^(park|nature_reserve)$"]["name"]${b};way["natural"="water"]["water"="lake"]["name"]${b};way["tourism"~"^(attraction|museum)$"]["name"]${b};way["historic"~"^(castle|monument)$"]["name"]${b};way["leisure"="park"]["name"]${b};relation["natural"="water"]["water"="lake"]["name"]${b};);out body center 40;`;

  const res = await queryOverpass(query);

  const seen = new Set();
  const pois = [];

  for (const el of (res.data.elements || [])) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const name = el.tags?.name;
    if (!lat || !lng || !name) continue;

    const key2 = name.toLowerCase().slice(0, 25);
    if (seen.has(key2)) continue;
    seen.add(key2);

    const { label, icon } = categorize(el.tags);
    pois.push({ id: `${el.type}-${el.id}`, name, lat, lng, icon, categoryLabel: label });
  }

  // Mettre en cache
  cache.set(key, { pois, ts: Date.now() });
  return pois;
}

module.exports = { getNearbyPOIs };
