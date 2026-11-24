/* ============================================================
   SCÈNE 01 — PORTO-NOVO : « La chambre aux symboles »
   Un fichier = une scène. Pour ajouter une scène, copie ce
   fichier (ex. scenes/02-cotonou.js), change l'id, l'order et
   le contenu, puis ajoute une balise <script> dans index.html.
   ============================================================ */
(function () {
  function examineLockbox(g) {
    if (g.flag("boxOpened")) {
      g.openModal("Le coffret est vide", "Tu as déjà récupéré le dossier qu'il contenait.");
      return;
    }
    if (!g.has("photo")) {
      g.openModal("Un coffret verrouillé", "Un petit coffret métallique est fixé sous le rebord du meuble. Un clavier à quatre chiffres protège son contenu. Il te faut trouver la date.");
      return;
    }
    g.openModal("Le coffret métallique",
      "La photographie porte la date 14.08.1998. Le coffret demande un code à quatre chiffres. Quelle partie de la date faut-il essayer ?",
      [
        { label: "1998", action: () => wrongCode(g) },
        { label: "0814", action: () => wrongCode(g) },
        { label: "1408", action: () => correctCode(g) }
      ], "ÉNIGME · CODE À 4 CHIFFRES");
  }

  function wrongCode(g) {
    g.toast("Le coffret émet un clic sourd. Ce n'est pas le bon code.");
    g.openModal("Code incorrect", "La date complète est 14.08.1998. Observe son ordre : jour, puis mois. Le code utilise quatre chiffres.", [
      { label: "Réessayer", action: () => examineLockbox(g) },
      { label: "Consulter le carnet", action: () => g.showJournal() }
    ], "ÉNIGME");
  }

  function correctCode(g) {
    g.setFlag("boxCodeSolved");
    g.openModal("Le mécanisme se déverrouille",
      "Un déclic retentit. Le code était bien 1408 : le jour et le mois de la photographie. Mais le coffret possède encore une serrure mécanique.",
      [
        { label: "Utiliser la petite clé en cuivre", action: () => {
          if (!g.has("key")) {
            g.openModal("Il manque une clé", "Le code a libéré le mécanisme, mais il faut une petite clé pour ouvrir le coffret.");
            return;
          }
          g.clearSelection();
          g.addItem("dossier");
          g.setFlag("boxOpened");
          g.openModal("Le dossier Kpassa",
            "À l'intérieur se trouve un dossier jauni. Sur la première page, une annotation manuscrite : « Transfert effectué sur ordre du commissaire Kpassa. Témoin déplacé le 14 août 1998. » Une signature : A.K.",
            [{ label: "Ajouter le dossier au carnet", action: () => g.toast("Nouvelle preuve enregistrée. L'affaire prend une autre dimension.") }],
            "NOUVELLE PREUVE");
        } }
      ], "ÉNIGME RÉSOLUE");
  }

  (window.MYSTERIA_SCENES = window.MYSTERIA_SCENES || []).push({
    id: "porto-novo-chambre",
    order: 1,
    city: "PORTO-NOVO",
    place: "CENTRE MÉDICAL SAINT-MICHEL",
    caseNumber: "001",
    title: "La chambre aux symboles",
    ariaLabel: "Chambre d'un établissement médical à Porto-Novo",
    sceneClass: "scene-hospital",
    dialogueLabel: "💬 Interroger le témoin",
    completeFlag: "boxOpened",

    decorHTML: `
      <div class="scene-window"><span></span><i></i></div>
      <div class="wall-clock">23:17</div>
      <div class="wall-writing">△ ○ ║<br>IV · 7 · Ω<br>◉ ↗ ◇</div>
      <div class="bed"><div class="pillow"></div><div class="sheet"></div></div>
      <div class="bedside"><div class="drawer"></div><div class="lamp"></div></div>`,

    hotspots: [
      { target: "wall", className: "hotspot-wall", label: "Examiner les symboles sur le mur" },
      { target: "drawer", className: "hotspot-drawer", label: "Examiner la table de chevet" },
      { target: "bed", className: "hotspot-bed", label: "Examiner le lit" },
      { target: "lockbox", className: "hotspot-box", label: "Examiner le coffret métallique" }
    ],

    items: {
      key: { icon: "🗝️", name: "Petite clé en cuivre", description: "Une clé ancienne, légèrement oxydée." },
      note: { icon: "📜", name: "Fragment de note", description: "Deux initiales écrites à l'encre : A.K." },
      photo: { icon: "🖼️", name: "Photographie ancienne", description: "Au dos : 14.08.1998." },
      dossier: { icon: "📁", name: "Dossier d'archives", description: "Un dossier portant le nom Kpassa." }
    },

    examine(target, g) {
      if (target === "wall") {
        g.setFlag("clueRead");
        g.openModal("Les symboles sur le mur",
          "Des signes ont été tracés à la hâte : un triangle, un cercle, quatre barres et les chiffres VII. Sous les symboles, une phrase presque effacée : « La date ouvre ce que la mémoire a fermé. »",
          [
            { label: "Noter les symboles dans le carnet", action: () => g.toast("Les symboles sont consignés dans le carnet.") },
            { label: "Examiner la table de chevet", action: () => g.examine("drawer") }
          ]);
        return;
      }
      if (target === "drawer") {
        if (!g.flag("drawerOpened")) {
          g.setFlag("drawerOpened");
          g.addItem("key");
          g.openModal("La table de chevet",
            "Le tiroir était coincé. À l'intérieur, tu trouves une petite clé en cuivre et un papier plié portant deux lettres : « A.K. ».",
            [
              { label: "Récupérer le fragment de note", action: () => { g.addItem("note"); g.toast("Les initiales A.K. sont ajoutées au carnet."); } },
              { label: "Regarder sous le lit", action: () => g.examine("bed") }
            ]);
        } else {
          g.openModal("Le tiroir", "Il est vide à présent. Tu as récupéré son contenu.");
        }
        return;
      }
      if (target === "bed") {
        if (!g.has("photo")) {
          g.addItem("photo");
          g.openModal("Sous le lit",
            "Une photographie ancienne était glissée sous le sommier. On y distingue la façade du bâtiment et, au dos, une date : 14.08.1998.",
            [{ label: "Mémoriser la date", action: () => g.toast("Date enregistrée dans le carnet : 14.08.1998.") }]);
        } else {
          g.openModal("La photographie", "Tu as déjà récupéré la photographie. La date inscrite au dos est le 14 août 1998.");
        }
        return;
      }
      if (target === "lockbox") examineLockbox(g);
    },

    interrogate(g) {
      if (!g.flag("witnessAsked")) {
        g.setFlag("witnessAsked");
        g.openModal("Le témoin",
          "L'homme garde les yeux fixés sur le mur. Il murmure : « Ils ont effacé le nom… mais pas la date. Demandez à Adélaïde. Elle était là cette nuit-là. »",
          [
            { label: "Qui est Adélaïde ?", action: () => g.openModal("Le témoin",
              "« L'ancienne archiviste. Elle connaît l'histoire de cette chambre. Mais ne prononcez pas le nom Kpassa devant elle. »",
              [{ label: "Noter ce nom", action: () => g.toast("Nom ajouté au carnet : Kpassa.") }], "DÉPOSITION") },
            { label: "Le laisser se reposer", action: () => g.toast("Le témoin se replonge dans le silence.") }
          ], "DÉPOSITION");
      } else {
        g.openModal("Le témoin", "« La date… retrouvez Adélaïde. Elle sait pourquoi ce dossier a disparu. »",
          [{ label: "Terminer l'entretien", action: () => {} }], "DÉPOSITION");
      }
    },

    journal(g) {
      const lines = [
        "Enquête : La chambre aux symboles",
        "Lieu : Centre médical Saint-Michel, Porto-Novo",
        "Objectif : comprendre les signes laissés par le témoin."
      ];
      if (g.flag("clueRead")) lines.push("• Mur : « La date ouvre ce que la mémoire a fermé. »");
      if (g.has("note")) lines.push("• Fragment : initiales A.K.");
      if (g.has("photo")) lines.push("• Photographie : 14.08.1998.");
      if (g.flag("boxCodeSolved")) lines.push("• Coffret : code 1408 validé.");
      if (g.has("dossier")) lines.push("• Dossier : transfert du témoin ordonné par le commissaire Kpassa, le 14 août 1998. Signature A.K.");
      return lines;
    }
  });
})();
