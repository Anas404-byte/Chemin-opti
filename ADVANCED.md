# 🚀 Guide Avancé et Extensions

## 1️⃣ Ajouter une Base de Données

### Option 1 : MongoDB (Recommandé pour prototype)

**Installation:**
```bash
npm install mongoose
```

**server/models/Tour.js:**
```javascript
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: String,
  addresses: [String],
  optimizedRoute: Object,
  totalDistance: Number,
  createdAt: { type: Date, default: Date.now },
  userId: String
});

module.exports = mongoose.model('Tour', tourSchema);
```

**server/index.js:**
```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gps-livraison');

app.post('/api/tours', async (req, res) => {
  // Sauvegarder une tournée
});

app.get('/api/tours', async (req, res) => {
  // Récupérer les tournées
});
```

### Option 2 : PostgreSQL (Production)

```bash
npm install pg sequelize
```

## 2️⃣ Support Multi-Véhicules

### Algorithme CVRP (Capacitated Vehicle Routing Problem)

```javascript
// server/utils/cvrp.js
function optimizeMultiVehicleRoute(addresses, vehicles) {
  // vehicles = [{ id: 1, capacity: 10, start: coords },...]
  
  // 1. Regrouper par capacité
  const groups = clusterAddresses(addresses, vehicles.length);
  
  // 2. Optimiser chaque groupe
  const routes = groups.map(group => optimizeRoute(group));
  
  // 3. Assigner aux véhicules
  return assignToVehicles(routes, vehicles);
}
```

## 3️⃣ Intégration OSRM (Vraies Distances Routières)

OSRM fournit les vraies distances et temps de trajet.

**Installation:**
```bash
npm install osrm
```

**Modification routeOptimizer.js:**
```javascript
const osrm = require('osrm');
const instances = new osrm.OSRM({ data: 'maps/france.osrm' });

async function getDistance(lat1, lng1, lat2, lng2) {
  return new Promise((resolve, reject) => {
    instances.route({
      coordinates: [[lng1, lat1], [lng2, lat2]],
      geometries: 'polyline'
    }, (err, result) => {
      if (err) reject(err);
      resolve({
        distance: result.routes[0].distance / 1000, // km
        duration: result.routes[0].duration / 60 // minutes
      });
    });
  });
}
```

Ou utiliser le service en ligne (gratuit):
```javascript
async function getOSRMDistance(lat1, lng1, lat2, lng2) {
  const response = await axios.get(
    `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}`,
    { params: { overview: false } }
  );
  return {
    distance: response.data.routes[0].distance / 1000,
    duration: response.data.routes[0].duration / 60
  };
}
```

## 4️⃣ Fenêtres de Temps

Ajouter des contraintes horaires par adresse:

```javascript
// Exemple d'adresse avec fenêtre de temps
{
  address: "10 rue de la Paix, Paris",
  lat: 48.8566,
  lng: 2.3522,
  timeWindow: {
    start: 9 * 60,    // 9h00 en minutes
    end: 12 * 60      // 12h00 en minutes
  }
}
```

**Algorithme modifié:**
```javascript
function optimizeRouteWithTimeWindows(coordinates) {
  let route = nearestNeighbor(coordinates);
  
  // Vérifier les contraintes de temps
  let currentTime = 0;
  for (let i = 0; i < route.length; i++) {
    const point = route[i];
    
    // Ajouter temps de trajet
    if (i > 0) {
      const duration = getDistance(
        route[i-1].lat, route[i-1].lng,
        point.lat, point.lng
      );
      currentTime += duration;
    }
    
    // Vérifier fenêtre de temps
    if (currentTime > point.timeWindow.end) {
      // Sortir de la fenêtre de temps - ajuster l'itinéraire
    }
    
    // Ajouter temps de livraison
    currentTime += point.deliveryTime || 5;
  }
  
  return route;
}
```

## 5️⃣ Authentification Utilisateur

### Ajouter JWT

```bash
npm install jsonwebtoken bcryptjs
```

**server/middleware/auth.js:**
```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
```

**Utilisation:**
```javascript
app.post('/api/tours', authenticateToken, async (req, res) => {
  // Créer une tournée pour l'utilisateur authentifié
  const tour = new Tour({
    ...req.body,
    userId: req.user.id
  });
  await tour.save();
  res.json(tour);
});
```

## 6️⃣ Cache des Géolocalisations

Éviter les appels répétés à Nominatim:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 heure

async function getCoordinatesFromAddress(address) {
  const cached = cache.get(address);
  if (cached) return cached;
  
  const coords = await nominatimLookup(address);
  cache.set(address, coords);
  return coords;
}
```

## 7️⃣ Clustering (Pour gros volumes)

Diviser la région en zones plus petites:

```javascript
function clusterAddresses(addresses, numClusters = 5) {
  // k-means clustering
  const clusters = [];
  const centroids = initializeCentroids(addresses, numClusters);
  
  for (let iteration = 0; iteration < 10; iteration++) {
    // Réassigner les points
    // Mettre à jour les centroides
  }
  
  return clusters;
}

function optimizeMultipleClusters(addresses) {
  const clusters = clusterAddresses(addresses, 5);
  return clusters.map(cluster => optimizeRoute(cluster));
}
```

## 8️⃣ Suivi en Temps Réel

Ajouter un système de tracking des véhicules:

```javascript
// server/models/Vehicle.js
const vehicleSchema = {
  id: String,
  currentLocation: { lat: Number, lng: Number },
  currentOrder: Number,
  tour: ObjectId,
  lastUpdate: Date
};

// WebSocket pour mises à jour en temps réel
const io = require('socket.io')(app);

io.on('connection', (socket) => {
  socket.on('update-location', (data) => {
    // Mettre à jour la position du véhicule
    // Notifier les autres clients
    io.emit('vehicle-updated', data);
  });
});
```

**Frontend:**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('vehicle-updated', (vehicle) => {
  // Mettre à jour la carte en temps réel
});
```

## 9️⃣ Algorithmes Avancés

### Lin-Kernighan Heuristic

Meilleure qualité que 2-opt, plus complexe:

```bash
npm install or-tools
```

### Simulated Annealing

```javascript
function simulatedAnnealing(route, temperature = 1000) {
  let current = route;
  let best = route;
  
  while (temperature > 1) {
    const neighbor = generateNeighbor(current);
    const delta = calculateChange(current, neighbor);
    
    if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
      current = neighbor;
      
      if (calculateDistance(current) < calculateDistance(best)) {
        best = current;
      }
    }
    
    temperature *= 0.9999;
  }
  
  return best;
}
```

### Genetic Algorithm

```javascript
function geneticAlgorithm(addresses, populationSize = 100) {
  let population = generateRandomPopulation(addresses, populationSize);
  
  for (let generation = 0; generation < 50; generation++) {
    // Évaluer
    population = evaluate(population);
    
    // Sélectionner
    const parents = select(population, populationSize / 2);
    
    // Croiser
    population = crossover(parents, populationSize);
    
    // Muter
    population = mutate(population, 0.01);
  }
  
  return population[0]; // Meilleure solution
}
```

## 🔟 Optimisations de Performance

### Worker Threads (Calcul parallèle)

```javascript
const { Worker } = require('worker_threads');

function optimizeRouteAsync(addresses) {
  return new Promise((resolve) => {
    const worker = new Worker('./optimize-worker.js');
    worker.on('message', resolve);
    worker.postMessage({ addresses });
  });
}
```

### Mise en cache des routes

```javascript
const LRU = require('lru-cache');
const routeCache = new LRU({ max: 1000 });

function cachedOptimization(addresses) {
  const key = addresses.sort().join('|');
  
  if (routeCache.has(key)) {
    return routeCache.get(key);
  }
  
  const result = optimizeRoute(addresses);
  routeCache.set(key, result);
  return result;
}
```

## 1️⃣1️⃣ Déploiement Production

### Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN cd client && npm install && npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3'
services:
  gps:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017
  mongo:
    image: mongo:5
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
```

### Déploiement Heroku

```bash
heroku login
heroku create gps-livraison
git push heroku main
```

### Variables d'environnement production

```
MONGODB_URI=...
JWT_SECRET=...
NODE_ENV=production
SERVER_PORT=5000
```

## 1️⃣2️⃣ Monitoring et Analytics

```javascript
// server/analytics.js
const analytics = {
  totalRoutes: 0,
  avgDistance: 0,
  avgTime: 0,
  avgAddresses: 0
};

function trackOptimization(result) {
  analytics.totalRoutes++;
  analytics.avgDistance = (
    (analytics.avgDistance * (analytics.totalRoutes - 1) + result.totalDistance) 
    / analytics.totalRoutes
  );
  // ...
}

app.get('/api/analytics', (req, res) => {
  res.json(analytics);
});
```

---

Voilà les extensions principales ! Commencez par la base de données, puis ajoutez progressivement les autres fonctionnalités. 🚀
