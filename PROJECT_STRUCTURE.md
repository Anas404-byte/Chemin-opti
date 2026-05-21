# 📂 Structure Complète du Projet

```
gps/
│
├── 📄 Configuration & Documentation
│   ├── package.json                # Dépendances root et scripts
│   ├── .env                        # Variables d'environnement (local)
│   ├── .env.example                # Modèle .env
│   ├── .gitignore                  # Fichiers à ignorer
│   │
│   ├── 📖 Documentation
│   ├── README.md                   # 📖 Documentation principale
│   ├── QUICKSTART.md               # 🚀 Démarrage rapide
│   ├── ARCHITECTURE.md             # 🏗️ Architecture complète
│   ├── ADVANCED.md                 # 🔬 Fonctionnalités avancées
│   ├── TROUBLESHOOTING.md          # 🐛 Dépannage & FAQ
│   │
│   └── 🚀 Scripts
│       ├── start.sh                # Script démarrage Linux/Mac
│       └── start.bat               # Script démarrage Windows
│
├── 📦 Backend (server/)
│   │
│   ├── package.json                # Dépendances Node.js
│   │
│   ├── index.js                    # 🎯 Serveur Express principal
│   │                               # - Routes API
│   │                               # - Middleware
│   │                               # - Démarrage serveur
│   │
│   └── utils/                      # Modules utilitaires
│       ├── routeOptimizer.js       # ⭐ Algorithme d'optimisation
│       │                           # - Nearest Neighbor
│       │                           # - 2-opt optimization
│       │                           # - Géolocalisation (Nominatim)
│       │
│       └── distance.js             # Calcul de distances
│                                   # - Haversine formula
│
├── 🎨 Frontend (client/)
│   │
│   ├── package.json                # Dépendances React
│   │
│   ├── public/
│   │   └── index.html              # 🌐 HTML principal
│   │                               # - Point d'entrée
│   │                               # - Métadonnées
│   │
│   └── src/
│       ├── index.js                # Point d'entrée React
│       ├── index.css               # Styles globaux
│       │
│       ├── App.js                  # 🎯 Composant principal
│       │                           # - Gestion d'état
│       │                           # - Appels API
│       │                           # - Orchestration
│       │
│       ├── App.css                 # Styles principaux
│       │                           # - Layout flexbox
│       │                           # - Responsive design
│       │                           # - Thème
│       │
│       └── components/             # Composants réutilisables
│           │
│           ├── AddressForm.js      # 📝 Formulaire d'entrée
│           │                       # - Ajout/suppression adresses
│           │                       # - Liste des adresses
│           │                       # - Numérotation
│           │
│           ├── MapComponent.js     # 🗺️ Cartographie Leaflet
│           │                       # - Initialisation map
│           │                       # - Affichage marqueurs
│           │                       # - Traçage de route
│           │                       # - Zoom automatique
│           │
│           └── RouteResults.js     # 📊 Affichage résultats
│                                   # - Distance totale
│                                   # - Nombre de points
│                                   # - Ordre optimisé
│
└── 📊 Structure Complète

```

## 📋 Récapitulatif des Fichiers

### Configuration
| Fichier | Rôle |
|---------|------|
| `package.json` | Dépendances et scripts npm |
| `.env` | Variables d'environnement locale |
| `.env.example` | Modèle pour .env |
| `.gitignore` | Fichiers à ignorer par Git |

### Documentation
| Fichier | Contenu |
|---------|---------|
| `README.md` | Guide complet et introduction |
| `QUICKSTART.md` | Instructions rapides de démarrage |
| `ARCHITECTURE.md` | Explication détaillée de l'architecture |
| `ADVANCED.md` | Fonctionnalités avancées et extensions |
| `TROUBLESHOOTING.md` | Dépannage et FAQ |

### Backend
| Fichier | Responsabilité |
|---------|-----------------|
| `server/index.js` | Serveur Express et routes API |
| `server/utils/routeOptimizer.js` | Algorithmes d'optimisation |
| `server/utils/distance.js` | Calcul de distances géométriques |

### Frontend React
| Fichier | Rôle |
|---------|------|
| `client/public/index.html` | HTML principal |
| `client/src/index.js` | Entrée React |
| `client/src/App.js` | Composant racine |
| `client/src/App.css` | Styles principaux |
| `client/src/components/AddressForm.js` | Formulaire |
| `client/src/components/MapComponent.js` | Carte |
| `client/src/components/RouteResults.js` | Résultats |

## 🔄 Flux de Données

```
┌─────────────────────────────────────────────┐
│ Interface Utilisateur (React)               │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ App.js (État principal)              │   │
│ │ - addresses: []                      │   │
│ │ - optimizedRoute: null               │   │
│ └─────────────────────────────────────┘   │
│       │         │         │                │
│       ▼         ▼         ▼                │
│  AddressForm  MapComponent  RouteResults   │
└─────────────────────────────────────────────┘
          │                      ▲
          │ POST /api/optimize   │
          │ {addresses}          │ Response
          │                      │
          ▼                      │
┌─────────────────────────────────────────────┐
│ Serveur (Node.js/Express)                   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ index.js (Serveur)                   │   │
│ │ - Parser requêtes                    │   │
│ │ - Valider adresses                   │   │
│ └─────────────────────────────────────┘   │
│       │                                    │
│       ▼                                    │
│ ┌─────────────────────────────────────┐   │
│ │ routeOptimizer.js                    │   │
│ │ 1. Géolocaliser (Nominatim API)     │   │
│ │ 2. Nearest Neighbor                 │   │
│ │ 3. 2-opt Optimization               │   │
│ │ 4. Calculer distance (distance.js)  │   │
│ └─────────────────────────────────────┘   │
│       │                                    │
│       ▼                                    │
│ ┌─────────────────────────────────────┐   │
│ │ Réponse JSON                         │   │
│ │ {                                    │   │
│ │   optimizedRoute: [],                │   │
│ │   totalDistance: 12.5,               │   │
│ │   waypoints: 3                       │   │
│ │ }                                    │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 🎯 Points d'Entrée

### Frontend
- **URL:** http://localhost:3000
- **Fichier:** `client/public/index.html`
- **Composant:** `client/src/App.js`

### Backend
- **URL:** http://localhost:5000
- **Serveur:** `server/index.js`
- **Routes principales:**
  - `POST /api/optimize-route` - Optimiser une tournée
  - `POST /api/geocode` - Géolocaliser une adresse
  - `GET /` - Test serveur

## 📦 Dépendances Principales

### Backend
```json
{
  "express": "Framework web",
  "cors": "Cross-Origin Requests",
  "body-parser": "Parser JSON",
  "axios": "Requêtes HTTP",
  "dotenv": "Variables d'environnement"
}
```

### Frontend
```json
{
  "react": "Library UI",
  "leaflet": "Cartographie",
  "axios": "Requêtes HTTP"
}
```

## 🚀 Commandes Disponibles

```bash
# Démarrer tout (frontend + backend)
npm run dev

# Démarrer uniquement le serveur
npm run server

# Démarrer uniquement React
npm run client

# Construire pour production
npm run build

# Scripts disponibles dans client/:
cd client
npm start        # Démarrer en développement
npm run build    # Construire pour production
npm test         # Lancer les tests
```

## 📊 Tailles Fichiers

| Dossier | Fichiers | Taille approx |
|---------|----------|--------------|
| `node_modules/` | 1000+ | ~500 MB |
| `server/` | 5 | ~15 KB |
| `client/` | 15 | ~50 KB |
| **Total (code)** | **20** | **~65 KB** |

## ⚡ Performance

| Action | Temps |
|--------|-------|
| Géolocaliser 1 adresse | ~500ms |
| Optimiser 10 adresses | ~1s |
| Optimiser 50 adresses | ~5s |
| Afficher carte | ~200ms |

## 🔒 Fichiers Ignorés

```
node_modules/        # Dépendances
.env                 # Variables sensibles
dist/, build/        # Builds
.DS_Store            # Fichiers système
*.log                # Logs
```

---

✅ Structure complète et cohérente pour démarrer et scaler !
