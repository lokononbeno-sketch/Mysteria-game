/* ============================================================
   SCÈNE 02 — COTONOU : « L'archiviste silencieuse »
   Suite directe de la scène 01 : le témoin a parlé d'Adélaïde.
   Réutilise la photographie, la clé en cuivre et le dossier Kpassa.
   Le décor est stylisé dans scenes/02-cotonou.css.
   ============================================================ */
(function () {
  const DRAWERS = [
    { label: "Tiroir 1998 · VII", ok: false },
    { label: "Tiroir 1998 · VIII", ok: true },
    { label: "Tiroir 1999 · VIII", ok: false }
  ];

  /* ---------- Dialogue avec Adélaïde ---------- */
  function intro(g) {
    const opening = g.flag("mentionedKpassa")
      ? "Elle lève enfin les yeux. « Vous revenez. Cette fois, pas de nom prononcé ici. Qui vous envoie ? »"
      : "Une femme d'une cinquantaine d'années trie des fiches sans lever les yeux. « Les archives sont fermées. Qui vous envoie ? »";
    g.openModal("Adélaïde", opening, [
      { label: "Un témoin de Porto-Novo m'envoie.", action: () => witnessSent(g) },
      { label: "Je veux parler du commissaire Kpassa.", action: () => kpassaTooEarly(g) },
      { label: "Je reviendrai.", action: () => {} }
    ], "DÉPOSITION");
  }

  function witnessSent(g) {
    const options = [];
    if (g.has("photo")) options.push({ label: "Lui montrer la photographie de 1998", action: () => gainTrust(g) });
    options.push({ label: "Lui parler du commissaire Kpassa", action: () => kpassaTooEarly(g) });
    options.push({ label: "Revenir plus tard", action: () => {} });
    g.openModal("Adélaïde",
      "Ses mains s'immobilisent. « Il est encore en vie… » Elle referme un tiroir, lentement. « Je ne parle pas sans preuve. Qu'avez-vous trouvé dans sa chambre ? »",
      options, "DÉPOSITION");
  }

  function kpassaTooEarly(g) {
    g.setFlag("mentionedKpassa");
    g.openModal("Adélaïde",
      "Le silence tombe sur la pièce. Adélaïde repose sa fiche, très doucement. « Ce nom ne se prononce pas ici. Revenez quand vous aurez de quoi me prouver que vous savez de quoi vous parlez. »",
      [{ label: "Revenir plus tard", action: () => {} }], "DÉPOSITION");
  }

  function gainTrust(g) {
    g.setFlag("trust");
    g.openModal("Adélaïde",
      "Elle prend la photographie du bout des doigts. « Le 14 août 1998. Cette nuit-là, on a déplacé quelqu'un. » Son regard glisse vers ta poche. « Cette petite clé en cuivre… elle ouvre le meuble des transferts, là-bas. Personne ne l'a ouvert depuis des années. »",
      [
        { label: "Ouvrir le meuble des transferts", action: () => examineCabinet(g) },
        { label: "Examiner la salle", action: () => {} }
      ], "ELLE PARLE");
  }

  function confront(g) {
    g.openModal("Adélaïde",
      "Elle a vu le registre entre tes mains. Elle ne dit rien pendant un long moment. « Alors vous savez qu'une signature figure sur cette page. »",
      [
        { label: "Qui est A.K. ?", action: () => whoIsAK(g) },
        { label: "Revenir plus tard", action: () => {} }
      ], "CONFRONTATION");
  }

  function whoIsAK(g) {
    const options = [];
    if (g.has("cadre")) options.push({ label: "Lui montrer la photo de son bureau", action: () => confess(g) });
    options.push({ label: "Chercher d'autres preuves", action: () => {} });
    g.openModal("Adélaïde",
      "« Des initiales. Il y a des milliers d'A.K. dans ce pays. » Elle soutient ton regard. Tu n'as rien pour la contredire… pour l'instant. Regarde autour de toi : dans cette pièce, tout parle d'elle.",
      options, "CONFRONTATION");
  }

  function confess(g) {
    g.setFlag("confessed");
    g.openModal("Adélaïde",
      "Elle regarde longtemps le cliché. « Mon père m'a demandé de signer. J'avais vingt-quatre ans, j'étais archiviste. Il disait que c'était pour protéger le témoin. J'ai signé le transfert du dossier vers Parakou. Le nom, c'est lui qui l'a gratté. » Elle ferme les yeux. « Si le témoin vous a envoyée ici, c'est qu'il veut qu'on retrouve ce dossier. À Parakou. Aux archives régionales. »",
      [{ label: "Noter : archives régionales de Parakou", action: () => g.toast("Prochaine destination : Parakou.") }],
      "A.K. = ADELAÏDE KPASSA");
  }

  /* ---------- Le meuble des transferts ---------- */
  function examineCabinet(g) {
    if (g.has("registre")) {
      g.openModal("Le meuble des transferts", "Le tiroir d'août 1998 est vide : tu as déjà pris le registre.");
      return;
    }
    if (!g.has("key")) {
      g.openModal("Un meuble verrouillé", "Un meuble métallique à trois tiroirs. La serrure est en cuivre. Il te faut la bonne clé.");
      return;
    }
    if (!g.flag("trust")) {
      g.openModal("Adélaïde",
        "« Ne touchez pas à ça ! » Sa voix a claqué dans la pièce. Tu retires ta main. Il va falloir gagner sa confiance d'abord.",
        [{ label: "Lui parler", action: () => scene.interrogate(g) }], "ATTENTION");
      return;
    }
    g.openModal("Le meuble des transferts",
      "La clé en cuivre tourne sans effort. Trois tiroirs portent des étiquettes. Lequel ouvrir ?",
      DRAWERS.map((d) => ({ label: d.label, action: () => (d.ok ? openRegistry(g) : wrongDrawer(g)) })),
      "ÉNIGME · CLASSEMENT");
  }

  function wrongDrawer(g) {
    g.toast("Ce tiroir ne contient rien d'utile.");
    g.openModal("Mauvais tiroir",
      "Des registres sans rapport avec la nuit de la photographie. Rappelle-toi la date : 14.08.1998. Les étiquettes se lisent « année · mois en chiffres romains ».",
      [
        { label: "Réessayer", action: () => examineCabinet(g) },
        { label: "Consulter le carnet", action: () => g.showJournal() }
      ], "ÉNIGME");
  }

  function openRegistry(g) {
    g.addItem("registre");
    g.setFlag("registryRead");
    g.openModal("Le registre d'août 1998",
      "Page du 14 août, ligne 7 : « Dossier du témoin n° 7 transféré vers les archives régionales de Parakou. Ordre du commissaire Kpassa. Autorisé : A.K., archiviste. » Le nom du témoin a été gratté au cutter.",
      [{ label: "Noter l'autorisation signvée A.K.".replace("signvée", "signée"), action: () => g.toast("A.K. a autorisé le transfert. Qui se cache derrière ces initiales ?") }],
      "NOUVELLE PREUVE");
  }

  /* ---------- La scène ---------- */
  const scene = {
    id: "cotonou-archives",
    order: 2,
    city: "COTONOU",
    place: "ARCHIVES MUNICIPALES",
    caseNumber: "002",
    title: "L'archiviste silencieuse",
    ariaLabel: "Salle d'archives à Cotonou, avec une étagère, un bureau et un meuble métallique",
    sceneClass: "scene-archives",
    dialogueLabel: "💬 Parler à Adélaïde",
    completeFlag: "confessed",

    intro: {
      eyebrow: "ARRIVÉE À COTONOU",
      title: "Les archives municipales",
      text: "Le témoin de Porto-Novo n'a prononcé qu'un prénom : Adélaïde. Tu la trouves à Cotonou, au fond d'une salle d'archives, derrière des piles de boîtes jauniès. Elle ne lève pas les yeux. Le dossier Kpassa pèse dans ta poche.",
      button: "Entrer dans la salle"
    },

    decorHTML: `
      <div class="arc-sign">ARCHIVES · COTONOU</div>
      <div class="wall-clock">09:40</div>
      <div class="arc-shelves"></div>
      <div class="arc-woman"><i class="arc-head"></i><i class="arc-body"></i></div>
      <div class="arc-desk"><i class="arc-frame"></i><i class="arc-papers"></i></div>
      <div class="arc-cabinet"></div>`,

    hotspots: [
      { target: "shelves", className: "", style: "left:19%;top:34%", label: "Examiner les étagères d'archives" },
      { target: "adelaide", className: "", style: "left:47%;top:36%", label: "Parler à Adélaïde" },
      { target: "desk", className: "", style: "left:30%;top:64%", label: "Examiner le bureau" },
      { target: "cabinet", className: "", style: "right:12%;top:55%", label: "Examiner le meuble métallique" }
    ],

    items: {
      fiche: { icon: "🗂️", name: "Règle de classement", description: "Année, puis mois en chiffres romains." },
      cadre: { icon: "📸", name: "Photo du bureau d'Adélaïde", description: "Au dos : « Papa et moi, 1996. A.K. »" },
      registre: { icon: "📒", name: "Registre d'août 1998", description: "Transfert du dossier du témoin n° 7 vers Parakou." }
    },

    examine(target, g) {
      if (target === "adelaide") { scene.interrogate(g); return; }
      if (target === "cabinet") { examineCabinet(g); return; }
      if (target === "shelves") {
        if (!g.flag("shelvesRead")) {
          g.setFlag("shelvesRead");
          g.addItem("fiche");
          g.openModal("Les étagères",
            "Des centaines de boîtes classées par année. Une fiche collée sur le montant explique le système : « Année · mois en chiffres romains. » Plus bas, plusieurs étiquettes ont été arrachées.",
            [{ label: "Noter la règle de classement", action: () => g.toast("Règle notée dans le carnet.") }]);
        } else {
          g.openModal("Les étagères", "Tu as déjà noté le système de classement : année, puis mois en chiffres romains.");
        }
        return;
      }
      if (target === "desk") {
        if (!g.flag("deskSeen")) {
          g.setFlag("deskSeen");
          g.addItem("cadre");
          g.openModal("Le bureau d'Adélaïde",
            "Parmi les tampons et les fiches, un cadre ancien : une jeune femme en blouse d'archiviste se tient aux côtés d'un homme en uniforme de commissaire. Au dos, une dédicace : « Papa et moi, 1996. A.K. »",
            [{ label: "Noter ce détail", action: () => g.toast("Les mêmes initiales que sur le dossier de Porto-Novo.") }]);
        } else {
          g.openModal("Le bureau d'Adélaïde", "Tampons, fiches, un cadre ancien. Tu as déjà relevé ce qui comptait : la dédicace « Papa et moi, 1996. A.K. ».");
        }
      }
    },

    interrogate(g) {
      if (g.flag("confessed")) {
        g.openModal("Adélaïde",
          "Elle ne lève plus les yeux de ses fiches. « Allez à Parakou avant qu'ils comprennent que vous savez. »",
          [{ label: "Terminer l'entretien", action: () => {} }], "DÉPOSITION");
      } else if (g.flag("registryRead")) {
        confront(g);
      } else if (g.flag("trust")) {
        g.openModal("Adélaïde",
          "« Le meuble des transferts est là-bas. Ouvrez-le, puis revenez me voir. »",
          [
            { label: "Ouvrir le meuble des transferts", action: () => examineCabinet(g) },
            { label: "Pas maintenant", action: () => {} }
          ], "DÉPOSITION");
      } else {
        intro(g);
      }
    },

    journal(g) {
      const lines = [
        "Enquête : L'archiviste silencieuse",
        "Lieu : Archives municipales, Cotonou",
        "Objectif : retrouver ce qui a été effacé du registre de 1998."
      ];
      if (g.flag("shelvesRead")) lines.push("• Classement : année · mois en chiffres romains.");
      if (g.flag("mentionedKpassa")) lines.push("• Adélaïde refuse qu'on prononce le nom Kpassa devant elle.");
      if (g.flag("trust")) lines.push("• Adélaïde a vu la photographie de 1998 et parle enfin. La clé en cuivre ouvre le meuble des transferts.");
      if (g.has("cadre")) lines.push("• Bureau : photo d'une jeune femme avec un commissaire. Au dos : « Papa et moi, 1996. A.K. »");
      if (g.has("registre")) lines.push("• Registre : dossier du témoin n° 7 envoyé à Parakou le 14.08.1998. Autorisé : A.K.");
      if (g.flag("confessed")) lines.push("• A.K. = Adélaïde Kpassa, fille du commissaire. Piste : archives régionales de Parakou.");
      return lines;
    }
  };

  (window.MYSTERIA_SCENES = window.MYSTERIA_SCENES || []).push(scene);
})();
