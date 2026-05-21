const axios = require('axios');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function categorize(tags) {
  if (tags.natural === 'lake' || (tags.natural === 'water' && tags.water === 'lake'))
    return { label: "Lac", icon: '💧' };
  if (tags.natural === 'waterfall')  return { label: "Cascade",      icon: '🌊' };
  if (tags.natural === 'peak')       return { label: "Sommet",        icon: '⛰️' };
  if (tags.natural === 'beach')      return { label: "Plage",         icon: '🏖️' };
  if (tags.tourism === 'viewpoint')  return { label: "Point de vue",  icon: '🔭' };
  if (tags.tourism === 'attraction') return { label: "Attraction",    icon: '⭐' };
  if (tags.tourism === 'museum')     return { label: "Musée",         icon: '🏛️' };
  if (tags.historic === 'castle')    return { label: "Château",       icon: '🏰' };
  if (tags.historic === 'monument')  return { label: "Monument",      icon: '🗿' };
  if (tags.historic === 'ruins')     return { label: "Ruines",        icon: '🏚️' };
  if (tags.leisure === 'park')       return { label: "Parc",          icon: '🌳' };
  if (tags.leisure === 'nature_reserve') return { label: "Réserve naturelle", icon: '🦋' };
  return { label: "Lieu d'intérêt",  icon: '📍' };
}

async function getNearbyPOIs(bbox) {
  const { south, west, north, east } = bbox;
  const b = `(${south},${west},${north},${east})`;

  const query = `
[out:json][timeout:30];
(
  node["natural"~"^(lake|waterfall|peak|beach)$"]["name"]${b};
  node["tourism"~"^(attraction|viewpoint|museum)$"]["name"]${b};
  node["historic"~"^(castle|monument|ruins|archaeological_site)$"]["name"]${b};
  node["leisure"~"^(park|nature_reserve)$"]["name"]${b};
  way["natural"="water"]["water"="lake"]["name"]${b};
  way["tourism"~"^(attraction|museum)$"]["name"]${b};
  way["historic"~"^(castle|monument)$"]["name"]${b};
  way["leisure"="park"]["name"]${b};
  relation["natural"="water"]["water"="lake"]["name"]${b};
);
out body center 40;
`.trim();

  const params = new URLSearchParams();
  params.append('data', query);

  const res = await axios.post(OVERPASS_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 35000,
  });

  const seen = new Set();
  const pois = [];

  for (const el of (res.data.elements || [])) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const name = el.tags?.name;
    if (!lat || !lng || !name) continue;

    // Dédoublonnage par nom (premiers 25 chars)
    const key = name.toLowerCase().slice(0, 25);
    if (seen.has(key)) continue;
    seen.add(key);

    const { label, icon } = categorize(el.tags);
    pois.push({
      id: `${el.type}-${el.id}`,
      name,
      lat,
      lng,
      icon,
      categoryLabel: label,
    });
  }

  return pois;
}

module.exports = { getNearbyPOIs };
