# 🏗️ Architecture de l'Application GPS Livraison

## 📐 Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│              NAVIGATEUR (Frontend)                   │
│ ┌──────────────────────────────────────────────┐   │
│ │    React App (Port 3000)                     │   │
│ │  ┌────────────────────────────────────────┐ │   │
│ │  │ App.js (composant principal)           │ │   │
│ │  │ - Gestion de l'état                    │ │   │
│ │  │ - Appels API                           │ │   │
│ │  │ - Gestion des adresses                 │ │   │
│ │  └────────────────────────────────────────┘ │   │
│ │  ┌────────────────────────────────────────┐ │   │
│ │  │ Composants                             │ │   │
│ │  │ - AddressForm: Formulaire d'entrée     │ │   │
│ │  │ - MapComponent: Visualisation Leaflet  │ │   │
│ │  │ - RouteResults: Affichage résultats    │ │   │
│ │  └────────────────────────────────────────┘ │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        │
                    HTTP/JSON
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│         SERVEUR (Backend - Port 5000)                │
│ ┌──────────────────────────────────────────────┐   │
│ │ Express.js Server                            │   │
│ │ ┌────────────────────────────────────────┐  │   │
│ │ │ Routes API                             │  │   │
│ │ │ POST /api/optimize-route               │  │   │
│ │ │ POST /api/geocode                      │  │   │
│ │ │ GET  /                                 │  │   │
│ │ └────────────────────────────────────────┘  │   │
│ │ ┌────────────────────────────────────────┐  │   │
│ │ │ Modules Utilitaires                    │  │   │
│ │ │                                        │  │   │
│ │ │ routeOptimizer.js:                     │  │   │
│ │ │ - getCoordinatesFromAddress()          │  │   │
│ │ │ - optimizeRoute()                      │  │   │
│ │ │ - twoOptOptimization()                 │  │   │
│ │ │                                        │  │   │
│ │ │ distance.js:                           │  │   │
│ │ │ - calculateDistance()                  │  │   │
│ │ └────────────────────────────────────────┘  │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        │
              HTTPS / Geocoding API
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│    SERVICES EXTERNES                                │
│ ┌──────────────────────────────────────────────┐   │
│ │ Nominatim (OpenStreetMap)                    │   │
│ │ - Géolocalisation d'adresses                 │   │
│ │ - Conversion adresse ↔ coordonnées           │   │
│ └──────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────┐   │
│ │ Leaflet + OpenStreetMap                      │   │
│ │ - Cartographie interactive                   │   │
│ │ - Affichage des routes                       │   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## 🔄 Flux de données

### 1. Entrée des adresses
```
Utilisateur tape adresse
    ↓
AddressForm.js
    ↓
App.js stocke dans state
    ↓
Affichage dans address-list
```

### 2. Optimisation de la route
```
Utilisateur clique "Optimiser"
    ↓
App.js → API POST /api/optimize-route
    ↓
Backend: routeOptimizer.js
    ↓
1. getCoordinatesFromAddress() pour chaque adresse
   └→ Appel Nominatim (OpenStreetMap)
      └→ lat/lng pour chaque adresse
    ↓
2. optimizeRoute()
   ├→ Nearest Neighbor (construction route)
   └→ 2-opt optimization (amélioration)
    ↓
3. calculateDistance()
   └→ Distance totale (Haversine)
    ↓
Réponse JSON au client
    ↓
MapComponent affiche la route
RouteResults affiche statistiques
```

## 📦 Modules et Responsabilités

### Frontend (React)

#### `App.js`
- Composant racine
- Gestion de l'état global
- Appels API au backend
- Coordination entre composants

#### `AddressForm.js`
- Formulaire d'entrée
- Liste des adresses
- Boutons d'ajout/suppression

#### `MapComponent.js`
- Initialisation Leaflet
- Affichage des marqueurs
- Traçage de la route
- Interaction utilisateur

#### `RouteResults.js`
- Affichage des résultats
- Distance totale
- Ordre optimisé des arrêts

### Backend (Node.js)

#### `index.js`
- Serveur Express
- Middleware (CORS, bodyParser)
- Routes API
- Gestion des erreurs

#### `routeOptimizer.js`
- `getCoordinatesFromAddress()` : Géolocalisation
- `optimizeRoute()` : Algorithme d'optimisation
- `twoOptOptimization()` : Amélioration 2-opt

#### `distance.js`
- `calculateDistance()` : Formule Haversine

## 🔌 API Endpoints

### POST /api/optimize-route
Optimise une tournée de livraison

**Request:**
```json
{
  "addresses": ["adresse1", "adresse2", "adresse3"]
}
```

**Response:**
```json
{
  "success": true,
  "optimizedRoute": [
    { "address": "...", "lat": 48.xxx, "lng": 2.xxx },
    ...
  ],
  "totalDistance": 12.5,
  "waypoints": 3
}
```

**Process interne:**
1. Valider les adresses
2. Géolocaliser chaque adresse
3. Appliquer algorithme d'optimisation
4. Calculer distance totale
5. Retourner résultats

### POST /api/geocode
Géolocalise une seule adresse

**Request:**
```json
{
  "address": "10 rue de la Paix, Paris"
}
```

**Response:**
```json
{
  "success": true,
  "lat": 48.8566,
  "lng": 2.3522
}
```

## 🧮 Algorithmes

### Nearest Neighbor (Glouton)
```
1. Partir du premier point
2. Répéter:
   - Trouver le point non visité le plus proche
   - Aller à ce point
   - Marquer comme visité
```

**Complexité:** O(n²)
**Avantage:** Rapide
**Inconvénient:** Pas optimal

### 2-opt (Amélioration)
```
1. Partant de la solution Nearest Neighbor
2. Répéter (max N itérations):
   - Pour chaque paire de segments (i, j):
     - Tester si inverser le segment améliore
     - Si oui: inverser et continuer
   - Si aucune amélioration: arrêter
```

**Complexité:** O(n²) par itération
**Avantage:** Améliore significativement la solution
**Résultat:** Routes quasi-optimales

### Haversine (Distance)
Calcule la distance entre deux points GPS sur une sphère

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c  (R = 6371 km)
```

## 📊 Complexité et Performance

| Opération | Complexité | Temps (20 points) |
|-----------|-----------|-------------------|
| Géolocalisation | O(n) | ~2s |
| Nearest Neighbor | O(n²) | ~5ms |
| 2-opt (50 iter) | O(n² × iter) | ~100ms |
| **Total** | **O(n²)** | **~2.1s** |

Pour 100 points : ~20s (acceptable pour pré-calcul)
Pour 200+ points : Considérer OSRM ou algorithme plus rapide

## 🔐 Sécurité

Considérations :
- ✅ Validation des adresses au serveur
- ✅ Gestion des erreurs de géolocalisation
- ✅ Timeout sur les appels externes (Nominatim)
- ⚠️ Pas d'authentification (à ajouter pour production)
- ⚠️ Pas de rate limiting (ajouter pour production)
- ⚠️ Pas de validation CORS stricte (adapter domaines)

## 🚀 Améliorations Futures

### Court terme
- Cache des géolocalisations
- Support de fichiers CSV
- Sauvegarde des tournées

### Moyen terme
- Support multi-véhicules
- Fenêtres de temps
- Contraintes de capacité
- Intégration OSRM (vraies distances)

### Long terme
- Support temps réel
- Machine learning pour prédictions
- Système de notification chauffeurs
- Tableau de bord analytics

## 📝 Notes de Développement

### Dépendances principales
- `express` : Framework web
- `leaflet` : Cartographie frontend
- `axios` : Requêtes HTTP
- `cors` : Cross-origin requests
- `body-parser` : Parsing JSON

### Limitations actuelles
1. Nominatim a un rate limit (1 req/s recommandé)
2. 2-opt est limité à 50 itérations pour performance
3. Pas de vraie distance routière (utilise distance directe)
4. Pas de support offline

### Optimisations possibles
1. Cacher les géolocalisations
2. Utiliser Worker threads pour optimisation
3. Implémenter Lin-Kernighan
4. Intégrer OSRM pour distance réelle
