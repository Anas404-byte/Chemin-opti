# 🐛 Guide de Dépannage et FAQ

## 🔴 Erreurs courantes

### 1. "Cannot GET /"
**Symptôme:** Erreur 404 sur http://localhost:3000

**Solutions:**
- Assurez-vous que React a démarré : `npm run client`
- Vérifiez qu'il n'y a pas d'erreurs dans la console de React
- Essayez de redémarrer : Ctrl+C et `npm run dev`

### 2. "Failed to fetch" ou "CORS error"
**Symptôme:** Erreur dans la console du navigateur

**Solutions:**
```javascript
// Vérifiez que le serveur tourne
// http://localhost:5000 devrait répondre

// Si vous changez le port du serveur:
// 1. Éditez package.json (server)
// 2. Éditez client/package.json (proxy)
```

### 3. "Address not found"
**Symptôme:** Toutes les adresses retournent cette erreur

**Solutions:**
- Vérifiez votre connexion Internet
- Essayez une adresse bien spécifique : "10 rue de la Paix, 75000 Paris"
- Attendez quelques secondes (rate limit Nominatim)
- Vérifiez les logs du serveur

**Nominatim Rate Limit:**
```
Limite: 1 requête/seconde
Solution: Ajouter un délai entre requêtes
```

### 4. "Port 5000 already in use"
**Symptôme:** Erreur au démarrage du serveur

**Solutions sur Windows:**
```powershell
# Trouver le processus
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Tuer le processus
Stop-Process -Id PID -Force

# Ou utiliser un autre port dans .env:
SERVER_PORT=5001
```

### 5. "npm: command not found"
**Symptôme:** npm ne fonctionne pas

**Solutions:**
- Installez Node.js depuis https://nodejs.org
- Vérifiez l'installation : `node --version`
- Redémarrez le terminal

### 6. "Cannot find module 'express'"
**Symptôme:** Le serveur ne démarre pas

**Solutions:**
```bash
# Réinstallez les dépendances
npm install

# Vérifiez que node_modules existe
ls node_modules

# Sinon, supprimez et réinstallez
rm -r node_modules package-lock.json
npm install
```

## ❓ Questions Fréquentes

### Q1 : Comment améliorer la qualité des routes ?
**A:** 
1. Augmentez `maxIterations` dans `routeOptimizer.js` (plus lent)
2. Intégrez OSRM pour vraies distances routières
3. Utilisez des algorithmes plus avancés (Lin-Kernighan)

### Q2 : Peut-on gérer plusieurs véhicules ?
**A:** Pas pour l'instant. Pour ajouter cette fonctionnalité :
1. Créer une table `vehicles` en base de données
2. Implémenter CVRP (Capacitated Vehicle Routing Problem)
3. Partitionner les adresses par véhicule

### Q3 : Comment sauvegarder les tournées ?
**A:** À ajouter :
1. Base de données (MongoDB, PostgreSQL)
2. Routes API de CRUD
3. Authentification utilisateur

### Q4 : Peut-on utiliser Google Maps au lieu d'OpenStreetMap ?
**A:** Oui :
```javascript
// Remplacer Leaflet par Google Maps API
// 1. npm install @googlemaps/js-api-loader
// 2. Modifier MapComponent.js
// 3. Utiliser Google Geocoding API à la place de Nominatim
```

### Q5 : L'application fonctionne hors ligne ?
**A:** Non pour le moment. OpenStreetMap et Nominatim nécessitent Internet.

**Pour offline :**
1. Télécharger tiles OpenStreetMap localement
2. Utiliser base de données géolocalisation local
3. Utiliser QGIS ou Leaflet offline plugin

### Q6 : Combien de points peut-on optimiser ?
**A:**
- ✅ 10-20 points : < 1 seconde
- ✅ 20-50 points : 1-3 secondes
- ⚠️ 50-100 points : 5-15 secondes
- ❌ 100+ points : peut être trop lent

**Solutions pour gros volumes :**
- Limiter 2-opt à 20 itérations
- Utiliser clustering (grouper par région)
- Implémenter LKH ou Concorde

### Q7 : Comment changer les couleurs/apparence ?
**A:** Éditez `client/src/App.css`
```css
/* Couleur principale */
.btn-primary {
  background: #4CAF50;  /* Changez cette couleur */
}
```

### Q8 : Puis-je héberger cela en ligne ?
**A:** Oui, options :
- Vercel (frontend) + Railway/Render (backend)
- Heroku (full stack)
- AWS, Google Cloud, Azure

## 📋 Checklist de débogage

Avant de demander de l'aide :

- [ ] Node.js est installé ? (`node --version`)
- [ ] npm est à jour ? (`npm --version`)
- [ ] Dépendances installées ? (`npm install`)
- [ ] Pas d'erreurs dans les logs serveur ?
- [ ] Pas d'erreurs dans la console du navigateur (F12) ?
- [ ] Le serveur répond ? (http://localhost:5000)
- [ ] L'application React se charge ? (http://localhost:3000)
- [ ] Vous avez Internet ? (OpenStreetMap/Nominatim nécessitent)
- [ ] Les ports ne sont pas utilisés ? (`netstat -ano | findstr 3000`)
- [ ] Vous avez essayé de redémarrer ?

## 🧪 Tests Simples

### Test 1 : Serveur fonctionne ?
```bash
# Terminal 1
npm run server

# Terminal 2
curl http://localhost:5000
# Vous devez voir: {"message":"Serveur GPS Livraison actif"}
```

### Test 2 : Géolocalisation fonctionne ?
```bash
curl -X POST http://localhost:5000/api/geocode \
  -H "Content-Type: application/json" \
  -d '{"address":"Paris"}'
# Vous devez voir les coordonnées
```

### Test 3 : Optimisation fonctionne ?
```bash
curl -X POST http://localhost:5000/api/optimize-route \
  -H "Content-Type: application/json" \
  -d '{"addresses":["Paris","Lyon","Marseille"]}'
# Vous devez voir la route optimisée
```

### Test 4 : Interface React fonctionne ?
- Ouvrez http://localhost:3000
- Vous devez voir le formulaire et la carte

## 🔍 Inspecter les logs

### Logs Serveur
```bash
# Voir les logs en temps réel
npm run server

# Vous verrez des messages comme:
# "Serveur lancé sur http://localhost:5000"
# "POST /api/optimize-route 200"
```

### Logs Frontend
```javascript
// Dans le navigateur:
// F12 → Console → Vous verrez les erreurs/logs
// F12 → Network → Vous verrez les requêtes API
```

### Logs détaillés
Ajouter dans `server/index.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

## 📞 Obtenir de l'aide

Si vous avez encore des problèmes :

1. **Vérifiez les logs** : Lisez les messages d'erreur complètement
2. **Consultez ARCHITECTURE.md** : Comprendre le flux
3. **Testez avec curl** : Vérifier l'API directement
4. **Essayez les exemples** : Utilisez des adresses bien connues
5. **Réinstallez** : `npm install` peut sauver

## ✅ Validation

Une fois que tout fonctionne :
- [ ] http://localhost:5000 répond
- [ ] http://localhost:3000 charge
- [ ] Vous pouvez ajouter des adresses
- [ ] Optimisation fonctionne
- [ ] Carte affiche la route
- [ ] Distance s'affiche

Bienvenue dans GPS Livraison ! 🚀
