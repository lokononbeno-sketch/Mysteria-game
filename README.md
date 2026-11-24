# MYSTERIA 🇧🇯
Mysteria évolue vers un jeu d'action-aventure 3D en monde ouvert, avec Porto-Novo comme première ville jouable.

## Lancer le jeu
Publier avec GitHub Pages (Settings → Pages → Deploy from a branch → main → /(root)). Le moteur 3D charge Three.js depuis jsDelivr : connexion internet requise.

## Commandes
- PC : WASD ou flèches pour marcher, E pour prendre/quitter un véhicule, Espace pour sauter.
- Mobile : joystick tactile, bouton Prendre/Sortir, bouton Saut.
- Mini-carte : position du joueur, destination et itinéraire indicatif.

## Prototype 3D
- Quartier fictif inspiré de Porto-Novo : maisons à véranda, façades pastel, toits, marché et palmiers.
- Personnage humain stylisé avec visage, vêtements et animation de marche.
- Piétons animés, motos et voitures.
- Prise en main d'une moto ou d'une voiture.
- Missions avec récompenses en FCFA.
- Caméra à la troisième personne et mini-carte.

## Mode enquête historique
Le mode enquête narratif est conservé dans `enquete.html`. Les fichiers de scènes et son moteur d'origine restent présents.

## Modules 3D
- `monde-ouvert/game.js` : monde, caméra, contrôles et boucle de jeu.
- `monde-ouvert/player.js` : personnage.
- `monde-ouvert/vehicles.js` : véhicules.
- `monde-ouvert/traffic.js` : circulation et piétons.
- `monde-ouvert/missions.js` : objectifs et récompenses.
- `monde-ouvert/minimap.js` : carte.

## Limites du prototype
Les modèles sont provisoires et procéduraux, pas photoréalistes. La carte est un premier quartier fictif inspiré de la ville, pas une reproduction géographique exacte. Les collisions, dialogues, sauvegardes et missions complexes seront ajoutés dans les prochaines versions.