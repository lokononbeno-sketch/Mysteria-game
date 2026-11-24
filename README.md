# MYSTERIA 🇧🇯

Mysteria est un jeu d'action-aventure 3D en monde ouvert. Porto-Novo, au Bénin, est la première ville jouable prévue.

## Lancer le jeu

Ouvrir la page principale `index.html`. Pour une publication web, configurer GitHub Pages sur la branche de déploiement choisie et le dossier `/(root)`. Le moteur 3D charge Three.js depuis jsDelivr : une connexion internet est requise dans cette version.

## Commandes

- PC : WASD ou flèches pour marcher, E pour prendre/quitter un véhicule, Espace pour sauter.
- Mobile : joystick tactile, bouton Prendre/Sortir, bouton Saut.
- Mini-carte : position du joueur, destination et itinéraire indicatif.

## Monde 3D

- Quartier fictif inspiré de Porto-Novo : maisons à véranda, façades pastel, toits, marché et palmiers.
- Personnage humain stylisé avec visage, vêtements et animation de marche.
- Piétons animés, motos et voitures.
- Prise en main d'une moto ou d'une voiture.
- Missions successives avec récompenses en FCFA.
- Caméra à la troisième personne et mini-carte.

## Modules 3D

- `monde-ouvert/game.js` : monde, caméra, contrôles et boucle de jeu.
- `monde-ouvert/player.js` : personnage.
- `monde-ouvert/vehicles.js` : véhicules.
- `monde-ouvert/traffic.js` : circulation et piétons.
- `monde-ouvert/missions.js` : objectifs et récompenses.
- `monde-ouvert/minimap.js` : carte.

## Prototype et limites

Le jeu est en cours de développement. Les modèles sont provisoires et procéduraux, pas photoréalistes. La carte est un premier quartier fictif inspiré de la ville, pas une reproduction géographique exacte. Les collisions avancées, dialogues, sauvegardes, missions complexes et mode hors ligne restent à développer.
