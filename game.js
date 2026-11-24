/* ============================================================
   MYSTERIA — moteur du jeu
   Le moteur ne contient AUCUN texte d'enquête : tout le contenu
   (décor, objets, dialogues, énigmes) vit dans scenes/*.js.
   ============================================================ */
const $ = (id) => document.getElementById(id);
const SAVE_KEY = "mysteria-save-v3";
const OLD_SAVE_KEY = "mysteria-save-v2";
const TOTAL_CHAPTERS = 5;
const DEFAULT_HINT = "EXAMINE LES ÉLÉMENTS DE LA PIÈCE";

const scenes = (window.MYSTERIA_SCENES || []).slice().sort((a, b) => a.order - b.order);
if (!scenes.length) throw new Error("Aucune scène chargée : vérifie les balises <script> dans index.html.");
const itemInfo = Object.assign({}, ...scenes.map((s) => s.items || {}));

const pad = (n) => String(n).padStart(2, "0");
function show(el, visible) { el.hidden = !visible; el.style.display = visible ? "" : "none"; }

/* ---------- État & sauvegarde ---------- */
function freshState() {
  return { sceneId: scenes[0].id, found: [], flags: {}, completed: [], sound: false, selectedItem: null };
}
const state = freshState();

// Ancienne sauvegarde (v2) : on la convertit pour ne pas perdre la progression.
function migrateV2(old) {
  const flags = {};
  ["clueRead", "drawerOpened", "witnessAsked", "boxCodeSolved", "boxOpened"].forEach((n) => { if (old[n]) flags[n] = true; });
  return {
    sceneId: scenes[0].id, found: old.found, flags,
    completed: old.boxOpened ? [scenes[0].id] : [],
    sound: !!old.sound, selectedItem: old.selectedItem || null
  };
}
function readSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (raw && Array.isArray(raw.found)) return raw;
    const old = JSON.parse(localStorage.getItem(OLD_SAVE_KEY) || "null");
    if (old && Array.isArray(old.found)) return migrateV2(old);
  } catch (_) {}
  return null;
}
function hasSave() {
  try { return !!(localStorage.getItem(SAVE_KEY) || localStorage.getItem(OLD_SAVE_KEY)); } catch (_) { return false; }
}
function load() {
  const saved = readSave();
  if (saved) {
    Object.assign(state, saved);
    if (!scenes.some((s) => s.id === state.sceneId)) state.sceneId = scenes[0].id;
  }
}
function save() {
  if (isComplete() && !state.completed.includes(state.sceneId)) state.completed.push(state.sceneId);
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (error) { toast("Sauvegarde locale indisponible."); }
  updateInventory();
  updateHint();
  updateNext();
}

/* ---------- Scène courante ---------- */
function currentScene() { return scenes.find((s) => s.id === state.sceneId) || scenes[0]; }
function isComplete() { const s = currentScene(); return !!(s.completeFlag && state.flags[s.completeFlag]); }

function renderScene() {
  const s = currentScene();
  $("case-number").textContent = "DOSSIER N° " + s.caseNumber;
  $("case-title").textContent = s.title;
  $("chapter-pill").textContent = pad(s.order) + " / " + pad(TOTAL_CHAPTERS);
  $("scene-city").textContent = "📍 " + s.city;
  $("scene-label").textContent = s.place;
  $("dialogue-button").textContent = s.dialogueLabel || "💬 Interroger";
  show($("dialogue-button"), typeof s.interrogate === "function");

  const sc = $("scene");
  sc.className = "scene " + s.sceneClass;
  sc.setAttribute("aria-label", s.ariaLabel || s.title);
  sc.innerHTML = s.decorHTML
    + s.hotspots.map((h) => '<button class="hotspot ' + h.className + '" data-target="' + h.target + '" aria-label="' + h.label + '"'
      + (h.style ? ' style="' + h.style + '"' : "") + "><span>+</span></button>").join("")
    + '<div class="scene-vignette"></div>';
  sc.querySelectorAll(".hotspot").forEach((b) => b.addEventListener("click", () => examine(b.dataset.target)));

  updateInventory();
  updateHint();
  updateNext();

  // Texte d'arrivée optionnel (scene.intro), affiché une seule fois par scène.
  if (s.intro && !state.flags["intro:" + s.id]) {
    state.flags["intro:" + s.id] = true;
    save();
    openModal(s.intro.title, s.intro.text, [{ label: s.intro.button || "Commencer l'enquête", action: () => {} }], s.intro.eyebrow || "ARRIVÉE");
  }
}

/* ---------- Interface ---------- */
function updateInventory() {
  const box = $("inventory-items");
  box.innerHTML = "";
  if (!state.found.length) {
    box.innerHTML = '<span class="empty-inventory">Les objets trouvés apparaîtront ici.</span>';
  }
  state.found.forEach((id) => {
    const item = itemInfo[id];
    if (!item) return;
    const el = document.createElement("button");
    el.type = "button";
    el.className = "inventory-item" + (state.selectedItem === id ? " selected" : "");
    el.title = item.name + " — toucher pour examiner";
    el.setAttribute("aria-label", item.name);
    el.setAttribute("aria-pressed", state.selectedItem === id ? "true" : "false");
    el.textContent = item.icon;
    el.addEventListener("click", () => {
      state.selectedItem = state.selectedItem === id ? null : id;
      updateInventory();
      updateHint();
      if (state.selectedItem) toast(item.description);
    });
    box.appendChild(el);
  });
  $("inventory-count").textContent = state.found.length + (state.found.length > 1 ? " OBJETS" : " OBJET");
}
function updateHint() {
  const item = state.selectedItem && itemInfo[state.selectedItem];
  $("scene-hint").textContent = item
    ? item.name.toUpperCase() + " — sélectionné"
    : (isComplete() ? "DOSSIER RÉSOLU — PASSE À L'ENQUÊTE SUIVANTE" : DEFAULT_HINT);
}
function updateNext() { show($("next-scene-button"), isComplete()); }

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2500);
}
function openModal(title, text, options = [], eyebrow = "OBSERVATION") {
  $("modal-title").textContent = title;
  $("modal-text").textContent = text;
  $("modal-eyebrow").textContent = eyebrow;
  const box = $("modal-options");
  box.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "modal-option";
    button.textContent = option.label;
    button.addEventListener("click", () => { closeModal(); option.action(); });
    box.appendChild(button);
  });
  $("dialogue-modal").hidden = false;
}
function closeModal() { $("dialogue-modal").hidden = true; }

/* ---------- API donnée aux scènes ---------- */
function addItem(id) {
  if (!itemInfo[id]) return;
  if (!state.found.includes(id)) {
    state.found.push(id);
    save();
    toast(itemInfo[id].name + " ajouté à l'inventaire.");
  }
}
function examine(target) { currentScene().examine(target, api); }
function showJournal() {
  const lines = currentScene().journal(api);
  openModal("Carnet d'enquête", lines.join("\n"), [{ label: "Fermer le carnet", action: () => {} }], "NOTES DE L'INSPECTEUR");
}
const api = {
  has: (id) => state.found.includes(id),
  flag: (name) => !!state.flags[name],
  setFlag: (name, value = true) => { state.flags[name] = value; save(); },
  addItem,
  clearSelection: () => { state.selectedItem = null; },
  openModal, toast, examine, showJournal
};

/* ---------- Navigation ---------- */
function refreshHome() {
  const saved = hasSave();
  show($("start-button"), !saved);
  show($("continue-button"), saved);
  show($("new-game-button"), saved);
}
function startGame() {
  $("home-screen").hidden = true;
  $("game-screen").hidden = false;
  renderScene();
}
function goHome() {
  $("game-screen").hidden = true;
  $("home-screen").hidden = false;
  refreshHome();
}
function newGame() {
  try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(OLD_SAVE_KEY); } catch (_) {}
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, freshState());
  $("sound-toggle").textContent = "♪";
  startGame();
}
function confirmNewGame() {
  openModal("Nouvelle partie",
    "Ta progression actuelle sera effacée. Tu veux vraiment recommencer l'enquête depuis le début ?",
    [
      { label: "Oui, recommencer", action: newGame },
      { label: "Non, garder ma partie", action: () => {} }
    ], "ATTENTION");
}
function goNext() {
  const idx = scenes.findIndex((s) => s.id === state.sceneId);
  const next = scenes[idx + 1];
  if (next) {
    state.sceneId = next.id;
    state.selectedItem = null;
    save();
    renderScene();
    return;
  }
  openModal("Dossier " + currentScene().caseNumber + " résolu",
    "Tu as résolu l'affaire de " + currentScene().city + ". Les prochaines villes arrivent bientôt : l'enquête continue.",
    [{ label: "Retour à l'accueil", action: goHome }], "À SUIVRE");
}

/* ---------- Événements ---------- */
$("start-button").addEventListener("click", startGame);
$("continue-button").addEventListener("click", startGame);
$("new-game-button").addEventListener("click", confirmNewGame);
$("next-scene-button").addEventListener("click", goNext);
$("back-home").addEventListener("click", goHome);
$("journal-button").addEventListener("click", showJournal);
$("dialogue-button").addEventListener("click", () => currentScene().interrogate(api));
$("sound-toggle").addEventListener("click", () => {
  state.sound = !state.sound;
  $("sound-toggle").textContent = state.sound ? "♫" : "♪";
  toast(state.sound ? "Le son sera disponible dans une prochaine version." : "Son désactivé.");
});
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeModal));
$("dialogue-modal").addEventListener("click", (event) => {
  if (event.target.id === "dialogue-modal") closeModal();
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });

/* ---------- Démarrage ---------- */
load();
$("sound-toggle").textContent = state.sound ? "♫" : "♪";
refreshHome();
