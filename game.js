const $ = (id) => document.getElementById(id);
const SAVE_KEY = "mysteria-save-v1";
const state = { found: [], clueRead: false, drawerOpened: false, witnessAsked: false, codeSolved: false, sound: false };
const itemInfo = {
  key: { icon: "🗝️", name: "Petite clé en cuivre" },
  note: { icon: "📜", name: "Fragment de note" },
  photo: { icon: "🖼️", name: "Photographie ancienne" }
};
function save() { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); updateInventory(); }
function load() {
  try { const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); if (saved) Object.assign(state, saved); } catch (_) {}
  updateInventory();
}
function updateInventory() {
  const box = $("inventory-items");
  box.innerHTML = "";
  if (!state.found.length) box.innerHTML = '<span class="empty-inventory">Les objets trouvés apparaîtront ici.</span>';
  state.found.forEach((id) => {
    const item = itemInfo[id]; const el = document.createElement("div");
    el.className = "inventory-item"; el.title = item.name; el.textContent = item.icon; box.appendChild(el);
  });
  $("inventory-count").textContent = state.found.length + (state.found.length > 1 ? " OBJETS" : " OBJET");
}
function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2300);
}
function openModal(title, text, options = [], eyebrow = "OBSERVATION") {
  $("modal-title").textContent = title; $("modal-text").textContent = text; $("modal-eyebrow").textContent = eyebrow;
  const box = $("modal-options"); box.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button"); button.className = "modal-option"; button.textContent = option.label;
    button.addEventListener("click", () => { closeModal(); option.action(); }); box.appendChild(button);
  });
  $("dialogue-modal").hidden = false;
}
function closeModal() { $("dialogue-modal").hidden = true; }
function addItem(id) {
  if (!state.found.includes(id)) { state.found.push(id); save(); toast(itemInfo[id].name + " ajouté à l'inventaire"); }
}
function examine(target) {
  if (target === "wall") {
    if (!state.clueRead) {
      state.clueRead = true; save();
      openModal("Les symboles sur le mur", "Des signes ont été tracés à la hâte : un triangle, un cercle, quatre barres et les chiffres VII. Sous les symboles, une phrase presque effacée : « La date ouvre ce que la mémoire a fermé. »", [
        { label: "Noter les symboles dans le carnet", action: () => toast("Indices enregistrés dans le carnet.") },
        { label: "Examiner la table de chevet", action: () => examine("drawer") }
      ]);
    } else openModal("Les symboles", "Le message semble faire référence à une date. Les quatre barres pourraient représenter un chiffre.");
  }
  if (target === "drawer") {
    if (!state.drawerOpened) {
      state.drawerOpened = true; addItem("key");
      openModal("La table de chevet", "Le tiroir était coincé. À l'intérieur, tu trouves une petite clé en cuivre et un papier plié portant deux lettres : « A.K. ».", [
        { label: "Garder la clé et le papier", action: () => { addItem("note"); toast("Deux indices ajoutés à l'inventaire."); } },
        { label: "Regarder sous le lit", action: () => examine("bed") }
      ]);
    } else openModal("Le tiroir", "Il est vide à présent. Tu as récupéré son contenu.");
  }
  if (target === "bed") {
    if (!state.found.includes("photo")) {
      addItem("photo");
      openModal("Sous le lit", "Une photographie ancienne était glissée sous le sommier. On y distingue la façade du bâtiment et, au dos, une date : 14.08.1998.", [
        { label: "Mémoriser la date", action: () => toast("Date enregistrée : 14.08.1998") }
      ]);
    } else openModal("Sous le lit", "Tu as déjà récupéré la photographie. La date inscrite au dos pourrait être importante.");
  }
}
function startGame() { $("home-screen").hidden = true; $("game-screen").hidden = false; }
function showJournal() {
  const lines = ["Enquête : La chambre aux symboles", "Lieu : Centre médical Saint-Michel, Porto-Novo", "Objectif : comprendre les signes laissés par le témoin."];
  if (state.clueRead) lines.push("• Mur : « La date ouvre ce que la mémoire a fermé. »");
  if (state.found.includes("note")) lines.push("• Papier : initiales A.K.");
  if (state.found.includes("photo")) lines.push("• Photographie : date du 14.08.1998.");
  openModal("Carnet d'enquête", lines.join("\n"), [{ label: "Fermer le carnet", action: () => {} }], "NOTES DE L'INSPECTEUR");
}
function interrogate() {
  if (!state.witnessAsked) {
    state.witnessAsked = true; save();
    openModal("Le témoin", "L'homme garde les yeux fixés sur le mur. Il murmure : « Ils ont effacé le nom… mais pas la date. Demandez à Adélaïde. Elle était là cette nuit-là. »", [
      { label: "Qui est Adélaïde ?", action: () => openModal("Le témoin", "« L'ancienne archiviste. Elle connaît l'histoire de cette chambre. Mais ne prononcez pas le nom Kpassa devant elle. »", [{ label: "Noter ce nom", action: () => toast("Nom ajouté au carnet : Kpassa.") }], "DÉPOSITION") },
      { label: "Le laisser se reposer", action: () => toast("Le témoin se replonge dans le silence.") }
    ], "DÉPOSITION");
  } else {
    openModal("Le témoin", "« La date… retrouvez Adélaïde. Elle sait pourquoi ce dossier a disparu. »", [{ label: "Terminer l'entretien", action: () => {} }], "DÉPOSITION");
  }
}
$("start-button").addEventListener("click", startGame);
$("continue-button").addEventListener("click", startGame);
$("back-home").addEventListener("click", () => { $("game-screen").hidden = true; $("home-screen").hidden = false; });
$("journal-button").addEventListener("click", showJournal);
$("dialogue-button").addEventListener("click", interrogate);
$("sound-toggle").addEventListener("click", () => { state.sound = !state.sound; $("sound-toggle").textContent = state.sound ? "♫" : "♪"; toast(state.sound ? "Ambiance sonore activée prochainement." : "Son désactivé."); });
document.querySelectorAll(".hotspot").forEach((button) => button.addEventListener("click", () => examine(button.dataset.target)));
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeModal));
$("dialogue-modal").addEventListener("click", (event) => { if (event.target.id === "dialogue-modal") closeModal(); });
load();
if (localStorage.getItem(SAVE_KEY)) $("continue-button").hidden = false;
