const $ = (id) => document.getElementById(id);
const SAVE_KEY = "mysteria-save-v2";
const state = {
  found: [], clueRead: false, drawerOpened: false, witnessAsked: false,
  boxCodeSolved: false, boxOpened: false, sound: false, selectedItem: null
};
const itemInfo = {
  key: { icon: "🗝️", name: "Petite clé en cuivre", description: "Une clé ancienne, légèrement oxydée." },
  note: { icon: "📜", name: "Fragment de note", description: "Deux initiales écrites à l'encre : A.K." },
  photo: { icon: "🖼️", name: "Photographie ancienne", description: "Au dos : 14.08.1998." },
  dossier: { icon: "📁", name: "Dossier d'archives", description: "Un dossier portant le nom Kpassa." }
};
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (error) { toast("Sauvegarde locale indisponible."); }
  updateInventory();
}
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (saved && Array.isArray(saved.found)) Object.assign(state, saved);
  } catch (_) {}
  updateInventory();
}
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
      if (state.selectedItem) {
        $("scene-hint").textContent = item.name.toUpperCase() + " — sélectionné";
        toast(item.description);
      } else {
        $("scene-hint").textContent = "EXAMINE LES ÉLÉMENTS DE LA PIÈCE";
      }
    });
    box.appendChild(el);
  });
  $("inventory-count").textContent = state.found.length + (state.found.length > 1 ? " OBJETS" : " OBJET");
}
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
function addItem(id) {
  if (!state.found.includes(id)) {
    state.found.push(id);
    save();
    toast(itemInfo[id].name + " ajouté à l'inventaire.");
  }
}
function examine(target) {
  if (target === "wall") {
    state.clueRead = true;
    save();
    openModal("Les symboles sur le mur",
      "Des signes ont été tracés à la hâte : un triangle, un cercle, quatre barres et les chiffres VII. Sous les symboles, une phrase presque effacée : « La date ouvre ce que la mémoire a fermé. »",
      [
        { label: "Noter les symboles dans le carnet", action: () => toast("Les symboles sont consignés dans le carnet.") },
        { label: "Examiner la table de chevet", action: () => examine("drawer") }
      ]);
    return;
  }
  if (target === "drawer") {
    if (!state.drawerOpened) {
      state.drawerOpened = true;
      addItem("key");
      openModal("La table de chevet",
        "Le tiroir était coincé. À l'intérieur, tu trouves une petite clé en cuivre et un papier plié portant deux lettres : « A.K. ».",
        [
          { label: "Récupérer le fragment de note", action: () => { addItem("note"); toast("Les initiales A.K. sont ajoutées au carnet."); } },
          { label: "Regarder sous le lit", action: () => examine("bed") }
        ]);
    } else {
      openModal("Le tiroir", "Il est vide à présent. Tu as récupéré son contenu.");
    }
    return;
  }
  if (target === "bed") {
    if (!state.found.includes("photo")) {
      addItem("photo");
      openModal("Sous le lit",
        "Une photographie ancienne était glissée sous le sommier. On y distingue la façade du bâtiment et, au dos, une date : 14.08.1998.",
        [{ label: "Mémoriser la date", action: () => toast("Date enregistrée dans le carnet : 14.08.1998.") }]);
    } else {
      openModal("La photographie", "Tu as déjà récupéré la photographie. La date inscrite au dos est le 14 août 1998.");
    }
    return;
  }
  if (target === "lockbox") examineLockbox();
}
function examineLockbox() {
  if (state.boxOpened) {
    openModal("Le coffret est vide", "Tu as déjà récupéré le dossier qu'il contenait.");
    return;
  }
  if (!state.found.includes("photo")) {
    openModal("Un coffret verrouillé", "Un petit coffret métallique est fixé sous le rebord du meuble. Un clavier à quatre chiffres protège son contenu. Il te faut trouver la date.");
    return;
  }
  openModal("Le coffret métallique",
    "La photographie porte la date 14.08.1998. Le coffret demande un code à quatre chiffres. Quelle partie de la date faut-il essayer ?",
    [
      { label: "1998", action: () => wrongCode() },
      { label: "0814", action: () => wrongCode() },
      { label: "1408", action: () => correctCode() }
    ], "ÉNIGME · CODE À 4 CHIFFRES");
}
function wrongCode() {
  toast("Le coffret émet un clic sourd. Ce n'est pas le bon code.");
  openModal("Code incorrect", "La date complète est 14.08.1998. Observe son ordre : jour, puis mois. Le code utilise quatre chiffres.", [
    { label: "Réessayer", action: () => examineLockbox() },
    { label: "Consulter le carnet", action: () => showJournal() }
  ], "ÉNIGME");
}
function correctCode() {
  state.boxCodeSolved = true;
  save();
  openModal("Le mécanisme se déverrouille",
    "Un déclic retentit. Le code était bien 1408 : le jour et le mois de la photographie. Mais le coffret possède encore une serrure mécanique.",
    [
      { label: "Utiliser la petite clé en cuivre", action: () => {
        if (!state.found.includes("key")) {
          openModal("Il manque une clé", "Le code a libéré le mécanisme, mais il faut une petite clé pour ouvrir le coffret.");
          return;
        }
        state.boxOpened = true;
        state.selectedItem = null;
        addItem("dossier");
        openModal("Le dossier Kpassa",
          "À l'intérieur se trouve un dossier jauni. Sur la première page, une annotation manuscrite : « Transfert effectué sur ordre du commissaire Kpassa. Témoin déplacé le 14 août 1998. » Une signature : A.K.",
          [{ label: "Ajouter le dossier au carnet", action: () => toast("Nouvelle preuve enregistrée. L'affaire prend une autre dimension.") }],
          "NOUVELLE PREUVE");
      } }
    ], "ÉNIGME RÉSOLUE");
}
function startGame() {
  $("home-screen").hidden = true;
  $("game-screen").hidden = false;
}
function showJournal() {
  const lines = [
    "Enquête : La chambre aux symboles",
    "Lieu : Centre médical Saint-Michel, Porto-Novo",
    "Objectif : comprendre les signes laissés par le témoin."
  ];
  if (state.clueRead) lines.push("• Mur : « La date ouvre ce que la mémoire a fermé. »");
  if (state.found.includes("note")) lines.push("• Fragment : initiales A.K.");
  if (state.found.includes("photo")) lines.push("• Photographie : 14.08.1998.");
  if (state.boxCodeSolved) lines.push("• Coffret : code 1408 validé.");
  if (state.found.includes("dossier")) lines.push("• Dossier : transfert du témoin ordonné par le commissaire Kpassa, le 14 août 1998. Signature A.K.");
  openModal("Carnet d'enquête", lines.join("\n"),
    [{ label: "Fermer le carnet", action: () => {} }], "NOTES DE L'INSPECTEUR");
}
function interrogate() {
  if (!state.witnessAsked) {
    state.witnessAsked = true;
    save();
    openModal("Le témoin",
      "L'homme garde les yeux fixés sur le mur. Il murmure : « Ils ont effacé le nom… mais pas la date. Demandez à Adélaïde. Elle était là cette nuit-là. »",
      [
        { label: "Qui est Adélaïde ?", action: () => openModal("Le témoin",
          "« L'ancienne archiviste. Elle connaît l'histoire de cette chambre. Mais ne prononcez pas le nom Kpassa devant elle. »",
          [{ label: "Noter ce nom", action: () => toast("Nom ajouté au carnet : Kpassa.") }], "DÉPOSITION") },
        { label: "Le laisser se reposer", action: () => toast("Le témoin se replonge dans le silence.") }
      ], "DÉPOSITION");
  } else {
    openModal("Le témoin", "« La date… retrouvez Adélaïde. Elle sait pourquoi ce dossier a disparu. »",
      [{ label: "Terminer l'entretien", action: () => {} }], "DÉPOSITION");
  }
}
$("start-button").addEventListener("click", startGame);
$("continue-button").addEventListener("click", startGame);
$("back-home").addEventListener("click", () => {
  $("game-screen").hidden = true;
  $("home-screen").hidden = false;
});
$("journal-button").addEventListener("click", showJournal);
$("dialogue-button").addEventListener("click", interrogate);
$("sound-toggle").addEventListener("click", () => {
  state.sound = !state.sound;
  $("sound-toggle").textContent = state.sound ? "♫" : "♪";
  toast(state.sound ? "Le son sera disponible dans une prochaine version." : "Son désactivé.");
});
document.querySelectorAll(".hotspot").forEach((button) => {
  button.addEventListener("click", () => examine(button.dataset.target));
});
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeModal));
$("dialogue-modal").addEventListener("click", (event) => {
  if (event.target.id === "dialogue-modal") closeModal();
});
load();
if (localStorage.getItem(SAVE_KEY)) $("continue-button").hidden = false;
