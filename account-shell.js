(function initAccountShell() {
  const body = document.body;
  const role = body?.dataset?.requiredRole || "";
  if (!body?.dataset?.liveDashboard) {
    return;
  }

  const ACCOUNT_BACKGROUNDS = [
    {
      id: "forge-floor",
      name: "Ironhall Forge",
      subtitle: "Forged steel, warm shadows, and a steady house-base backdrop.",
      image: "./assets/legacy-gym-bg.jpeg",
    },
    {
      id: "progress-wall",
      name: "Victory Archive",
      subtitle: "Sharper progress energy with a cleaner performance-wall backdrop.",
      image: "./assets/why-app-progress.jpg",
    },
    {
      id: "coach-client",
      name: "Allied Quest",
      subtitle: "Coach-and-client momentum framed as a shared build journey.",
      image: "./assets/why-coach-client.jpg",
    },
    {
      id: "coach-support",
      name: "Lantern Watch",
      subtitle: "Warmer accountability energy with a steadier support-line mood.",
      image: "./assets/why-coach-support.jpg",
    },
    {
      id: "gym-floor",
      name: "Arena Floor",
      subtitle: "Open-floor training atmosphere with broader room depth.",
      image: "./assets/why-gym-floor.jpg",
    },
    {
      id: "mascot-lounge",
      name: "Corgi Keep",
      subtitle: "A lighter branded room with more playful LEGACY character.",
      image: "./assets/why-mascott-corgi.jpg",
    },
  ];

  function padAvatarIndex(value) {
    return String(value || 0).padStart(2, "0");
  }

  function titleCaseAvatarLabel(value) {
    return String(value || "")
      .split(/[-_]+/u)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function buildIndexedAvatarCollection(config) {
    const start = Number(config.start || 1);
    const end = Number(config.end || 0);
    if (!end || end < start) {
      return [];
    }

    return Array.from({ length: end - start + 1 }, (_, index) => {
      const number = start + index;
      const fileIndex = padAvatarIndex(number);
      return {
        id: `${config.groupId}-${fileIndex}`,
        name: `${config.namePrefix} ${fileIndex}`,
        category: config.category,
        groupId: config.groupId,
        groupLabel: config.groupLabel,
        collectionId: config.collectionId,
        collectionLabel: config.collectionLabel,
        image: `${config.basePath}/${config.filePrefix}-${fileIndex}.${config.extension || "png"}`,
      };
    });
  }

  function buildNamedAvatarCollection(config) {
    return (config.names || []).map((name) => ({
      id: `${config.groupId}-${String(name).replace(/[^a-z0-9]+/giu, "-").replace(/^-+|-+$/gu, "").toLowerCase()}`,
      name: `${config.namePrefix} ${titleCaseAvatarLabel(name)}`.trim(),
      category: config.category,
      groupId: config.groupId,
      groupLabel: config.groupLabel,
      collectionId: config.collectionId,
      collectionLabel: config.collectionLabel,
      image: `${config.basePath}/${name}${config.fileSuffix || ""}.${config.extension || "png"}`,
    }));
  }

  function hashAvatarSeed(value) {
    return String(value || "").split("").reduce((seed, character) => ((seed * 33) + character.charCodeAt(0)) >>> 0, 7);
  }

  function pickAvatarLoreItem(items, seed, offset = 0) {
    if (!Array.isArray(items) || !items.length) {
      return "";
    }

    return items[(seed + offset) % items.length];
  }

  function getAvatarPronouns(category) {
    if (category === "female") {
      return {
        subject: "she",
        object: "her",
        possessive: "her",
        subjectCap: "She",
      };
    }

    return {
      subject: "he",
      object: "him",
      possessive: "his",
      subjectCap: "He",
    };
  }

  function hexToRgbChannels(value) {
    const normalized = String(value || "").replace(/[^a-f0-9]/giu, "");
    if (normalized.length === 3) {
      return normalized
        .split("")
        .map((character) => parseInt(character + character, 16))
        .join(", ");
    }

    if (normalized.length !== 6) {
      return "255, 168, 95";
    }

    return [
      parseInt(normalized.slice(0, 2), 16),
      parseInt(normalized.slice(2, 4), 16),
      parseInt(normalized.slice(4, 6), 16),
    ].join(", ");
  }

  const AVATAR_LEGACY_TRUTHS = [
    "That is the law every LEGACY portrait carries: the bullied, the ignored, and the disgraced can still build a name worth following through hard work, commitment, and the refusal to stay small.",
    "Every file in this archive ends at the same truth: humiliation is not a destiny when discipline becomes your answer and legacy becomes your standard.",
    "This library was built on one creed: nobody stays a nobody if they are willing to outwork the shame, own the scars, and rise anyway.",
    "The message never changes across these cards: hard work, commitment, and relentless standards can turn a forgotten name into one that leaves a legacy behind.",
  ];

  const AVATAR_PREVIEW_THEMES = {
    tier1: { accent: "#f2a24b", accentAlt: "#7d4422", soft: "#ffe0ba", deep: "#3a2113" },
    tier2: { accent: "#e57b3a", accentAlt: "#9a3722", soft: "#ffd8bf", deep: "#351712" },
    tier3: { accent: "#49caa4", accentAlt: "#245f77", soft: "#d7fff2", deep: "#112521" },
    tier4: { accent: "#b08cff", accentAlt: "#5f49a1", soft: "#efe4ff", deep: "#19152d" },
    tier5: { accent: "#f1c96b", accentAlt: "#d05353", soft: "#fff0cc", deep: "#2f1d14" },
    legends: { accent: "#f2a24b", accentAlt: "#d86a2f", soft: "#ffe2b7", deep: "#5f2415" },
    titans: { accent: "#d0a66a", accentAlt: "#8f6232", soft: "#f8e6c4", deep: "#302114" },
    v3: { accent: "#d65c46", accentAlt: "#7d2930", soft: "#ffd2c8", deep: "#3a1117" },
    v4: { accent: "#62d4dd", accentAlt: "#3d7cff", soft: "#d7fbff", deep: "#143646" },
    chinese: { accent: "#38c287", accentAlt: "#d45b43", soft: "#d9ffef", deep: "#123a2e" },
    western: { accent: "#7d8fff", accentAlt: "#f1c96b", soft: "#e4e9ff", deep: "#1d275f" },
    default: { accent: "#f2a24b", accentAlt: "#d86a2f", soft: "#ffe2b7", deep: "#5f2415" },
  };

  const AVATAR_COLLECTION_UI = {
    tier1: {
      statsKicker: "First Spark Readout",
      statsTitle: "Starter GPP",
      statsCopy: "Early-stage GPP: base engine, movement quality, and beginner resilience still being built.",
      shortLabel: "SPARK",
    },
    tier2: {
      statsKicker: "Street Steel Readout",
      statsTitle: "Striker GPP",
      statsCopy: "The body is settling in: sharper output, more repeatable work, and better control under fatigue.",
      shortLabel: "STEEL",
    },
    tier3: {
      statsKicker: "Wildframe Readout",
      statsTitle: "Hybrid GPP",
      statsCopy: "Middle-tier character build: stronger capacity, cleaner balance, and more confident movement.",
      shortLabel: "WILD",
    },
    tier4: {
      statsKicker: "Runebound Readout",
      statsTitle: "Guard GPP",
      statsCopy: "Higher-tier readiness with deeper composure, more durable output, and stronger technical sharpness.",
      shortLabel: "RUNE",
    },
    tier5: {
      statsKicker: "Ascendant Readout",
      statsTitle: "Ascendant GPP",
      statsCopy: "Pre-legacy build quality: strong engine, strong control, and a much more premium performance floor.",
      shortLabel: "ASCEND",
    },
    legends: {
      statsKicker: "Emberguard Forge Sheet",
      statsTitle: "Forge Readiness",
      statsCopy: "A GPP profile rendered like forged kit: hotter power, heavier output, and sharper recovery under pressure.",
      shortLabel: "FORGE",
    },
    titans: {
      statsKicker: "Iron Dominion Plate Readout",
      statsTitle: "Plate Readiness",
      statsCopy: "A GPP profile built like siege hardware: load-bearing strength, durability, and impact held under brutal weight.",
      shortLabel: "PLATE",
    },
    v3: {
      statsKicker: "Crownfall Heraldic Sheet",
      statsTitle: "Court Readiness",
      statsCopy: "A GPP profile with more balance and composure: coordination, agility, and poise built into the same frame.",
      shortLabel: "CREST",
    },
    v4: {
      statsKicker: "Radiant Court Aura Sheet",
      statsTitle: "Aura Readiness",
      statsCopy: "A GPP profile tuned for precision and movement quality, with cleaner speed, control, and luminous technical sharpness.",
      shortLabel: "AURA",
    },
    chinese: {
      statsKicker: "Jade Zodiac Seal",
      statsTitle: "Jade Readiness",
      statsCopy: "A GPP profile guided by rhythm and flow: mobility, balance, and coordination reinforced without losing bite.",
      shortLabel: "JADE",
    },
    western: {
      statsKicker: "Astral Houses Constellation Sheet",
      statsTitle: "Astral Readiness",
      statsCopy: "A GPP profile mapped like a star chart: fast lines, high awareness, and linked movement across the whole system.",
      shortLabel: "ASTRA",
    },
    default: {
      statsKicker: "Legacy GPP Profile",
      statsTitle: "GPP",
      statsCopy: "General physical preparedness breakdown for this portrait.",
      shortLabel: "GPP",
    },
  };

  const AVATAR_STORY_WORLDS = {
    legends: {
      origins: [
        "a forgotten heir from the ember quarter",
        "a castoff standard-bearer with no house left to defend",
        "a ridiculed street ward no council would claim",
        "the name people used when they wanted to describe failure quickly",
      ],
      fractures: [
        "a public disgrace turned that identity into an open joke",
        "the city made a spectacle of the first time the world broke around them",
        "every witness treated the fall like proof they had been right all along",
        "people wore their collapse like gossip until it hardened into legend",
      ],
      exiles: [
        "the ash tunnels beneath a burned district",
        "rooflines above a city that only respected winners",
        "silent corridors where no one looked twice at the forgotten",
        "abandoned watch posts at the edge of the old ward",
      ],
      returns: [
        "a sentinel presence that made doubters lower their eyes",
        "an ember-crowned force who no longer needed permission",
        "the kind of survivor who makes a room feel smaller by entering it",
        "living proof that disgrace can be reforged into command",
      ],
      legacy: [
        "Now the district that once laughed studies the steadiness it took to come back sharper than before.",
        "The same people who spoke over that fall now speak more carefully when the name returns.",
        "Nothing about the rise was gifted; that is why it feels heavier than old titles ever did.",
        "The comeback matters because it was built in the dark, long before anyone was willing to believe in it.",
      ],
    },
    titans: {
      origins: [
        "a quarry-born castoff valued only for labor",
        "a pit-bred giant people used before they respected",
        "a blunt weapon in other people's stories",
        "the kind of figure crowds only noticed when something went wrong",
      ],
      fractures: [
        "the world mistook size for purpose and mocked everything softer than rage",
        "every failure was repeated louder because it was easy to laugh at a body before understanding the will inside it",
        "the fall stripped away borrowed status and left only silence behind",
        "people treated the early version like brute force with no future",
      ],
      exiles: [
        "the iron pits beneath ruined stone arches",
        "storm-cut quarries where only endurance answered back",
        "old ramparts no one climbed anymore",
        "the shadowed vaults of a dead stronghold",
      ],
      returns: [
        "a disciplined colossus whose restraint feels more dangerous than old fury",
        "the kind of fortress people run toward when everything else is breaking",
        "a sovereign weight that no longer needs noise to dominate a room",
        "proof that power becomes myth only after it learns purpose",
      ],
      legacy: [
        "That is why the legend now feels immovable: it was not built on size alone, but on control hard-won in private.",
        "Heavier than iron is the discipline it took to become dependable after being dismissed as a brute.",
        "Every scar on that silhouette reads like a chapter in a life that refused to stay crude.",
        "The rise matters because force stopped being the identity and became the instrument instead.",
      ],
    },
    v3: {
      origins: [
        "a banner-bearer from a fallen court nobody believed would rise again",
        "a discarded name from an academy that only remembered winners",
        "a former favorite whose collapse became public property",
        "the one people referenced whenever they wanted to warn others what failure looked like",
      ],
      fractures: [
        "the first fall was replayed so often it almost replaced the person underneath it",
        "every ally stepped back the moment the crest slipped from their shoulders",
        "the old world shut its doors and expected the story to end there",
        "public ridicule made exile feel official long before any decree did",
      ],
      exiles: [
        "broken courts and rain-cut corridors where forgotten names echoed",
        "fringe districts built from old banners and second chances",
        "lamp-lit alleys where craft mattered more than pedigree",
        "the hollow wings of an abandoned palace school",
      ],
      returns: [
        "a crownless presence too precise to dismiss",
        "the sort of operator who makes old gatekeepers look outdated",
        "a reclaimed symbol sharpened by the years others wasted mocking it",
        "the answer to every person who thought the name had already died",
      ],
      legacy: [
        "Now the same halls that once reduced the story to gossip measure themselves against the composure of the return.",
        "The crest came back different: less ornamental, more earned.",
        "That is what makes the rise feel dangerous now, it no longer depends on approval to exist.",
        "The comeback reads clean because every weak piece of the old identity was burned off before dawn ever returned.",
      ],
    },
    v4: {
      origins: [
        "a polished contender trapped inside rooms that only valued perfection when it served someone else",
        "the elegant favorite people praised right up until the first visible fracture",
        "a quiet rival mistaken for decoration because poise made others careless",
        "a ceremonial prodigy expected to stay beautiful, useful, and silent",
      ],
      fractures: [
        "the first misstep gave the whole room permission to become cold",
        "power circles closed so fast it felt rehearsed",
        "the fall was framed as proof that polish had always been shallow",
        "admiration curdled into contempt the moment obedience disappeared",
      ],
      exiles: [
        "white-lit halls where silence sharpened every thought",
        "glass towers built to expose weakness and reward recovery",
        "the upper chambers where no one survives on grace alone",
        "cold ceremonial wings haunted by old expectations",
      ],
      returns: [
        "a radiant figure whose composure now feels like pressure",
        "the kind of heroine who makes elegance look lethal",
        "a sovereign force wrapped in light and sharpened by loss",
        "what remains after refinement learns how to endure fire",
      ],
      legacy: [
        "That is why the comeback feels luminous instead of fragile: it was forged after every soft illusion had already broken.",
        "The same people who mistook restraint for weakness now have to study what it grew into.",
        "Nothing about the rise was decorative; even the grace was earned the hard way.",
        "Her return matters because it proves polish can survive collapse and come back colder, harder, and more complete.",
      ],
    },
    chinese: {
      origins: [
        "a child of a house people spoke about in lowered voices",
        "the name elders treated like a warning whispered under ceremony",
        "an heir written off as misfortune before they chose anything for themselves",
        "someone born into history and blamed for its ruins without consent",
      ],
      fractures: [
        "the shame was inherited so early it almost felt like law",
        "every closed gate made the old stigma feel permanent",
        "the first public fall convinced a whole community that the omen had been real",
        "ritual and rejection became impossible to separate",
      ],
      exiles: [
        "moon-cut courtyards and empty ancestral passages",
        "lantern-lit roofs above neighborhoods that remembered too much",
        "temple stairs where patience became the only ally left",
        "quiet festival grounds after the crowds had gone home",
      ],
      returns: [
        "a sovereign omen reclaimed and made radiant",
        "the kind of guardian who turns old superstition back on itself",
        "a phoenix-shaped answer to every gate that once stayed shut",
        "proof that lineage does not have to inherit shame forever",
      ],
      legacy: [
        "That is what gives the return its weight: the curse people spoke about was outlived by discipline and will.",
        "Now the same names that once whispered about disgrace speak with caution instead.",
        "The rise matters because honor was rebuilt without asking the old world for permission.",
        "Every detail in the silhouette reads like history taken back by the person who was supposed to disappear beneath it.",
      ],
    },
    western: {
      origins: [
        "a minor name at the edge of houses built for brighter constellations",
        "the forgotten rival everyone expected to fade quietly",
        "a fallen favorite turned into a cautionary headline",
        "someone the skyward courts admired only while success looked effortless",
      ],
      fractures: [
        "the first collapse gave the crowd a cleaner story than the truth ever did",
        "prestige evaporated the moment the shine cracked",
        "every failure was treated like proof the ascent had been a mistake",
        "the world decided too early that the arc had already ended",
      ],
      exiles: [
        "observatory halls after midnight",
        "the outer runways beneath silent constellations",
        "abandoned sky platforms where old banners rattled in the wind",
        "cold celestial vaults where only patience kept time",
      ],
      returns: [
        "a star-born force that no longer burns for applause",
        "a comet-like presence that feels inevitable once it arrives",
        "the sort of figure who makes old judgment look embarrassingly small",
        "a skyward answer to everyone who thought disgrace could be permanent",
      ],
      legacy: [
        "That is what makes the rise feel cosmic now: the light came back from farther away than anyone expected it could.",
        "The same courts that once treated the fall like entertainment now have to reckon with the return as fact.",
        "Nothing about the comeback was inherited; even the brilliance had to be rebuilt from debris.",
        "The silhouette carries the night differently now, not as loneliness, but as proof of distance survived.",
      ],
    },
  };

  const AVATAR_STAT_PROFILES = {
    tier1: {
      gpp: {
        "Cardiovascular/respiratory endurance": 50,
        Stamina: 48,
        Strength: 47,
        Flexibility: 54,
        Power: 46,
        Speed: 49,
        Coordination: 52,
        Agility: 50,
        Balance: 53,
        Accuracy: 49,
      },
    },
    tier2: {
      gpp: {
        "Cardiovascular/respiratory endurance": 56,
        Stamina: 58,
        Strength: 57,
        Flexibility: 58,
        Power: 56,
        Speed: 57,
        Coordination: 58,
        Agility: 57,
        Balance: 58,
        Accuracy: 56,
      },
    },
    tier3: {
      gpp: {
        "Cardiovascular/respiratory endurance": 64,
        Stamina: 66,
        Strength: 65,
        Flexibility: 66,
        Power: 64,
        Speed: 65,
        Coordination: 67,
        Agility: 66,
        Balance: 66,
        Accuracy: 64,
      },
    },
    tier4: {
      gpp: {
        "Cardiovascular/respiratory endurance": 72,
        Stamina: 74,
        Strength: 73,
        Flexibility: 74,
        Power: 72,
        Speed: 74,
        Coordination: 76,
        Agility: 75,
        Balance: 75,
        Accuracy: 73,
      },
    },
    tier5: {
      gpp: {
        "Cardiovascular/respiratory endurance": 80,
        Stamina: 82,
        Strength: 81,
        Flexibility: 80,
        Power: 82,
        Speed: 81,
        Coordination: 83,
        Agility: 82,
        Balance: 82,
        Accuracy: 81,
      },
    },
    legends: {
      gpp: {
        "Cardiovascular/respiratory endurance": 74,
        Stamina: 78,
        Strength: 82,
        Flexibility: 67,
        Power: 80,
        Speed: 71,
        Coordination: 76,
        Agility: 72,
        Balance: 74,
        Accuracy: 79,
      },
    },
    titans: {
      gpp: {
        "Cardiovascular/respiratory endurance": 80,
        Stamina: 88,
        Strength: 94,
        Flexibility: 52,
        Power: 90,
        Speed: 54,
        Coordination: 62,
        Agility: 56,
        Balance: 64,
        Accuracy: 70,
      },
    },
    v3: {
      gpp: {
        "Cardiovascular/respiratory endurance": 78,
        Stamina: 76,
        Strength: 72,
        Flexibility: 74,
        Power: 75,
        Speed: 77,
        Coordination: 82,
        Agility: 80,
        Balance: 76,
        Accuracy: 78,
      },
    },
    v4: {
      gpp: {
        "Cardiovascular/respiratory endurance": 72,
        Stamina: 70,
        Strength: 64,
        Flexibility: 86,
        Power: 74,
        Speed: 82,
        Coordination: 88,
        Agility: 84,
        Balance: 80,
        Accuracy: 90,
      },
    },
    chinese: {
      gpp: {
        "Cardiovascular/respiratory endurance": 76,
        Stamina: 74,
        Strength: 68,
        Flexibility: 82,
        Power: 72,
        Speed: 78,
        Coordination: 86,
        Agility: 84,
        Balance: 82,
        Accuracy: 80,
      },
    },
    western: {
      gpp: {
        "Cardiovascular/respiratory endurance": 74,
        Stamina: 76,
        Strength: 66,
        Flexibility: 80,
        Power: 70,
        Speed: 88,
        Coordination: 78,
        Agility: 86,
        Balance: 79,
        Accuracy: 83,
      },
    },
    default: {
      gpp: {
        "Cardiovascular/respiratory endurance": 72,
        Stamina: 72,
        Strength: 72,
        Flexibility: 72,
        Power: 72,
        Speed: 72,
        Coordination: 72,
        Agility: 72,
        Balance: 72,
        Accuracy: 72,
      },
    },
  };

  const AVATAR_LORE_THEMES = {
    legends: {
      arenas: [
        "the furnace tunnels below the old arena district",
        "a concrete yard where nobody trained for him but the clock",
        "a dead-end gym lit by one broken amber floodlight",
        "the back rooms of a city that only noticed champions after they won",
      ],
      male: {
        first: ["Iron", "Ashen", "Storm", "Vigil", "Rift", "Ember", "Onyx", "Flint", "Valor", "Night", "Brass", "Cinder"],
        second: ["Warden", "Sentinel", "Harbinger", "Reclaimer", "Bastion", "Breaker", "Marshal", "Aegis", "Vow", "Sovereign", "Ascendant", "Keeper"],
        looks: ["ember-rimmed armor and soot-dark steel", "scarred ceremonial bronze with black pauldrons", "forged obsidian plating trimmed in furnace gold", "battle-burnished steel cut for a last return"],
        beginnings: ["a reserve fighter nobody ever picked first", "the spare son of a dead district people stopped betting on", "a mocked recruit left off every serious roster", "the gym floor target every louder man laughed past"],
        wounds: ["being jeered out of his first trial and left to leave by the back gate", "watching his own team use him as the punchline for every bad session", "taking public blame for a collapse he did not cause", "hearing his name used as shorthand for weakness"],
        grinds: ["rebuilding his body before sunrise while everyone else slept off their excuses", "turning every insult into one more rep, one more drill, one more brutal return", "learning discipline the hard way through silence, bruises, and repetition", "forging himself on lonely mornings that would have broken the old version of him"],
        returns: ["the last man standing when the room finally needed a leader", "a wall of calm pressure no crowd could laugh through anymore", "the kind of champion people pretend they believed in all along", "a living answer to every voice that once tried to shrink him"],
        legacyMarks: ["He does not carry the fire to look heroic. He carries it because pain taught him how to stay lit when everybody else went cold.", "His armor is not decoration. It is proof that discipline can turn a public humiliation into private power.", "He walks like someone who survived the part of the story most people never make it through.", "He became the standard that the same room which mocked him now measures itself against."],
      },
      female: {
        first: ["Sable", "Ember", "Nova", "Astra", "Riven", "Vanta", "Lumen", "Auric", "Cinder", "Seren", "Valor", "Vigil"],
        second: ["Aegis", "Resolve", "Phoenix", "Throne", "Warden", "Sovereign", "Halo", "Ascendant", "Keeper", "Vow", "Crown", "Aurora"],
        looks: ["ember-lined regalia over forged battle silk", "scarred royal armor recut for war instead of ceremony", "gilded plating worn like a vow instead of a crown", "burnished ceremonial steel with a survivor’s calm in every line"],
        beginnings: ["the woman they called too soft for the work ahead", "an outcast nobody wanted attached to their name", "the heir stripped of place, title, and sympathy", "the quiet one the room kept speaking over"],
        wounds: ["having mentors laugh at her limits before she even moved", "being pushed out and called a burden to everyone around her", "watching people celebrate when she fell because it proved their bias right", "hearing the word fragile used like it was the whole story"],
        grinds: ["stacking ruthless consistency on top of every dismissal until elegance became force", "building her strength in private so the comeback would not need permission", "turning grief into structure and structure into power", "learning to carry herself like a storm long before anyone else saw it"],
        returns: ["the kind of heroine who makes a room straighten before she speaks", "a sovereign presence with nothing left to prove to the people who doubted her", "a calm destroyer of old assumptions", "the answer to every person who mistook kindness for weakness"],
        legacyMarks: ["She did not rise because anyone saved her. She rose because effort became her language when nobody else would speak for her.", "The gold in her frame reads like royalty, but it was earned the hard way: through repetition, rejection, and the refusal to disappear.", "Her comeback is not gentle. It is composed, deliberate, and impossible to dismiss.", "She carries herself like someone who buried the old shame and built a throne out of discipline."],
      },
    },
    titans: {
      arenas: [
        "the iron pits beneath a dead coliseum",
        "a warehouse floor where strength was the only language anybody respected",
        "the stone corridors of an old strongman compound",
        "the brutal work bays where he learned pain without applause",
      ],
      male: {
        first: ["Forge", "Titan", "Stone", "Obsidian", "Atlas", "Steel", "Brass", "Ruin", "Granite", "Dread", "Anvil", "Grim"],
        second: ["Colossus", "Bulwark", "Monarch", "Bastion", "Hammer", "Rampart", "Anvil", "Apex", "Warden", "Breaker", "Giant", "Dominion"],
        looks: ["ironbound plate built for impact", "arena-worn armor with heavy forged shoulders", "massive war metal layered over black straps and scars", "stone-cut plating that looks welded to his will"],
        beginnings: ["the giant people only called useful when there was weight to move", "the laborer nobody listened to after the work was done", "a castoff enforcer with strength but no respect", "the brute they swore would never have the discipline to lead"],
        wounds: ["being mocked as nothing more than muscle without a mind", "watching smaller men use his failures as entertainment", "losing every bit of borrowed status the moment he stopped being convenient", "being remembered only for the damage he caused before he learned control"],
        grinds: ["teaching himself precision so power would stop being wasted", "building patience rep by rep until rage turned into command", "lifting through isolation until he understood that control is the final form of strength", "earning presence through work instead of size alone"],
        returns: ["a disciplined titan who makes chaos move around him", "the kind of force that no longer needs to shout to dominate a room", "a colossal standard others lean on when things start breaking", "the proof that raw power means nothing until it is mastered"],
        legacyMarks: ["He stopped trying to be feared and started becoming dependable, which turned out to be far harder and far more legendary.", "Every plate and scar on him reads like a chapter in the same rise: from ridiculed brute to disciplined protector.", "His legend is not built on size alone. It is built on the work it took to make that size answer to purpose.", "He became the wall that younger fighters run toward, not away from."],
      },
    },
    v3: {
      arenas: [
        "the cracked courts and back gyms of a fallen academy",
        "old locker rooms where names were made and ruined in the same week",
        "a half-forgotten training hall with more ghosts than support",
        "the fringe circuits where second chances were never handed out",
      ],
      male: {
        first: ["Rogue", "Crown", "Apex", "Torch", "Sable", "Vanta", "Legacy", "Arc", "Prime", "Nova", "Noct", "Riven"],
        second: ["Strider", "Rook", "Cipher", "Drake", "Mercer", "Runeblade", "Outrider", "Crest", "Harrow", "Vale", "Crown", "Vow"],
        looks: ["old-school champion layers sharpened into street-bred armor", "weathered tactical cloth with regal trim that survived the fall", "hard-cut arena gear built from what others threw away", "classic champion lines recast for someone who learned to win alone"],
        beginnings: ["the trainee nobody remembered after the team photo", "the rookie buried on the bench and blamed for everything around him", "a disgraced hopeful with no backing and no clean path home", "the favorite turned cautionary tale before his story had even started"],
        wounds: ["being booed when his name was called because the crowd already decided he would fail", "watching his banner come down while lesser people took credit for his work", "taking every cheap joke the hall could invent until his silence became sharper than their noise", "having the system lock its gates the second he stumbled"],
        grinds: ["learning in the margins while everyone else trained under bright lights", "rebuilding skill by skill with nobody left to clap for it", "turning rejection into a cleaner edge than talent ever gave him", "finding identity in repetition after the old title was stripped away"],
        returns: ["a crownless champion whose presence still bends the room", "the type of operator who does not need permission to matter anymore", "a survivor who came back technically sharper and emotionally untouchable", "the man the same academy now points to when it needs a real example"],
        legacyMarks: ["He does not carry the old crest to chase nostalgia. He carries it to remind everyone that a fall is not the end of a line.", "His whole look reads like recovered status: not borrowed glory, but earned return.", "He turned exile into craft, and craft into the kind of authority applause cannot fake.", "He became living evidence that the people written off in public can still rebuild better in private."],
      },
      female: {
        first: ["Velvet", "Crown", "Nova", "Ardent", "Sable", "Vesper", "Rogue", "Apex", "Lustre", "Riven", "Dawn", "Lyric"],
        second: ["Vale", "Aria", "Reign", "Bloom", "Vesper", "Cipher", "Grace", "Mara", "Crown", "Solace", "Ember", "Oath"],
        looks: ["regal champion cloth with battle-worn discipline in every seam", "classic warrior trim made sharper by survival", "structured arena armor that feels equal parts elegance and warning", "old-school ceremonial lines worn by someone who had to earn her return twice"],
        beginnings: ["the underdog nobody defended when the room turned cruel", "the scapegoat blamed every time the team cracked under pressure", "the rejected prodigy they loved only until she stumbled", "the girl the hall wrote off as style without substance"],
        wounds: ["being reduced to gossip the moment she fell from favor", "watching the same people who praised her rewrite her as a weakness", "hearing every loss pinned to her name until she almost believed it", "being told to stay quiet and grateful while lesser work got celebrated"],
        grinds: ["rebuilding in silence until confidence became visible again", "training with surgical intent until elegance stopped being mistaken for fragility", "stacking unglamorous reps until grace and menace became the same movement", "forging a comeback where every detail looked composed because the work beneath it was brutal"],
        returns: ["a heroine with poise sharp enough to cut through old narratives", "the woman whose comeback made everyone remember what they tried to bury", "a composed force with zero interest in pleasing the people who doubted her", "the answer to every version of the word washed-up that was thrown at her"],
        legacyMarks: ["She came back too polished to argue with and too dangerous to ignore.", "Her presence now feels regal because it is built on mastery, not favor.", "She turned public disgrace into private craftsmanship and made the world catch up later.", "The room that once shrank her into gossip now studies her like a blueprint."],
      },
    },
    v4: {
      arenas: [
        "the sealed upper halls where perfection was demanded and mercy never was",
        "a sterile modern chamber built to expose weakness instantly",
        "white-lit towers where expectations crushed people long before failure did",
        "future-forged courts where only exacting discipline survived",
      ],
      female: {
        first: ["Solar", "Ivory", "Astra", "Lumen", "Auric", "Seraph", "Mirra", "Sera", "Rune", "Halo", "Opaline", "Velour"],
        second: ["Oracle", "Throne", "Ascend", "Halo", "Cipher", "Nova", "Grace", "Crown", "Radiance", "Aegis", "Vow", "Empress"],
        looks: ["sleek luminous armor with a throne-born edge", "precision-cut royal silk lit like a weapon", "clean ceremonial plating built for a colder kind of war", "future-forged regalia that looks refined until it moves"],
        beginnings: ["the woman they called too polished to survive real pressure", "the overlooked recruit in the back row no one took seriously", "a disgraced favorite who lost status before she ever lost ability", "the quiet contender everyone mistook for harmless"],
        wounds: ["being publicly frozen out the instant she stopped making others comfortable", "watching power circles close around her while calling it merit", "having the whole room admire her look while doubting her spine", "being treated like a symbol instead of a fighter until she broke that role apart"],
        grinds: ["turning refinement into something ruthless through repetition", "training until grace and force became impossible to separate", "building a colder, harder confidence than the old version ever knew", "mastering the discipline required to make elegance hit like certainty"],
        returns: ["a radiant threat with no need to explain herself anymore", "the kind of heroine who looks regal because the work underneath her is brutal", "a controlled storm in a polished frame", "the final form of everything they underestimated"],
        legacyMarks: ["She did not survive by becoming louder. She survived by becoming undeniable.", "What looks luminous now was welded from isolation, pressure, and the refusal to collapse on cue.", "Her rise reads clean because the suffering beneath it has already been mastered.", "She became the standard for what happens when elegance is backed by relentless work."],
      },
    },
    chinese: {
      arenas: [
        "moonlit courtyards where clan memory cut deeper than steel",
        "ancestral training halls that kept every failure on record",
        "temple steps where old names carried more weight than new talent",
        "festival grounds where shame was public and survival was quiet",
      ],
      male: {
        first: ["Jade", "Crimson", "Moon", "Sun", "Golden", "Silver", "Duskwind", "Celestial", "Rising", "Tiger", "Dragon", "Ox"],
        second: ["Tiger", "Dragon", "Banner", "Ascendant", "Warden", "Serpent", "Vow", "Monarch", "Guardian", "Stride", "Phoenix", "Crown"],
        looks: ["zodiac-forged silk over moonlit ceremonial armor", "beast-marked robes with battle-worn celestial trim", "lunar battle cloth edged in old gold and patient fury", "ceremonial plating shaped by clan scars and stubborn pride"],
        beginnings: ["the boy their village quietly labeled unlucky", "the mocked apprentice with no patron willing to stand beside him", "the son of failure everyone pitied before he spoke", "the exile whose name people lowered their voice to mention"],
        wounds: ["being treated like a bad omen before he ever had a chance to prove otherwise", "watching gates close because his family name no longer carried respect", "hearing every mistake framed as proof that he did not belong", "being made to bow his head for faults older than he was"],
        grinds: ["training under old lantern light until discipline outshone superstition", "rebuilding honor through patient work no one cared to watch", "learning to carry shame without letting it decide his future", "turning inherited humiliation into a stricter and deeper kind of focus"],
        returns: ["a guardian whose calm feels older than the insults that made him", "the dragon they once mocked as a weakling", "a steady rising force who made his own house proud again", "the man who turned a cursed name into a feared standard"],
        legacyMarks: ["He did not erase the shame he inherited. He outworked it until it no longer owned him.", "His frame carries ceremony, but his rise was built in private, lonely labor.", "He became proof that honor can be rebuilt even after a whole crowd decides you have none left.", "The same halls that whispered about him now speak his name with care."],
      },
      female: {
        first: ["Jade", "Crimson", "Lunar", "Celestial", "Golden", "Silver", "Moon", "Dawn", "Sun", "Rabbit", "Phoenix", "Serpent"],
        second: ["Phoenix", "Dragon", "Ascendant", "Halo", "Vow", "Crown", "Rabbit", "Guardian", "Grace", "Banner", "Tiger", "Radiance"],
        looks: ["lunar silk armor stitched with constellations and resolve", "zodiac-crowned robes cut for movement instead of ceremony", "moon-burnished battle silk lit like an omen reclaimed", "celestial regalia worn by someone who stopped asking for welcome"],
        beginnings: ["the daughter of a fallen house nobody wanted near their future", "the girl their village whispered about like a warning", "the outcast they called a bad omen before she could answer", "the one no gate opened for unless it had to"],
        wounds: ["being watched like she might bring misfortune just by arriving", "hearing elders speak of her future as if it had already failed", "learning early that some rooms only saw scandal when they looked at her", "having rejection wrapped in ritual until it almost felt holy"],
        grinds: ["training until shame had no space left inside her stance", "carving her own worth through discipline when approval never came", "building a quiet ferocity behind every graceful movement", "turning exile into the kind of focus that cannot be taught gently"],
        returns: ["a phoenix presence the old world can no longer disown", "the woman who made every omen spoken over her sound foolish", "a sovereign force wrapped in grace and sharpened by rejection", "the answer to every closed gate she survived"],
        legacyMarks: ["She rose without being invited, which makes the legend cleaner and harder than approval ever could.", "Her elegance reads ancient, but it was sharpened by modern cruelty and stubborn work.", "She turned whispered disgrace into a lineage of her own making.", "The house that lost her now has to live with becoming the reason she became unstoppable."],
      },
    },
    western: {
      arenas: [
        "observatory halls where talent was measured against impossible constellations",
        "midnight platforms built for chosen names, not underdogs",
        "star-lit chambers where every failure echoed louder than praise",
        "celestial runways where only the polished were expected to survive",
      ],
      male: {
        first: ["Orion", "Halo", "Zenith", "Eclipse", "Nova", "Leo", "Aether", "Cosmic", "Star", "Sol", "Atlas", "Virgo"],
        second: ["Archer", "Voyager", "Warden", "Drift", "Crown", "Sentinel", "Comet", "Ascendant", "Crest", "Breaker", "Ranger", "Orbit"],
        looks: ["constellation-lined armor over night-cut cloth", "astral champion trim with hard celestial geometry", "star-metal plating designed for a second coming", "cosmic ceremonial gear that turns stillness into threat"],
        beginnings: ["the nobody staring up from the lowest rung of a system built for favorites", "the hated rival everyone was happy to see fail", "the failed favorite nobody intended to forgive", "the boy they said peaked too early and would never recover"],
        wounds: ["watching brighter names get endless second chances while he got none", "hearing the same crowd celebrate every stumble like it was destiny", "being written off as a cautionary tale before he was done fighting", "learning that prestige is fragile when people only loved the winning version of you"],
        grinds: ["training under empty lights until his skill stopped needing an audience", "turning humiliation into precision one lonely session at a time", "building a colder focus than the glittering world around him expected", "teaching himself to keep climbing after admiration turned to contempt"],
        returns: ["a star-born fighter who no longer burns for applause", "the comet they thought had already fallen past recovery", "a silent voyager whose discipline outshines his old reputation", "the man who made the sky look crowded by coming back brighter"],
        legacyMarks: ["He stopped chasing the room and started chasing mastery, which is why the room came back later.", "The constellations on him feel earned because they were mapped through failure first.", "He became a skyward answer to every person who thought disgrace was permanent.", "Now he moves like someone who has already outlived public opinion."],
      },
      female: {
        first: ["Lyra", "Nova", "Eclipse", "Halo", "Vesper", "Aria", "Sol", "Zenith", "Aether", "Celeste", "Star", "Virgo"],
        second: ["Muse", "Crown", "Ascendant", "Comet", "Orbit", "Grace", "Lyra", "Halo", "Astra", "Vesper", "Solace", "Aria"],
        looks: ["starlit regalia cut with sharp celestial lines", "astral silk armor that glows without softening", "cosmic ceremonial plating built for a colder form of grace", "constellation-trimmed battle cloth worn like earned myth"],
        beginnings: ["the disgraced prodigy nobody expected back", "the underdog written off as decoration instead of danger", "the rejected name whispered about like a warning sign", "the girl people remembered only for the fall"],
        wounds: ["being admired for image while being denied belief", "watching praise turn to ridicule the second she slipped", "having people speak about her like a faded headline instead of a living fighter", "being expected to disappear once the room stopped clapping"],
        grinds: ["building substance so undeniable that beauty could no longer be used against her", "training through silence until her presence carried its own gravity", "turning isolation into polish, and polish into force", "earning back every inch of belief through invisible work"],
        returns: ["a celestial heroine with a colder and steadier fire than before", "the kind of comeback that makes old judgment look small", "a luminous threat no one can reduce to appearance anymore", "the answer to every room that confused style for weakness"],
        legacyMarks: ["She did not return to be admired again. She returned to become undeniable.", "Her rise shines because the work beneath it is brutal, disciplined, and real.", "She turned a public fall into a private forge and came back carrying light like a weapon.", "Now the same world that once reduced her to image has to face the strength behind it."],
      },
    },
  };

  function getAvatarThemeVariant(theme, category) {
    return theme?.[category] || theme?.male || theme?.female || null;
  }

  function buildAvatarDisplayName(theme, variant, seed, sequenceIndex = 0) {
    const firstPool = Array.isArray(variant.first) && variant.first.length ? variant.first : ["Legacy"];
    const secondPool = Array.isArray(variant.second) && variant.second.length ? variant.second : ["Ascendant"];
    const firstIndex = sequenceIndex % firstPool.length;
    const secondIndex = ((sequenceIndex * 5) + Math.floor(sequenceIndex / firstPool.length)) % secondPool.length;
    const first = firstPool[firstIndex];
    const second = secondPool[secondIndex];
    return `${first} ${second}`.trim();
  }

  function buildAvatarStory(displayName, collectionId, variant, category, seed) {
    const pronouns = getAvatarPronouns(category);
    const world = AVATAR_STORY_WORLDS[collectionId] || AVATAR_STORY_WORLDS.default || AVATAR_STORY_WORLDS.legends;
    const look = pickAvatarLoreItem(variant.looks, seed, 5);
    const origin = pickAvatarLoreItem(world.origins, seed * 5, 9);
    const fracture = pickAvatarLoreItem(world.fractures, seed * 7, 3);
    const exile = pickAvatarLoreItem(world.exiles, seed * 11, 4);
    const returnLine = pickAvatarLoreItem(world.returns, seed * 13, 8);
    const legacyMark = pickAvatarLoreItem(world.legacy, seed * 17, 2);
    const sharedTruth = pickAvatarLoreItem(AVATAR_LEGACY_TRUTHS, seed, 5);

    return [
      `${displayName} was never handed a myth. ${pronouns.subjectCap} began as ${origin}, and ${fracture}. Instead of vanishing for good, ${pronouns.subject} disappeared into ${exile}, where silence, deliberate work, and unshaken discipline remade the person beneath the shame.`,
      `The version that returned wore ${look} and moved like ${returnLine}. ${legacyMark} ${sharedTruth}`,
    ].join("\n\n");
  }

  const shellState = {
    profileSummary: null,
  };
  const ACCOUNT_AVATAR_LEGACY_UNLOCK_LEVEL = 51;

  function buildAvatarStats(collectionId, seed, summary = shellState.profileSummary) {
    const profile = AVATAR_STAT_PROFILES[collectionId] || AVATAR_STAT_PROFILES.default;
    const liveLevel = getAvatarUnlockLevel(summary);
    const roleBonus = role === "coach" ? 2 : role === "super_admin" ? 1 : 0;
    const collectionBonus = ["tier1", "tier2", "tier3", "tier4", "tier5"].includes(collectionId)
      ? Math.max(0, Number(collectionId.slice(-1)) - 1) * 2
      : liveLevel >= ACCOUNT_AVATAR_LEGACY_UNLOCK_LEVEL
        ? Math.min(8, Math.floor((liveLevel - ACCOUNT_AVATAR_LEGACY_UNLOCK_LEVEL) / 4) + 4)
        : 0;
    const buildGroup = (groupKey, seedOffset) =>
      Object.entries(profile[groupKey] || {}).map(([label, value], index) => {
        const variation = (((seed >> ((index + seedOffset) % 8)) & 7) - 3) * 2;
        return {
          label,
          value: Math.max(42, Math.min(98, value + variation + collectionBonus + roleBonus)),
        };
      });

    return {
      gpp: buildGroup("gpp", 1),
    };
  }

  function getAvatarThemeVariableEntries(themeId, seedSource) {
    const visual = AVATAR_PREVIEW_THEMES[themeId] || AVATAR_PREVIEW_THEMES.default;
    const seed = Math.abs(hashAvatarSeed(String(seedSource || themeId || "avatar")));

    return [
      ["--avatar-accent", visual.accent],
      ["--avatar-accent-rgb", hexToRgbChannels(visual.accent)],
      ["--avatar-accent-alt", visual.accentAlt],
      ["--avatar-accent-alt-rgb", hexToRgbChannels(visual.accentAlt)],
      ["--avatar-accent-soft", visual.soft],
      ["--avatar-accent-soft-rgb", hexToRgbChannels(visual.soft)],
      ["--avatar-accent-deep", visual.deep],
      ["--avatar-accent-deep-rgb", hexToRgbChannels(visual.deep)],
      ["--avatar-sigil-top", `${8 + (seed % 10)}%`],
      ["--avatar-sigil-left", `${20 + ((seed >> 3) % 30)}%`],
      ["--avatar-sigil-width", `${52 + ((seed >> 6) % 24)}%`],
      ["--avatar-sigil-height", `${38 + ((seed >> 9) % 22)}%`],
      ["--avatar-sigil-rotate", `${-18 + ((seed >> 12) % 36)}deg`],
      ["--avatar-wash-one-x", `${14 + ((seed >> 15) % 18)}%`],
      ["--avatar-wash-one-y", `${12 + ((seed >> 18) % 18)}%`],
      ["--avatar-wash-two-x", `${68 + ((seed >> 21) % 16)}%`],
      ["--avatar-wash-two-y", `${8 + ((seed >> 24) % 16)}%`],
      ["--avatar-grid-focus-x", `${44 + ((seed >> 2) % 20)}%`],
      ["--avatar-grid-focus-y", `${34 + ((seed >> 5) % 16)}%`],
      ["--avatar-grid-rotate", `${-8 + ((seed >> 8) % 16)}deg`],
      ["--avatar-beam-one-top", `${14 + ((seed >> 11) % 10)}%`],
      ["--avatar-beam-two-bottom", `${14 + ((seed >> 14) % 12)}%`],
      ["--avatar-beam-one-width", `${46 + ((seed >> 17) % 16)}%`],
      ["--avatar-beam-two-width", `${44 + ((seed >> 20) % 18)}%`],
      ["--avatar-beam-one-angle", `${-22 + ((seed >> 23) % 18)}deg`],
      ["--avatar-beam-two-angle", `${10 + ((seed >> 26) % 16)}deg`],
      ["--avatar-spark-one-x", `${14 + ((seed >> 4) % 16)}%`],
      ["--avatar-spark-one-y", `${16 + ((seed >> 7) % 14)}%`],
      ["--avatar-spark-two-x", `${70 + ((seed >> 10) % 12)}%`],
      ["--avatar-spark-two-y", `${64 + ((seed >> 13) % 12)}%`],
      ["--avatar-spark-three-x", `${76 + ((seed >> 16) % 10)}%`],
      ["--avatar-spark-three-y", `${24 + ((seed >> 19) % 20)}%`],
      ["--avatar-spark-four-x", `${10 + ((seed >> 22) % 12)}%`],
      ["--avatar-spark-four-y", `${70 + ((seed >> 25) % 10)}%`],
    ];
  }

  function buildAvatarThemeStyle(themeId, seedSource) {
    return getAvatarThemeVariableEntries(themeId, seedSource)
      .map(([key, value]) => `${key}:${value}`)
      .join(";");
  }

  function buildAvatarStatsMarkup(stats, collectionId = "default", modifierClass = "") {
    if (!stats) {
      return "";
    }

    const themeId = collectionId || "default";
    const ui = AVATAR_COLLECTION_UI[themeId] || AVATAR_COLLECTION_UI.default;

    const renderBlocks = (value) => {
      const activeBlocks = Math.max(1, Math.min(10, Math.round((Number(value) || 0) / 10)));
      return Array.from({ length: 10 }, (_, index) =>
        `<span class="appearance-avatar-story__stat-block appearance-avatar-story__stat-block--${themeId}${index < activeBlocks ? " is-active" : ""}"></span>`
      ).join("");
    };

    const renderGroup = (title, items, shortLabel) => `
      <section class="appearance-avatar-story__stat-card appearance-avatar-story__stat-card--${themeId}">
        <div class="appearance-avatar-story__stat-head">
          <span>${title}</span>
          <small>${shortLabel}</small>
        </div>
        <div class="appearance-avatar-story__stat-list appearance-avatar-story__stat-list--${themeId}">
          ${(items || [])
            .map(
              (item) => `
                <div class="appearance-avatar-story__stat-row appearance-avatar-story__stat-row--${themeId}">
                  <div class="appearance-avatar-story__stat-meta">
                    <span>${escapeHtml(item.label)}</span>
                    <strong>${escapeHtml(String(item.value))}</strong>
                  </div>
                  <span class="appearance-avatar-story__stat-track appearance-avatar-story__stat-track--${themeId}">
                    ${renderBlocks(item.value)}
                  </span>
                </div>
              `
            )
            .join("")}
        </div>
      </section>
    `;

    return `
      <div class="appearance-avatar-story__stats ${modifierClass}" data-avatar-collection="${themeId}">
        ${renderGroup("General Physical Preparedness", stats.gpp, ui.shortLabel || "GPP")}
      </div>
    `;
  }

  function applyAvatarThemeToNode(node, collectionId, seedSource = collectionId) {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    const themeId = collectionId || "default";
    getAvatarThemeVariableEntries(themeId, seedSource).forEach(([key, value]) => {
      node.style.setProperty(key, value);
    });
    node.dataset.avatarCollection = themeId;
  }

  function buildCustomAvatarFallbackStory(summary, characterName) {
    const progressCurrent = Number(summary?.progress?.current || 0);
    const level = Math.max(0, Math.floor(progressCurrent / 5000));
    const roleCopy = role === "coach"
      ? "leads from the front, turning roster pressure into a system of calm execution"
      : role === "super_admin"
        ? "operates above the noise, keeping the whole machine sharp when the room gets heavy"
        : "builds momentum through real reps, patient discipline, and repeatable proof";

    return `${characterName} is your personal character profile inside LEGACY+. This story is custom, but the progression is live. Level ${level} and your current XP feed the GPP card automatically so the portrait still reflects what you are actually building.\n\n${characterName} ${roleCopy}.`;
  }

  function getAvatarUnlockLevel(summary = shellState.profileSummary) {
    const currentXp = Math.max(Number(summary?.progress?.current || 0), 0);
    return Math.max(0, Math.floor(currentXp / 5000));
  }

  function buildLiveAvatarStats(summary) {
    const currentXp = Math.max(Number(summary?.progress?.current || 0), 0);
    const level = Math.max(0, Math.floor(currentXp / 5000));
    const progressPercent = Math.max(0, Math.min(100, Number(summary?.progress?.percent || 0)));
    const tokenCount = Math.max(Number(summary?.tokenCount || 0), 0);
    const roleBias = role === "coach" ? 8 : role === "super_admin" ? 6 : 10;
    const clamp = (value) => Math.max(48, Math.min(98, Math.round(value)));

    return {
      gpp: [
        { label: "Consistency", value: clamp(52 + level * 3.8 + progressPercent * 0.16) },
        { label: "Work Capacity", value: clamp(50 + level * 2.9 + progressPercent * 0.24) },
        { label: "Control", value: clamp(48 + roleBias + level * 2.2 + Math.min(tokenCount, 36) * 0.42) },
        { label: "Recovery", value: clamp(50 + level * 1.8 + (100 - progressPercent) * 0.12 + roleBias * 0.4) },
        { label: "Output", value: clamp(49 + level * 3.1 + Math.min(tokenCount, 42) * 0.48) },
        { label: "Resilience", value: clamp(54 + level * 2.7 + progressPercent * 0.18) },
      ],
    };
  }

  function getAvatarIdentity(previewState = getPreviewAvatarState()) {
    const activeCollection = previewState?.activeCollection || null;
    const selectedPreset = previewState?.selectedPreset || null;
    const summary = previewState?.summary || shellState.profileSummary || { displayName: roleLabel(role), progress: {} };
    const collectionId = selectedPreset?.collectionId || activeCollection?.id || "default";
    const collectionLabel = selectedPreset?.collectionLabel || activeCollection?.label || "Legacy";
    const collectionUi = AVATAR_COLLECTION_UI[collectionId] || AVATAR_COLLECTION_UI.default;
    const name = selectedPreset?.name || summary.displayName || roleLabel(role);
    const backstory = selectedPreset?.story || buildCustomAvatarFallbackStory(summary, name);
    const stats = selectedPreset
      ? buildAvatarStats(collectionId, hashAvatarSeed(selectedPreset.id || selectedPreset.image || name), summary)
      : buildLiveAvatarStats(summary);

    return {
      ...previewState,
      summary,
      name,
      backstory,
      stats,
      collectionId,
      collectionLabel,
      storyKicker: `${collectionLabel} Archive`,
      statsKicker: selectedPreset ? collectionUi.statsKicker : "Live GPP Profile",
      statsTitle: selectedPreset ? `${name} | ${collectionUi.statsTitle || "GPP"}` : `${name} | Live Progress Profile`,
      statsCopy:
        selectedPreset
          ? collectionUi.statsCopy || "General physical preparedness breakdown for this portrait."
          : "This GPP card is generated from your real XP, level, gym coins, and live account momentum.",
      themeSeed:
        selectedPreset?.id
        || previewState?.selectedAvatarUrl
        || `${collectionId}:${name}`,
    };
  }

  function getAvatarPreviewThemeStyle(preset, collection) {
    const themeId = preset?.collectionId || collection?.id || "default";
    const seedSource = preset?.id || preset?.image || themeId;
    return buildAvatarThemeStyle(themeId, seedSource);
  }

  const avatarDecorateCounters = new Map();

  function decorateAvatarPreset(preset) {
    if (preset?.manualIdentity) {
      return { ...preset };
    }

    const theme = AVATAR_LORE_THEMES[preset.collectionId] || AVATAR_LORE_THEMES.legends;
    const variant = getAvatarThemeVariant(theme, preset.category);
    const seed = hashAvatarSeed(preset.id);
    const counterKey = `${preset.collectionId}:${preset.category}`;
    const sequenceIndex = avatarDecorateCounters.get(counterKey) || 0;
    avatarDecorateCounters.set(counterKey, sequenceIndex + 1);
    const displayName = variant ? buildAvatarDisplayName(theme, variant, seed, sequenceIndex) : preset.name;
    const story = variant ? buildAvatarStory(displayName, preset.collectionId, variant, preset.category, seed) : preset.story || "";
    const stats = buildAvatarStats(preset.collectionId, seed);

    return {
      ...preset,
      name: displayName,
      story,
      stats,
    };
  }

  const STARTER_AVATAR_PRESETS = [
    ...buildNamedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v2/western_male",
      names: ["aries", "leo", "libra", "scorpio", "taurus"],
      fileSuffix: "-male",
      category: "male",
      groupId: "tier1-men",
      groupLabel: "Rookie Path",
      collectionId: "tier1",
      collectionLabel: "First Spark",
      namePrefix: "Rookie",
    }),
    ...buildNamedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v2/western_female",
      names: ["aries", "leo", "libra", "scorpio", "taurus"],
      fileSuffix: "-female",
      category: "female",
      groupId: "tier1-women",
      groupLabel: "Rookie Path",
      collectionId: "tier1",
      collectionLabel: "First Spark",
      namePrefix: "Rookie",
    }),
    ...buildNamedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v2/chinese_male",
      names: ["dragon", "horse", "rabbit", "snake", "tiger"],
      fileSuffix: "-male",
      category: "male",
      groupId: "tier2-men",
      groupLabel: "Contender Path",
      collectionId: "tier2",
      collectionLabel: "Street Steel",
      namePrefix: "Contender",
    }),
    ...buildNamedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v2/chinese_female",
      names: ["dragon", "horse", "rabbit", "snake", "tiger"],
      fileSuffix: "-female",
      category: "female",
      groupId: "tier2-women",
      groupLabel: "Contender Path",
      collectionId: "tier2",
      collectionLabel: "Street Steel",
      namePrefix: "Contender",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v3/male",
      filePrefix: "male",
      start: 1,
      end: 5,
      category: "male",
      groupId: "tier3-men",
      groupLabel: "Hybrid Path",
      collectionId: "tier3",
      collectionLabel: "Wildframe",
      namePrefix: "Hybrid",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v3/female",
      filePrefix: "female",
      start: 1,
      end: 5,
      category: "female",
      groupId: "tier3-women",
      groupLabel: "Hybrid Path",
      collectionId: "tier3",
      collectionLabel: "Wildframe",
      namePrefix: "Hybrid",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/male_legends",
      filePrefix: "male",
      start: 1,
      end: 5,
      category: "male",
      groupId: "tier4-men",
      groupLabel: "Elite Path",
      collectionId: "tier4",
      collectionLabel: "Runebound",
      namePrefix: "Elite",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/female_legends",
      filePrefix: "female",
      start: 1,
      end: 5,
      category: "female",
      groupId: "tier4-women",
      groupLabel: "Elite Path",
      collectionId: "tier4",
      collectionLabel: "Runebound",
      namePrefix: "Elite",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/male_titans",
      filePrefix: "titan",
      start: 1,
      end: 5,
      category: "male",
      groupId: "tier5-men",
      groupLabel: "Ascendant Path",
      collectionId: "tier5",
      collectionLabel: "Ascendant",
      namePrefix: "Ascendant",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v4/female",
      filePrefix: "female",
      start: 1,
      end: 5,
      category: "female",
      groupId: "tier5-women",
      groupLabel: "Ascendant Path",
      collectionId: "tier5",
      collectionLabel: "Ascendant",
      namePrefix: "Ascendant",
    }),
  ];

  const ACCOUNT_AVATAR_PRESETS = [
    ...STARTER_AVATAR_PRESETS,
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/female_legends",
      filePrefix: "female",
      start: 1,
      end: 15,
      category: "female",
      groupId: "female-legends",
      groupLabel: "Female Emberguard",
      collectionId: "legends",
      collectionLabel: "Emberguard",
      namePrefix: "Legend",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v3/female",
      filePrefix: "female",
      start: 1,
      end: 20,
      category: "female",
      groupId: "classic-women-v3",
      groupLabel: "Female Crownfall",
      collectionId: "v3",
      collectionLabel: "Crownfall",
      namePrefix: "Classic",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v4/female",
      filePrefix: "female",
      start: 1,
      end: 17,
      category: "female",
      groupId: "modern-women-v4",
      groupLabel: "Female Radiant Court",
      collectionId: "v4",
      collectionLabel: "Radiant Court",
      namePrefix: "Oracle",
    }),
    ...buildNamedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v2/chinese_female",
      names: ["dog", "dragon", "goat", "horse", "monkey", "ox", "pig", "rabbit", "rat", "rooster", "snake", "tiger"],
      fileSuffix: "-female",
      category: "female",
      groupId: "lunar-women",
      groupLabel: "Female Jade Zodiac",
      collectionId: "chinese",
      collectionLabel: "Jade Zodiac",
      namePrefix: "Lunar",
    }),
    ...buildNamedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v2/western_female",
      names: ["aquarius", "aries", "cancer", "capricorn", "gemini", "leo", "libra", "pisces", "sagittarius", "scorpio", "taurus", "virgo"],
      fileSuffix: "-female",
      category: "female",
      groupId: "zodiac-women",
      groupLabel: "Female Astral Houses",
      collectionId: "western",
      collectionLabel: "Astral Houses",
      namePrefix: "Zodiac",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/male_legends",
      filePrefix: "male",
      start: 1,
      end: 15,
      category: "male",
      groupId: "male-legends",
      groupLabel: "Male Emberguard",
      collectionId: "legends",
      collectionLabel: "Emberguard",
      namePrefix: "Legend",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/male_titans",
      filePrefix: "titan",
      start: 1,
      end: 10,
      category: "male",
      groupId: "male-titans",
      groupLabel: "Male Iron Dominion",
      collectionId: "titans",
      collectionLabel: "Iron Dominion",
      namePrefix: "Titan",
    }),
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v3/male",
      filePrefix: "male",
      start: 1,
      end: 20,
      category: "male",
      groupId: "classic-men-v3",
      groupLabel: "Male Crownfall",
      collectionId: "v3",
      collectionLabel: "Crownfall",
      namePrefix: "Classic",
    }),
    ...buildNamedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v2/chinese_male",
      names: ["dog", "dragon", "goat", "horse", "monkey", "ox", "pig", "rabbit", "rat", "rooster", "snake", "tiger"],
      fileSuffix: "-male",
      category: "male",
      groupId: "lunar-men",
      groupLabel: "Male Jade Zodiac",
      collectionId: "chinese",
      collectionLabel: "Jade Zodiac",
      namePrefix: "Lunar",
    }),
    ...buildNamedAvatarCollection({
      basePath: "./assets/CRM%20Pictures/v2/western_male",
      names: ["aquarius", "aries", "cancer", "capricorn", "gemini", "leo", "libra", "pisces", "sagittarius", "scorpio", "taurus", "virgo"],
      fileSuffix: "-male",
      category: "male",
      groupId: "zodiac-men",
      groupLabel: "Male Astral Houses",
      collectionId: "western",
      collectionLabel: "Astral Houses",
      namePrefix: "Zodiac",
    }),
  ].map((preset) => decorateAvatarPreset(preset));

  const ACCOUNT_AVATAR_STARTER_COLLECTIONS = [
    { id: "tier1", label: "First Spark", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
    { id: "tier2", label: "Street Steel", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
    { id: "tier3", label: "Wildframe", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
    { id: "tier4", label: "Runebound", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
    { id: "tier5", label: "Ascendant", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
  ];

  const ACCOUNT_AVATAR_LEGACY_COLLECTIONS = [
    { id: "legends", label: "Emberguard", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
    { id: "titans", label: "Iron Dominion", characterTypes: [{ id: "male", label: "Male" }] },
    { id: "v3", label: "Crownfall", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
    { id: "v4", label: "Radiant Court", characterTypes: [{ id: "female", label: "Female" }] },
    { id: "chinese", label: "Jade Zodiac", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
    { id: "western", label: "Astral Houses", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
  ];

  const ACCOUNT_AVATAR_COLLECTIONS = [
    ...ACCOUNT_AVATAR_STARTER_COLLECTIONS,
    ...ACCOUNT_AVATAR_LEGACY_COLLECTIONS,
  ];

  const ACCOUNT_AVATAR_STARTER_TRACK = [
    { collectionId: "tier1", tierLabel: "Rookie Path", levelMin: 0, levelMax: 10, chapterCopy: "Clean beginner frame" },
    { collectionId: "tier2", tierLabel: "Contender Path", levelMin: 11, levelMax: 20, chapterCopy: "Sharper street build" },
    { collectionId: "tier3", tierLabel: "Hybrid Path", levelMin: 21, levelMax: 30, chapterCopy: "Wild mid-tier rise" },
    { collectionId: "tier4", tierLabel: "Elite Path", levelMin: 31, levelMax: 40, chapterCopy: "Controlled high-tier force" },
    { collectionId: "tier5", tierLabel: "Ascendant Path", levelMin: 41, levelMax: 50, chapterCopy: "Final pre-legacy form" },
  ];

  const ACCOUNT_AVATAR_LEGACY_TRACKS = {
    male: [
      { collectionId: "legends", tierLabel: "Legacy I", levelMin: 51, levelMax: 60, chapterCopy: "Emberguard opens" },
      { collectionId: "titans", tierLabel: "Legacy II", levelMin: 61, levelMax: 70, chapterCopy: "Dominion unlocked" },
      { collectionId: "v3", tierLabel: "Legacy III", levelMin: 71, levelMax: 80, chapterCopy: "Crownfall expands" },
      { collectionId: "chinese", tierLabel: "Legacy IV", levelMin: 81, levelMax: 90, chapterCopy: "Jade forms awaken" },
      { collectionId: "western", tierLabel: "Legacy V", levelMin: 91, levelMax: 100, chapterCopy: "Astral vault opens" },
    ],
    female: [
      { collectionId: "legends", tierLabel: "Legacy I", levelMin: 51, levelMax: 60, chapterCopy: "Emberguard opens" },
      { collectionId: "v4", tierLabel: "Legacy II", levelMin: 61, levelMax: 70, chapterCopy: "Radiant Court unlocks" },
      { collectionId: "v3", tierLabel: "Legacy III", levelMin: 71, levelMax: 80, chapterCopy: "Crownfall expands" },
      { collectionId: "chinese", tierLabel: "Legacy IV", levelMin: 81, levelMax: 90, chapterCopy: "Jade forms awaken" },
      { collectionId: "western", tierLabel: "Legacy V", levelMin: 91, levelMax: 100, chapterCopy: "Astral vault opens" },
    ],
  };

  const ACCOUNT_EMAIL_GENDER_OVERRIDES = {
    "lukelango@legacycoaching.com.my": "male",
    "luke_raj@hotmail.com": "male",
    "lucasraj93@gmail.com": "male",
  };

  const ACCOUNT_AVATAR_DEPRECATED_PATH_FALLBACKS = {
    "./assets/CRM%20Pictures/path_tiers/male/male-tier-01.svg": "./assets/CRM%20Pictures/v2/western_male/aries-male.png",
    "./assets/CRM%20Pictures/path_tiers/male/male-tier-02.svg": "./assets/CRM%20Pictures/v2/chinese_male/dragon-male.png",
    "./assets/CRM%20Pictures/path_tiers/male/male-tier-03.svg": "./assets/CRM%20Pictures/v3/male/male-01.png",
    "./assets/CRM%20Pictures/path_tiers/male/male-tier-04.svg": "./assets/CRM%20Pictures/male_legends/male-01.png",
    "./assets/CRM%20Pictures/path_tiers/male/male-tier-05.svg": "./assets/CRM%20Pictures/male_titans/titan-01.png",
    "./assets/CRM%20Pictures/path_tiers/female/female-tier-01.svg": "./assets/CRM%20Pictures/v2/western_female/aries-female.png",
    "./assets/CRM%20Pictures/path_tiers/female/female-tier-02.svg": "./assets/CRM%20Pictures/v2/chinese_female/dragon-female.png",
    "./assets/CRM%20Pictures/path_tiers/female/female-tier-03.svg": "./assets/CRM%20Pictures/v3/female/female-01.png",
    "./assets/CRM%20Pictures/path_tiers/female/female-tier-04.svg": "./assets/CRM%20Pictures/female_legends/female-01.png",
    "./assets/CRM%20Pictures/path_tiers/female/female-tier-05.svg": "./assets/CRM%20Pictures/v4/female/female-01.png",
  };

  const ACCOUNT_ROLE_AVATAR_DEFAULTS = {
    super_admin: {
      male: "./assets/CRM%20Pictures/v2/western_male/aries-male.png",
      female: "./assets/CRM%20Pictures/v2/western_female/aries-female.png",
    },
    coach: {
      male: "./assets/CRM%20Pictures/v2/western_male/aries-male.png",
      female: "./assets/CRM%20Pictures/v2/western_female/aries-female.png",
    },
    client: {
      male: "./assets/CRM%20Pictures/v2/western_male/aries-male.png",
      female: "./assets/CRM%20Pictures/v2/western_female/aries-female.png",
    },
  };

  const ACCOUNT_AVATAR_DEFAULTS = {
    "lukelango@legacycoaching.com.my": "./assets/CRM%20Pictures/v2/western_male/aries-male.png",
    "luke_raj@hotmail.com": "./assets/CRM%20Pictures/v2/western_male/aries-male.png",
    "lucasraj93@gmail.com": "./assets/CRM%20Pictures/v2/western_male/aries-male.png",
  };

  const TUTORIAL_VERSION = "20260405-app-shell-guided3";
  const MESSAGE_CATEGORY_PATTERN = /message|whatsapp|email|follow|booking|session|calendar|lead/iu;
  const TIME_SLOT_START_HOUR = 6;
  const TIME_SLOT_END_HOUR = 22;
  const TIME_SLOT_INTERVAL_MINUTES = 30;
  const SHELL_REFRESH_DEBOUNCE_MS = 180;
  const NAV_ICON_MAP = {
    home:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.5 12 3l8.5 7.5"></path><path d="M6.5 9.5V20h11V9.5"></path><path d="M10 20v-5h4v5"></path></svg>',
    clients:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path><path d="M16.5 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path><path d="M3.5 19c.8-2.6 2.9-4 6-4s5.2 1.4 6 4"></path><path d="M14.5 18.5c.6-1.8 2-2.8 4.2-3"></path></svg>',
    client_xp:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.2 4.6 5.1.7-3.7 3.6.9 5.1-4.5-2.4-4.5 2.4.9-5.1-3.7-3.6 5.1-.7Z"></path></svg>',
    coach_xp:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.2 4.6 5.1.7-3.7 3.6.9 5.1-4.5-2.4-4.5 2.4.9-5.1-3.7-3.6 5.1-.7Z"></path><path d="M12 14v7"></path></svg>',
    training:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h3"></path><path d="M17 10h3"></path><path d="M7 8v4"></path><path d="M17 8v4"></path><path d="M10 7v6"></path><path d="M14 7v6"></path><path d="M10 10h4"></path></svg>',
    nutrition:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20c4.4 0 8-3.1 8-7s-3.6-7-8-7-8 3.1-8 7 3.6 7 8 7Z"></path><path d="M12 20c-1.6-1.7-2.4-4-2.4-6.8S10.4 8 12 6"></path><path d="M12 20c1.6-1.7 2.4-4 2.4-6.8S13.6 8 12 6"></path><path d="M6.5 10.5h11"></path></svg>',
    programming:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20c4.4 0 8-3.1 8-7s-3.6-7-8-7-8 3.1-8 7 3.6 7 8 7Z"></path><path d="M12 20c-1.6-1.7-2.4-4-2.4-6.8S10.4 8 12 6"></path><path d="M12 20c1.6-1.7 2.4-4 2.4-6.8S13.6 8 12 6"></path><path d="M6.5 10.5h11"></path></svg>',
    health:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-6.5-4.2-8.3-7.8C2.3 9.5 4 6 7.5 6c1.9 0 3.3 1 4.5 2.6C13.2 7 14.6 6 16.5 6 20 6 21.7 9.5 20.3 12.2 18.5 15.8 12 20 12 20Z"></path><path d="M8 12h2l1.2-2.2L13 14h3"></path></svg>',
    progress:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5h15"></path><path d="M7.5 16V11"></path><path d="M12 16V7"></path><path d="M16.5 16v-4"></path></svg>',
    schedule:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3"></path><path d="M17 3v3"></path><path d="M4 8h16"></path><path d="M5.5 5.5h13A1.5 1.5 0 0 1 20 7v11.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5V7A1.5 1.5 0 0 1 5.5 5.5Z"></path><path d="M8 12h3"></path><path d="M8 16h6"></path></svg>',
    commissions:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18V9"></path><path d="M12 18V5"></path><path d="M19 18v-7"></path><path d="M3.5 20.5h17"></path></svg>',
    financials:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18V9"></path><path d="M12 18V5"></path><path d="M19 18v-7"></path><path d="M3.5 20.5h17"></path></svg>',
    planner:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path><path d="M8 17h7"></path></svg>',
    packages:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5 12 4l8 4.5-8 4.5Z"></path><path d="M4 8.5V16l8 4 8-4V8.5"></path><path d="M12 13v7"></path></svg>',
    rewards:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 14.3 8.6l5 .7-3.6 3.5.9 5-4.6-2.4-4.6 2.4.9-5-3.6-3.5 5-.7Z"></path></svg>',
    leads:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h12"></path><path d="M8.5 19v-3.5a3.5 3.5 0 0 1 7 0V19"></path><path d="M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"></path></svg>',
    profile:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6Z"></path><path d="M5 19c1-3 3.4-4.7 7-4.7s6 1.7 7 4.7"></path></svg>',
    settings:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"></path><path d="M19.4 15.1 21 12l-1.6-3.1-3.1-.5-2-2.7H9.7l-2 2.7-3.1.5L3 12l1.6 3.1 3.1.5 2 2.7h4.6l2-2.7Z"></path></svg>',
    default:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>',
  };

  const ROLE_SHELLS = {
    client: {
      brand: 'LEGACY<span>+</span> Client',
      copy: "Packages, schedule, rewards, and settings in one private workspace.",
      nav: [
        { key: "home", href: "/client-dashboard.html", label: "Home" },
        { key: "training", href: "/client-planner.html?tab=training", label: "Training" },
        { key: "nutrition", href: "/client-planner.html?tab=nutrition", label: "Nutrition" },
        { key: "health", href: "/client-planner.html?tab=health", label: "Health" },
        { key: "progress", href: "/client-planner.html?tab=progress", label: "Progress" },
        { key: "packages", href: "/client-packages.html", label: "Packages" },
        { key: "schedule", href: "/client-schedule.html", label: "Schedule" },
        { key: "rewards", href: "/client-rewards.html", label: "Rewards" },
        { key: "profile", href: "/client-profile.html", label: "Profile" },
        { key: "settings", href: "/client-settings.html", label: "Settings" },
      ],
      tutorial: [
        {
          title: "Your private workspace",
          body: "Use the left navigation as your main control panel. Home is your snapshot, not the place for every workflow.",
        },
        {
          title: "Packages and balance",
          body: "Open Packages to buy sessions, review package expiry, and confirm how many sessions are still free to book.",
        },
        {
          title: "Planner delivery",
          body: "Open Planner for coach-assigned training days, nutrition targets, health updates, and progress-photo instructions in one place.",
        },
        {
          title: "Scheduling",
          body: "Use Schedule to request sessions, check coach availability, and submit reschedule or cancellation requests.",
        },
        {
          title: "Rewards and progress",
          body: "Rewards tracks your XP, gym coins, and milestones. Settings lets you preview and apply your profile portrait.",
        },
      ],
    },
    coach: {
      brand: 'LEGACY<span>+</span> Coach',
      copy: "",
      nav: [
        { key: "home", href: "/coach-dashboard.html", label: "Home" },
        { key: "clients", href: "/coach-clients.html", label: "Clients" },
        { key: "client_xp", href: "/XP%20gamification/staff.html", label: "Client XP" },
        { key: "training", href: "/coach-training.html", label: "Training" },
        { key: "programming", href: "/coach-programming.html", label: "Nutrition" },
        { key: "health", href: "/coach-health.html", label: "Health" },
        { key: "schedule", href: "/coach-schedule.html", label: "Schedule" },
        { key: "commissions", href: "/coach-commissions.html", label: "Commissions" },
        { key: "profile", href: "/coach-profile.html", label: "Profile" },
        { key: "settings", href: "/coach-settings.html", label: "Settings" },
      ],
      tutorial: [
        {
          title: "Coach control panel",
          body: "Home is your operating snapshot. The banner buttons show alerts, message items, and the tutorial any time you need a refresher.",
        },
        {
          title: "Clients and rewards",
          body: "Open Clients to review your roster, active packages, and submit reward requests that wait for super admin approval.",
        },
        {
          title: "Client XP logging",
          body: "Client XP gives you the protected event logger and ledger views for existing members without giving coaches member-creation or rules access.",
        },
        {
          title: "Training desk",
          body: "Open Training to build repeatable blocks, assign workouts, and manage the coach-side calendar in one focused training workspace.",
        },
        {
          title: "Nutrition + health ops",
          body: "Open Nutrition to manage meal guidance, health forms, review queues, and roster nudges without mixing them into workout building.",
        },
        {
          title: "Scheduling workflow",
          body: "Open Schedule to publish availability, approve booking requests, connect Google Calendar, and complete sessions.",
        },
        {
          title: "Commission tracking",
          body: "Commissions shows what has been generated, approved, and paid so your monthly payout trail stays visible.",
        },
      ],
    },
    super_admin: {
      brand: 'LEGACY<span>+</span> CRM',
      copy: "Lead flow, client operations, coach performance, and financial oversight from one admin workspace.",
      nav: [
        { key: "home", href: "/admin-dashboard.html", label: "Home" },
        { key: "clients", href: "/admin-clients.html", label: "TEAM" },
        { key: "client_xp", href: "/XP%20gamification/admin.html", label: "Client XP" },
        { key: "coach_xp", href: "/XP%20coach%20gamification/index.html", label: "Coach XP" },
        { key: "leads", href: "/admin-leads.html", label: "Leads" },
        { key: "financials", href: "/admin-financials.html", label: "Financials" },
        { key: "settings", href: "/admin-settings.html", label: "Settings" },
      ],
      tutorial: [
        {
          title: "Admin overview",
          body: "Home gives you the live KPI snapshot. Use it to spot approvals, unread notifications, and business issues that need action first.",
        },
        {
          title: "Team operations",
          body: "The TEAM section controls coach setup, assignments, reward approvals, and who owns each client relationship inside the CRM.",
        },
        {
          title: "Client XP control",
          body: "Client XP is the admin-only module for bundle imports, member creation, profile linking, ledger review, and coin redemption.",
        },
        {
          title: "Coach XP control",
          body: "Coach XP is a management-only module for roster records, XP rules, event logging, trials, and seeding. Coaches do not have access to this engine.",
        },
        {
          title: "Lead pipeline",
          body: "Leads is your working CRM board for enquiry capture, follow-ups, message logging, and conversion into live client accounts.",
        },
        {
          title: "Financial control",
          body: "Financials is where you audit package purchases, payment status, and coach payout records. Settings holds portrait controls and integration references.",
        },
      ],
    },
  };

  const shellConfig = ROLE_SHELLS[role] || null;
  if (!shellConfig) {
    return;
  }

  const COACH_THEME_PRESETS = [
    {
      id: "ember-forge",
      legacyIds: ["luke"],
      name: "Forgebound Ember",
      subtitle: "Molten orange, black iron, and the house-forge heat.",
      accentRgb: "255, 128, 0",
      accent: "#ff8000",
      altRgb: "254, 161, 42",
      alt: "#fea12a",
      deep: "#6c2d00",
      previewImage: "./assets/legacy-gym-bg.jpeg",
    },
    {
      id: "vault-gold",
      legacyIds: ["ariff"],
      name: "Sunvault Regent",
      subtitle: "Regal gold, darker premium contrast, and a championship floor.",
      accentRgb: "212, 166, 74",
      accent: "#d4a64a",
      altRgb: "240, 207, 124",
      alt: "#f0cf7c",
      deep: "#5e4416",
      previewImage: "./assets/why-app-progress.jpg",
    },
    {
      id: "sea-current",
      legacyIds: ["kylie"],
      name: "Tideglass Current",
      subtitle: "Tropical teal with cooler athletic-tech edge lighting.",
      accentRgb: "6, 168, 153",
      accent: "#06a899",
      altRgb: "66, 214, 203",
      alt: "#42d6cb",
      deep: "#04463f",
      previewImage: "./assets/why-gym-floor.jpg",
    },
    {
      id: "neon-orchid",
      legacyIds: ["jenita"],
      name: "Orchid Voltage",
      subtitle: "Electric orchid with a sharper luxe-night voltage.",
      accentRgb: "192, 32, 160",
      accent: "#c020a0",
      altRgb: "238, 130, 238",
      alt: "#ee82ee",
      deep: "#531046",
      previewImage: "./assets/why-coach-support.jpg",
    },
    {
      id: "solar-flare",
      legacyIds: ["shobana"],
      name: "Dawnfire Crest",
      subtitle: "Bright yellow, rich gold, and a sunrise-crest charge.",
      accentRgb: "255, 255, 0",
      accent: "#ffff00",
      altRgb: "255, 213, 74",
      alt: "#ffd54a",
      deep: "#6b6200",
      previewImage: "./assets/why-coach-client.jpg",
    },
    {
      id: "cobalt-strike",
      name: "Stormwatch Cobalt",
      subtitle: "Electric cobalt and ice-blue edges with a sharper tactical lift.",
      accentRgb: "58, 126, 255",
      accent: "#3a7eff",
      altRgb: "138, 219, 255",
      alt: "#8adbff",
      deep: "#112d75",
      previewImage: "./assets/why-app-progress.jpg",
    },
    {
      id: "crimson-iron",
      name: "Warlord Crimson",
      subtitle: "Deep crimson, ember red, and a darker forged-metal frame.",
      accentRgb: "227, 70, 83",
      accent: "#e34653",
      altRgb: "255, 126, 118",
      alt: "#ff7e76",
      deep: "#5e1620",
      previewImage: "./assets/why-coach-client.jpg",
    },
    {
      id: "jade-pulse",
      name: "Verdant Pulse",
      subtitle: "Emerald intensity with a brighter athletic neon lift.",
      accentRgb: "44, 202, 129",
      accent: "#2cca81",
      altRgb: "132, 255, 191",
      alt: "#84ffbf",
      deep: "#0f4c34",
      previewImage: "./assets/why-gym-floor.jpg",
    },
    {
      id: "lunar-ice",
      name: "Moonfrost Vale",
      subtitle: "Frosted steel blue with colder white-blue highlights.",
      accentRgb: "137, 190, 255",
      accent: "#89beff",
      altRgb: "220, 242, 255",
      alt: "#dcf2ff",
      deep: "#1d3552",
      previewImage: "./assets/why-app-progress.jpg",
    },
    {
      id: "rose-noir",
      name: "Roseveil Noir",
      subtitle: "Smoked rose copper with a darker noir-luxury finish.",
      accentRgb: "219, 122, 148",
      accent: "#db7a94",
      altRgb: "255, 198, 184",
      alt: "#ffc6b8",
      deep: "#552130",
      previewImage: "./assets/why-coach-support.jpg",
    },
  ];

  const COACH_THEME_LOOKUP = new Map(
    COACH_THEME_PRESETS.flatMap((preset) => [
      [preset.id, preset],
      ...(preset.legacyIds || []).map((legacyId) => [legacyId, preset]),
    ])
  );

  const pageKey = body.dataset.accountPage || inferPageKey(role, window.location.pathname);
  function resolveActiveShellPageKey() {
    if (role === "client") {
      const filename = String(window.location.pathname || "").split("/").pop().toLowerCase();
      if (filename === "client-planner.html") {
        try {
          const params = new URLSearchParams(window.location.search || "");
          const requestedTab = String(params.get("tab") || "").trim().toLowerCase();
          const allowedTabs = new Set(["training", "nutrition", "health", "progress"]);
          return allowedTabs.has(requestedTab) ? requestedTab : "training";
        } catch (_) {
          return "training";
        }
      }
    }

    return pageKey;
  }

  function isShellNavItemActive(item) {
    return String(item?.key || "") === resolveActiveShellPageKey();
  }

  function resolveCurrentNavItem() {
    return shellConfig.nav.find((item) => isShellNavItemActive(item)) || shellConfig.nav[0];
  }

  const sidebarNode = document.getElementById("account-sidebar") || document.querySelector(".crm-sidebar");
  const appearanceGridNode = document.getElementById("account-appearance-presets");
  const appearanceFeedbackNode = document.getElementById("account-appearance-feedback");
  const appearanceCurrentNode = document.getElementById("account-appearance-current");
  const coachThemeGridNode = document.getElementById("account-coach-theme-presets");
  const coachThemeFeedbackNode = document.getElementById("account-coach-theme-feedback");
  const coachThemeCurrentNode = document.getElementById("account-coach-theme-current");
  const coachThemeApplyButtonNode = document.getElementById("account-coach-theme-apply");
  const avatarGridNode = document.getElementById("account-avatar-presets");
  const avatarFeedbackNode = document.getElementById("account-avatar-feedback");
  const avatarCurrentNode = document.getElementById("account-avatar-current");
  const avatarPreviewNode = document.getElementById("account-avatar-preview");
  const avatarCardPreviewNode = document.getElementById("account-avatar-card-preview");
  const avatarApplyButtonNode = document.getElementById("account-avatar-apply");
  const accountEmailNodes = Array.from(document.querySelectorAll("[data-account-email], #admin-email-display"));
  const securityEmailNodes = Array.from(document.querySelectorAll("[data-security-email]"));
  const securityUsernameNodes = Array.from(document.querySelectorAll("[data-security-username]"));
  const securityRoleNodes = Array.from(document.querySelectorAll("[data-security-role]"));
  const securityPasswordFormNode = document.getElementById("account-security-password-form");
  const securityResetButtonNode = document.getElementById("account-security-reset");
  const securityFeedbackNode = document.getElementById("account-security-feedback");
  const localAppearanceKey = `legacy-account-appearance:${role || "default"}`;
  const localCoachThemeKey = "legacy-coach-theme:v1";
  const tutorialStorageKey = `legacy-account-tutorial:${role}:${TUTORIAL_VERSION}`;
  const AUTH_ACCESS_CACHE_KEY = "legacy-auth-access:v1";
  const SHELL_CACHE_KEY = `legacy-account-shell-cache:v2:${role || "default"}`;
  const SHELL_CACHE_TTL_MS = 2 * 60 * 1000;
  const ACTIVE_PANEL_CACHE_KEY = `legacy-account-panel:v1:${role || "default"}:${pageKey || "default"}`;

  Object.assign(shellState, {
    accessToken: "",
    activeBackgroundId: "",
    activeCoachThemeId: "",
    access: null,
    profileSummary: null,
    notifications: [],
    preferences: {},
    preferencesPromise: null,
    activeOverlay: "",
    activeOverlayAnchor: null,
    overlayExpandedByKind: {
      notifications: false,
      messages: false,
    },
    tutorialStepIndex: 0,
    tutorialTargetSelector: "",
    tutorialForced: false,
    signOutBound: false,
    activePanelId: "",
    loadInFlight: false,
    refreshTimer: 0,
    pendingRefreshReason: "",
    pendingRefreshSilent: true,
    pendingCoachThemeId: "",
    pendingAvatarUrl: "",
    avatarStoryPage: 0,
    avatarCollectionId: "",
    avatarCharacterType: "",
    accountGender: "",
    liveBindingsReady: false,
    realtimeChannel: null,
    realtimeSubscriptionKey: "",
    navPrefetchBound: false,
    prefetchedUrls: new Set(),
  });

  const SHELL_REALTIME_TABLES = {
    client: ["profiles", "client_profiles", "coach_client_assignments", "notifications"],
    coach: ["profiles", "coach_client_assignments", "sessions", "notifications"],
    super_admin: ["profiles", "leads", "orders", "notifications"],
  };

  function normalizeCoachThemeId(value) {
    const normalizedValue = String(value || "").trim().toLowerCase();
    if (!normalizedValue || normalizedValue === "default" || normalizedValue === "client-default") {
      return "";
    }

    return COACH_THEME_LOOKUP.get(normalizedValue)?.id || "";
  }

  function getCoachThemePreset(themeId) {
    const normalizedThemeId = normalizeCoachThemeId(themeId);
    return normalizedThemeId ? COACH_THEME_LOOKUP.get(normalizedThemeId) || null : null;
  }

  function getCoachThemeLabel(themeId) {
    return getCoachThemePreset(themeId)?.name || "House Blend";
  }

  function setCoachThemeFeedback(message, tone) {
    if (!coachThemeFeedbackNode) {
      return;
    }

    coachThemeFeedbackNode.textContent = message || "";
    coachThemeFeedbackNode.classList.remove("error", "success");
    if (tone === "error") {
      coachThemeFeedbackNode.classList.add("error");
    } else if (tone === "success") {
      coachThemeFeedbackNode.classList.add("success");
    }
  }

  function setSecurityFeedback(message, tone) {
    if (!securityFeedbackNode) {
      return;
    }

    securityFeedbackNode.textContent = message || "";
    securityFeedbackNode.classList.remove("error", "success");
    if (tone === "error") {
      securityFeedbackNode.classList.add("error");
    } else if (tone === "success") {
      securityFeedbackNode.classList.add("success");
    }
  }

  function setActionButtonBusy(buttonNode, busyLabel) {
    if (!(buttonNode instanceof HTMLButtonElement)) {
      return () => {};
    }

    const originalMarkup = buttonNode.innerHTML;
    buttonNode.disabled = true;
    buttonNode.setAttribute("aria-busy", "true");
    buttonNode.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span><span>${escapeHtml(busyLabel || "Working...")}</span>`;

    return () => {
      buttonNode.disabled = false;
      buttonNode.removeAttribute("aria-busy");
      buttonNode.innerHTML = originalMarkup;
    };
  }

  function renderSecuritySection() {
    const summary = shellState.profileSummary || shellState.access || null;
    const email = summary?.email || shellState.access?.user?.email || "";
    const roleValue = summary?.role || role || "";
    const roleText = roleLabel(roleValue);

    securityEmailNodes.forEach((node) => {
      node.textContent = email || roleText.toLowerCase();
    });

    securityUsernameNodes.forEach((node) => {
      if (node instanceof HTMLInputElement) {
        node.value = email;
      }
    });

    securityRoleNodes.forEach((node) => {
      node.textContent = roleText;
    });

    if (securityResetButtonNode instanceof HTMLButtonElement) {
      securityResetButtonNode.disabled = !email;
    }
  }

  function bindSecurityControls() {
    if (securityPasswordFormNode && securityPasswordFormNode.dataset.bound !== "true") {
      securityPasswordFormNode.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(securityPasswordFormNode);
        const newPassword = String(formData.get("newPassword") || "").trim();
        const confirmPassword = String(formData.get("confirmPassword") || "").trim();

        if (!newPassword || !confirmPassword) {
          setSecurityFeedback("Enter and confirm your new password.", "error");
          return;
        }

        if (newPassword !== confirmPassword) {
          setSecurityFeedback("The password confirmation does not match.", "error");
          return;
        }

        if (!window.legacyAuth?.updatePassword) {
          setSecurityFeedback("Password updates are not available right now.", "error");
          return;
        }

        const submitButton = securityPasswordFormNode.querySelector("#account-security-submit, button[type='submit']");
        const releaseBusy = setActionButtonBusy(submitButton, "Updating Password...");
        setSecurityFeedback("Saving your new password...", "success");

        try {
          const result = await window.legacyAuth.updatePassword(newPassword);
          if (!result?.ok) {
            throw new Error(result?.error || "Unable to update the password.");
          }

          securityPasswordFormNode.reset();
          setSecurityFeedback(result.message || "Password updated successfully.", "success");
        } catch (error) {
          setSecurityFeedback(error?.message || "Unable to update the password.", "error");
        } finally {
          releaseBusy();
        }
      });

      securityPasswordFormNode.dataset.bound = "true";
    }

    if (securityResetButtonNode && securityResetButtonNode.dataset.bound !== "true") {
      securityResetButtonNode.addEventListener("click", async () => {
        const email = shellState.profileSummary?.email || shellState.access?.user?.email || "";
        if (!email) {
          setSecurityFeedback("We could not resolve the signed-in email for this account.", "error");
          return;
        }

        if (!window.legacyAuth?.requestPasswordReset) {
          setSecurityFeedback("Password reset is not available right now.", "error");
          return;
        }

        const redirectTo = new URL("./reset-password.html", window.location.href).toString();
        const releaseBusy = setActionButtonBusy(securityResetButtonNode, "Sending Reset Email...");
        setSecurityFeedback("Sending your password reset email...", "success");

        try {
          const result = await window.legacyAuth.requestPasswordReset(email, { redirectTo });
          if (!result?.ok) {
            throw new Error(result?.error || "Unable to send the password reset email.");
          }

          setSecurityFeedback(result.message || "Password reset email sent.", "success");
        } catch (error) {
          setSecurityFeedback(error?.message || "Unable to send the password reset email.", "error");
        } finally {
          releaseBusy();
        }
      });

      securityResetButtonNode.dataset.bound = "true";
    }
  }

  function applyCoachThemePreview(themeId) {
    if (role !== "coach") {
      return;
    }

    const normalizedThemeId = normalizeCoachThemeId(themeId);
    shellState.pendingCoachThemeId = normalizedThemeId;

    if (normalizedThemeId) {
      body.dataset.coachTheme = normalizedThemeId;
    } else {
      delete body.dataset.coachTheme;
    }

    syncCoachThemeSelection();
  }

  function commitCoachTheme(themeId) {
    const normalizedThemeId = normalizeCoachThemeId(themeId);
    shellState.activeCoachThemeId = normalizedThemeId;
    shellState.pendingCoachThemeId = normalizedThemeId;

    if (normalizedThemeId) {
      body.dataset.coachTheme = normalizedThemeId;
    } else {
      delete body.dataset.coachTheme;
    }

    if (!shellState.preferences || typeof shellState.preferences !== "object") {
      shellState.preferences = {};
    }

    if (normalizedThemeId) {
      shellState.preferences.coachPaletteId = normalizedThemeId;
      try {
        window.localStorage.setItem(localCoachThemeKey, normalizedThemeId);
      } catch (_) {
        // Ignore storage failures and continue with the in-memory theme.
      }
    } else {
      delete shellState.preferences.coachPaletteId;
      try {
        window.localStorage.removeItem(localCoachThemeKey);
      } catch (_) {
        // Ignore storage failures and continue with the in-memory theme.
      }
    }

    syncCoachThemeSelection();
  }

  function readSessionJson(key) {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function writeSessionJson(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      // Ignore storage failures and continue without cache.
    }
  }

  function removeSessionKey(key) {
    try {
      window.sessionStorage.removeItem(key);
    } catch (_) {
      // Ignore storage failures.
    }
  }

  function readAuthAccessHydration() {
    const cached = readSessionJson(AUTH_ACCESS_CACHE_KEY);
    if (!cached?.userId) {
      return null;
    }

    const cachedAt = Number(cached.cachedAt || 0);
    if (!cachedAt || Date.now() - cachedAt > SHELL_CACHE_TTL_MS) {
      return null;
    }

    const cachedRole = String(cached.role || "").trim().toLowerCase();
    if (role && cachedRole && cachedRole !== role) {
      return null;
    }

    return {
      userId: String(cached.userId || ""),
      email: String(cached.email || ""),
      role: cachedRole || role,
    };
  }

  function readShellCache() {
    const cached = readSessionJson(SHELL_CACHE_KEY);
    if (!cached?.summary?.id) {
      removeSessionKey(SHELL_CACHE_KEY);
      return null;
    }

    const cachedAt = Number(cached.cachedAt || 0);
    if (!cachedAt || Date.now() - cachedAt > SHELL_CACHE_TTL_MS) {
      removeSessionKey(SHELL_CACHE_KEY);
      return null;
    }

    const cachedRole = String(cached.role || cached.summary?.role || "").trim().toLowerCase();
    if (role && cachedRole && cachedRole !== role) {
      removeSessionKey(SHELL_CACHE_KEY);
      return null;
    }

    const authHydration = readAuthAccessHydration();
    if (authHydration?.userId && String(cached.summary.id || "") !== authHydration.userId) {
      removeSessionKey(SHELL_CACHE_KEY);
      return null;
    }

    return {
      summary: cached.summary,
      notifications: Array.isArray(cached.notifications) ? cached.notifications : [],
    };
  }

  function writeShellCache(summary, notifications) {
    if (!summary?.id) {
      return;
    }

    writeSessionJson(SHELL_CACHE_KEY, {
      cachedAt: Date.now(),
      role: summary.role || role,
      summary,
      notifications: Array.isArray(notifications) ? notifications.slice(0, 60) : [],
    });
  }

  function readActivePanelCache() {
    try {
      return window.sessionStorage.getItem(ACTIVE_PANEL_CACHE_KEY) || "";
    } catch (_) {
      return "";
    }
  }

  function writeActivePanelCache(panelId) {
    try {
      if (!panelId) {
        window.sessionStorage.removeItem(ACTIVE_PANEL_CACHE_KEY);
        return;
      }
      window.sessionStorage.setItem(ACTIVE_PANEL_CACHE_KEY, panelId);
    } catch (_) {
      // Ignore storage failures.
    }
  }

  function inferPageKey(currentRole, pathname) {
    const filename = String(pathname || "")
      .split("/")
      .pop()
      .toLowerCase();

    const pageMap = {
      client: {
        "client-dashboard.html": "home",
        "client-planner.html": "planner",
        "client-packages.html": "packages",
        "client-schedule.html": "schedule",
        "client-rewards.html": "rewards",
        "client-profile.html": "profile",
        "client-settings.html": "settings",
      },
      coach: {
        "coach-dashboard.html": "home",
        "coach-clients.html": "clients",
        "coach-training.html": "training",
        "coach-programming.html": "programming",
        "coach-health.html": "health",
        "coach-schedule.html": "schedule",
        "coach-commissions.html": "commissions",
        "coach-profile.html": "profile",
        "coach-settings.html": "settings",
      },
      super_admin: {
        "admin-dashboard.html": "home",
        "admin-clients.html": "clients",
        "admin-leads.html": "leads",
        "admin-financials.html": "financials",
        "admin-settings.html": "settings",
      },
    };

    return pageMap[currentRole]?.[filename] || "home";
  }

  function roleLabel(inputRole) {
    if (inputRole === "super_admin") {
      return "Super Admin";
    }
    if (inputRole === "coach") {
      return "Coach";
    }
    return "Client";
  }

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "-")
      .replace(/^-+|-+$/gu, "");
  }

  function getInitials(value) {
    return String(value || "")
      .trim()
      .split(/\s+/u)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "--";
  }

  function iconMarkup(type) {
    if (type === "notifications") {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a4 4 0 0 0-4 4v1.6c0 .9-.32 1.77-.9 2.46L5.8 12.5A2.2 2.2 0 0 0 7.48 16H16.5a2.2 2.2 0 0 0 1.68-3.5l-1.28-1.44A3.8 3.8 0 0 1 16 8.6V7a4 4 0 0 0-4-4Zm0 18a2.5 2.5 0 0 0 2.32-1.57h-4.64A2.5 2.5 0 0 0 12 21Z"></path>
        </svg>
      `;
    }

    if (type === "messages") {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v7A2.5 2.5 0 0 1 16.5 15H11l-3.83 3.24A1 1 0 0 1 5.5 17.5V15A2.5 2.5 0 0 1 3 12.5v-7A2.5 2.5 0 0 1 5.5 3"></path>
        </svg>
      `;
    }

    if (type === "signout") {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10.75 4.75A2.75 2.75 0 0 0 8 7.5v1.75h1.75V7.5c0-.55.45-1 1-1h5.75c.55 0 1 .45 1 1v9c0 .55-.45 1-1 1h-5.75c-.55 0-1-.45-1-1v-1.75H8v1.75a2.75 2.75 0 0 0 2.75 2.75h5.75a2.75 2.75 0 0 0 2.75-2.75v-9a2.75 2.75 0 0 0-2.75-2.75h-5.75Zm-6 7.25a.88.88 0 0 1 .88-.88h6.5l-1.44-1.43 1.24-1.24 3.56 3.55-3.56 3.55-1.24-1.24 1.44-1.43h-6.5a.88.88 0 0 1-.88-.88Z"></path>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.75A9.25 9.25 0 1 0 21.25 12 9.25 9.25 0 0 0 12 2.75Zm0 14.2a1.05 1.05 0 1 1-1.05 1.05A1.05 1.05 0 0 1 12 16.95Zm1.63-6.46-.52.35c-.46.32-.74.58-.74 1.21v.4h-1.84v-.55c0-1.1.43-1.88 1.39-2.54l.59-.4a1.77 1.77 0 0 0 .86-1.43 1.75 1.75 0 0 0-3.49 0H8.04a3.58 3.58 0 0 1 7.16.02 3.39 3.39 0 0 1-1.57 2.99Z"></path>
      </svg>
    `;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/gu, "&amp;")
      .replace(/</gu, "&lt;")
      .replace(/>/gu, "&gt;")
      .replace(/"/gu, "&quot;")
      .replace(/'/gu, "&#39;");
  }

  function formatTimeSlotLabel(hours24, minutes) {
    const date = new Date();
    date.setHours(hours24, minutes, 0, 0);
    return new Intl.DateTimeFormat("en-MY", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function buildTimeSlotOptions() {
    const options = ['<option value="">Select time slot</option>'];

    for (let hour = TIME_SLOT_START_HOUR; hour <= TIME_SLOT_END_HOUR; hour += 1) {
      for (let minute = 0; minute < 60; minute += TIME_SLOT_INTERVAL_MINUTES) {
        if (hour === TIME_SLOT_END_HOUR && minute > 0) {
          continue;
        }

        const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        const label = formatTimeSlotLabel(hour, minute);
        options.push(`<option value="${value}">${escapeHtml(label)}</option>`);
      }
    }

    return options.join("");
  }

  function hydrateTimeSlotSelects() {
    const optionMarkup = buildTimeSlotOptions();
    document.querySelectorAll("[data-time-slot-select]").forEach((select) => {
      if (!(select instanceof HTMLSelectElement)) {
        return;
      }

      const currentValue = String(select.dataset.currentValue || select.value || "").trim();
      const placeholder = String(select.dataset.placeholder || "Select time slot").trim();
      select.innerHTML = optionMarkup.replace("Select time slot", escapeHtml(placeholder));
      if (currentValue) {
        select.value = currentValue;
      }
    });
  }

  function hydrateDateInputs() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayValue = `${year}-${month}-${day}`;

    document.querySelectorAll("[data-min-today]").forEach((input) => {
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      if (!input.min || input.min < todayValue) {
        input.min = todayValue;
      }
    });
  }

  function isDashboardSelectCandidate(node) {
    return (
      node instanceof HTMLSelectElement
      && !node.multiple
      && Number(node.size || 0) <= 1
      && node.dataset.crmNativeSelect !== "true"
    );
  }

  const OPEN_SELECT_SURFACE_SELECTOR = [
    ".contact-form",
    ".account-form",
    ".xp-coach-form-grid",
    ".hitpay-report-filter-bar",
    ".crm-selector-form",
    ".lead-filter-bar",
    ".coach-training-topbar",
    ".crm-page-head",
    ".crm-page-tabs",
    ".xp-coach-page-tabs",
    ".client-planner-workspace-nav",
    ".dashboard-table-wrap",
    ".section.dashboard-section",
    ".card",
    "label",
  ].join(", ");

  function syncOpenSelectSurfaceState(activeWrapper) {
    document.querySelectorAll(".crm-has-open-select").forEach((node) => {
      node.classList.remove("crm-has-open-select");
    });

    let current = activeWrapper instanceof HTMLElement ? activeWrapper : null;
    while (current instanceof HTMLElement) {
      if (current.matches(OPEN_SELECT_SURFACE_SELECTOR)) {
        current.classList.add("crm-has-open-select");
      }
      current = current.parentElement;
    }
  }

  function closeCustomSelect(wrapper) {
    if (!(wrapper instanceof HTMLElement)) {
      return;
    }

    wrapper.classList.remove("is-open");
    const trigger = wrapper.querySelector(".crm-select__trigger");
    const menu = wrapper.querySelector(".crm-select__menu");
    if (trigger instanceof HTMLButtonElement) {
      trigger.setAttribute("aria-expanded", "false");
    }
    if (menu instanceof HTMLElement) {
      menu.hidden = true;
    }
    const nextOpenWrapper = document.querySelector(".crm-select.is-open");
    syncOpenSelectSurfaceState(nextOpenWrapper instanceof HTMLElement ? nextOpenWrapper : null);
  }

  function closeCustomSelects(exceptWrapper) {
    document.querySelectorAll(".crm-select.is-open").forEach((wrapper) => {
      if (wrapper !== exceptWrapper) {
        closeCustomSelect(wrapper);
      }
    });
  }

  function buildCustomSelectOption(select, option, menu, groupLabel) {
    if (!(option instanceof HTMLOptionElement) || !(menu instanceof HTMLElement)) {
      return;
    }

    const optionButton = document.createElement("button");
    const optionValue = String(option.value || "");
    const isSelected = optionValue === String(select.value || "");
    const isPlaceholder = !optionValue;

    optionButton.type = "button";
    optionButton.className = "crm-select__option";
    optionButton.dataset.value = optionValue;
    optionButton.setAttribute("role", "option");
    optionButton.setAttribute("aria-selected", String(isSelected));
    optionButton.disabled = option.disabled;
    optionButton.classList.toggle("is-selected", isSelected);
    optionButton.classList.toggle("is-placeholder", isPlaceholder);

    if (groupLabel) {
      optionButton.dataset.groupLabel = groupLabel;
    }

    const labelNode = document.createElement("span");
    labelNode.className = "crm-select__option-label";
    labelNode.textContent = option.textContent || option.label || "Option";
    optionButton.appendChild(labelNode);

    if (isSelected) {
      const markNode = document.createElement("span");
      markNode.className = "crm-select__option-mark";
      markNode.setAttribute("aria-hidden", "true");
      markNode.textContent = "✓";
      optionButton.appendChild(markNode);
    }

    menu.appendChild(optionButton);
  }

  function syncCustomSelect(select) {
    if (!isDashboardSelectCandidate(select)) {
      return;
    }

    const wrapper = select.closest(".crm-select");
    const trigger = wrapper?.querySelector(".crm-select__trigger");
    const triggerLabel = wrapper?.querySelector(".crm-select__trigger-label");
    const menu = wrapper?.querySelector(".crm-select__menu");
    if (!(wrapper instanceof HTMLElement) || !(trigger instanceof HTMLButtonElement) || !(triggerLabel instanceof HTMLElement) || !(menu instanceof HTMLElement)) {
      return;
    }

    const selectedOption = Array.from(select.options).find((option) => option.value === select.value)
      || Array.from(select.options).find((option) => !option.disabled)
      || null;

    wrapper.classList.toggle("is-disabled", Boolean(select.disabled));
    wrapper.classList.toggle("is-empty", !String(select.value || "").trim());
    trigger.disabled = Boolean(select.disabled);
    triggerLabel.textContent =
      selectedOption?.textContent
      || select.dataset.placeholder
      || select.getAttribute("aria-label")
      || "Select an option";

    menu.innerHTML = "";
    Array.from(select.children).forEach((child) => {
      if (child instanceof HTMLOptGroupElement) {
        const groupNode = document.createElement("div");
        groupNode.className = "crm-select__group-label";
        groupNode.textContent = child.label || "Options";
        menu.appendChild(groupNode);
        Array.from(child.children).forEach((option) => buildCustomSelectOption(select, option, menu, child.label || ""));
        return;
      }

      buildCustomSelectOption(select, child, menu, "");
    });

    if (select.disabled) {
      closeCustomSelect(wrapper);
    }
  }

  function openCustomSelect(wrapper, focusLast) {
    if (!(wrapper instanceof HTMLElement) || wrapper.classList.contains("is-disabled")) {
      return;
    }

    closeCustomSelects(wrapper);
    const trigger = wrapper.querySelector(".crm-select__trigger");
    const menu = wrapper.querySelector(".crm-select__menu");
    wrapper.classList.add("is-open");
    if (trigger instanceof HTMLButtonElement) {
      trigger.setAttribute("aria-expanded", "true");
    }
    syncOpenSelectSurfaceState(wrapper);
    if (menu instanceof HTMLElement) {
      menu.hidden = false;
      const options = Array.from(menu.querySelectorAll(".crm-select__option:not(:disabled)"));
      const focusTarget = focusLast
        ? options[options.length - 1]
        : menu.querySelector(".crm-select__option.is-selected:not(:disabled)") || options[0];
      if (focusTarget instanceof HTMLButtonElement) {
        window.requestAnimationFrame(() => {
          focusTarget.focus();
        });
      }
    }
  }

  function enhanceDashboardSelect(select) {
    if (!isDashboardSelectCandidate(select) || select.dataset.crmSelectEnhanced === "true") {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "crm-select";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "crm-select__trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const labelNode = document.createElement("span");
    labelNode.className = "crm-select__trigger-label";
    trigger.appendChild(labelNode);

    const caretNode = document.createElement("span");
    caretNode.className = "crm-select__trigger-caret";
    caretNode.setAttribute("aria-hidden", "true");
    trigger.appendChild(caretNode);

    const menu = document.createElement("div");
    menu.className = "crm-select__menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    select.parentNode?.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);

    select.classList.add("crm-select__native");
    select.tabIndex = -1;
    select.dataset.crmSelectEnhanced = "true";

    const observer = new MutationObserver(() => {
      syncCustomSelect(select);
    });
    observer.observe(select, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled"],
    });

    select.addEventListener("change", () => {
      syncCustomSelect(select);
    });

    syncCustomSelect(select);
  }

  function enhanceDashboardSelects(rootNode) {
    const root = rootNode instanceof HTMLElement || rootNode instanceof Document ? rootNode : document;
    root.querySelectorAll("select").forEach((select) => {
      enhanceDashboardSelect(select);
    });
  }

  function syncResponsiveTable(table) {
    if (!(table instanceof HTMLTableElement)) {
      return;
    }

    const headers = Array.from(table.querySelectorAll("thead th")).map((node) => String(node.textContent || "").trim());
    if (!headers.length) {
      return;
    }

    table.querySelectorAll("tbody tr").forEach((row) => {
      const cells = Array.from(row.children).filter((node) => node instanceof HTMLTableCellElement);
      cells.forEach((cell, index) => {
        const colspan = Number.parseInt(cell.getAttribute("colspan") || "1", 10);
        if (colspan > 1 || !headers[index]) {
          cell.removeAttribute("data-label");
          return;
        }
        cell.setAttribute("data-label", headers[index]);
      });
    });
  }

  function enhanceResponsiveTables(rootNode) {
    const root = rootNode instanceof HTMLElement || rootNode instanceof Document ? rootNode : document;
    root.querySelectorAll("table.dashboard-table").forEach((table) => {
      syncResponsiveTable(table);
    });
  }

  function bindResponsiveTableObserver() {
    if (body.dataset.crmTableLabelsBound === "true") {
      return;
    }

    body.dataset.crmTableLabelsBound = "true";
    let rafId = 0;
    const observer = new MutationObserver(() => {
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        enhanceResponsiveTables(document);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false,
      attributes: false,
    });
  }

  function bindCustomSelectControls() {
    if (body.dataset.crmSelectBound === "true") {
      return;
    }

    body.dataset.crmSelectBound = "true";

    document.addEventListener("click", (event) => {
      const label = event.target.closest("label");
      if (label instanceof HTMLLabelElement && !event.target.closest(".crm-select")) {
        const labeledSelect = label.control instanceof HTMLSelectElement ? label.control : label.querySelector("select");
        if (isDashboardSelectCandidate(labeledSelect) && labeledSelect?.dataset?.crmSelectEnhanced === "true") {
          event.preventDefault();
          const trigger = labeledSelect.closest(".crm-select")?.querySelector(".crm-select__trigger");
          if (trigger instanceof HTMLButtonElement) {
            trigger.focus();
            if (trigger.closest(".crm-select")?.classList.contains("is-open")) {
              closeCustomSelect(trigger.closest(".crm-select"));
            } else {
              openCustomSelect(trigger.closest(".crm-select"), false);
            }
          }
          return;
        }
      }

      const optionButton = event.target.closest(".crm-select__option");
      if (optionButton instanceof HTMLButtonElement) {
        const wrapper = optionButton.closest(".crm-select");
        const select = wrapper?.querySelector("select");
        if (select instanceof HTMLSelectElement && !select.disabled) {
          const nextValue = optionButton.dataset.value || "";
          if (select.value !== nextValue) {
            select.value = nextValue;
            select.dispatchEvent(new Event("input", { bubbles: true }));
            select.dispatchEvent(new Event("change", { bubbles: true }));
          } else {
            syncCustomSelect(select);
          }
        }
        closeCustomSelect(wrapper);
        return;
      }

      const trigger = event.target.closest(".crm-select__trigger");
      if (trigger instanceof HTMLButtonElement) {
        const wrapper = trigger.closest(".crm-select");
        if (!(wrapper instanceof HTMLElement)) {
          return;
        }

        if (wrapper.classList.contains("is-open")) {
          closeCustomSelect(wrapper);
        } else {
          openCustomSelect(wrapper, false);
        }
        return;
      }

      if (!event.target.closest(".crm-select")) {
        closeCustomSelects(null);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCustomSelects(null);
        return;
      }

      const trigger = event.target.closest(".crm-select__trigger");
      if (
        trigger instanceof HTMLButtonElement
        && (event.key === "ArrowDown" || event.key === "ArrowUp")
      ) {
        event.preventDefault();
        openCustomSelect(trigger.closest(".crm-select"), event.key === "ArrowUp");
      }
    });
  }

  function formatBadgeCount(count) {
    const normalized = Number(count || 0);
    if (!normalized) {
      return "0";
    }
    return normalized > 9 ? "9+" : String(normalized);
  }

  function formatMetricCount(value) {
    const normalized = Number(value || 0);
    if (!Number.isFinite(normalized)) {
      return "0";
    }
    return normalized.toLocaleString("en-US");
  }

  function formatCoachPublicId(value) {
    const normalized = String(value || "").replace(/[^a-z0-9]/giu, "").toUpperCase();
    return normalized ? `LGC-C${normalized.slice(0, 6)}` : "PENDING";
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function parseEmailList(rawList) {
    return String(rawList || "")
      .split(",")
      .map((email) => normalizeEmail(email))
      .filter(Boolean);
  }

  function normalizeAvatarPath(value) {
    return String(value || "")
      .trim()
      .replace(/\\/gu, "/")
      .replace(/CRM pictures/gu, "CRM Pictures")
      .replace(/ /gu, "%20");
  }

  function normalizeAvatarGender(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "female" ? "female" : normalized === "male" ? "male" : "";
  }

  function getAvatarPreset(avatarUrl) {
    const normalized = normalizeAvatarPath(avatarUrl);
    return ACCOUNT_AVATAR_PRESETS.find((preset) => normalizeAvatarPath(preset.image) === normalized) || null;
  }

  function resolveAccountGender(email) {
    const explicitGender = normalizeAvatarGender(shellState.accountGender);
    if (explicitGender) {
      return explicitGender;
    }

    return normalizeAvatarGender(ACCOUNT_EMAIL_GENDER_OVERRIDES[normalizeEmail(email)]);
  }

  function getAvatarUnlockTrack(email = shellState.profileSummary?.email || "", summary = shellState.profileSummary) {
    const accountGender = resolveAccountGender(email);
    const currentLevel = getAvatarUnlockLevel(summary);
    const legacyTrack = ACCOUNT_AVATAR_LEGACY_TRACKS[accountGender] || ACCOUNT_AVATAR_LEGACY_TRACKS.male;
    const unlockEntries = [...ACCOUNT_AVATAR_STARTER_TRACK, ...legacyTrack];
    const nextLockedCollectionId = unlockEntries.find(
      (entry) => currentLevel < Number(entry.levelMin || 0)
    )?.collectionId || "";

    return unlockEntries
      .map((entry, index) => {
        const collection = ACCOUNT_AVATAR_COLLECTIONS.find((item) => item.id === entry.collectionId);
        if (!collection) {
          return null;
        }

        const previewImage = getDefaultAvatarForCollection(collection, email, accountGender);
        return {
          ...collection,
          tierIndex: index + 1,
          tierLabel: entry.tierLabel || `Tier ${index + 1}`,
          chapterCopy: entry.chapterCopy || "",
          levelMin: Number(entry.levelMin || 0),
          levelMax: Number(entry.levelMax || entry.levelMin || 0),
          previewImage,
          isUnlocked: currentLevel >= Number(entry.levelMin || 0),
          isNextUnlock: currentLevel < Number(entry.levelMin || 0) && nextLockedCollectionId === entry.collectionId,
          isLegacy: Number(entry.levelMin || 0) >= ACCOUNT_AVATAR_LEGACY_UNLOCK_LEVEL,
        };
      })
      .filter(Boolean);
  }

  function getAvailableAvatarCollections(email = shellState.profileSummary?.email || "", summary = shellState.profileSummary) {
    return getAvatarUnlockTrack(email, summary);
  }

  function getUnlockedAvatarCollections(email = shellState.profileSummary?.email || "", summary = shellState.profileSummary) {
    return getAvailableAvatarCollections(email, summary).filter((collection) => collection.isUnlocked);
  }

  function getDefaultAvatarForCollection(collection, email = shellState.profileSummary?.email || "", preferredCategory = "") {
    if (!collection) {
      return "";
    }

    const accountGender = resolveAccountGender(email);
    const selectedCategory = preferredCategory || accountGender || collection.characterTypes?.[0]?.id || "";
    const matchingPreset =
      ACCOUNT_AVATAR_PRESETS.find((preset) => preset.collectionId === collection.id && preset.category === selectedCategory)
      || ACCOUNT_AVATAR_PRESETS.find((preset) => preset.collectionId === collection.id);

    return matchingPreset?.image || "";
  }

  function coerceAvatarUrlToUnlockedCollection(avatarUrl, email = shellState.profileSummary?.email || "", summary = shellState.profileSummary) {
    const resolved = resolveAvatarUrl(avatarUrl, email);
    const preset = getAvatarPreset(resolved);
    if (!preset) {
      return resolved;
    }

    const availableCollections = getAvailableAvatarCollections(email, summary);
    const matchedCollection = availableCollections.find((collection) => collection.id === preset.collectionId);
    if (matchedCollection?.isUnlocked) {
      return resolved;
    }

    const fallbackCollection = getUnlockedAvatarCollections(email, summary).slice(-1)[0] || availableCollections[0] || null;
    return getDefaultAvatarForCollection(fallbackCollection, email, preset.category) || resolved;
  }

  function resolveAvatarUrl(avatarUrl, email) {
    const explicit = normalizeAvatarPath(avatarUrl);
    if (explicit) {
      const deprecatedReplacement = ACCOUNT_AVATAR_DEPRECATED_PATH_FALLBACKS[explicit] || "";
      if (deprecatedReplacement) {
        return normalizeAvatarPath(deprecatedReplacement);
      }
      return getAvatarPreset(explicit)?.image || explicit;
    }

    const emailDefault = ACCOUNT_AVATAR_DEFAULTS[normalizeEmail(email)] || "";
    if (emailDefault) {
      return normalizeAvatarPath(emailDefault);
    }

    const accountGender = resolveAccountGender(email);
    const roleDefaults = ACCOUNT_ROLE_AVATAR_DEFAULTS[role] || {};
    return normalizeAvatarPath(roleDefaults[accountGender] || roleDefaults.male || roleDefaults.female || "");
  }

  window.legacyAccountAvatarCatalog = ACCOUNT_AVATAR_PRESETS.map((preset) => ({ ...preset }));
  window.resolveLegacyAccountAvatar = ({ avatarUrl = "", email = "" } = {}) => resolveAvatarUrl(avatarUrl, email);

  function setYear() {
    document.querySelectorAll("[data-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function initRevealObserver() {
    const revealNodes = document.querySelectorAll(".reveal");
    if (!revealNodes.length) {
      return;
    }

    if (body?.dataset?.liveDashboard) {
      revealNodes.forEach((node) => node.classList.add("in-view"));
      return;
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.16 }
      );

      revealNodes.forEach((node) => observer.observe(node));
      return;
    }

    revealNodes.forEach((node) => node.classList.add("in-view"));
  }

  function getBackgroundPreset(backgroundId) {
    return ACCOUNT_BACKGROUNDS.find((preset) => preset.id === backgroundId) || ACCOUNT_BACKGROUNDS[0];
  }

  function setAppearanceFeedback(message, tone) {
    if (!appearanceFeedbackNode) {
      return;
    }

    appearanceFeedbackNode.textContent = message || "";
    appearanceFeedbackNode.classList.remove("error", "success");
    if (tone === "error") {
      appearanceFeedbackNode.classList.add("error");
    } else if (tone === "success") {
      appearanceFeedbackNode.classList.add("success");
    }
  }

  function setAvatarFeedback(message, tone) {
    if (!avatarFeedbackNode) {
      return;
    }

    avatarFeedbackNode.textContent = message || "";
    avatarFeedbackNode.classList.remove("error", "success");
    if (tone === "error") {
      avatarFeedbackNode.classList.add("error");
    } else if (tone === "success") {
      avatarFeedbackNode.classList.add("success");
    }
  }

  function syncCoachThemeSelection() {
    if (role !== "coach") {
      return;
    }

    const savedThemeKey = shellState.activeCoachThemeId || "default";
    const previewThemeKey = shellState.pendingCoachThemeId || "default";

    if (coachThemeCurrentNode) {
      const savedLabel = getCoachThemeLabel(shellState.activeCoachThemeId);
      if (savedThemeKey !== previewThemeKey) {
        coachThemeCurrentNode.textContent = `Saved palette: ${savedLabel}. Previewing: ${getCoachThemeLabel(shellState.pendingCoachThemeId)}.`;
      } else {
        coachThemeCurrentNode.textContent = `Saved palette: ${savedLabel}.`;
      }
    }

    if (coachThemeGridNode) {
      coachThemeGridNode.querySelectorAll("[data-coach-theme-id]").forEach((button) => {
        const buttonThemeId = button.getAttribute("data-coach-theme-id") || "default";
        const isPreview = buttonThemeId === previewThemeKey;
        const isSaved = buttonThemeId === savedThemeKey;
        button.classList.toggle("is-active", isPreview);
        button.classList.toggle("is-saved", isSaved);
        button.setAttribute("aria-pressed", String(isPreview));
      });
    }

    if (coachThemeApplyButtonNode) {
      const hasPendingChange = savedThemeKey !== previewThemeKey;
      coachThemeApplyButtonNode.disabled = !hasPendingChange;
      coachThemeApplyButtonNode.textContent = hasPendingChange ? "Apply Palette" : "Palette Applied";
    }
  }

  function applyBackground(backgroundId, persistLocal) {
    const preset = getBackgroundPreset(backgroundId);
    shellState.activeBackgroundId = preset.id;
    body.dataset.accountBackground = preset.id;
    document.documentElement.style.setProperty("--account-bg-image", `url("${preset.image}")`);

    if (appearanceCurrentNode) {
      appearanceCurrentNode.textContent = `Current background: ${preset.name}`;
    }

    if (persistLocal) {
      window.localStorage.setItem(localAppearanceKey, preset.id);
    }

    if (appearanceGridNode) {
      appearanceGridNode.querySelectorAll("[data-background-id]").forEach((button) => {
        const isActive = button.getAttribute("data-background-id") === preset.id;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }
  }

  async function getAccessToken() {
    if (shellState.accessToken) {
      return shellState.accessToken;
    }

    if (window.legacyAuth?.getAccessToken) {
      const accessToken = await window.legacyAuth.getAccessToken();
      if (accessToken) {
        shellState.accessToken = accessToken;
        return accessToken;
      }
    }

    const supabase = window.legacyAuth?.getSupabaseClient?.();
    if (!supabase) {
      return "";
    }

    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.access_token) {
      return "";
    }

    shellState.accessToken = data.session.access_token;
    return shellState.accessToken;
  }

  async function loadServerPreferences() {
    if (shellState.preferencesPromise) {
      window.legacyAccountPreferencesPromise = shellState.preferencesPromise;
      return shellState.preferencesPromise;
    }

    if (shellState.preferences && Object.keys(shellState.preferences).length) {
      return shellState.preferences;
    }

    const request = (async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        return {};
      }

      const response = await window.fetch("/.netlify/functions/get-user-preferences", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to load your appearance settings.");
      }

      const preferences = payload?.preferences || {};
      shellState.preferences = preferences;
      window.legacyAccountPreferences = preferences;

      if (preferences.backgroundId) {
        applyBackground(preferences.backgroundId, true);
      }

      if (role === "coach") {
        commitCoachTheme(preferences.coachPaletteId || "");
      }

      if (accountEmailNodes.length && payload?.email) {
        accountEmailNodes.forEach((node) => {
          node.textContent = payload.email;
        });
      }

      window.dispatchEvent(
        new CustomEvent("legacy:account-preferences-loaded", {
          detail: {
            preferences,
            email: payload?.email || "",
          },
        })
      );

      return preferences;
    })();

    shellState.preferencesPromise = request;
    window.legacyAccountPreferencesPromise = request;

    try {
      return await request;
    } finally {
      if (shellState.preferencesPromise === request) {
        shellState.preferencesPromise = null;
      }
      if (window.legacyAccountPreferencesPromise === request) {
        window.legacyAccountPreferencesPromise = null;
      }
    }
  }

  async function saveServerPreferences(patch) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Your account session is not available.");
    }

    const response = await window.fetch("/.netlify/functions/save-user-preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(patch),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Unable to save your preferences.");
    }

    shellState.preferences = payload?.preferences || shellState.preferences;
    window.legacyAccountPreferences = shellState.preferences;
    window.dispatchEvent(
      new CustomEvent("legacy:account-preferences-loaded", {
        detail: {
          preferences: shellState.preferences,
        },
      })
    );
    return shellState.preferences;
  }

  async function saveServerAvatar(avatarUrl) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Your account session is not available.");
    }

    const response = await window.fetch("/.netlify/functions/save-profile-avatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ avatarUrl }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "Unable to save your profile portrait.");
    }

    return payload?.avatarUrl || avatarUrl;
  }

  function calculateTarget(current) {
    const normalized = Math.max(Number(current || 0), 0);
    return Math.max(5000, Math.ceil(Math.max(normalized, 1) / 5000) * 5000);
  }

  function buildProgress(currentValue, label) {
    const current = Math.max(Number(currentValue || 0), 0);
    const target = calculateTarget(current);
    const percent = Math.max(2, Math.min(100, Math.round((current / target) * 100)));
    const remaining = Math.max(target - current, 0);
    return {
      label,
      current,
      target,
      remaining,
      percent,
    };
  }

  function captureTriggerRect(triggerButton) {
    if (!(triggerButton instanceof HTMLElement)) {
      return shellState.activeOverlayAnchor || null;
    }

    const rect = triggerButton.getBoundingClientRect();
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }

  function positionFloatingPanel(panelNode, anchorRect, preferredWidth) {
    if (!(panelNode instanceof HTMLElement)) {
      return;
    }

    const viewportPadding = window.innerWidth <= 640 ? 12 : 18;
    const requestedWidth = Number(preferredWidth || 420);
    const maxWidth = Math.max(280, window.innerWidth - viewportPadding * 2);
    const panelWidth = Math.min(requestedWidth, maxWidth);
    const maxHeight = Math.max(320, window.innerHeight - viewportPadding * 2);
    const fallbackAnchor = {
      right: window.innerWidth - viewportPadding,
      bottom: viewportPadding + 72,
      top: viewportPadding + 72,
    };
    const resolvedAnchor = anchorRect || shellState.activeOverlayAnchor || fallbackAnchor;

    panelNode.style.width = `${panelWidth}px`;
    panelNode.style.maxHeight = `${maxHeight}px`;

    const measuredHeight = Math.min(panelNode.scrollHeight || panelNode.offsetHeight || maxHeight, maxHeight);
    const left = Math.max(
      viewportPadding,
      Math.min(
        (resolvedAnchor.right || fallbackAnchor.right) - panelWidth,
        window.innerWidth - panelWidth - viewportPadding
      )
    );

    const belowTop = (resolvedAnchor.bottom || fallbackAnchor.bottom) + 10;
    const aboveTop = (resolvedAnchor.top || fallbackAnchor.top) - measuredHeight - 10;
    const preferredBelowFits = belowTop + measuredHeight <= window.innerHeight - viewportPadding;
    const preferredAboveFits = aboveTop >= viewportPadding;

    let top;
    if (preferredBelowFits) {
      top = belowTop;
    } else if (preferredAboveFits) {
      top = aboveTop;
    } else {
      top = Math.max(
        viewportPadding,
        Math.min(
          belowTop,
          window.innerHeight - measuredHeight - viewportPadding
        )
      );
    }

    const applyPosition = (resolvedTop) => {
      panelNode.style.left = `${left}px`;
      panelNode.style.top = `${resolvedTop}px`;
    };

    applyPosition(top);

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => {
        const actualRect = panelNode.getBoundingClientRect();
        if (!actualRect || actualRect.height <= 0) {
          return;
        }

        const correctedTop = Math.max(
          viewportPadding,
          Math.min(
            actualRect.top,
            window.innerHeight - actualRect.height - viewportPadding
          )
        );

        if (Math.abs(correctedTop - actualRect.top) > 1) {
          applyPosition(correctedTop);
        }
      });
    }
  }

  function repositionActivePopover() {
    if (shellState.activeOverlay === "notifications" || shellState.activeOverlay === "messages") {
      const panelNode = document.querySelector("#crm-shell-overlay .crm-drawer");
      positionFloatingPanel(panelNode, shellState.activeOverlayAnchor, 420);
      return;
    }

    if (shellState.activeOverlay === "tutorial") {
      const steps = getTutorialSteps();
      positionTutorialSpotlight(steps[shellState.tutorialStepIndex], { allowScroll: false });
    }
  }

  function isMessageNotification(notification) {
    const haystack = [
      notification?.category,
      notification?.title,
      notification?.body,
      notification?.action_url,
    ]
      .filter(Boolean)
      .join(" ");
    return MESSAGE_CATEGORY_PATTERN.test(haystack);
  }

  function renderShellChrome() {
    renderSidebar();
    renderHeaderBanner();
    renderIdentityBanner();
    renderPageTabs();
    bindNavPrefetch();
    repositionActivePopover();
  }

  function prefetchPage(urlLike) {
    try {
      const url = new URL(String(urlLike || ""), window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }

      const cacheKey = `${url.pathname}${url.search}`;
      const currentKey = `${window.location.pathname}${window.location.search}`;
      if (!cacheKey || cacheKey === currentKey || shellState.prefetchedUrls.has(cacheKey)) {
        return;
      }

      shellState.prefetchedUrls.add(cacheKey);
      window.fetch(url.href, {
        credentials: "same-origin",
        headers: {
          "X-Legacy-Prefetch": "1",
        },
      }).catch(() => null);
    } catch (_) {
      // Ignore malformed URLs and continue.
    }
  }

  function bindNavPrefetch() {
    if (shellState.navPrefetchBound) {
      return;
    }

    shellState.navPrefetchBound = true;
    const maybePrefetch = (target) => {
      const link = target?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      if (!link.closest(".crm-nav, .crm-sidebar-footer, .account-quick-grid, .account-quick-card, .profile-actions")) {
        return;
      }

      prefetchPage(link.href);
    };

    document.addEventListener(
      "pointerenter",
      (event) => {
        maybePrefetch(event.target);
      },
      true
    );

    document.addEventListener(
      "focusin",
      (event) => {
        maybePrefetch(event.target);
      },
      true
    );

    window.setTimeout(() => {
      document.querySelectorAll(".crm-nav-link[href]").forEach((link) => {
        if (link instanceof HTMLAnchorElement) {
          prefetchPage(link.href);
        }
      });
    }, 800);
  }

  function queueDeferredShellRefresh(reason, silent) {
    shellState.pendingRefreshReason = reason || shellState.pendingRefreshReason || "live-update";
    shellState.pendingRefreshSilent = shellState.pendingRefreshSilent && silent !== false;
  }

  function clearScheduledShellRefresh() {
    if (!shellState.refreshTimer) {
      return;
    }

    window.clearTimeout(shellState.refreshTimer);
    shellState.refreshTimer = 0;
  }

  function scheduleShellRefresh(reason, options) {
    const config = options || {};
    const silent = config.silent !== false;
    const delay = Number.isFinite(config.delay) ? Number(config.delay) : SHELL_REFRESH_DEBOUNCE_MS;

    if (shellState.loadInFlight) {
      queueDeferredShellRefresh(reason, silent);
      return;
    }

    clearScheduledShellRefresh();
    shellState.refreshTimer = window.setTimeout(() => {
      shellState.refreshTimer = 0;
      void refreshShellData({
        silent,
        reason: reason || "live-update",
      });
    }, Math.max(0, delay));
  }

  function teardownShellRealtime() {
    if (!shellState.realtimeChannel || !window.legacyAuth?.getSupabaseClient) {
      shellState.realtimeChannel = null;
      shellState.realtimeSubscriptionKey = "";
      return;
    }

    const supabase = window.legacyAuth.getSupabaseClient();
    if (!supabase?.removeChannel) {
      shellState.realtimeChannel = null;
      shellState.realtimeSubscriptionKey = "";
      return;
    }

    supabase.removeChannel(shellState.realtimeChannel).catch(() => null);
    shellState.realtimeChannel = null;
    shellState.realtimeSubscriptionKey = "";
  }

  async function setupShellRealtime() {
    if (!window.legacyAuth?.getSupabaseClient) {
      return;
    }

    const access = shellState.access || (await window.legacyAuth.requireRole());
    if (!access?.ok) {
      return;
    }

    const supabase = window.legacyAuth.getSupabaseClient();
    if (!supabase?.channel) {
      return;
    }

    const watchedTables = SHELL_REALTIME_TABLES[role] || ["profiles", "notifications"];
    const subscriptionKey = `${access.user.id}:${role}:${watchedTables.join(",")}`;
    if (shellState.realtimeSubscriptionKey === subscriptionKey && shellState.realtimeChannel) {
      return;
    }

    teardownShellRealtime();

    let channel = supabase.channel(`legacy-shell-live:${role}:${access.user.id}`);
    watchedTables.forEach((table) => {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          scheduleShellRefresh(`${table}:${payload?.eventType || "change"}`, {
            silent: true,
            delay: 120,
          });
        }
      );
    });

    channel.subscribe(() => null);
    shellState.realtimeChannel = channel;
    shellState.realtimeSubscriptionKey = subscriptionKey;
  }

  function bindLiveShellEvents() {
    if (shellState.liveBindingsReady) {
      return;
    }

    window.addEventListener("focus", () => {
      scheduleShellRefresh("window-focus", {
        silent: true,
        delay: 0,
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      scheduleShellRefresh("document-visible", {
        silent: true,
        delay: 0,
      });
    });

    window.addEventListener("pagehide", () => {
      clearScheduledShellRefresh();
      teardownShellRealtime();
    });

    window.addEventListener("resize", () => {
      repositionActivePopover();
    });

    window.addEventListener(
      "scroll",
      () => {
        repositionActivePopover();
      },
      { passive: true }
    );

    shellState.liveBindingsReady = true;
  }

  async function loadShellData() {
    if (!window.legacyAuth?.requireRole || !window.legacyAuth?.getSupabaseClient) {
      return null;
    }

    const access = await window.legacyAuth.requireRole();
    if (!access.ok) {
      return null;
    }

    const supabase = window.legacyAuth.getSupabaseClient();
    const userId = access.user.id;
    const notificationsQuery = supabase
      .from("notifications")
      .select("id, category, title, body, action_url, is_read, created_at")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(60);

    const profilePromise = supabase
      .from("profiles")
      .select("id, display_name, avatar_url, role, status")
      .eq("id", userId)
      .maybeSingle();

    const notificationsPromise = notificationsQuery;

    let rolePromises = [];
    if (role === "client") {
      rolePromises = [
        supabase
          .from("client_profiles")
          .select("preferred_name, xp_points, gym_coins, member_id, gender")
          .eq("id", userId)
          .maybeSingle(),
      ];
    } else if (role === "coach") {
      rolePromises = [
        supabase
          .from("coach_profiles")
          .select("gender")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("coach_client_assignments")
          .select("id", { count: "exact", head: true })
          .eq("coach_id", userId)
          .eq("status", "active"),
        supabase
          .from("sessions")
          .select("id", { count: "exact", head: true })
          .eq("coach_id", userId)
          .eq("status", "completed"),
      ];
    } else if (role === "super_admin") {
      rolePromises = [
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "coach"),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "converted"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
      ];
    }

    const [profileResponse, notificationsResponse, ...extraResponses] = await Promise.all([
      profilePromise,
      notificationsPromise,
      ...rolePromises,
    ]);

    if (profileResponse.error) {
      throw profileResponse.error;
    }

    if (notificationsResponse.error) {
      throw notificationsResponse.error;
    }

    const profile = profileResponse.data || {};
    const notifications = notificationsResponse.data || [];

    let displayName = profile.display_name || access.user.email || roleLabel(role);
    let progress = buildProgress(0, "XP Progress");
    let tokenCount = null;
    let tokenLabel = "";
    let focusSummary = shellConfig.copy;
    let identityLabel = "";

    if (role === "client") {
      const clientProfile = extraResponses[0]?.data || null;
      shellState.accountGender = normalizeAvatarGender(clientProfile?.gender) || resolveAccountGender(access.user.email || "");
      displayName = clientProfile?.preferred_name || displayName;
      progress = buildProgress(Number(clientProfile?.xp_points || 0), "XP Progress");
      tokenCount = Number(clientProfile?.gym_coins || 0);
      tokenLabel = "Gym Coins";
      focusSummary = `${formatMetricCount(clientProfile?.xp_points || 0)} XP earned and ready to convert into visible progress.`;
      identityLabel = clientProfile?.member_id ? `MEMBER ID ${clientProfile.member_id}` : "MEMBER ID PENDING";
    } else if (role === "coach") {
      const coachProfile = extraResponses[0]?.data || null;
      const activeAssignments = Number(extraResponses[1]?.count || 0);
      const completedSessions = Number(extraResponses[2]?.count || 0);
      shellState.accountGender = normalizeAvatarGender(coachProfile?.gender) || resolveAccountGender(access.user.email || "");
      progress = buildProgress(activeAssignments * 380 + completedSessions * 140, "Coach XP");
      tokenCount = activeAssignments;
      tokenLabel = "Active Clients";
      focusSummary = `${formatMetricCount(completedSessions)} completed sessions are already feeding your coach progression.`;
      identityLabel = `COACH ID ${formatCoachPublicId(userId)}`;
    } else if (role === "super_admin") {
      const coachCount = Number(extraResponses[0]?.count || 0);
      const convertedLeads = Number(extraResponses[1]?.count || 0);
      const paidOrders = Number(extraResponses[2]?.count || 0);
      shellState.accountGender = resolveAccountGender(access.user.email || "");
      progress = buildProgress(coachCount * 220 + convertedLeads * 240 + paidOrders * 140, "Admin XP");
      tokenCount = paidOrders;
      tokenLabel = "Paid Orders";
      focusSummary = `${formatMetricCount(coachCount)} coaches and ${formatMetricCount(convertedLeads)} converted leads are live in this workspace.`;
    } else {
      shellState.accountGender = resolveAccountGender(access.user.email || "");
    }

    const unreadNotifications = notifications.filter((item) => !item.is_read);
    const summary = {
      id: userId,
      role,
      displayName,
      email: access.user.email || "",
      avatarUrl: "",
      avatarGender: shellState.accountGender || resolveAccountGender(access.user.email || ""),
      initials: getInitials(displayName),
      progress,
      tokenCount,
      tokenLabel,
      focusSummary,
      identityLabel,
      notificationCount: unreadNotifications.filter((item) => !isMessageNotification(item)).length,
      messageCount: unreadNotifications.filter((item) => isMessageNotification(item)).length,
    };

    summary.avatarUrl = coerceAvatarUrlToUnlockedCollection(
      resolveAvatarUrl(profile.avatar_url, access.user.email || ""),
      summary.email,
      summary
    );

    shellState.access = access;
    shellState.profileSummary = summary;
    shellState.notifications = notifications;
    window.legacyAccountSummary = summary;
    writeShellCache(summary, notifications);

    const liveAccountEmailNodes = Array.from(document.querySelectorAll("[data-account-email], #admin-email-display"));
    if (liveAccountEmailNodes.length && summary.email) {
      liveAccountEmailNodes.forEach((node) => {
        node.textContent = summary.email;
      });
    }

    renderSecuritySection();

    return summary;
  }

  async function refreshShellData(options) {
    const config = options || {};
    const silent = config.silent !== false;
    shellState.loadInFlight = true;

    try {
      bindLiveShellEvents();
      const summary = await loadShellData();
      if (!summary && !silent) {
        return null;
      }

      renderShellChrome();
      renderAvatarSelector();
      void setupShellRealtime().catch(() => null);
      return summary;
    } catch (error) {
      if (!silent) {
        console.error("[LEGACY] Unable to refresh shell data.", error);
      }
      return null;
    } finally {
      shellState.loadInFlight = false;
      if (shellState.pendingRefreshReason) {
        const pendingReason = shellState.pendingRefreshReason;
        const pendingSilent = shellState.pendingRefreshSilent !== false;
        shellState.pendingRefreshReason = "";
        shellState.pendingRefreshSilent = true;
        scheduleShellRefresh(pendingReason, {
          silent: pendingSilent,
          delay: 0,
        });
      }
    }
  }

  function renderSidebar() {
    if (!sidebarNode) {
      return;
    }

    const summary = shellState.profileSummary || {
      displayName: roleLabel(role),
      email: "",
    };
    const sidebarEmail = summary.email || roleLabel(role);

    const sidebarCopy = typeof shellConfig.copy === "string" ? shellConfig.copy.trim() : "";

    const brandMarkup = `
      <div class="crm-sidebar__brand">
        <a class="crm-brand" href="${shellConfig.nav[0].href}">${shellConfig.brand}</a>
        ${sidebarCopy ? `<p class="crm-copy crm-sidebar-copy">${escapeHtml(sidebarCopy)}</p>` : ""}
      </div>
    `;

    const isInView = sidebarNode.classList.contains("in-view");
    sidebarNode.className = `crm-sidebar crm-shell-sidebar reveal crm-sidebar--${role}${isInView ? " in-view" : ""}`;
    sidebarNode.innerHTML = `
      ${brandMarkup}
      <nav class="crm-sidebar__nav crm-nav" aria-label="${escapeHtml(roleLabel(role))} navigation">
        ${shellConfig.nav
          .map(
            (item) =>
              `<a class="crm-nav-link${isShellNavItemActive(item) ? " is-active is-current" : ""}" href="${item.href}" data-label="${escapeHtml(item.label)}" aria-label="${escapeHtml(item.label)}" title="${escapeHtml(item.label)}"${isShellNavItemActive(item) ? ' aria-current="page"' : ""}>
                <span class="crm-nav-link__icon" aria-hidden="true">${NAV_ICON_MAP[item.key] || NAV_ICON_MAP.default}</span>
                <span class="crm-nav-link__label">${escapeHtml(item.label)}</span>
              </a>`
          )
          .join("")}
      </nav>
      <div class="crm-sidebar-footer">
        <div class="crm-sidebar-account" aria-label="Current workspace account">
          <strong>${escapeHtml(summary.displayName)}</strong>
          <span>${escapeHtml(sidebarEmail)}</span>
        </div>
        <a class="btn btn-ghost" href="https://www.legacycoaching.com.my/">Back to Website</a>
        <button class="btn btn-ghost crm-sidebar-logout" type="button" data-account-sign-out aria-label="Log out">
          Log out
        </button>
      </div>
    `;
  }

  function getPreviewAvatarState() {
    const summary = shellState.profileSummary || {
      displayName: roleLabel(role),
      email: "",
      initials: getInitials(roleLabel(role)),
      avatarUrl: "",
      role,
    };
    const currentAvatarUrl = coerceAvatarUrlToUnlockedCollection(
      resolveAvatarUrl(summary.avatarUrl, summary.email || ""),
      summary.email || "",
      summary
    );
    const activeCollection = getActiveAvatarCollection();
    const visiblePresets = getVisibleAvatarPresets(activeCollection);
    const fallbackPreset = visiblePresets[0] || null;
    const selectedAvatarUrl =
      coerceAvatarUrlToUnlockedCollection(
        resolveAvatarUrl(shellState.pendingAvatarUrl || currentAvatarUrl, summary.email || ""),
        summary.email || "",
        summary
      )
      || fallbackPreset?.image
      || "";
    const selectedPreset = getAvatarPreset(selectedAvatarUrl);

    return {
      summary,
      currentAvatarUrl,
      selectedAvatarUrl,
      activeCollection,
      visiblePresets,
      fallbackPreset,
      selectedPreset,
    };
  }

  function syncAvatarSelection() {
    const previewState = getPreviewAvatarState();
    const {
      summary,
      currentAvatarUrl,
      selectedAvatarUrl,
      activeCollection,
      visiblePresets,
      fallbackPreset,
      selectedPreset,
    } = previewState;
    const avatarIdentity = getAvatarIdentity(previewState);
    const currentPreset = getAvatarPreset(currentAvatarUrl);
    const previewPreset = selectedPreset || fallbackPreset || currentPreset || null;
    const hasPrev = visiblePresets.length > 1;
    const hasNext = visiblePresets.length > 1;
    const previewThemeStyle = getAvatarPreviewThemeStyle(previewPreset, activeCollection);
    const previewThemeId = previewPreset?.collectionId || activeCollection?.id || "default";
    const previewSeed = previewPreset?.id ? Math.abs(hashAvatarSeed(previewPreset.id)) : 0;
    const savedPortraitLabel = currentAvatarUrl
      ? currentPreset?.name || "Selected character"
      : "Initials only";
    const selectedPortraitLabel = avatarIdentity.name || previewPreset?.name || "Character";
    const hasAvatarChange = Boolean(selectedAvatarUrl) && selectedAvatarUrl !== currentAvatarUrl;

    if (avatarCurrentNode) {
      avatarCurrentNode.textContent = `Saved character: ${savedPortraitLabel}`;
    }

    if (avatarPreviewNode) {
      avatarPreviewNode.innerHTML = currentAvatarUrl
        ? `<img alt="${escapeHtml(currentPreset?.name || summary.displayName)}" class="crm-avatar__image" src="${escapeHtml(currentAvatarUrl)}" />`
        : `<span>${escapeHtml(summary.initials || "--")}</span>`;
    }

    if (avatarCardPreviewNode) {
      const selectedAvatarMarkup = selectedAvatarUrl
        ? `<img alt="${escapeHtml(avatarIdentity.name)}" class="crm-avatar__image" src="${escapeHtml(selectedAvatarUrl)}" />`
        : `<span>${escapeHtml(summary.initials || "--")}</span>`;

      avatarCardPreviewNode.innerHTML = `
        <div class="appearance-avatar-preview-card__stage">
          <button
            class="appearance-avatar-preview-control appearance-avatar-preview-control--prev"
            type="button"
            aria-label="Show previous portrait"
            data-avatar-nav="prev"
            ${hasPrev ? "" : "disabled"}
          >
            <span aria-hidden="true">&lt;</span>
          </button>
          <div
            class="appearance-avatar-preview-frame"
            data-avatar-collection="${escapeHtml(previewThemeId)}"
            data-avatar-category="${escapeHtml(activeCollection?.characterTypes?.length ? (shellState.avatarCharacterType || activeCollection.characterTypes[0].id) : "")}"
            data-avatar-seed="${escapeHtml(String(previewSeed))}"
            style="${escapeHtml(previewThemeStyle)}"
          >
            <div class="appearance-avatar-preview-ambience" aria-hidden="true">
              <span class="appearance-avatar-preview-ambience__wash"></span>
              <span class="appearance-avatar-preview-ambience__grid"></span>
              <span class="appearance-avatar-preview-ambience__sigil"></span>
              <span class="appearance-avatar-preview-ambience__beam appearance-avatar-preview-ambience__beam--one"></span>
              <span class="appearance-avatar-preview-ambience__beam appearance-avatar-preview-ambience__beam--two"></span>
              <span class="appearance-avatar-preview-ambience__spark appearance-avatar-preview-ambience__spark--one"></span>
              <span class="appearance-avatar-preview-ambience__spark appearance-avatar-preview-ambience__spark--two"></span>
              <span class="appearance-avatar-preview-ambience__spark appearance-avatar-preview-ambience__spark--three"></span>
              <span class="appearance-avatar-preview-ambience__spark appearance-avatar-preview-ambience__spark--four"></span>
            </div>
            <div class="appearance-avatar-preview-actions">
              <button
                class="appearance-avatar-preview-story"
                type="button"
                aria-label="Open character story"
                data-avatar-story="true"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H20v15.5A2.5 2.5 0 0 0 17.5 16H6z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"/>
                  <path d="M6 5.5v13A2.5 2.5 0 0 0 8.5 21H20" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"/>
                  <path d="M10 7.5h5M10 11h5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/>
                </svg>
              </button>
              <button
                class="appearance-avatar-preview-expand"
                type="button"
                aria-label="Open full portrait view"
                data-avatar-enlarge="true"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 4H5v4M15 4h4v4M9 20H5v-4M19 20h-4v-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                </svg>
              </button>
            </div>
            <div class="crm-avatar crm-avatar--portrait-large">${selectedAvatarMarkup}</div>
          </div>
          <button
            class="appearance-avatar-preview-control appearance-avatar-preview-control--next"
            type="button"
            aria-label="Show next portrait"
            data-avatar-nav="next"
            ${hasNext ? "" : "disabled"}
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      `;

      const prevButton = avatarCardPreviewNode.querySelector('[data-avatar-nav="prev"]');
      if (prevButton instanceof HTMLButtonElement) {
        prevButton.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          cycleAvatarPreview("prev");
        };
      }

      const nextButton = avatarCardPreviewNode.querySelector('[data-avatar-nav="next"]');
      if (nextButton instanceof HTMLButtonElement) {
        nextButton.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          cycleAvatarPreview("next");
        };
      }

      const storyButton = avatarCardPreviewNode.querySelector("[data-avatar-story]");
      if (storyButton instanceof HTMLButtonElement) {
        storyButton.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          openAvatarStoryView();
        };
      }

      const enlargeButton = avatarCardPreviewNode.querySelector("[data-avatar-enlarge]");
      if (enlargeButton instanceof HTMLButtonElement) {
        enlargeButton.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          openAvatarFullView();
        };
      }
    }

    if (avatarGridNode) {
      avatarGridNode.querySelectorAll("[data-avatar-url]").forEach((button) => {
        const buttonUrl = button.getAttribute("data-avatar-url") || "";
        const isSelected = buttonUrl === selectedAvatarUrl;
        const isSaved = buttonUrl === currentAvatarUrl;
        button.classList.toggle("is-active", isSelected);
        button.classList.toggle("is-saved", isSaved);
        button.setAttribute("aria-pressed", String(isSelected));
      });
    }

    if (avatarApplyButtonNode) {
      avatarApplyButtonNode.disabled = !hasAvatarChange;
      avatarApplyButtonNode.textContent = hasAvatarChange ? `Apply ${selectedPortraitLabel}` : "Character Applied";
    }

  }

  function setPendingAvatar(avatarUrl) {
    shellState.pendingAvatarUrl = coerceAvatarUrlToUnlockedCollection(
      resolveAvatarUrl(avatarUrl, shellState.profileSummary?.email || ""),
      shellState.profileSummary?.email || "",
      shellState.profileSummary
    );
    const preset = getAvatarPreset(shellState.pendingAvatarUrl);
    if (preset) {
      shellState.avatarCollectionId = preset.collectionId || shellState.avatarCollectionId;
      shellState.avatarCharacterType = preset.category || shellState.avatarCharacterType;
    }
    syncAvatarSelection();
  }

  function commitAvatar(avatarUrl) {
    const resolvedAvatarUrl = coerceAvatarUrlToUnlockedCollection(
      resolveAvatarUrl(avatarUrl, shellState.profileSummary?.email || ""),
      shellState.profileSummary?.email || "",
      shellState.profileSummary
    );
    if (shellState.profileSummary) {
      shellState.profileSummary.avatarUrl = resolvedAvatarUrl;
    }
    shellState.pendingAvatarUrl = resolvedAvatarUrl;
    const preset = getAvatarPreset(resolvedAvatarUrl);
    if (preset) {
      shellState.avatarCollectionId = preset.collectionId || shellState.avatarCollectionId;
      shellState.avatarCharacterType = preset.category || shellState.avatarCharacterType;
    }
    syncAvatarSelection();
    renderHeaderBanner();
    renderIdentityBanner();
  }

  function getActiveAvatarCollection() {
    const availableCollections = getAvailableAvatarCollections();
    const unlockedCollections = availableCollections.filter((item) => item.isUnlocked);
    const selectableCollections = unlockedCollections.length ? unlockedCollections : availableCollections;
    if (!selectableCollections.length) {
      return null;
    }

    const selectedAvatarUrl = coerceAvatarUrlToUnlockedCollection(
      resolveAvatarUrl(
        shellState.pendingAvatarUrl || shellState.profileSummary?.avatarUrl || "",
        shellState.profileSummary?.email || ""
      ),
      shellState.profileSummary?.email || "",
      shellState.profileSummary
    );
    const selectedPreset = getAvatarPreset(selectedAvatarUrl);

    const hasSelectedCollection = selectableCollections.some((item) => item.id === shellState.avatarCollectionId);
    if (!shellState.avatarCollectionId || !hasSelectedCollection) {
      shellState.avatarCollectionId = selectedPreset?.collectionId && selectableCollections.some((item) => item.id === selectedPreset.collectionId)
        ? selectedPreset.collectionId
        : selectableCollections[selectableCollections.length - 1]?.id || selectableCollections[0]?.id || "core";
    }

    let collection =
      selectableCollections.find((item) => item.id === shellState.avatarCollectionId)
      || selectableCollections[selectableCollections.length - 1]
      || selectableCollections[0];

    const accountGender = resolveAccountGender(shellState.profileSummary?.email || "");
    const availableTypes = (collection.characterTypes || []).filter((item) => !accountGender || item.id === accountGender);
    const preferredType =
      selectedPreset &&
      selectedPreset.collectionId === collection.id &&
      availableTypes.some((item) => item.id === selectedPreset.category)
        ? selectedPreset.category
        : shellState.avatarCharacterType;

    if (!availableTypes.some((item) => item.id === preferredType)) {
      shellState.avatarCharacterType = availableTypes[0]?.id || "";
    } else {
      shellState.avatarCharacterType = preferredType || "";
    }

    return collection;
  }

  function getVisibleAvatarPresets(collection = getActiveAvatarCollection()) {
    if (!collection) {
      return [];
    }

    const activeCharacterType = shellState.avatarCharacterType || collection.characterTypes?.[0]?.id || "";
    return ACCOUNT_AVATAR_PRESETS.filter(
      (preset) => preset.collectionId === collection.id && preset.category === activeCharacterType
    );
  }

  function ensurePendingAvatarInVisibleSet() {
    const visiblePresets = getVisibleAvatarPresets();
    if (!visiblePresets.length) {
      return visiblePresets;
    }

    const currentPendingUrl = coerceAvatarUrlToUnlockedCollection(
      resolveAvatarUrl(
        shellState.pendingAvatarUrl || shellState.profileSummary?.avatarUrl || "",
        shellState.profileSummary?.email || ""
      ),
      shellState.profileSummary?.email || "",
      shellState.profileSummary
    );
    const isVisible = visiblePresets.some(
      (preset) => normalizeAvatarPath(preset.image) === normalizeAvatarPath(currentPendingUrl)
    );
    if (!isVisible) {
      shellState.pendingAvatarUrl = visiblePresets[0].image;
    }

    return visiblePresets;
  }

  function cycleAvatarPreview(direction) {
    const visiblePresets = getVisibleAvatarPresets();
    if (!visiblePresets.length) {
      return;
    }

    const selectedAvatarUrl = resolveAvatarUrl(
      shellState.pendingAvatarUrl || shellState.profileSummary?.avatarUrl || "",
      shellState.profileSummary?.email || ""
    );
    const currentIndex = visiblePresets.findIndex(
      (preset) => normalizeAvatarPath(preset.image) === normalizeAvatarPath(selectedAvatarUrl)
    );
    const nextIndex = currentIndex < 0
      ? direction === "prev"
        ? visiblePresets.length - 1
        : 0
      : direction === "prev"
        ? (currentIndex - 1 + visiblePresets.length) % visiblePresets.length
        : (currentIndex + 1) % visiblePresets.length;

    setPendingAvatar(visiblePresets[nextIndex].image);
    renderAvatarSelector();
    setAvatarFeedback("Preview updated. Click Apply Character to save this selection.", "");
  }

  function cycleAvatarFullView(direction) {
    const visiblePresets = getVisibleAvatarPresets();
    if (!visiblePresets.length) {
      return;
    }

    const selectedAvatarUrl = resolveAvatarUrl(
      shellState.pendingAvatarUrl || shellState.profileSummary?.avatarUrl || "",
      shellState.profileSummary?.email || ""
    );
    const currentIndex = visiblePresets.findIndex(
      (preset) => normalizeAvatarPath(preset.image) === normalizeAvatarPath(selectedAvatarUrl)
    );
    const nextIndex = currentIndex < 0
      ? direction === "prev"
        ? visiblePresets.length - 1
        : 0
      : direction === "prev"
        ? (currentIndex - 1 + visiblePresets.length) % visiblePresets.length
        : (currentIndex + 1) % visiblePresets.length;

    setPendingAvatar(visiblePresets[nextIndex].image);
    openAvatarFullView();
  }

  function openAvatarFullView() {
    const overlayNode = ensureAvatarFullViewOverlay();
    const previewState = getPreviewAvatarState();
    const avatarIdentity = getAvatarIdentity(previewState);
    const selectedAvatarUrl = previewState.selectedAvatarUrl;

    if (!selectedAvatarUrl) {
      return;
    }

    applyAvatarThemeToNode(
      overlayNode,
      avatarIdentity.collectionId,
      avatarIdentity.themeSeed
    );
    const imageNode = overlayNode.querySelector(".appearance-avatar-fullview__image");
    const kickerNode = overlayNode.querySelector(".appearance-avatar-fullview__kicker");
    const titleNode = overlayNode.querySelector(".appearance-avatar-fullview__title");
    const statsNode = overlayNode.querySelector(".appearance-avatar-fullview__stats-wrap");
    if (imageNode instanceof HTMLImageElement) {
      imageNode.src = selectedAvatarUrl;
      imageNode.alt = `${avatarIdentity.name} portrait enlarged`;
    }
    if (kickerNode instanceof HTMLElement) {
      kickerNode.textContent = avatarIdentity.storyKicker;
    }
    if (titleNode instanceof HTMLElement) {
      titleNode.textContent = avatarIdentity.name;
    }
    if (statsNode instanceof HTMLElement) {
      statsNode.innerHTML = buildAvatarStatsMarkup(
        avatarIdentity.stats,
        avatarIdentity.collectionId,
        "appearance-avatar-story__stats--fullview"
      );
    }

    overlayNode.classList.add("is-open");
    overlayNode.setAttribute("aria-hidden", "false");
    overlayNode.style.display = "grid";
    overlayNode.style.visibility = "visible";
    overlayNode.style.opacity = "1";
    overlayNode.style.pointerEvents = "auto";
    document.body.classList.add("avatar-lightbox-open");
  }

  function getSelectedAvatarPreset() {
    const { selectedAvatarUrl } = getPreviewAvatarState();
    return getAvatarPreset(selectedAvatarUrl) || null;
  }

  function closeAvatarFullView() {
    const overlayNode = document.getElementById("account-avatar-fullview");
    if (!(overlayNode instanceof HTMLElement)) {
      return;
    }

    overlayNode.classList.remove("is-open");
    overlayNode.setAttribute("aria-hidden", "true");
    overlayNode.style.display = "none";
    overlayNode.style.visibility = "hidden";
    overlayNode.style.opacity = "0";
    overlayNode.style.pointerEvents = "none";
    document.body.classList.remove("avatar-lightbox-open");
  }

  function syncAvatarStoryPage(storyNode) {
    if (!(storyNode instanceof HTMLElement)) {
      return;
    }

    const currentPage = shellState.avatarStoryPage === 1 ? "stats" : "story";
    storyNode.dataset.storyPage = currentPage;

    storyNode.querySelectorAll("[data-avatar-story-page]").forEach((pageNode) => {
      if (!(pageNode instanceof HTMLElement)) {
        return;
      }

      const isActive = pageNode.dataset.avatarStoryPage === currentPage;
      pageNode.hidden = !isActive;
      pageNode.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    const pagerNode = storyNode.querySelector(".appearance-avatar-story__pager");
    if (pagerNode instanceof HTMLElement) {
      pagerNode.textContent = currentPage === "story" ? "Story Card 1 / 2" : "GPP Card 2 / 2";
    }

    const prevButton = storyNode.querySelector('[data-avatar-story-nav="prev"]');
    if (prevButton instanceof HTMLButtonElement) {
      const isHidden = currentPage === "story";
      prevButton.hidden = isHidden;
      prevButton.disabled = isHidden;
    }

    const nextButton = storyNode.querySelector('[data-avatar-story-nav="next"]');
    if (nextButton instanceof HTMLButtonElement) {
      const isHidden = currentPage === "stats";
      nextButton.hidden = isHidden;
      nextButton.disabled = isHidden;
    }
  }

  function setAvatarStoryPage(nextPage) {
    shellState.avatarStoryPage = nextPage === 1 ? 1 : 0;
    const storyNode = document.getElementById("account-avatar-story");
    if (storyNode instanceof HTMLElement) {
      syncAvatarStoryPage(storyNode);
    }
  }

  function renderAvatarStoryOverlay(storyNode, avatarIdentity) {
    if (!(storyNode instanceof HTMLElement) || !avatarIdentity) {
      return;
    }

    const storyKickerNode = storyNode.querySelector(".appearance-avatar-story__kicker");
    const storyTitleNode = storyNode.querySelector(".appearance-avatar-story__title");
    const bodyNode = storyNode.querySelector(".appearance-avatar-story__body");
    const imageNode = storyNode.querySelector(".appearance-avatar-story__portrait");
    const statsKickerNode = storyNode.querySelector(".appearance-avatar-story__stats-kicker");
    const statsTitleNode = storyNode.querySelector(".appearance-avatar-story__stats-title");
    const statsCopyNode = storyNode.querySelector(".appearance-avatar-story__stats-copy");
    const statsNode = storyNode.querySelector(".appearance-avatar-story__stats-wrap");

    applyAvatarThemeToNode(storyNode, avatarIdentity.collectionId || "default", avatarIdentity.themeSeed);

    if (storyTitleNode instanceof HTMLElement) {
      storyTitleNode.textContent = avatarIdentity.name;
    }
    if (storyKickerNode instanceof HTMLElement) {
      storyKickerNode.textContent = avatarIdentity.storyKicker;
    }
    if (bodyNode instanceof HTMLElement) {
      bodyNode.textContent = avatarIdentity.backstory || "";
    }
    if (statsKickerNode instanceof HTMLElement) {
      statsKickerNode.textContent = avatarIdentity.statsKicker;
    }
    if (statsTitleNode instanceof HTMLElement) {
      statsTitleNode.textContent = avatarIdentity.statsTitle;
    }
    if (statsCopyNode instanceof HTMLElement) {
      statsCopyNode.textContent = avatarIdentity.statsCopy;
    }
    if (statsNode instanceof HTMLElement) {
      statsNode.innerHTML = buildAvatarStatsMarkup(avatarIdentity.stats, avatarIdentity.collectionId || "default");
    }
    if (imageNode instanceof HTMLImageElement) {
      imageNode.src = avatarIdentity.selectedAvatarUrl || "";
      imageNode.alt = `${avatarIdentity.name} portrait`;
    }

    syncAvatarStoryPage(storyNode);
  }

  function openAvatarStoryView() {
    const storyNode = ensureAvatarStoryOverlay();
    const avatarIdentity = getAvatarIdentity();
    if (!avatarIdentity?.selectedAvatarUrl) {
      setAvatarFeedback("Choose or upload a portrait first to open the character story card.", "");
      return;
    }

    shellState.avatarStoryPage = 0;
    renderAvatarStoryOverlay(storyNode, avatarIdentity);

    storyNode.classList.add("is-open");
    storyNode.setAttribute("aria-hidden", "false");
    storyNode.style.display = "grid";
    storyNode.style.visibility = "visible";
    storyNode.style.opacity = "1";
    storyNode.style.pointerEvents = "auto";
    document.body.classList.add("avatar-lightbox-open");
  }

  function closeAvatarStoryView() {
    const storyNode = document.getElementById("account-avatar-story");
    if (!(storyNode instanceof HTMLElement)) {
      return;
    }

    storyNode.classList.remove("is-open");
    storyNode.setAttribute("aria-hidden", "true");
    storyNode.style.display = "none";
    storyNode.style.visibility = "hidden";
    storyNode.style.opacity = "0";
    storyNode.style.pointerEvents = "none";
    shellState.avatarStoryPage = 0;
    document.body.classList.remove("avatar-lightbox-open");
  }

  function ensureAvatarFullViewOverlay() {
    let overlayNode = document.getElementById("account-avatar-fullview");
    if (overlayNode instanceof HTMLElement) {
      return overlayNode;
    }

    overlayNode = document.createElement("div");
    overlayNode.id = "account-avatar-fullview";
    overlayNode.className = "appearance-avatar-fullview";
    overlayNode.setAttribute("aria-hidden", "true");
    overlayNode.style.display = "none";
    overlayNode.style.visibility = "hidden";
    overlayNode.style.opacity = "0";
    overlayNode.style.pointerEvents = "none";
    overlayNode.innerHTML = `
      <div class="appearance-avatar-fullview__backdrop" data-avatar-fullview-close="true"></div>
      <section class="appearance-avatar-fullview__dialog" role="dialog" aria-modal="true" aria-label="Portrait full view">
        <button
          class="appearance-avatar-fullview__close"
          type="button"
          aria-label="Close full portrait view"
          data-avatar-fullview-close="true"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <div class="appearance-avatar-fullview__layout">
          <button
            class="appearance-avatar-fullview__nav appearance-avatar-fullview__nav--prev"
            type="button"
            aria-label="Show previous portrait"
            data-avatar-fullview-nav="prev"
          >
            <span aria-hidden="true">&lt;</span>
          </button>
          <div class="appearance-avatar-fullview__frame">
            <img alt="Portrait full view" class="appearance-avatar-fullview__image" src="" />
          </div>
          <aside class="appearance-avatar-fullview__side">
            <span class="appearance-avatar-fullview__kicker"></span>
            <h3 class="appearance-avatar-fullview__title"></h3>
            <div class="appearance-avatar-fullview__stats-wrap"></div>
          </aside>
          <button
            class="appearance-avatar-fullview__nav appearance-avatar-fullview__nav--next"
            type="button"
            aria-label="Show next portrait"
            data-avatar-fullview-nav="next"
          >
            <span aria-hidden="true">&gt;</span>
          </button>
        </div>
      </section>
    `;
    document.body.appendChild(overlayNode);

    overlayNode.addEventListener("click", (event) => {
      const navTrigger = event.target.closest("[data-avatar-fullview-nav]");
      if (navTrigger instanceof HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        cycleAvatarFullView(navTrigger.getAttribute("data-avatar-fullview-nav") || "next");
        return;
      }
      const closeTrigger = event.target.closest("[data-avatar-fullview-close]");
      if (closeTrigger instanceof HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        closeAvatarFullView();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!overlayNode.classList.contains("is-open")) {
        return;
      }
      if (event.key === "ArrowLeft") {
        cycleAvatarFullView("prev");
        return;
      }
      if (event.key === "ArrowRight") {
        cycleAvatarFullView("next");
        return;
      }
      if (event.key === "Escape") {
        closeAvatarFullView();
      }
    });

    return overlayNode;
  }

  function ensureAvatarStoryOverlay() {
    let storyNode = document.getElementById("account-avatar-story");
    if (storyNode instanceof HTMLElement) {
      return storyNode;
    }

    storyNode = document.createElement("div");
    storyNode.id = "account-avatar-story";
    storyNode.className = "appearance-avatar-story";
    storyNode.setAttribute("aria-hidden", "true");
    storyNode.style.display = "none";
    storyNode.style.visibility = "hidden";
    storyNode.style.opacity = "0";
    storyNode.style.pointerEvents = "none";
    storyNode.innerHTML = `
      <div class="appearance-avatar-story__backdrop" data-avatar-story-close="true"></div>
      <section class="appearance-avatar-story__dialog" role="dialog" aria-modal="true" aria-label="Character backstory">
        <button
          class="appearance-avatar-story__close"
          type="button"
          aria-label="Close character backstory"
          data-avatar-story-close="true"
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <div class="appearance-avatar-story__frame">
          <div class="appearance-avatar-story__topbar">
            <span class="appearance-avatar-story__pager">Story Card 1 / 2</span>
            <div class="appearance-avatar-story__top-actions">
              <button
                class="appearance-avatar-story__nav appearance-avatar-story__nav--prev"
                type="button"
                data-avatar-story-nav="prev"
                hidden
                disabled
              >
                Back
              </button>
              <button
                class="appearance-avatar-story__nav appearance-avatar-story__nav--next"
                type="button"
                data-avatar-story-nav="next"
              >
                Next: GPP Card
              </button>
            </div>
          </div>
          <div class="appearance-avatar-story__panel appearance-avatar-story__panel--story" data-avatar-story-page="story">
            <div class="appearance-avatar-story__media">
              <img alt="Character portrait" class="appearance-avatar-story__portrait" src="" />
            </div>
            <div class="appearance-avatar-story__copy">
              <span class="appearance-avatar-story__kicker"></span>
              <h3 class="appearance-avatar-story__title"></h3>
              <p class="appearance-avatar-story__body"></p>
            </div>
          </div>
          <div
            class="appearance-avatar-story__panel appearance-avatar-story__panel--stats"
            data-avatar-story-page="stats"
            hidden
            aria-hidden="true"
          >
            <div class="appearance-avatar-story__stats-card-shell">
              <div class="appearance-avatar-story__stats-copy-wrap">
                <span class="appearance-avatar-story__stats-kicker"></span>
                <h3 class="appearance-avatar-story__stats-title"></h3>
                <p class="appearance-avatar-story__stats-copy"></p>
              </div>
              <div class="appearance-avatar-story__stats-wrap"></div>
            </div>
          </div>
        </div>
      </section>
    `;
    document.body.appendChild(storyNode);

    storyNode.addEventListener("click", (event) => {
      const navTrigger = event.target.closest("[data-avatar-story-nav]");
      if (navTrigger instanceof HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        setAvatarStoryPage(navTrigger.getAttribute("data-avatar-story-nav") === "next" ? 1 : 0);
        return;
      }

      const closeTrigger = event.target.closest("[data-avatar-story-close]");
      if (closeTrigger instanceof HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        closeAvatarStoryView();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!storyNode.classList.contains("is-open")) {
        return;
      }
      if (event.key === "ArrowRight" && shellState.avatarStoryPage === 0) {
        setAvatarStoryPage(1);
        return;
      }
      if (event.key === "ArrowLeft" && shellState.avatarStoryPage === 1) {
        setAvatarStoryPage(0);
        return;
      }
      if (event.key === "Escape") {
        closeAvatarStoryView();
      }
    });

    return storyNode;
  }

  function getPanelLabel(node, fallbackLabel) {
    if (!(node instanceof HTMLElement)) {
      return fallbackLabel || "Section";
    }

    const explicit = String(node.dataset.sectionLabel || node.dataset.subnavLabel || "").trim();
    if (explicit) {
      return explicit;
    }

    const labelNode = node.querySelector(":scope > .kicker, :scope > h2, :scope > h3, :scope > strong");
    const nestedNode =
      labelNode ||
      node.querySelector(".kicker, h2, h3, strong");

    return String(nestedNode?.textContent || fallbackLabel || "Section").trim();
  }

  function collectPagePanels() {
    if (pageKey === "home") {
      return [];
    }

    const mainNode = document.querySelector(".dashboard-main");
    if (!mainNode) {
      return [];
    }

    const directPanels = Array.from(mainNode.querySelectorAll(":scope > .crm-page-panel")).filter(
      (item) => item instanceof HTMLElement
    );
    if (directPanels.length) {
      const seen = new Map();
      return directPanels.map((panelNode, index) => {
        const fallbackLabel = `Panel ${index + 1}`;
        const baseId = panelNode.id || `${role}-${pageKey}-${slugify(getPanelLabel(panelNode, fallbackLabel)) || `panel-${index + 1}`}`;
        const duplicateCount = seen.get(baseId) || 0;
        seen.set(baseId, duplicateCount + 1);
        const resolvedId = duplicateCount ? `${baseId}-${duplicateCount + 1}` : baseId;
        panelNode.id = resolvedId;
        panelNode.dataset.pagePanel = "true";
        return {
          node: panelNode,
          label: getPanelLabel(panelNode, fallbackLabel),
          id: resolvedId,
        };
      });
    }

    const sections = Array.from(mainNode.querySelectorAll(":scope > .dashboard-section"));
    const panels = [];

    sections.forEach((section, sectionIndex) => {
      if (!(section instanceof HTMLElement)) {
        return;
      }

      const hasSectionHeading = Boolean(
        String(section.dataset.sectionLabel || "").trim() ||
          section.querySelector(":scope > .kicker") ||
          section.querySelector(":scope > h2")
      );

      if (hasSectionHeading) {
        panels.push({
          node: section,
          label: getPanelLabel(section, `Section ${sectionIndex + 1}`),
        });
        return;
      }

      const nestedPanels = Array.from(
        section.querySelectorAll(":scope > article, :scope > .split > article, :scope > .funnel-grid > article")
      ).filter((item) => item instanceof HTMLElement);

      if (!nestedPanels.length) {
        panels.push({
          node: section,
          label: getPanelLabel(section, `Section ${sectionIndex + 1}`),
        });
        return;
      }

      nestedPanels.forEach((panelNode, panelIndex) => {
        panels.push({
          node: panelNode,
          label: getPanelLabel(panelNode, `Panel ${panelIndex + 1}`),
        });
      });
    });

    const seen = new Map();
    return panels.map((panel, index) => {
      const baseId = panel.node.id || `${role}-${pageKey}-${slugify(panel.label) || `panel-${index + 1}`}`;
      const duplicateCount = seen.get(baseId) || 0;
      seen.set(baseId, duplicateCount + 1);
      const resolvedId = duplicateCount ? `${baseId}-${duplicateCount + 1}` : baseId;
      panel.node.id = resolvedId;
      panel.node.dataset.pagePanel = "true";
      return {
        ...panel,
        id: resolvedId,
      };
    });
  }

  function applyPagePanelVisibility(activePanelId) {
    const panelNodes = Array.from(document.querySelectorAll("[data-page-panel='true']"));
    panelNodes.forEach((panelNode) => {
      panelNode.hidden = panelNode.id !== activePanelId;
    });

    document.querySelectorAll(".dashboard-section").forEach((sectionNode) => {
      if (!(sectionNode instanceof HTMLElement)) {
        return;
      }

      if (sectionNode.dataset.pagePanel === "true") {
        return;
      }

      const owningPanel = sectionNode.closest("[data-page-panel='true']");
      if (owningPanel instanceof HTMLElement) {
        sectionNode.hidden = owningPanel.hidden;
        return;
      }

      const containsPanels = Boolean(sectionNode.querySelector("[data-page-panel='true']"));
      if (!containsPanels) {
        sectionNode.hidden = false;
        return;
      }

      const hasVisiblePanel = Boolean(sectionNode.querySelector("[data-page-panel='true']:not([hidden])"));
      sectionNode.hidden = !hasVisiblePanel;
    });
  }

  function activatePageTab(panelId) {
    shellState.activePanelId = panelId || "";
    writeActivePanelCache(shellState.activePanelId);
    document.querySelectorAll(".crm-page-tab").forEach((button) => {
      const isActive = button.getAttribute("data-panel-id") === shellState.activePanelId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    applyPagePanelVisibility(shellState.activePanelId);
  }

  function bindPageTabs(panels) {
    const tabBar = document.querySelector(".crm-page-tabs");
    if (!tabBar || !panels.length) {
      return;
    }

    if (tabBar.dataset.bound !== "true") {
      tabBar.addEventListener("click", (event) => {
        const button = event.target.closest("[data-panel-id]");
        if (!(button instanceof HTMLButtonElement)) {
          return;
        }

        const targetId = button.getAttribute("data-panel-id") || "";
        const targetNode = document.getElementById(targetId);
        if (!targetNode) {
          return;
        }

        activatePageTab(targetId);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      tabBar.dataset.bound = "true";
    }
    const preferredPanelId = shellState.activePanelId || readActivePanelCache();
    const initialPanelId = panels.find((panel) => panel.id === preferredPanelId)?.id || panels[0].id;
    activatePageTab(initialPanelId);
  }

  function isShellManagedTabBar(tabNode) {
    return Boolean(tabNode?.dataset?.shellManagedTabs === "true" || tabNode?.querySelector("[data-panel-id]"));
  }

  function isPageManagedTabBar(tabNode) {
    return Boolean(
      tabNode && !isShellManagedTabBar(tabNode)
    );
  }

  function renderPageTabs() {
    const headerNode = document.querySelector(".crm-page-head");
    const existingNode = document.querySelector(".crm-page-tabs");
    const disablePageTabs = document.body?.dataset?.disablePageTabs === "true";
    const pageOwnsTabs = isPageManagedTabBar(existingNode);

    if (!headerNode || pageKey === "home" || disablePageTabs) {
      if (existingNode && isShellManagedTabBar(existingNode)) {
        existingNode.remove();
      }
      return;
    }

    if (pageOwnsTabs) {
      return;
    }

    const panels = collectPagePanels();
    if (!panels.length) {
      if (existingNode && isShellManagedTabBar(existingNode)) {
        existingNode.remove();
      }
      return;
    }

    const tabMarkup = panels
      .map(
        (panel) => `
          <button
            class="crm-page-tab"
            type="button"
            data-panel-id="${escapeHtml(panel.id)}"
            aria-pressed="false"
          >
            ${escapeHtml(panel.label)}
          </button>
        `
      )
      .join("");

    const tabNode = existingNode || document.createElement("nav");
    tabNode.className = "crm-page-tabs reveal in-view";
    tabNode.setAttribute("aria-label", "Page sections");
    tabNode.dataset.shellManagedTabs = "true";
    tabNode.innerHTML = tabMarkup;

    if (!existingNode) {
      headerNode.insertAdjacentElement("afterend", tabNode);
    }

    bindPageTabs(panels);
  }

  function ensureOverlayContainers() {
    if (!document.getElementById("crm-shell-overlay")) {
      const overlay = document.createElement("div");
      overlay.id = "crm-shell-overlay";
      overlay.className = "crm-overlay";
      overlay.hidden = true;
      overlay.innerHTML = `
        <button class="crm-overlay-backdrop" type="button" data-overlay-close aria-label="Close panel"></button>
        <section class="crm-drawer" role="dialog" aria-modal="true" aria-labelledby="crm-overlay-title">
          <div class="crm-drawer__head">
            <div>
              <p class="crm-drawer__eyebrow" id="crm-overlay-eyebrow">Workspace</p>
              <h2 id="crm-overlay-title">Panel</h2>
            </div>
            <button class="crm-icon-close" type="button" data-overlay-close aria-label="Close panel">×</button>
          </div>
          <div class="crm-drawer__body" id="crm-overlay-body"></div>
        </section>
      `;
      document.body.appendChild(overlay);
    }

    if (!document.getElementById("crm-tutorial-overlay")) {
      const tutorial = document.createElement("div");
      tutorial.id = "crm-tutorial-overlay";
      tutorial.className = "crm-overlay crm-overlay--tutorial";
      tutorial.hidden = true;
      tutorial.innerHTML = `
        <button class="crm-overlay-backdrop" type="button" data-tutorial-close aria-label="Close tutorial"></button>
        <div class="crm-tutorial-spotlight" id="crm-tutorial-spotlight" hidden></div>
        <section class="crm-tutorial" role="dialog" aria-modal="true" aria-labelledby="crm-tutorial-title">
          <div class="crm-tutorial__head">
            <div>
              <p class="crm-drawer__eyebrow">Workspace guide</p>
              <h2 id="crm-tutorial-title">How this workspace works</h2>
            </div>
            <button class="crm-icon-close" type="button" data-tutorial-close aria-label="Close tutorial">×</button>
          </div>
          <div class="crm-tutorial__progress">
            <span id="crm-tutorial-step-label">Step 1</span>
            <div class="crm-tutorial__bar" aria-hidden="true"><span id="crm-tutorial-bar"></span></div>
          </div>
          <div class="crm-tutorial__body">
            <h3 id="crm-tutorial-step-title"></h3>
            <p id="crm-tutorial-step-body"></p>
            <ul class="crm-tutorial__nav" id="crm-tutorial-nav"></ul>
          </div>
          <div class="crm-tutorial__actions">
            <button class="btn btn-ghost" type="button" id="crm-tutorial-back">Back</button>
            <button class="btn btn-primary" type="button" id="crm-tutorial-next">Next</button>
          </div>
        </section>
      `;
      document.body.appendChild(tutorial);
    }
  }

  function getOverlayItems(kind) {
    const isMessageView = kind === "messages";
    return (shellState.notifications || []).filter((notification) =>
      isMessageView ? isMessageNotification(notification) : !isMessageNotification(notification)
    );
  }

  function resolveRoleHomePath(role) {
    if (role === "coach") {
      return "/coach-dashboard.html";
    }

    if (role === "super_admin") {
      return "/admin-dashboard.html";
    }

    return "/client-dashboard.html";
  }

  function sanitizeOverlayTarget(url) {
    const value = typeof url === "string" ? url.trim() : "";
    if (!value || /^javascript:/iu.test(value)) {
      return "";
    }

    if (/^(https?:)?\/\//iu.test(value) || /^(mailto|tel):/iu.test(value)) {
      return value;
    }

    if (/^[./?#]/u.test(value)) {
      return value;
    }

    return `./${value.replace(/^\/+/u, "")}`;
  }

  function resolveNotificationTarget(notification) {
    const directTarget = sanitizeOverlayTarget(notification?.action_url || "");
    if (directTarget) {
      return directTarget;
    }

    const role = shellState.profileSummary?.role || body?.dataset?.requiredRole || "";
    const haystack = [
      notification?.category,
      notification?.title,
      notification?.body,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (/coach_review|quarterly review|review due|promotion ready|promotion-ready|kpi|tier|position/iu.test(haystack)) {
      return "/admin-clients.html";
    }

    if (/lead|whatsapp|inquiry|follow up|follow-up|consult/iu.test(haystack)) {
      return "/admin-leads.html";
    }

    if (/payment|billing|refund|purchase|order|financial|payout|commission|revenue|liability/iu.test(haystack)) {
      if (role === "coach") {
        return "/coach-commissions.html";
      }
      if (role === "client") {
        return "/client-packages.html";
      }
      return "/admin-financials.html";
    }

    if (/schedule|booking|session|calendar|reschedule|cancellation|cancelled|canceled|approved|declined/iu.test(haystack)) {
      if (role === "coach") {
        return "/coach-schedule.html";
      }
      if (role === "super_admin") {
        return "/admin-clients.html";
      }
      return "/client-schedule.html";
    }

    if (/reward|xp|coin|coins|milestone/iu.test(haystack)) {
      return role === "client" ? "/client-rewards.html" : resolveRoleHomePath(role);
    }

    if (/message|guidance|progress update|shared|reply|client/iu.test(haystack)) {
      if (role === "coach") {
        return "/coach-clients.html";
      }
      if (role === "super_admin") {
        return "/admin-clients.html";
      }
      return resolveRoleHomePath(role);
    }

    return resolveRoleHomePath(role);
  }

  function formatOverlayTimestamp(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    return new Intl.DateTimeFormat("en-MY", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function renderOverlayFeed(kind) {
    const titleNode = document.getElementById("crm-overlay-title");
    const eyebrowNode = document.getElementById("crm-overlay-eyebrow");
    const bodyNode = document.getElementById("crm-overlay-body");
    if (!titleNode || !eyebrowNode || !bodyNode) {
      return;
    }

    const isMessageView = kind === "messages";
    const items = getOverlayItems(kind);
    const expanded = Boolean(shellState.overlayExpandedByKind[kind]);
    const visibleItems = expanded ? items : items.slice(0, 5);

    eyebrowNode.textContent = isMessageView ? "Messages" : "Notifications";
    titleNode.textContent = isMessageView ? "Recent communication history" : "Recent alerts and updates";
    bodyNode.innerHTML = visibleItems.length
      ? `
        <div class="crm-feed-summary">
          <div class="crm-feed-summary__group">
            <span>${expanded ? `Showing all ${items.length}` : `Showing ${visibleItems.length} of ${items.length}`}</span>
            <strong>${items.filter((item) => !item.is_read).length} unread</strong>
          </div>
          <span class="crm-feed-summary__hint">${isMessageView ? "Tap any item to continue the conversation." : "Tap any item to jump straight to the task."}</span>
        </div>
        ${visibleItems
          .map((item) => {
            const targetUrl = resolveNotificationTarget(item);
            const itemTag = targetUrl ? "a" : "article";
            const itemLabel = item.title || (isMessageView ? "message" : "notification");
            const unreadLabel = item.is_read ? "History" : "Unread";
            const itemAttributes = targetUrl
              ? ` href="${escapeHtml(targetUrl)}" data-overlay-target="${escapeHtml(targetUrl)}" aria-label="Open ${escapeHtml(
                  itemLabel
                )}"`
              : "";
            return `
              <${itemTag} class="crm-feed-item${item.is_read ? " crm-feed-item--history" : ""}${
                targetUrl ? " crm-feed-item--action" : ""
              }"${itemAttributes}>
                <div class="crm-feed-item__meta">
                  <div class="crm-feed-item__meta-group">
                    <span class="crm-feed-item__pill">${escapeHtml(item.category || "system")}</span>
                    <span class="crm-feed-item__pill crm-feed-item__pill--state${item.is_read ? "" : " crm-feed-item__pill--unread"}">${escapeHtml(
                      unreadLabel
                    )}</span>
                  </div>
                  <span class="crm-feed-item__stamp">${escapeHtml(formatOverlayTimestamp(item.created_at))}</span>
                </div>
                <div class="crm-feed-item__title-row">
                  ${item.is_read ? "" : '<span class="crm-feed-item__dot" aria-hidden="true"></span>'}
                  <h3>${escapeHtml(item.title)}</h3>
                </div>
                <p>${escapeHtml(item.body)}</p>
                <div class="crm-feed-item__footer">
                  <span class="crm-feed-item__state">${item.is_read ? "Saved in history" : "Waiting for review"}</span>
                  <span class="crm-feed-item__cta">${targetUrl ? (isMessageView ? "Open conversation" : "Open task") : "Saved in history"}</span>
                </div>
              </${itemTag}>
            `;
          })
          .join("")}
        ${
          items.length > 5
            ? `
              <div class="crm-feed-actions">
                <button class="btn btn-ghost" type="button" data-overlay-more="${escapeHtml(kind)}">
                  ${expanded ? "Show Less" : "See More"}
                </button>
              </div>
            `
            : ""
        }
      `
      : `<article class="crm-feed-item crm-feed-item--empty"><h3>${isMessageView ? "No conversations waiting" : "No alerts waiting"}</h3><p>${
          isMessageView
            ? "Messages will appear here when a client, coach, or admin workflow creates a communication alert."
            : "Notifications will appear here when there are new approvals, leads, or payment-related updates."
        }</p><span class="crm-feed-item__empty-hint">${
          isMessageView
            ? "The newest five conversations will stay pinned here first."
            : "The newest five alerts will stay pinned here first."
        }</span></article>`;

    const unreadIds = items.filter((item) => !item.is_read).map((item) => item.id).filter(Boolean);
    if (unreadIds.length) {
      void markNotificationsRead(unreadIds);
    }
  }

  function openOverlay(kind, triggerButton) {
    ensureOverlayContainers();
    const overlay = document.getElementById("crm-shell-overlay");
    const panelNode = overlay?.querySelector(".crm-drawer");
    if (!overlay || !(panelNode instanceof HTMLElement)) {
      return;
    }

    if (shellState.activeOverlay === kind && !overlay.hidden) {
      closeOverlay();
      return;
    }

    shellState.activeOverlay = kind;
    shellState.activeOverlayAnchor = captureTriggerRect(triggerButton);
    shellState.overlayExpandedByKind[kind] = false;
    renderOverlayFeed(kind);
    overlay.hidden = false;
    positionFloatingPanel(panelNode, shellState.activeOverlayAnchor, 420);
  }

  function closeOverlay() {
    const overlay = document.getElementById("crm-shell-overlay");
    if (overlay) {
      overlay.hidden = true;
    }
    if (shellState.activeOverlay !== "tutorial") {
      shellState.activeOverlay = "";
    }
  }

  function tutorialStep({ targetSelector = "", title = "", description = "", interactionType = "next" }) {
    const cleanTitle = String(title || "").trim();
    const cleanDescription = String(description || "").trim();
    return {
      title: cleanTitle,
      body: cleanDescription,
      description: cleanDescription,
      targetSelector: String(targetSelector || "").trim(),
      interactionType,
    };
  }

  function getTutorialSteps() {
    const activeClientPlannerTab =
      pageKey === "planner"
        ? document.querySelector("[data-client-planner-tab].is-active")?.getAttribute("data-client-planner-tab") ||
          new URLSearchParams(window.location.search).get("tab") ||
          "training"
        : "";
    const activeClientSettingsTab =
      pageKey === "settings"
        ? document.querySelector("[data-client-settings-tab].is-active")?.getAttribute("data-client-settings-tab") || "portrait"
        : "";

    const helpStep = tutorialStep({
      title: "Help anytime",
      description: "Use the help button in the top bar whenever you want to replay this tour from the page you are on.",
      targetSelector: '[data-shell-open="tutorial"]',
      interactionType: "click",
    });
    const logoutStep = tutorialStep({
      title: "Log out safely",
      description: "Use Log out when you are done on a shared device. You can sign out from the sidebar footer or the security panel.",
      targetSelector: ".crm-sidebar-logout, [data-account-sign-out]",
      interactionType: "click",
    });

    if (role === "client") {
      const navSteps = [
        tutorialStep({
          title: "Home tab",
          description: "Start here after landing. Home is your quick picture of what needs attention now, what is booked next, and what your coach has already set up.",
          targetSelector: '#account-sidebar .crm-nav a[href$="client-dashboard.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Training tab",
          description: "Open Training for your assigned block, session log, and the exact numbers you need to enter after each workout.",
          targetSelector: '#account-sidebar .crm-nav a[href*="client-planner.html?tab=training"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Nutrition tab",
          description: "Nutrition keeps your targets, daily adherence, meal logging, and food or photo support in one place.",
          targetSelector: '#account-sidebar .crm-nav a[href*="client-planner.html?tab=nutrition"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Health tab",
          description: "Health is for recovery forms, check-ins, readiness signals, and coach health notes. Empty states here simply mean nothing is due yet.",
          targetSelector: '#account-sidebar .crm-nav a[href*="client-planner.html?tab=health"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Progress tab",
          description: "Use Progress for photo uploads and visual check-ins. If it looks empty, no photo set has been uploaded or reviewed yet.",
          targetSelector: '#account-sidebar .crm-nav a[href*="client-planner.html?tab=progress"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Packages tab",
          description: "Packages is where you check active balance, buy another bundle, and review receipts or invoices. If you have no sessions yet, start here.",
          targetSelector: '#account-sidebar .crm-nav a[href$="client-packages.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Schedule tab",
          description: "Use Schedule to book, review coach availability, or request a change. If the calendar looks quiet, it just means nothing has been published or booked yet.",
          targetSelector: '#account-sidebar .crm-nav a[href$="client-schedule.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Rewards tab",
          description: "Rewards shows approved XP, coins, milestones, and leaderboard progress. New accounts often stay quiet here until coach or admin approvals land.",
          targetSelector: '#account-sidebar .crm-nav a[href$="client-rewards.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Profile tab",
          description: "Profile is your clean summary page for character, package balance, verified sessions, and approved reward activity.",
          targetSelector: '#account-sidebar .crm-nav a[href$="client-profile.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Settings tab",
          description: "Settings is where you manage portrait choice, wearables, password, and support routes. Data export or deletion requests still go through LEGACY+ support.",
          targetSelector: '#account-sidebar .crm-nav a[href$="client-settings.html"]',
          interactionType: "click",
        }),
      ];

      const pageSteps = {
        home: [
          tutorialStep({
            title: "Identity banner",
            description: "This top banner shows who the workspace belongs to, your level path, and your live progress status.",
            targetSelector: "#crm-identity-banner",
          }),
          tutorialStep({
            title: "Action snapshot",
            description: "Use this section first. It is the fastest place to see what to do next, especially if you have no bookings, no active package, or no pending coach tasks yet.",
            targetSelector: "#client-home-focus-panel",
          }),
          tutorialStep({
            title: "Quick stats",
            description: "These cards summarize sessions, bookings, rewards, and package usage so you do not need to open every tab just to orient yourself.",
            targetSelector: "#client-home-snapshot",
          }),
          tutorialStep({
            title: "Plan preview",
            description: "This block previews your current training, nutrition, and health direction before you move into the detailed planner pages.",
            targetSelector: "#client-home-plan",
          }),
        ],
        training: [
          tutorialStep({
            title: "Planner tabs",
            description: "These tabs switch between training, nutrition, health, and progress. Use them as your coaching workspace hub.",
            targetSelector: "#client-planner-tabs",
          }),
          tutorialStep({
            title: "Current block",
            description: "This panel tells you what block is live, what your next assigned day is, and what your coach wants you to focus on right now.",
            targetSelector: "#client-planner-current-block",
          }),
          tutorialStep({
            title: "Training logging",
            description: "Log what actually happened here. If a day is empty, it has not been assigned yet. If it is prefilled, use the last-session guidance to move forward instead of starting from zero.",
            targetSelector: "#client-planner-training-days",
          }),
        ],
        nutrition: [
          tutorialStep({
            title: "Planner tabs",
            description: "Use the planner tabs to move between coaching layers without leaving the page.",
            targetSelector: "#client-planner-tabs",
          }),
          tutorialStep({
            title: "Nutrition plan",
            description: "Choose the active plan here, then use the daily log, meal flow, and photo tools below it. If a section is empty, nothing has been assigned or logged yet.",
            targetSelector: "#client-planner-nutrition-plan",
          }),
          tutorialStep({
            title: "Adherence and food logging",
            description: "This nutrition workspace is for daily adherence, meals, barcode search, and coach-reviewable intake notes.",
            targetSelector: "#client-planner-nutrition-form",
          }),
        ],
        health: [
          tutorialStep({
            title: "Planner tabs",
            description: "Use the planner tabs to switch into health whenever a check-in or recovery update is due.",
            targetSelector: "#client-planner-tabs",
          }),
          tutorialStep({
            title: "Health summary",
            description: "This summary shows the latest signals your coach cares about. Empty panels usually mean the next health form has not been scheduled yet.",
            targetSelector: "#client-planner-health-summary",
          }),
          tutorialStep({
            title: "Check-in form",
            description: "Submit recovery, readiness, or health updates here so the coach can review them with context instead of guesswork.",
            targetSelector: "#client-planner-checkin-form",
          }),
        ],
        progress: [
          tutorialStep({
            title: "Planner tabs",
            description: "Use the planner tabs to move into progress whenever it is time for a photo check-in or comparison review.",
            targetSelector: "#client-planner-tabs",
          }),
          tutorialStep({
            title: "Progress upload",
            description: "Upload your next photo set here. If the feed is empty, no photo batch has been captured yet for this phase.",
            targetSelector: "#client-planner-progress-form",
          }),
          tutorialStep({
            title: "Latest snapshot",
            description: "This section shows the latest upload, the review status, and any weight or summary details paired to that capture.",
            targetSelector: "#client-planner-progress-feed",
          }),
        ],
        packages: [
          tutorialStep({
            title: "Active balance",
            description: "Start here to see what is still bookable, what is reserved, and whether anything is close to expiring.",
            targetSelector: "#client-packages-balance",
          }),
          tutorialStep({
            title: "Purchase builder",
            description: "Use this selector to choose your format, tier, and session bundle. If the page feels empty, it usually means you have not selected a package path yet.",
            targetSelector: "#client-package-store",
          }),
          tutorialStep({
            title: "Documents and history",
            description: "This history table keeps your orders, payment state, and billing documents together so you can come back for receipts later.",
            targetSelector: "#client-packages-history",
          }),
        ],
        schedule: [
          tutorialStep({
            title: "Booking calendar",
            description: "Tap any open slot here to start a session request. This is the fastest booking route if your package balance is ready.",
            targetSelector: "#client-schedule-booking",
          }),
          tutorialStep({
            title: "Availability view",
            description: "Use this coach availability panel as a visual reference before you request a specific time or reschedule.",
            targetSelector: "#client-schedule-availability",
          }),
          tutorialStep({
            title: "Change requests",
            description: "Use this form when a confirmed booking needs to move or be cancelled. If it is empty, there may be no eligible session to change yet.",
            targetSelector: "#client-session-change-form",
          }),
        ],
        rewards: [
          tutorialStep({
            title: "Rewards identity",
            description: "This top section ties your portrait, level path, and reward track together so you can see whose progress you are looking at.",
            targetSelector: "#client-rewards-overview",
          }),
          tutorialStep({
            title: "Points tracker",
            description: "Approved XP and coins are summarized here. If the numbers are still low or empty, the activity has not been approved yet, not lost.",
            targetSelector: "#client-rewards-points",
          }),
          tutorialStep({
            title: "Leaderboard",
            description: "This is your relative standing among other clients. It is designed for context and motivation, not to replace your own coaching goals.",
            targetSelector: "#client-rewards-leaderboard",
          }),
        ],
        profile: [
          tutorialStep({
            title: "Profile overview",
            description: "This is your clean summary card for portrait, coach assignment, coins, next unlock, and package balance.",
            targetSelector: "#client-profile-overview",
          }),
          tutorialStep({
            title: "Verified activity",
            description: "Sessions and reward movement only appear here once they have actually been logged and approved. Empty rows are normal for new accounts.",
            targetSelector: "#client-profile-verified-activity",
          }),
          tutorialStep({
            title: "Package snapshot",
            description: "This section keeps your current package position and recent commercial activity together for quick reference.",
            targetSelector: "#client-profile-package-summary",
          }),
        ],
        "settings:portrait": [
          tutorialStep({
            title: "Settings tabs",
            description: "Use these page tabs to switch between portrait, wearables, account, and security without leaving settings.",
            targetSelector: '[data-client-settings-tab="portrait"]',
          }),
          tutorialStep({
            title: "Portrait library",
            description: "Choose your unlocked character here and apply it to the live workspace identity shown across the app.",
            targetSelector: "#client-settings-portrait",
          }),
          tutorialStep({
            title: "Help and support route",
            description: "If you need something that is not self-serve, use your coach or LEGACY+ support from the account and security tabs.",
            targetSelector: "#client-settings-account",
          }),
        ],
        "settings:wearables": [
          tutorialStep({
            title: "Settings tabs",
            description: "Use these page tabs to switch between portrait, wearables, account, and security without leaving settings.",
            targetSelector: '[data-client-settings-tab="wearables"]',
          }),
          tutorialStep({
            title: "Wearable connections",
            description: "Connect and sync supported wearable providers here. If the metric table is empty, the first sync has not happened yet.",
            targetSelector: "#client-settings-wearables",
          }),
        ],
        "settings:account": [
          tutorialStep({
            title: "Settings tabs",
            description: "Use these page tabs to switch between portrait, wearables, account, and security without leaving settings.",
            targetSelector: '[data-client-settings-tab="account"]',
          }),
          tutorialStep({
            title: "Signed-in details",
            description: "This card keeps your email, role, and support route visible. Export or deletion requests are handled through support, not self-service here.",
            targetSelector: "#client-settings-account",
          }),
        ],
        "settings:security": [
          tutorialStep({
            title: "Settings tabs",
            description: "Use these page tabs to switch between portrait, wearables, account, and security without leaving settings.",
            targetSelector: '[data-client-settings-tab="security"]',
          }),
          tutorialStep({
            title: "Security panel",
            description: "Update your password, send yourself a reset link, or sign out here. This is also the right reference point when support needs to verify your account route.",
            targetSelector: "#client-settings-security",
          }),
        ],
      };

      const currentPageKey =
        pageKey === "planner" ? activeClientPlannerTab : pageKey === "settings" ? `settings:${activeClientSettingsTab}` : pageKey;

      return navSteps.concat(pageSteps[currentPageKey] || pageSteps[pageKey] || []).concat([helpStep, logoutStep]);
    }

    if (role === "coach") {
      const navSteps = [
        tutorialStep({
          title: "Home tab",
          description: "Start on Home to scan your roster, booking pressure, commission picture, and the items that need action first.",
          targetSelector: '#account-sidebar .crm-nav a[href$="coach-dashboard.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Clients tab",
          description: "Clients is your roster operations page for points, packages, consult follow-up, and activation codes.",
          targetSelector: '#account-sidebar .crm-nav a[href$="coach-clients.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Client XP tab",
          description: "Client XP is your controlled event logger. If member lists are empty, the client has not been linked into the XP system yet.",
          targetSelector: '#account-sidebar .crm-nav a[href*="XP%20gamification/staff.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Training tab",
          description: "Training is where you build or assign structured programs, manage workbook previews, and run the session desk.",
          targetSelector: '#account-sidebar .crm-nav a[href$="coach-training.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Nutrition tab",
          description: "Nutrition handles nutrition programming, review queues, plan delivery, and quiet-roster nudges.",
          targetSelector: '#account-sidebar .crm-nav a[href$="coach-programming.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Health tab",
          description: "Health is the check-in and readiness workspace for templates, form scheduling, risk views, and health nudges.",
          targetSelector: '#account-sidebar .crm-nav a[href$="coach-health.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Schedule tab",
          description: "Schedule is where you publish availability, connect Google Calendar, review booking requests, and complete sessions with notes.",
          targetSelector: '#account-sidebar .crm-nav a[href$="coach-schedule.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Commissions tab",
          description: "Commissions shows the payout trail, KPI thresholds, and what is pending, approved, or already paid.",
          targetSelector: '#account-sidebar .crm-nav a[href$="coach-commissions.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Profile tab",
          description: "Profile is your clean coach record for roster strength, recent sessions, commission activity, and performance context.",
          targetSelector: '#account-sidebar .crm-nav a[href$="coach-profile.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Settings tab",
          description: "Settings controls palette, portrait, payout details, password, and sign-out. Deletion or account exports still run through super admin.",
          targetSelector: '#account-sidebar .crm-nav a[href$="coach-settings.html"]',
          interactionType: "click",
        }),
      ];

      const pageSteps = {
        home: [
          tutorialStep({
            title: "Identity banner",
            description: "This banner confirms whose workspace is open and gives you a fast sense of your current coaching identity and level path.",
            targetSelector: "#crm-identity-banner",
          }),
          tutorialStep({
            title: "KPI snapshot",
            description: "Use these cards to see clients, upcoming sessions, commission, and coach-issued points in one glance.",
            targetSelector: "#coach-stat-clients",
          }),
          tutorialStep({
            title: "Action and roster focus",
            description: "These sections pull forward what needs action now. If they look quiet, nothing urgent has been assigned, booked, or escalated yet.",
            targetSelector: "#coach-ops-brief-card",
          }),
          tutorialStep({
            title: "Live queues",
            description: "Booking requests, roster, recent sessions, and KPI review all flow through the home page so you can spot problems before opening another tab.",
            targetSelector: "#coach-booking-request-rows",
          }),
        ],
        clients: [
          tutorialStep({
            title: "Client roster",
            description: "This roster is your starting point. If it is empty, the super admin has not assigned clients to you yet.",
            targetSelector: "#coach-client-roster",
          }),
          tutorialStep({
            title: "Points request form",
            description: "Use this form to submit coach-issued rewards. Bundle actions and manual actions are separated so you do not need to remember every rule.",
            targetSelector: "#coach-points-form",
          }),
          tutorialStep({
            title: "Package visibility",
            description: "This table gives you the commercial context for your roster so you can see who still has active package coverage.",
            targetSelector: "#coach-package-rows",
          }),
          tutorialStep({
            title: "Consult workflow",
            description: "Use the consult form and follow-up form to move enquiries forward. If the pipeline is empty, no new consult leads have been created yet.",
            targetSelector: "#coach-consult-form",
          }),
          tutorialStep({
            title: "Client codes",
            description: "Generate client registration codes here. Existing codes stay visible below so you do not create duplicates by accident.",
            targetSelector: "#coach-client-code-form",
          }),
        ],
        client_xp: [
          tutorialStep({
            title: "XP status",
            description: "This header tells you whether the XP tools are ready. If the page says no members are linked yet, you are waiting on admin-side profile linking, not a broken page.",
            targetSelector: "#xp-module-status",
          }),
          tutorialStep({
            title: "Log event",
            description: "Choose a member, pick an action, and log a verified or pending event here. Search and category chips are built to help you find actions fast.",
            targetSelector: "#xp-event-form",
          }),
          tutorialStep({
            title: "Ledger and recent events",
            description: "Use these tables to confirm what has already counted. Empty tables simply mean no member data or no approved entries yet.",
            targetSelector: "#xp-ledger-table",
          }),
        ],
        training: [
          tutorialStep({
            title: "Program builder",
            description: "This wizard is where you choose the client, shape the block, and move through inputs, map, split, templates, and generation.",
            targetSelector: "#coach-program-template-form",
          }),
          tutorialStep({
            title: "Workbook preview",
            description: "This preview shows the current workbook logic before you assign it, so you can sanity-check structure and delivery details first.",
            targetSelector: "#coach-training-workbook-preview",
          }),
          tutorialStep({
            title: "Training day editor",
            description: "This is the editable day stack for the live template. Add, reset, or refine days here before you commit the plan.",
            targetSelector: "#coach-program-template-days",
          }),
          tutorialStep({
            title: "Session desk",
            description: "This desk is for live session logging and review. If it is empty, no client session has been selected or no session data is ready yet.",
            targetSelector: "#coach-training-session-desk",
          }),
        ],
        programming: [
          tutorialStep({
            title: "Nutrition operations summary",
            description: "These top cards show roster coverage, templates, review count, risk, and stale activity so you can spot the real bottlenecks first.",
            targetSelector: "#coach-program-roster-grid",
          }),
          tutorialStep({
            title: "Template and assignment flow",
            description: "Build the nutrition template here, then assign it to the client with a start date and workbook preview before delivery.",
            targetSelector: "#coach-program-template-form",
          }),
          tutorialStep({
            title: "Delivery workspace",
            description: "This is where nutrition targets, habits, weekly rhythm, and workbook-derived guidance are prepared for the client-facing side.",
            targetSelector: "#coach-program-delivery-plan-card",
          }),
          tutorialStep({
            title: "Ops and nudges",
            description: "Use the ops workflow when you need to follow up on nutrition gaps, quiet clients, or risk segments without rebuilding the full plan.",
            targetSelector: "#coach-program-ops-workflow-section",
          }),
        ],
        health: [
          tutorialStep({
            title: "Review and filter area",
            description: "Use these filters to surface the right health review workload. If the review stack is empty, no check-ins are overdue or available yet.",
            targetSelector: "#coach-program-review-summary-grid",
          }),
          tutorialStep({
            title: "Check-in templates",
            description: "Build or update the health question set here before you schedule it to a client.",
            targetSelector: "#coach-program-checkin-template-form",
          }),
          tutorialStep({
            title: "Schedule health check-ins",
            description: "Assign the template to a client here so the next recovery or readiness form lands with a clear due date.",
            targetSelector: "#coach-program-schedule-checkin-form",
          }),
          tutorialStep({
            title: "Health operations",
            description: "This nudge workflow is for overdue health forms, quiet rosters, and risk-based follow-up at scale.",
            targetSelector: "#coach-program-ops-workflow-section",
          }),
        ],
        schedule: [
          tutorialStep({
            title: "Availability calendar",
            description: "This is your published availability view. It should be the first place you check before investigating booking issues.",
            targetSelector: "#coach-live-availability-calendar",
          }),
          tutorialStep({
            title: "Google Calendar sync",
            description: "Connect or disconnect your live calendar here. If it says not connected, booking still works, but external calendar sync will not.",
            targetSelector: "#coach-calendar-connect",
          }),
          tutorialStep({
            title: "Availability form",
            description: "Publish recurring slots here so clients have something to book against.",
            targetSelector: "#coach-availability-form",
          }),
          tutorialStep({
            title: "Requests and session notes",
            description: "Booking requests, change requests, and completion notes all live in this page. Use the session notes drawer to close the loop after a session is done.",
            targetSelector: "#coach-booking-request-rows",
          }),
        ],
        commissions: [
          tutorialStep({
            title: "Commission overview",
            description: "This top area shows your weekly, monthly, quarterly, and rate snapshot so you know the payout picture before reviewing the ledger.",
            targetSelector: "#coach-commission-overview-summary",
          }),
          tutorialStep({
            title: "Comp plan and KPIs",
            description: "These lists explain how your payout structure is being evaluated right now, including review timing and KPI readiness.",
            targetSelector: "#coach-comp-plan-list",
          }),
          tutorialStep({
            title: "Commission ledger",
            description: "Use this table for the detailed payout trail. If it is empty, sessions have not generated payable records yet.",
            targetSelector: "#coach-commission-rows",
          }),
        ],
        profile: [
          tutorialStep({
            title: "Coach profile summary",
            description: "This top block is your operating profile: active clients, commission rate, current review timing, and performance bars.",
            targetSelector: "#coach-profile-summary-metrics",
          }),
          tutorialStep({
            title: "Roster and session history",
            description: "These tables show the clients and recent coaching activity tied to your live role.",
            targetSelector: "#coach-profile-roster-rows",
          }),
          tutorialStep({
            title: "Commission and operations",
            description: "This lower section gives you the payment trail and the ops notes that explain how your current coach position is being judged.",
            targetSelector: "#coach-profile-commission-rows",
          }),
        ],
        settings: [
          tutorialStep({
            title: "Coach palette",
            description: "Use this section if you want a different full-workspace palette. If you do nothing, the standard coach theme stays in place.",
            targetSelector: "#account-coach-theme-presets",
          }),
          tutorialStep({
            title: "Portrait library",
            description: "Choose your unlocked portrait here. The selected character updates your live coach identity across the workspace.",
            targetSelector: "#account-avatar-presets",
          }),
          tutorialStep({
            title: "Payout details",
            description: "Keep your commission bank details updated here so monthly payout work does not stall.",
            targetSelector: "#coach-payout-form",
          }),
          tutorialStep({
            title: "Security and account control",
            description: "Use this section to update your password, send a reset email, or sign out. Account export or deletion still goes through super admin.",
            targetSelector: "#account-security-password-form",
          }),
        ],
      };

      return navSteps.concat(pageSteps[pageKey] || []).concat([helpStep, logoutStep]);
    }

    if (role === "super_admin") {
      const navSteps = [
        tutorialStep({
          title: "Home tab",
          description: "Start on Home for the business picture first: revenue, payout risk, watchlist items, review pressure, and newsletter status.",
          targetSelector: '#account-sidebar .crm-nav a[href$="admin-dashboard.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "TEAM tab",
          description: "TEAM is where you manage coaches, assignments, reward approvals, activation codes, and account record exports.",
          targetSelector: '#account-sidebar .crm-nav a[href$="admin-clients.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Client XP tab",
          description: "Client XP is the admin-only control room for imports, member creation, profile linking, action corrections, redemptions, and ledger audit.",
          targetSelector: '#account-sidebar .crm-nav a[href*="XP%20gamification/admin.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Coach XP tab",
          description: "Coach XP is the management-only ledger for coach growth rules, promotion tracking, and XP activity review.",
          targetSelector: '#account-sidebar .crm-nav a[href*="XP%20coach%20gamification/index.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Leads tab",
          description: "Leads is the working CRM board for enquiry capture, follow-up, conversion, message logging, and pipeline health.",
          targetSelector: '#account-sidebar .crm-nav a[href$="admin-leads.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Financials tab",
          description: "Financials is where you audit sales, exports, commissions, customer revenue, and operating costs in one place.",
          targetSelector: '#account-sidebar .crm-nav a[href$="admin-financials.html"]',
          interactionType: "click",
        }),
        tutorialStep({
          title: "Settings tab",
          description: "Settings covers password control, add-on diagnostics, QA accounts, and integration reference panels.",
          targetSelector: '#account-sidebar .crm-nav a[href$="admin-settings.html"]',
          interactionType: "click",
        }),
      ];

      const pageSteps = {
        home: [
          tutorialStep({
            title: "Identity banner",
            description: "This top banner confirms the admin workspace identity and keeps the fastest controls close at hand.",
            targetSelector: "#crm-identity-banner",
          }),
          tutorialStep({
            title: "Numbers that matter first",
            description: "These KPI links are the fastest way to jump from summary to the exact area that needs attention.",
            targetSelector: "#admin-stat-net-revenue",
          }),
          tutorialStep({
            title: "Watchlist",
            description: "Use the watchlist as your true priority queue. If it is empty, the summary has not found a live issue to escalate right now.",
            targetSelector: "#admin-watchlist",
          }),
          tutorialStep({
            title: "Review queue and newsletter",
            description: "Coach reviews and newsletter status both live on Home so operational and communication risks stay visible together.",
            targetSelector: "#admin-coach-review-rows",
          }),
        ],
        clients: [
          tutorialStep({
            title: "Coach management",
            description: "Use this form to set position, tier, review timing, KPI notes, and payout rules for a coach.",
            targetSelector: "#admin-coach-management-form",
          }),
          tutorialStep({
            title: "Authentication codes",
            description: "Generate coach and client registration codes here. The table below helps you avoid duplicate or expired-code confusion.",
            targetSelector: "#admin-coach-code-form",
          }),
          tutorialStep({
            title: "Assignments",
            description: "Use this assignment form to decide which coach owns which client relationship across the app.",
            targetSelector: "#admin-assignment-form",
          }),
          tutorialStep({
            title: "Account records and exports",
            description: "Load a record here, then copy JSON or download a PDF export. Permanent deletion is intentionally not a one-click action in this workspace.",
            targetSelector: "#admin-account-records",
          }),
          tutorialStep({
            title: "Reward approval queue",
            description: "This queue is where coach-submitted rewards become approved XP or get held back for review.",
            targetSelector: "#admin-reward-rows",
          }),
        ],
        client_xp: [
          tutorialStep({
            title: "XP snapshot",
            description: "These KPI cards tell you whether Client XP is healthy before you touch imports or member data.",
            targetSelector: "#xp-admin-kpis",
          }),
          tutorialStep({
            title: "Import rules",
            description: "Use the import form first when you are setting up or correcting the XP engine from the workbook and bundle.",
            targetSelector: "#xp-import-form",
          }),
          tutorialStep({
            title: "Members and profile linking",
            description: "Create a member here, then link it to a client profile so coach and client views can resolve the same account.",
            targetSelector: "#xp-member-form",
          }),
          tutorialStep({
            title: "Action and redemption control",
            description: "Super admin can correct actions and process redemptions here. If the tables are empty, imports or member activity have not happened yet.",
            targetSelector: "#xp-action-form",
          }),
          tutorialStep({
            title: "Ledger audit",
            description: "Use the members, actions, and ledger tables to confirm the rules are producing the balance you expect.",
            targetSelector: "#xp-ledger-table",
          }),
        ],
        coach_xp: [
          tutorialStep({
            title: "Coach XP snapshot",
            description: "This module snapshot tells you the health of the Coach XP engine before you look at any one coach.",
            targetSelector: "#xp-coach-dashboard-kpis",
          }),
          tutorialStep({
            title: "Import and leaderboard",
            description: "Run the import once if needed, then use the leaderboard to compare counted XP and current level across coaches.",
            targetSelector: "#xp-coach-import-run",
          }),
          tutorialStep({
            title: "Activity trail",
            description: "This activity table is the audit trail for verified and pending coach XP actions. If it is empty, nothing has been logged yet.",
            targetSelector: "#xp-coach-dashboard-activity",
          }),
        ],
        leads: [
          tutorialStep({
            title: "Lead board",
            description: "Use the board and filters to understand the live pipeline. If it is empty, create the first lead or wait for capture sources to sync.",
            targetSelector: "#admin-lead-board",
          }),
          tutorialStep({
            title: "Create a lead",
            description: "This form is for manual entry when the lead did not come from the website, consult flow, or WhatsApp capture path.",
            targetSelector: "#admin-lead-form",
          }),
          tutorialStep({
            title: "Follow-up workflow",
            description: "Use follow-ups to set dates, ownership, and status changes without losing the activity trail.",
            targetSelector: "#admin-follow-up-form",
          }),
          tutorialStep({
            title: "Convert to client",
            description: "When a lead is ready, convert it here to create the client account and optionally assign a coach immediately.",
            targetSelector: "#admin-convert-lead-form",
          }),
          tutorialStep({
            title: "Messages and audit log",
            description: "Use the message form to log outbound contact, then verify the full history in the lead activity table below.",
            targetSelector: "#admin-lead-message-form",
          }),
        ],
        financials: [
          tutorialStep({
            title: "Finance navigation",
            description: "Use this workspace nav to move between overview, transactions, reports, commissions, customer revenue, and OPEX without leaving the page.",
            targetSelector: "#admin-finance-nav",
          }),
          tutorialStep({
            title: "Transaction exports",
            description: "Use Export here when finance needs a clean transaction pull. If the table is empty, broaden the filters or wait for live payments to sync.",
            targetSelector: "#admin-export-orders",
          }),
          tutorialStep({
            title: "Reports",
            description: "Use the report filters to create a date-bounded view of sales, refunds, fees, and collected revenue.",
            targetSelector: "#admin-report-view-transactions",
          }),
          tutorialStep({
            title: "Commission ledger",
            description: "This section is the payout audit trail. Export it when finance or coach reviews need a portable record.",
            targetSelector: "#admin-export-commissions",
          }),
          tutorialStep({
            title: "Operating costs",
            description: "Use the OPEX form and ledger to track internal spend. Empty charts here usually mean no operating-cost file has been loaded yet.",
            targetSelector: "#admin-operating-cost-form",
          }),
        ],
        settings: [
          tutorialStep({
            title: "Portrait and security",
            description: "These settings let you update the admin portrait, rotate your password, and sign out without leaving the CRM.",
            targetSelector: "#account-security-password-form",
          }),
          tutorialStep({
            title: "Automation and integrations",
            description: "Use the automation and add-on panels here as your reference point for what is live, what is read-only, and what still needs an external API.",
            targetSelector: "#admin-codex-bundle-status",
          }),
          tutorialStep({
            title: "QA accounts",
            description: "This form provisions or resets the dedicated QA coach and client accounts used for safe production testing.",
            targetSelector: "#admin-qa-accounts-form",
          }),
          tutorialStep({
            title: "Newsletter path",
            description: "The newsletter now has its own workspace. Use the shortcut here when you need audience, preview, or send controls.",
            targetSelector: "#admin-newsletter-home, a[href=\"./admin-newsletter.html\"]",
          }),
        ],
      };

      return navSteps.concat(pageSteps[pageKey] || []).concat([helpStep, logoutStep]);
    }

    return Array.isArray(shellConfig.tutorial) ? shellConfig.tutorial : [];
  }

  function clearTutorialSpotlight() {
    document.querySelectorAll(".crm-tutorial-target").forEach((node) => {
      node.classList.remove("crm-tutorial-target");
    });

    const spotlight = document.getElementById("crm-tutorial-spotlight");
    if (spotlight instanceof HTMLElement) {
      spotlight.hidden = true;
    }

    shellState.tutorialTargetSelector = "";
  }

  function positionTutorialSpotlight(step, options = {}) {
    const tutorial = document.getElementById("crm-tutorial-overlay");
    const tutorialPanel = tutorial?.querySelector(".crm-tutorial");
    const spotlight = document.getElementById("crm-tutorial-spotlight");
    clearTutorialSpotlight();

    if (!(tutorialPanel instanceof HTMLElement)) {
      return;
    }

    const targetSelector = typeof step?.targetSelector === "string" ? step.targetSelector.trim() : "";
    const targetNode = targetSelector ? document.querySelector(targetSelector) : null;
    if (!(targetNode instanceof HTMLElement) || !(spotlight instanceof HTMLElement)) {
      positionFloatingPanel(tutorialPanel, shellState.activeOverlayAnchor, 480);
      return;
    }

    shellState.tutorialTargetSelector = targetSelector;
    targetNode.classList.add("crm-tutorial-target");

    if (options.allowScroll !== false) {
      try {
        targetNode.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      } catch (_) {
        targetNode.scrollIntoView();
      }
    }

    const drawSpotlight = () => {
      const rect = targetNode.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        spotlight.hidden = true;
        positionFloatingPanel(tutorialPanel, shellState.activeOverlayAnchor, 480);
        return;
      }

      const padding = 10;
      const width = Math.min(window.innerWidth - 16, rect.width + padding * 2);
      const height = Math.min(window.innerHeight - 16, rect.height + padding * 2);
      const left = Math.max(8, Math.min(rect.left - padding, window.innerWidth - width - 8));
      const top = Math.max(8, Math.min(rect.top - padding, window.innerHeight - height - 8));

      spotlight.hidden = false;
      spotlight.style.left = `${left}px`;
      spotlight.style.top = `${top}px`;
      spotlight.style.width = `${width}px`;
      spotlight.style.height = `${height}px`;

      positionFloatingPanel(
        tutorialPanel,
        {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        480
      );
    };

    if (options.allowScroll !== false && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(drawSpotlight);
      return;
    }

    drawSpotlight();
  }

  function renderTutorialStep() {
    const tutorial = document.getElementById("crm-tutorial-overlay");
    const steps = getTutorialSteps();
    const step = steps[shellState.tutorialStepIndex];
    const titleNode = document.getElementById("crm-tutorial-step-title");
    const bodyNode = document.getElementById("crm-tutorial-step-body");
    const labelNode = document.getElementById("crm-tutorial-step-label");
    const barNode = document.getElementById("crm-tutorial-bar");
    const navNode = document.getElementById("crm-tutorial-nav");
    const backButton = document.getElementById("crm-tutorial-back");
    const nextButton = document.getElementById("crm-tutorial-next");
    const closeButton = tutorial?.querySelector("[data-tutorial-close]");

    if (!tutorial || !step || !titleNode || !bodyNode || !labelNode || !barNode || !navNode || !backButton || !nextButton) {
      return;
    }

    titleNode.textContent = step.title;
    bodyNode.textContent = step.body;
    labelNode.textContent = `Step ${shellState.tutorialStepIndex + 1} of ${steps.length}`;
    barNode.style.width = `${((shellState.tutorialStepIndex + 1) / steps.length) * 100}%`;
    navNode.innerHTML = steps
      .map(
        (item, index) => `
          <li class="${index === shellState.tutorialStepIndex ? "is-current" : ""}">
            <span>${escapeHtml(item.title)}</span>
          </li>
        `
      )
      .join("");

    backButton.disabled = shellState.tutorialStepIndex === 0;
    nextButton.textContent = shellState.tutorialStepIndex === steps.length - 1 ? "Finish tutorial" : "Next";
    if (closeButton) {
      closeButton.hidden = false;
    }

    positionTutorialSpotlight(step);
  }

  async function completeTutorial() {
    try {
      await saveServerPreferences({
        tutorialCompleted: true,
        tutorialVersion: TUTORIAL_VERSION,
      });
    } catch (_) {
      // Local fallback prevents the modal from blocking the user if the network save fails.
    }

    window.localStorage.setItem(tutorialStorageKey, "done");
    shellState.preferences.tutorialVersion = TUTORIAL_VERSION;
    shellState.tutorialForced = false;
    closeTutorial();
  }

  function closeTutorial() {
    const tutorial = document.getElementById("crm-tutorial-overlay");
    if (tutorial) {
      tutorial.hidden = true;
    }
    clearTutorialSpotlight();

    if (shellState.activeOverlay === "tutorial") {
      shellState.activeOverlay = "";
    }
  }

  function openTutorial(triggerButton) {
    ensureOverlayContainers();
    const tutorial = document.getElementById("crm-tutorial-overlay");
    if (!tutorial) {
      return;
    }

    if (shellState.activeOverlay === "tutorial" && !tutorial.hidden) {
      closeTutorial();
      return;
    }

    shellState.activeOverlay = "tutorial";
    shellState.activeOverlayAnchor = captureTriggerRect(triggerButton);
    shellState.tutorialForced = false;
    shellState.tutorialStepIndex = 0;
    tutorial.hidden = false;
    renderTutorialStep();
  }

  function bindOverlayControls() {
    ensureOverlayContainers();

    const overlay = document.getElementById("crm-shell-overlay");
    const tutorial = document.getElementById("crm-tutorial-overlay");
    if (overlay) {
      overlay.addEventListener("click", (event) => {
        const moreButton = event.target.closest("[data-overlay-more]");
        if (moreButton instanceof HTMLButtonElement) {
          const kind = moreButton.getAttribute("data-overlay-more") || "";
          if (kind) {
            shellState.overlayExpandedByKind[kind] = !shellState.overlayExpandedByKind[kind];
            renderOverlayFeed(kind);
            repositionActivePopover();
          }
          return;
        }

        if (event.target.closest("[data-overlay-close]")) {
          closeOverlay();
        }
      });
    }

    if (tutorial) {
      tutorial.addEventListener("click", async (event) => {
        if (event.target.closest("[data-tutorial-close]")) {
          closeTutorial();
          return;
        }

        const backButton = event.target.closest("#crm-tutorial-back");
        const nextButton = event.target.closest("#crm-tutorial-next");
        if (backButton) {
          shellState.tutorialStepIndex = Math.max(shellState.tutorialStepIndex - 1, 0);
          renderTutorialStep();
          return;
        }

        if (nextButton) {
          const total = getTutorialSteps().length;
          if (shellState.tutorialStepIndex >= total - 1) {
            await completeTutorial();
            return;
          }
          shellState.tutorialStepIndex += 1;
          renderTutorialStep();
        }
      });
    }
  }

  function renderHeaderBanner() {
    const headerNode = document.querySelector(".crm-page-head");
    if (!headerNode) {
      return;
    }

    headerNode.classList.add("crm-page-head--shell", "crm-topbar");
    const titleBlock = headerNode.querySelector(".crm-page-title-block") || headerNode.firstElementChild;
    const metaBlock = headerNode.querySelector(".crm-page-meta");
    const storedTitleMarkup = headerNode.dataset.pageTitleMarkup || titleBlock?.innerHTML || "";
    const storedMetaMarkup = headerNode.dataset.pageMetaMarkup || metaBlock?.innerHTML || "";
    headerNode.dataset.pageTitleMarkup = storedTitleMarkup;
    headerNode.dataset.pageMetaMarkup = storedMetaMarkup;

    const summary = shellState.profileSummary || {
      displayName: roleLabel(role),
      email: "",
      avatarUrl: "",
      initials: "--",
      progress: buildProgress(0, "XP Progress"),
      tokenCount: null,
      tokenLabel: "",
      focusSummary: shellConfig.copy,
    };

    const notificationCount = summary.notificationCount || 0;
    const messageCount = summary.messageCount || 0;
    const activePageKey = resolveActiveShellPageKey();
    const currentNavItem = resolveCurrentNavItem();
    const pageDisplayTitle = resolveShellPageTitle(activePageKey, currentNavItem?.label || "");
    headerNode.innerHTML = `
      <div class="crm-topbar__copy">
        <div class="crm-page-title-block">
          <h1 class="crm-topbar__display-title">${escapeHtml(pageDisplayTitle)}</h1>
        </div>
      </div>
      <div class="crm-topbar__utilities">
        <button class="crm-icon-button" type="button" data-shell-open="notifications" aria-label="Open notifications">
          ${iconMarkup("notifications")}
          <span class="crm-count-badge"${notificationCount ? "" : ' hidden="hidden"'}>${formatBadgeCount(notificationCount)}</span>
        </button>
        <button class="crm-icon-button" type="button" data-shell-open="messages" aria-label="Open messages">
          ${iconMarkup("messages")}
          <span class="crm-count-badge crm-count-badge--secondary"${messageCount ? "" : ' hidden="hidden"'}>${formatBadgeCount(messageCount)}</span>
        </button>
        <button class="crm-icon-button" type="button" data-shell-open="tutorial" aria-label="Open tutorial">
          ${iconMarkup("tutorial")}
        </button>
      </div>
    `;

    if (summary.email) {
      document.querySelectorAll("[data-account-email], #admin-email-display").forEach((node) => {
        node.textContent = summary.email;
      });
    }

    bindHeaderUtilityButtons();
    repositionActivePopover();
  }

  function handleHeaderUtilityAction(target, triggerButton) {
    if (target === "tutorial") {
      openTutorial(triggerButton);
      return;
    }

    openOverlay(target === "messages" ? "messages" : "notifications", triggerButton);
  }

  function bindHeaderUtilityButtons() {
    document.querySelectorAll("[data-shell-open]").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      if (button.dataset.shellButtonBound === "true") {
        return;
      }

      button.dataset.shellButtonBound = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleHeaderUtilityAction(button.getAttribute("data-shell-open") || "", button);
      });
    });
  }

  function resolveShellPageTitle(currentPageKey, fallbackLabel) {
    const titleMap = {
      home: "Dashboard",
      training: "Training",
      nutrition: "Nutrition",
      health: "Health",
      progress: "Progress",
      packages: "Packages",
      schedule: role === "client" ? "Bookings" : "Schedule",
      rewards: "Rewards",
      profile: "Profile",
      settings: "Settings",
      clients: role === "super_admin" ? "TEAM" : "Clients",
      leads: "Leads",
      financials: "Financials",
      commissions: "Commissions",
      client_xp: "Client XP",
      coach_xp: "Coach XP",
    };

    return titleMap[currentPageKey] || fallbackLabel || roleLabel(role);
  }

  function renderIdentityBanner() {
    document.getElementById("crm-identity-banner")?.remove();

    const headerNode = document.querySelector(".crm-page-head");
    if (!headerNode || pageKey !== "home") {
      return;
    }

    const summary = shellState.profileSummary || {
      displayName: roleLabel(role),
      email: "",
      avatarUrl: "",
      initials: "--",
      progress: buildProgress(0, "XP Progress"),
      tokenCount: null,
      tokenLabel: "",
      focusSummary: shellConfig.copy,
    };
    const currentNavItem = shellConfig.nav.find((item) => item.key === pageKey) || shellConfig.nav[0];
    const level = Math.max(0, Math.floor(Number(summary.progress?.current || 0) / 5000));
    const tokenMarkup = summary.tokenLabel
      ? `
        <div class="crm-identity-banner__token-row">
          <span class="crm-identity-banner__token-label">${escapeHtml(summary.tokenLabel)}</span>
          <strong class="crm-identity-banner__token-value">${escapeHtml(formatMetricCount(summary.tokenCount || 0))}</strong>
        </div>
      `
      : "";
    const identityMarkup = summary.identityLabel
      ? `<p class="crm-identity-banner__identity">${escapeHtml(summary.identityLabel)}</p>`
      : "";
    const clientVaultMarkup = role === "client"
      ? `
        <div class="crm-identity-banner__vault-grid" aria-label="Member vault summary">
          <article class="client-vault-card client-vault-card--xp" data-crm-tone="alert">
            <span class="client-vault-card__eyebrow">XP Bank</span>
            <strong class="client-vault-card__value" id="client-vault-xp-bank">0</strong>
            <p class="client-vault-card__note" id="client-vault-xp-bank-note">No approved XP activity yet.</p>
          </article>
          <article class="client-vault-card client-vault-card--coins" data-crm-tone="warning">
            <span class="client-vault-card__eyebrow">Coin Wallet</span>
            <strong class="client-vault-card__value" id="client-vault-coin-wallet">0</strong>
            <p class="client-vault-card__note" id="client-vault-coin-wallet-note">Gym coin redemptions will appear here.</p>
          </article>
          <article class="client-vault-card client-vault-card--momentum" data-crm-tone="success">
            <span class="client-vault-card__eyebrow">Weekly Momentum</span>
            <strong class="client-vault-card__value" id="client-vault-weekly-momentum">0</strong>
            <p class="client-vault-card__note" id="client-vault-weekly-momentum-note">No completed sessions or reward movement this week.</p>
          </article>
          <article class="client-vault-card client-vault-card--unlock" data-crm-tone="info">
            <span class="client-vault-card__eyebrow">Next Unlock</span>
            <strong class="client-vault-card__value" id="client-vault-next-unlock">Welcome Fuel</strong>
            <p class="client-vault-card__note" id="client-vault-next-unlock-note">Unlock milestone details will appear here.</p>
          </article>
        </div>
      `
      : tokenMarkup;
    const clientLevelMarkup = role === "client"
      ? `
        <div aria-label="Level ${level}" class="crm-level-badge" role="img">
          <span>Lv.</span>
          <strong>${level}</strong>
        </div>
      `
      : `
        <div aria-label="Level ${level}" class="crm-level-orb" role="img">
          <div class="crm-level-orb__core">
            <span>LV.${level}</span>
          </div>
        </div>
      `;
    const portraitFallbackMarkup = role !== "super_admin"
      ? `
        <div class="crm-avatar__fallback">
          <span class="crm-avatar__fallback-mark">${escapeHtml(summary.initials || "--")}</span>
          <span class="crm-avatar__fallback-note">${escapeHtml(role === "coach" ? "Portrait library available in Settings" : "Choose your portrait in Settings")}</span>
        </div>
      `
      : "";
    const avatarMarkup = summary.avatarUrl
      ? `<img alt="${escapeHtml(summary.displayName)}" class="crm-avatar__image" src="${escapeHtml(summary.avatarUrl)}" />`
      : role !== "super_admin"
        ? portraitFallbackMarkup
        : escapeHtml(summary.initials);

    if (role !== "super_admin") {
      headerNode.insertAdjacentHTML(
        "afterend",
        `
          <section class="crm-identity-banner crm-identity-banner--profile crm-card reveal in-view" id="crm-identity-banner">
            <div class="crm-identity-banner__portrait-stage">
              <div class="crm-avatar crm-avatar--portrait-large">${avatarMarkup}</div>
              ${clientLevelMarkup}
            </div>
            <div class="crm-identity-banner__body">
              <div class="crm-identity-banner__headline">
                <div class="crm-identity-banner__title-stack">
                  <h1 class="crm-title">${escapeHtml(summary.displayName)}</h1>
                  ${identityMarkup}
                </div>
              </div>
              <div class="crm-progress" aria-hidden="true">
                <span class="crm-progress__fill" style="width:${Math.max(2, Math.min(100, Number(summary.progress?.percent || 0)))}%"></span>
              </div>
              <p class="crm-identity-banner__xp-label">${escapeHtml(formatMetricCount(summary.progress?.current || 0))} / ${escapeHtml(formatMetricCount(summary.progress?.target || 0))} ${escapeHtml(summary.progress?.label || "XP Progress")}</p>
              ${clientVaultMarkup}
            </div>
          </section>
        `
      );
      document.dispatchEvent(new CustomEvent("legacy:identity-banner-rendered", { detail: { pageKey, role } }));
      return;
    }

    headerNode.insertAdjacentHTML(
      "afterend",
      `
        <section class="crm-identity-banner crm-card reveal in-view" id="crm-identity-banner">
          <div class="crm-identity-banner__avatar-stage">
            <div class="crm-avatar">${avatarMarkup}</div>
            <div aria-label="Level ${level}" class="crm-level-orb" role="img">
              <div class="crm-level-orb__core">
                <span>LV.${level}</span>
              </div>
            </div>
          </div>
          <div class="crm-identity-banner__body">
            <div class="crm-identity-banner__headline">
              <h1 class="crm-title">${escapeHtml(summary.displayName)}</h1>
              ${tokenMarkup}
            </div>
            <div class="crm-progress" aria-hidden="true">
              <span class="crm-progress__fill" style="width:${Math.max(2, Math.min(100, Number(summary.progress?.percent || 0)))}%"></span>
            </div>
            <p class="crm-identity-banner__xp-label">${escapeHtml(formatMetricCount(summary.progress?.current || 0))} / ${escapeHtml(formatMetricCount(summary.progress?.target || 0))} ${escapeHtml(summary.progress?.label || "XP Progress")}</p>
          </div>
          <div class="crm-identity-banner__meta">
            <p><strong>${escapeHtml(resolveShellPageTitle(pageKey, currentNavItem?.label || ""))}</strong></p>
            <p>${escapeHtml(summary.focusSummary || shellConfig.copy)}</p>
          </div>
        </section>
      `
    );
    document.dispatchEvent(new CustomEvent("legacy:identity-banner-rendered", { detail: { pageKey, role } }));
  }

  async function markNotificationsRead(ids) {
    const uniqueIds = Array.from(new Set((ids || []).map((id) => String(id || "").trim()).filter(Boolean)));
    if (!uniqueIds.length) {
      return;
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        return;
      }

      const response = await window.fetch("/.netlify/functions/mark-notifications-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ ids: uniqueIds }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to update notifications.");
      }

      const readIds = new Set(
        Array.isArray(payload?.readIds) ? payload.readIds.map((id) => String(id || "").trim()).filter(Boolean) : uniqueIds
      );
      if (!readIds.size) {
        return;
      }

      shellState.notifications = (shellState.notifications || []).map((notification) =>
        readIds.has(String(notification?.id || ""))
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      );

      if (shellState.profileSummary) {
        const unreadNotifications = shellState.notifications.filter((item) => !item.is_read);
        shellState.profileSummary.notificationCount = unreadNotifications.filter(
          (item) => !isMessageNotification(item)
        ).length;
        shellState.profileSummary.messageCount = unreadNotifications.filter((item) =>
          isMessageNotification(item)
        ).length;
      }

      writeShellCache(shellState.profileSummary, shellState.notifications);
      renderHeaderBanner();
    } catch (_) {
      // The drawer remains usable even if read-state persistence fails.
    }
  }

  function bindHeaderActions() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-shell-open]");
      if (!button) {
        return;
      }

      handleHeaderUtilityAction(button.getAttribute("data-shell-open") || "", button);
    });
  }

  function scheduleNonCriticalTask(callback) {
    if (typeof callback !== "function") {
      return;
    }

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => {
        callback();
      }, { timeout: 1200 });
      return;
    }

    window.setTimeout(() => {
      callback();
    }, 180);
  }

  function buildCoachThemePreviewStyle(preset) {
    const previewImage = preset?.previewImage || ACCOUNT_BACKGROUNDS[0]?.image || "./assets/legacy-gym-bg.jpeg";
    if (!preset) {
      return [
        "--coach-theme-preview-accent-rgb: 241, 89, 34",
        "--coach-theme-preview-alt-rgb: 254, 161, 42",
        "--coach-theme-preview-deep: #3a1807",
        `--coach-theme-preview-image: url('${previewImage}')`,
      ].join("; ");
    }

    return [
      `--coach-theme-preview-accent-rgb: ${preset.accentRgb}`,
      `--coach-theme-preview-alt-rgb: ${preset.altRgb}`,
      `--coach-theme-preview-deep: ${preset.deep}`,
      `--coach-theme-preview-accent: ${preset.accent}`,
      `--coach-theme-preview-alt: ${preset.alt}`,
      `--coach-theme-preview-image: url('${previewImage}')`,
    ].join("; ");
  }

  function renderCoachThemeSelector() {
    if (role !== "coach" || !coachThemeGridNode) {
      return;
    }

    const defaultCardMarkup = `
      <button
        class="appearance-theme-card"
        type="button"
        data-coach-theme-id="default"
        aria-pressed="false"
        style="${escapeHtml(buildCoachThemePreviewStyle(null))}"
      >
        <span class="appearance-theme-card__media">
          <span class="appearance-theme-card__media-preview" aria-hidden="true"></span>
          <span class="appearance-theme-card__beam appearance-theme-card__beam--one"></span>
          <span class="appearance-theme-card__beam appearance-theme-card__beam--two"></span>
          <span class="appearance-theme-card__spark appearance-theme-card__spark--one"></span>
          <span class="appearance-theme-card__spark appearance-theme-card__spark--two"></span>
          <span class="appearance-theme-card__swatch-row" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </span>
        <span class="appearance-theme-card__body">
          <strong>House Blend</strong>
          <span>The core LEGACY palette with the standard house-forge balance.</span>
        </span>
      </button>
    `;

    const presetMarkup = COACH_THEME_PRESETS.map(
      (preset) => `
        <button
          class="appearance-theme-card"
          type="button"
          data-coach-theme-id="${escapeHtml(preset.id)}"
          aria-pressed="false"
          style="${escapeHtml(buildCoachThemePreviewStyle(preset))}"
        >
          <span class="appearance-theme-card__media">
            <span class="appearance-theme-card__media-preview" aria-hidden="true"></span>
            <span class="appearance-theme-card__beam appearance-theme-card__beam--one"></span>
            <span class="appearance-theme-card__beam appearance-theme-card__beam--two"></span>
            <span class="appearance-theme-card__spark appearance-theme-card__spark--one"></span>
            <span class="appearance-theme-card__spark appearance-theme-card__spark--two"></span>
            <span class="appearance-theme-card__swatch-row" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </span>
          <span class="appearance-theme-card__body">
            <strong>${escapeHtml(preset.name)}</strong>
            <span>${escapeHtml(preset.subtitle)}</span>
          </span>
        </button>
      `
    ).join("");

    coachThemeGridNode.innerHTML = `${defaultCardMarkup}${presetMarkup}`;

    if (coachThemeGridNode.dataset.bound !== "true") {
      coachThemeGridNode.addEventListener("click", (event) => {
        const button = event.target.closest("[data-coach-theme-id]");
        if (!(button instanceof HTMLButtonElement)) {
          return;
        }

        const nextThemeId = button.getAttribute("data-coach-theme-id") || "default";
        const normalizedThemeId = nextThemeId === "default" ? "" : nextThemeId;
        if ((shellState.pendingCoachThemeId || "") === normalizedThemeId) {
          return;
        }

        applyCoachThemePreview(normalizedThemeId);
        setCoachThemeFeedback("Preview updated. Click Apply Palette to save this CRM theme.", "");
      });
      coachThemeGridNode.dataset.bound = "true";
    }

    if (coachThemeApplyButtonNode && coachThemeApplyButtonNode.dataset.bound !== "true") {
      coachThemeApplyButtonNode.addEventListener("click", async () => {
        const themeIdToSave = shellState.pendingCoachThemeId || "";
        const currentSavedThemeId = shellState.activeCoachThemeId || "";
        if (themeIdToSave === currentSavedThemeId) {
          return;
        }

        coachThemeApplyButtonNode.disabled = true;
        setCoachThemeFeedback("Saving your CRM palette...", "");

        try {
          const preferences = await saveServerPreferences({ coachPaletteId: themeIdToSave });
          commitCoachTheme(preferences?.coachPaletteId || "");
          setCoachThemeFeedback("CRM palette saved.", "success");
        } catch (error) {
          applyCoachThemePreview(shellState.activeCoachThemeId || "");
          setCoachThemeFeedback(error?.message || "Unable to save your CRM palette.", "error");
        }
      });
      coachThemeApplyButtonNode.dataset.bound = "true";
    }

    syncCoachThemeSelection();
  }

  function renderAppearanceSelector() {
    if (!appearanceGridNode) {
      return;
    }

    appearanceGridNode.innerHTML = ACCOUNT_BACKGROUNDS.map(
      (preset) => `
        <button
          class="appearance-card"
          type="button"
          data-background-id="${preset.id}"
          aria-pressed="false"
        >
          <span class="appearance-card__media" style="background-image: linear-gradient(180deg, rgba(5, 5, 5, 0.18), rgba(5, 5, 5, 0.42)), url('${preset.image}')"></span>
          <span class="appearance-card__body">
            <strong>${preset.name}</strong>
            <span>${preset.subtitle}</span>
          </span>
        </button>
      `
    ).join("");

    appearanceGridNode.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-background-id]");
      if (!button) {
        return;
      }

      const backgroundId = button.getAttribute("data-background-id") || "";
      if (!backgroundId || backgroundId === shellState.activeBackgroundId) {
        return;
      }

      applyBackground(backgroundId, true);
      setAppearanceFeedback("Saving your background preference...", "");

      try {
        await saveServerPreferences({ backgroundId });
        setAppearanceFeedback("Background preference saved.", "success");
      } catch (error) {
        setAppearanceFeedback(error?.message || "Unable to save your background preference.", "error");
      }
    });
  }

  function renderAvatarSelector() {
    if (!avatarGridNode) {
      return;
    }

    const activeCollection = getActiveAvatarCollection();
    if (!activeCollection) {
      return;
    }

    const availableCollections = getAvailableAvatarCollections();
    const currentLevel = getAvatarUnlockLevel(shellState.profileSummary);
    const visiblePresets = ensurePendingAvatarInVisibleSet();
    const availableCharacterTypes = (activeCollection.characterTypes || []).filter(
      (item) => !resolveAccountGender(shellState.profileSummary?.email || "") || item.id === resolveAccountGender(shellState.profileSummary?.email || "")
    );
    const activeCharacterType = shellState.avatarCharacterType || availableCharacterTypes[0]?.id || "";
    const showCharacterTypes = availableCharacterTypes.length > 1;

    avatarGridNode.innerHTML = `
      <div class="appearance-avatar-tabs" role="tablist" aria-label="Portrait collections">
        ${availableCollections
          .map(
            (tab) => `
              <button
                class="appearance-avatar-tab appearance-avatar-tab--card${tab.id === activeCollection.id ? " is-active" : ""}${tab.isUnlocked ? "" : " is-locked"}"
                type="button"
                role="tab"
                aria-selected="${String(tab.id === activeCollection.id)}"
                aria-disabled="${String(!tab.isUnlocked)}"
                data-avatar-collection="${tab.id}"
                data-avatar-locked="${String(!tab.isUnlocked)}"
                data-avatar-lock-level="${escapeHtml(String(tab.levelMin || 0))}"
                style="${escapeHtml(tab.previewImage ? `--avatar-tab-preview:url('${tab.previewImage}')` : "")}"
              >
                <span class="appearance-avatar-tab__media" aria-hidden="true">
                  ${tab.previewImage ? `<img alt="" src="${escapeHtml(tab.previewImage)}" loading="lazy" decoding="async" />` : ""}
                  ${tab.isUnlocked ? "" : `<span class="appearance-avatar-tab__lock-mark">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7 10V7.5A5 5 0 0 1 17 7.5V10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/>
                      <rect x="5" y="10" width="14" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/>
                    </svg>
                  </span>`}
                </span>
                <span class="appearance-avatar-tab__meta">
                  <span class="appearance-avatar-tab__eyebrow">${escapeHtml(tab.tierLabel)}</span>
                  <strong class="appearance-avatar-tab__title">${escapeHtml(tab.label)}</strong>
                  ${tab.chapterCopy ? `<span class="appearance-avatar-tab__chapter">${escapeHtml(tab.chapterCopy)}</span>` : ""}
                  <span class="appearance-avatar-tab__status">
                    ${escapeHtml(tab.levelMax >= 999 ? `Lvl ${tab.levelMin}+` : `Lvl ${tab.levelMin}-${tab.levelMax}`)}
                  </span>
                </span>
              </button>
            `
          )
          .join("")}
      </div>
      <p class="appearance-avatar-library__note">Your character path now climbs every 10 levels from 0 to 100, with each legacy archive unlocking in sequence instead of all at once.</p>
      <div class="appearance-avatar-library__panel">
        ${showCharacterTypes ? `<div class="appearance-avatar-subtabs" role="tablist" aria-label="${activeCollection.label} character types">
          ${availableCharacterTypes
            .map(
              (tab) => `
                <button
                  class="appearance-avatar-subtab${tab.id === activeCharacterType ? " is-active" : ""}"
                  type="button"
                  role="tab"
                  aria-selected="${String(tab.id === activeCharacterType)}"
                  data-avatar-character-type="${tab.id}"
                  data-character-tone="${tab.id}"
                >
                  ${tab.label}
                </button>
              `
            )
            .join("")}
        </div>` : ""}
      </div>
      <div class="appearance-avatar-grid appearance-avatar-grid--library">
        ${visiblePresets
          .map((preset) => {
            const cardThemeStyle = getAvatarPreviewThemeStyle(preset, activeCollection);
            const cardSeed = Math.abs(hashAvatarSeed(preset.id));
            return `
              <button
                class="appearance-avatar-card appearance-avatar-card--${escapeHtml(preset.collectionId)}"
                type="button"
                data-avatar-url="${preset.image}"
                data-avatar-collection="${escapeHtml(preset.collectionId)}"
                data-avatar-seed="${escapeHtml(String(cardSeed))}"
                aria-pressed="false"
                style="${escapeHtml(cardThemeStyle)}"
              >
                <span class="appearance-avatar-card__media">
                  <span class="appearance-avatar-card__ambience" aria-hidden="true">
                    <span class="appearance-avatar-card__wash"></span>
                    <span class="appearance-avatar-card__halo"></span>
                    <span class="appearance-avatar-card__grid"></span>
                    <span class="appearance-avatar-card__flare appearance-avatar-card__flare--one"></span>
                    <span class="appearance-avatar-card__flare appearance-avatar-card__flare--two"></span>
                    <span class="appearance-avatar-card__spark appearance-avatar-card__spark--one"></span>
                    <span class="appearance-avatar-card__spark appearance-avatar-card__spark--two"></span>
                  </span>
                  <img alt="${escapeHtml(preset.name)}" src="${escapeHtml(preset.image)}" loading="lazy" decoding="async" />
                </span>
                <span class="appearance-avatar-card__label">${preset.name}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    `;

    if (avatarGridNode.dataset.bound !== "true") {
      avatarGridNode.addEventListener("click", (event) => {
        const button = event.target.closest(".appearance-avatar-card[data-avatar-url]");
        if (button instanceof HTMLButtonElement) {
          const avatarUrl = button.getAttribute("data-avatar-url") || "";
          if (!avatarUrl) {
            return;
          }

          setPendingAvatar(avatarUrl);
          setAvatarFeedback("Preview updated. Click Apply Character to save this selection.", "");
          return;
        }

        const collectionButton = event.target.closest(".appearance-avatar-tab[data-avatar-collection]");
        if (collectionButton instanceof HTMLButtonElement) {
          const nextCollection = collectionButton.getAttribute("data-avatar-collection") || "";
          const isLocked = collectionButton.getAttribute("data-avatar-locked") === "true";
          const lockLevel = Number(collectionButton.getAttribute("data-avatar-lock-level") || 1) || 1;
          if (isLocked) {
            const liveLevel = getAvatarUnlockLevel(shellState.profileSummary);
            setAvatarFeedback(`This archive unlocks at Level ${lockLevel}. You are currently Level ${liveLevel}.`, "");
            return;
          }
          if (nextCollection && nextCollection !== shellState.avatarCollectionId) {
            shellState.avatarCollectionId = nextCollection;
            const collection = ACCOUNT_AVATAR_COLLECTIONS.find((item) => item.id === nextCollection);
            const hasCurrentType = collection?.characterTypes?.some((item) => item.id === shellState.avatarCharacterType);
            shellState.avatarCharacterType = hasCurrentType ? shellState.avatarCharacterType : collection?.characterTypes?.[0]?.id || "";
            renderAvatarSelector();
          }
          return;
        }

        const characterTypeButton = event.target.closest(".appearance-avatar-subtab[data-avatar-character-type]");
        if (characterTypeButton instanceof HTMLButtonElement) {
          const nextCharacterType = characterTypeButton.getAttribute("data-avatar-character-type") || "";
          if (nextCharacterType && nextCharacterType !== shellState.avatarCharacterType) {
            shellState.avatarCharacterType = nextCharacterType;
            renderAvatarSelector();
          }
          return;
        }
      });
      avatarGridNode.dataset.bound = "true";
    }

    if (avatarApplyButtonNode && avatarApplyButtonNode.dataset.bound !== "true") {
      avatarApplyButtonNode.addEventListener("click", async () => {
        const summary = shellState.profileSummary || { email: "", avatarUrl: "" };
        const currentUrl = coerceAvatarUrlToUnlockedCollection(
          resolveAvatarUrl(summary.avatarUrl || "", summary.email || ""),
          summary.email || "",
          summary
        );
        const pendingUrl = coerceAvatarUrlToUnlockedCollection(
          resolveAvatarUrl(shellState.pendingAvatarUrl || currentUrl, summary.email || ""),
          summary.email || "",
          summary
        );
        const hasAvatarChange = Boolean(pendingUrl) && pendingUrl !== currentUrl;

        if (!hasAvatarChange) {
          return;
        }

        avatarApplyButtonNode.disabled = true;
        setAvatarFeedback("Saving your character selection...", "");

        try {
          const savedAvatarUrl = await saveServerAvatar(pendingUrl);
          commitAvatar(savedAvatarUrl);
          syncAvatarSelection();
          setAvatarFeedback("Character applied.", "success");
        } catch (error) {
          shellState.pendingAvatarUrl = currentUrl;
          syncAvatarSelection();
          setAvatarFeedback(error?.message || "Unable to save your character selection.", "error");
        }
      });
      avatarApplyButtonNode.dataset.bound = "true";
    }

    syncAvatarSelection();
  }

  function bindSignOutButtons() {
    if (shellState.signOutBound) {
      return;
    }

    shellState.signOutBound = true;
    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-account-sign-out]");
      if (!button) {
        return;
      }

      button.disabled = true;
      try {
        removeSessionKey(SHELL_CACHE_KEY);
        removeSessionKey(ACTIVE_PANEL_CACHE_KEY);
        await window.legacyAuth?.signOut?.();
      } finally {
        window.location.assign("https://www.legacycoaching.com.my/");
      }
    });
  }

  function applyInitialLocalBackground() {
    const localBackgroundId = window.localStorage.getItem(localAppearanceKey) || ACCOUNT_BACKGROUNDS[0].id;
    applyBackground(localBackgroundId, false);
  }

  function applyInitialLocalCoachTheme() {
    if (role !== "coach") {
      return;
    }

    try {
      const cachedThemeId = normalizeCoachThemeId(window.localStorage.getItem(localCoachThemeKey) || "");
      if (cachedThemeId) {
        body.dataset.coachTheme = cachedThemeId;
        shellState.activeCoachThemeId = cachedThemeId;
        shellState.pendingCoachThemeId = cachedThemeId;
      } else {
        delete body.dataset.coachTheme;
        shellState.activeCoachThemeId = "";
        shellState.pendingCoachThemeId = "";
      }
    } catch (_) {
      // Ignore storage failures and let server preferences hydrate normally.
    }
  }

  async function init() {
    setYear();
    ensureOverlayContainers();
    bindHeaderActions();
    bindSignOutButtons();
    bindSecurityControls();
    bindOverlayControls();
    applyInitialLocalCoachTheme();
    applyInitialLocalBackground();
    hydrateTimeSlotSelects();
    hydrateDateInputs();
    bindCustomSelectControls();
    enhanceDashboardSelects(document);
    enhanceResponsiveTables(document);
    bindResponsiveTableObserver();
    const cachedShell = readShellCache();
    if (cachedShell?.summary) {
      shellState.profileSummary = cachedShell.summary;
      shellState.notifications = cachedShell.notifications || [];
      window.legacyAccountSummary = cachedShell.summary;
    }
    renderShellChrome();
    renderCoachThemeSelector();
    renderAppearanceSelector();
    renderAvatarSelector();
    renderSecuritySection();
    initRevealObserver();

    scheduleNonCriticalTask(async () => {
      const [preferencesResult, shellResult] = await Promise.allSettled([
        loadServerPreferences(),
        refreshShellData({
          silent: true,
          reason: "initial-load",
        }),
      ]);

      if (preferencesResult.status === "fulfilled") {
        if (appearanceFeedbackNode) {
          setAppearanceFeedback("Choose any preset to personalize your private workspace background.", "");
        }
      } else {
        const error = preferencesResult.reason;
        setAppearanceFeedback(error?.message || "Unable to load your saved background preference.", "error");
      }

      if (shellResult.status === "fulfilled") {
        renderShellChrome();
        renderAvatarSelector();
      }
    });
  }

  init();
})();
