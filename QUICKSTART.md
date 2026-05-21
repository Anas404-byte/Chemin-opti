# 🚀 Guide de Démarrage Rapide

## Étape 1 : Installation des dépendances

Ouvrez le terminal dans le dossier `gps` et exécutez :

```bash
npm install
cd client
npm install
cd ..
```

## Étape 2 : Démarrer l'application

Dans le dossier `gps`, exécutez :

```bash
npm run dev
```

Cela lancera automatiquement :
- ✅ Serveur backend sur http://localhost:5000
- ✅ Application React sur http://localhost:3000

## Étape 3 : Utiliser l'application

1. Ouvrez http://localhost:3000 dans votre navigateur
2. Entrez vos adresses de livraison
3. Cliquez sur "Optimiser la route"
4. Consultez le chemin optimal sur la carte !

## 📝 Exemples d'adresses à essayer

```
1 rue de la Paix, 75000 Paris
10 avenue Montaigne, 75008 Paris
42 boulevard Champs-Élysées, 75008 Paris
5 place de la Concorde, 75008 Paris
Notre-Dame, Paris
```

## 🔧 Si ça ne marche pas

### Le port 5000 est déjà utilisé ?
```bash
# Sur Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
# Puis changez SERVER_PORT dans .env
```

### React ne démarre pas ?
```bash
# Essayez de supprimer les dépendances et réinstallez
cd client
rm -r node_modules package-lock.json
npm install
npm start
```

### Les adresses ne sont pas trouvées ?
- Assurez-vous d'avoir une connexion Internet
- Essayez un format plus complet : numéro, rue, code postal, ville
- Exemple : "42 boulevard Saint-Germain, 75005 Paris"

## 🎓 Apprendre l'algorithme

L'application optimise les routes en utilisant :

1. **Nearest Neighbor** : Part du premier point et se connecte toujours au point le plus proche
2. **2-opt** : Améliore la route en inversant les segments croisés

Cela génère de très bonnes routes en quelques millisecondes !

## 📚 Fichiers importants

- `server/utils/routeOptimizer.js` : L'algorithme d'optimisation
- `client/src/components/MapComponent.js` : La cartographie Leaflet
- `client/src/App.js` : L'interface principale

## 🆘 Besoin d'aide ?

Consultez le README.md pour la documentation complète !
