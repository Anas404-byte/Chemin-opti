# 🚚 GPS Livraison - Optimiseur de Tournées

Une application web complète pour optimiser les tournées de livraison. Elle calcule automatiquement le chemin le plus rapide et organise les adresses dans l'ordre optimal pour les livreurs.

## 🎯 Fonctionnalités

- ✅ **Entrée d'adresses** : Ajoutez facilement vos points de livraison
- ✅ **Géolocalisation** : Conversion automatique des adresses en coordonnées GPS
- ✅ **Optimisation intelligent** : Algorithme Nearest Neighbor + 2-opt pour les meilleures routes
- ✅ **Cartographie interactive** : Visualisation en temps réel sur OpenStreetMap
- ✅ **Calcul de distance** : Distance totale de la tournée
- ✅ **Ordre optimisé** : Ordre automatique des livraisons

## 📋 Structure du Projet

```
gps/
├── server/                 # Backend Node.js/Express
│   ├── index.js           # Serveur principal
│   └── utils/
│       ├── routeOptimizer.js  # Algorithme d'optimisation
│       └── distance.js         # Calcul de distances
├── client/                 # Frontend React
│   ├── public/
│   │   └── index.html     # HTML principal
│   ├── src/
│   │   ├── App.js         # Composant principal
│   │   ├── App.css        # Styles
│   │   ├── index.js       # Point d'entrée React
│   │   └── components/
│   │       ├── AddressForm.js       # Formulaire d'adresses
│   │       ├── MapComponent.js      # Carte Leaflet
│   │       └── RouteResults.js      # Résultats
│   └── package.json
└── package.json            # Dépendances root
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (v14+)
- npm

### Installation

1. **Clonez ou créez le projet**
```bash
cd gps
```

2. **Installez les dépendances du serveur**
```bash
npm install
```

3. **Installez les dépendances du client**
```bash
cd client
npm install
cd ..
```

4. **Démarrez l'application**
```bash
npm run dev
```

Cela lancera :
- **Serveur backend** : http://localhost:5000
- **Frontend React** : http://localhost:3000

## 📖 Comment Utiliser

1. **Entrez une adresse** dans le champ de texte
2. **Cliquez sur "Ajouter"** pour l'ajouter à la liste
3. **Répétez** pour ajouter toutes vos adresses de livraison
4. **Cliquez sur "Optimiser la route"** pour calculer l'ordre optimal
5. **Consultez les résultats** : 
   - Ordre des livraisons sur la carte
   - Distance totale
   - Liste optimisée des adresses

## 🧠 Algorithme d'Optimisation

L'application utilise une combinaison d'algorithmes pour trouver la meilleure tournée :

1. **Nearest Neighbor** : Construction d'une route initiale en se connectant toujours au point le plus proche
2. **2-opt** : Amélioration itérative en inversant les segments de la route

Ces algorithmes offrent un bon équilibre entre :
- **Rapidité de calcul** : Idéal pour les tournées de 20-200 points
- **Qualité de solution** : Génère des routes pratiquement optimales

## 🗺️ Cartographie

- **Fournisseur** : OpenStreetMap (gratuit, pas de clé API requise)
- **Bibliothèque** : Leaflet
- **Géolocalisation** : Nominatim API (OpenStreetMap)

## 📊 API Endpoints

### Optimiser une tournée
```bash
POST /api/optimize-route
Content-Type: application/json

{
  "addresses": [
    "10 rue de la Paix, Paris",
    "42 boulevard Champs, Paris",
    "5 avenue Montaigne, Paris"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "optimizedRoute": [
    {
      "address": "10 rue de la Paix, Paris",
      "lat": 48.8566,
      "lng": 2.3522
    },
    ...
  ],
  "totalDistance": 12.5,
  "waypoints": 3
}
```

### Géolocaliser une adresse
```bash
POST /api/geocode
Content-Type: application/json

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

## 🎨 Personnalisation

### Modifier les couleurs
Éditez `client/src/App.css` pour changer les couleurs de la marque.

### Modifier l'algorithme
Éditez `server/utils/routeOptimizer.js` pour ajuster la stratégie d'optimisation.

### Changer la cartographie
Pour utiliser Google Maps ou Mapbox, installez leur SDK et modifiez `MapComponent.js`.

## 🔧 Dépannage

### Le serveur ne se lance pas
```bash
# Vérifiez que le port 5000 est libre
netstat -ano | findstr :5000
```

### Les adresses ne sont pas reconnues
- Vérifiez l'orthographe
- Incluez la ville/région
- Essayez un format plus spécifique (code postal, etc.)

### La carte ne s'affiche pas
- Vérifiez votre connexion Internet (OpenStreetMap en a besoin)
- Vérifiez la console du navigateur pour les erreurs

## 📦 Technologies Utilisées

- **Frontend** : React 18
- **Backend** : Node.js, Express
- **Cartographie** : Leaflet, OpenStreetMap
- **Géolocalisation** : Nominatim (OpenStreetMap)
- **Optimisation** : Algorithmes personnalisés (Nearest Neighbor + 2-opt)

## 🚀 Améliorations Futures

- [ ] Support des véhicules multiples
- [ ] Contraintes de temps (fenêtres de livraison)
- [ ] Capacité des véhicules
- [ ] Géométrie réelle des routes (OSRM integration)
- [ ] Sauvegarde des tournées
- [ ] Partage des routes avec les chauffeurs
- [ ] Suivi en temps réel (GPS du véhicule)
- [ ] Historique et statistiques

## 📄 Licence

MIT

## 👨‍💻 Auteur

GPS Livraison - Optimiseur de tournées pour livreurs

---

**Besoin d'aide ?** Consultez la documentation ou créez une issue !
