#!/bin/bash
# Script de démarrage pour développement

echo "🚀 GPS Livraison - Script de démarrage"
echo "========================================"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier Node.js
echo -e "${BLUE}📦 Vérification de Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installez-le depuis https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version) détecté${NC}"

# Installer les dépendances
echo -e "${BLUE}📦 Installation des dépendances...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Serveur..."
    npm install
    echo "Client..."
    cd client
    npm install
    cd ..
else
    echo -e "${GREEN}✓ Dépendances déjà installées${NC}"
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Création du fichier .env...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env créé${NC}"
fi

# Démarrer
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Tout est prêt !${NC}"
echo -e "${BLUE}🚀 Démarrage...${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo ""

npm run dev
