# MYSTERIA 🇧🇯
### Une aventure policière interactive — Made in Benin

MYSTERIA est un jeu d'enquête narratif mobile-first, conçu en format portrait. Son univers s'inspire des jeux d'aventure point-and-click à objets cachés, tout en proposant ses propres personnages, intrigues, dialogues, énigmes et solutions.

## Direction du projet
- Univers visuel et culturel béninois.
- Personnages noirs, ancrés dans la société béninoise.
- Cinq étapes : Porto-Novo, Cotonou, Parakou, Abomey-Calavi et Ouidah.
- Exploration de scènes, objets cachés, inventaire, dialogues, interrogatoires et énigmes.
- Histoires autonomes reliées par une intrigue centrale.

## Technologies
HTML, CSS et JavaScript natifs. La progression du prototype est sauvegardée localement dans le navigateur. Supabase sera envisagé plus tard pour les comptes, la synchronisation et les classements en ligne.

## Lancer le jeu
Ouvrir `index.html` dans un navigateur. Pour publier avec GitHub Pages : Settings → Pages → Deploy from a branch → main → /(root).

## Structure du code
- `game.js` : le moteur (sauvegarde, inventaire, carnet, fenêtres, navigation entre scènes, « Nouvelle partie »). Il ne contient aucun texte d'enquête.
- `scenes/` : **un fichier par scène** (décor, zones cliquables, objets, dialogues, énigmes, carnet).
- `index.html` et `style.css` : l'interface.

### Ajouter une scène
1. Copier `scenes/01-porto-novo.js` en `scenes/02-cotonou.js`.
2. Changer `id`, `order`, `city`, `place`, `title`, les objets, les zones cliquables et la logique.
3. Ajouter `<script src="scenes/02-cotonou.js"></script>` dans `index.html`, avant `game.js`.
4. Quand le drapeau `completeFlag` de la scène est activé, le bouton « Enquête suivante » apparaît tout seul.

## Prototype actuel
Une première scène d'enquête à Porto-Novo (« La chambre aux symboles »). Les illustrations de décor sont provisoires et dessinées en CSS ; elles seront remplacées progressivement par des illustrations originales et documentées de lieux béninois.
