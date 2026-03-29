(function initAccountShell() {
  const body = document.body;
  if (!body?.dataset?.liveDashboard) {
    return;
  }

  const ACCOUNT_BACKGROUNDS = [
    {
      id: "forge-floor",
      name: "Forge Floor",
      subtitle: "Default training-floor backdrop",
      image: "./assets/legacy-gym-bg.jpeg",
    },
    {
      id: "progress-wall",
      name: "Progress Wall",
      subtitle: "Clean progress-focused energy",
      image: "./assets/why-app-progress.jpg",
    },
    {
      id: "coach-client",
      name: "Coach + Client",
      subtitle: "Strong coaching partnership",
      image: "./assets/why-coach-client.jpg",
    },
    {
      id: "coach-support",
      name: "Support Line",
      subtitle: "Warm accountability atmosphere",
      image: "./assets/why-coach-support.jpg",
    },
    {
      id: "gym-floor",
      name: "Gym Floor",
      subtitle: "Full-room training backdrop",
      image: "./assets/why-gym-floor.jpg",
    },
    {
      id: "mascot-lounge",
      name: "Mascot Lounge",
      subtitle: "Lighter branded background",
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
        image: `${config.basePath}/${config.filePrefix}-${fileIndex}.png`,
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
      image: `${config.basePath}/${name}${config.fileSuffix || ""}.png`,
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
    legends: { accent: "#f2a24b", accentAlt: "#d86a2f", soft: "#ffe2b7", deep: "#5f2415" },
    titans: { accent: "#d0a66a", accentAlt: "#8f6232", soft: "#f8e6c4", deep: "#302114" },
    v3: { accent: "#d65c46", accentAlt: "#7d2930", soft: "#ffd2c8", deep: "#3a1117" },
    v4: { accent: "#62d4dd", accentAlt: "#3d7cff", soft: "#d7fbff", deep: "#143646" },
    chinese: { accent: "#38c287", accentAlt: "#d45b43", soft: "#d9ffef", deep: "#123a2e" },
    western: { accent: "#7d8fff", accentAlt: "#f1c96b", soft: "#e4e9ff", deep: "#1d275f" },
    default: { accent: "#f2a24b", accentAlt: "#d86a2f", soft: "#ffe2b7", deep: "#5f2415" },
  };

  const AVATAR_COLLECTION_UI = {
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

  function buildAvatarStats(collectionId, seed) {
    const profile = AVATAR_STAT_PROFILES[collectionId] || AVATAR_STAT_PROFILES.default;
    const buildGroup = (groupKey, seedOffset) =>
      Object.entries(profile[groupKey] || {}).map(([label, value], index) => {
        const variation = (((seed >> ((index + seedOffset) % 8)) & 7) - 3) * 2;
        return {
          label,
          value: Math.max(48, Math.min(98, value + variation)),
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

  function sanitizeCharacterName(value) {
    return String(value || "")
      .replace(/\s+/gu, " ")
      .trim()
      .slice(0, 64);
  }

  function sanitizeCharacterBackstory(value) {
    return String(value || "")
      .replace(/\r\n/gu, "\n")
      .replace(/\r/gu, "\n")
      .trim()
      .slice(0, 1400);
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

  function buildNormalizedCharacterProfile(profile) {
    const rawProfile = profile && typeof profile === "object" ? profile : {};
    return {
      name: sanitizeCharacterName(rawProfile.name),
      backstory: sanitizeCharacterBackstory(rawProfile.backstory),
    };
  }

  function syncCharacterProfileInputs() {
    if (avatarNameInputNode instanceof HTMLInputElement && avatarNameInputNode.value !== shellState.pendingCharacterName) {
      avatarNameInputNode.value = shellState.pendingCharacterName;
    }

    if (
      avatarBackstoryInputNode instanceof HTMLTextAreaElement
      && avatarBackstoryInputNode.value !== shellState.pendingCharacterBackstory
    ) {
      avatarBackstoryInputNode.value = shellState.pendingCharacterBackstory;
    }
  }

  function commitCharacterProfile(profile) {
    const nextProfile = buildNormalizedCharacterProfile(profile);
    shellState.activeCharacterName = nextProfile.name;
    shellState.pendingCharacterName = nextProfile.name;
    shellState.activeCharacterBackstory = nextProfile.backstory;
    shellState.pendingCharacterBackstory = nextProfile.backstory;

    shellState.preferences = shellState.preferences && typeof shellState.preferences === "object"
      ? shellState.preferences
      : {};
    shellState.preferences.characterProfile = nextProfile.name || nextProfile.backstory ? nextProfile : {};
    window.legacyAccountPreferences = shellState.preferences;

    syncCharacterProfileInputs();
  }

  function getPendingCharacterProfile() {
    return buildNormalizedCharacterProfile({
      name:
        avatarNameInputNode instanceof HTMLInputElement
          ? avatarNameInputNode.value
          : shellState.pendingCharacterName,
      backstory:
        avatarBackstoryInputNode instanceof HTMLTextAreaElement
          ? avatarBackstoryInputNode.value
          : shellState.pendingCharacterBackstory,
    });
  }

  function getActiveCharacterProfile() {
    return buildNormalizedCharacterProfile({
      name: shellState.activeCharacterName,
      backstory: shellState.activeCharacterBackstory,
    });
  }

  function getAvatarIdentity(previewState = getPreviewAvatarState()) {
    const activeCollection = previewState?.activeCollection || null;
    const selectedPreset = previewState?.selectedPreset || null;
    const summary = previewState?.summary || shellState.profileSummary || { displayName: roleLabel(role), progress: {} };
    const pendingProfile = getPendingCharacterProfile();
    const hasCustomNarrative = Boolean(pendingProfile.name || pendingProfile.backstory);
    const collectionId = selectedPreset?.collectionId || activeCollection?.id || "default";
    const collectionLabel = selectedPreset?.collectionLabel || activeCollection?.label || "Legacy";
    const collectionUi = AVATAR_COLLECTION_UI[collectionId] || AVATAR_COLLECTION_UI.default;
    const name = pendingProfile.name || selectedPreset?.name || summary.displayName || roleLabel(role);
    const backstory =
      pendingProfile.backstory
      || selectedPreset?.story
      || buildCustomAvatarFallbackStory(summary, name);
    const stats = hasCustomNarrative || !selectedPreset
      ? buildLiveAvatarStats(summary)
      : selectedPreset?.stats || buildLiveAvatarStats(summary);

    return {
      ...previewState,
      summary,
      name,
      backstory,
      stats,
      collectionId,
      collectionLabel,
      storyKicker: hasCustomNarrative ? `${collectionLabel} Character Record` : `${collectionLabel} Archive`,
      statsKicker: hasCustomNarrative || !selectedPreset ? "Live GPP Profile" : collectionUi.statsKicker,
      statsTitle:
        hasCustomNarrative || !selectedPreset
          ? `${name} | Live Progress Profile`
          : `${name} | ${collectionUi.statsTitle || "GPP"}`,
      statsCopy:
        hasCustomNarrative || !selectedPreset
          ? "This GPP card is generated from your real XP, level, gym coins, and live account momentum."
          : collectionUi.statsCopy || "General physical preparedness breakdown for this portrait.",
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

  const ACCOUNT_AVATAR_PRESETS = [
    ...buildIndexedAvatarCollection({
      basePath: "./assets/CRM Pictures/female_legends",
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
      basePath: "./assets/CRM Pictures/v3/female",
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
      basePath: "./assets/CRM Pictures/v4/female",
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
      basePath: "./assets/CRM Pictures/v2/chinese_female",
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
      basePath: "./assets/CRM Pictures/v2/western_female",
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
      basePath: "./assets/CRM Pictures/male_legends",
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
      basePath: "./assets/CRM Pictures/male_titans",
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
      basePath: "./assets/CRM Pictures/v3/male",
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
      basePath: "./assets/CRM Pictures/v2/chinese_male",
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
      basePath: "./assets/CRM Pictures/v2/western_male",
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

  const ACCOUNT_AVATAR_COLLECTIONS = [
    { id: "legends", label: "Emberguard", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
    { id: "titans", label: "Iron Dominion", characterTypes: [{ id: "male", label: "Male" }] },
    { id: "v3", label: "Crownfall", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
    { id: "v4", label: "Radiant Court", characterTypes: [{ id: "female", label: "Female" }] },
    { id: "chinese", label: "Jade Zodiac", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
    { id: "western", label: "Astral Houses", characterTypes: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
  ];

  const ACCOUNT_ROLE_AVATAR_DEFAULTS = {
    super_admin: "./assets/CRM Pictures/male_titans/titan-01.png",
  };

  const ACCOUNT_AVATAR_DEFAULTS = {
    "lucasraj93@gmail.com": "./assets/CRM Pictures/male_titans/titan-02.png",
    "coach.daniel.demo@legacycoaching.com.my": "./assets/CRM Pictures/male_titans/titan-03.png",
    "coach.amelia.demo@legacycoaching.com.my": "./assets/CRM Pictures/female_legends/female-02.png",
    "coach.hana.demo@legacycoaching.com.my": "./assets/CRM Pictures/female_legends/female-03.png",
    "lukelango@legacycoaching.com.my": "./assets/CRM Pictures/v4/female/female-01.png",
    "client.sarah.demo@legacycoaching.com.my": "./assets/CRM Pictures/v4/female/female-02.png",
    "client.alicia.demo@legacycoaching.com.my": "./assets/CRM Pictures/v4/female/female-03.png",
    "client.rahman.demo@legacycoaching.com.my": "./assets/CRM Pictures/v3/male/male-01.png",
    "client.jason.demo@legacycoaching.com.my": "./assets/CRM Pictures/v3/male/male-02.png",
    "client.nadia.demo@legacycoaching.com.my": "./assets/CRM Pictures/v4/female/female-04.png",
    "client.marcus.demo@legacycoaching.com.my": "./assets/CRM Pictures/v3/male/male-03.png",
    "client.priya.demo@legacycoaching.com.my": "./assets/CRM Pictures/female_legends/female-01.png",
    "client.faris.demo@legacycoaching.com.my": "./assets/CRM Pictures/v3/male/male-04.png",
  };

  const TUTORIAL_VERSION = "20260322-app-shell";
  const MESSAGE_CATEGORY_PATTERN = /message|whatsapp|email|follow|booking|session|calendar|lead/iu;
  const TIME_SLOT_START_HOUR = 6;
  const TIME_SLOT_END_HOUR = 22;
  const TIME_SLOT_INTERVAL_MINUTES = 30;
  const SHELL_REFRESH_DEBOUNCE_MS = 180;

  const ROLE_SHELLS = {
    client: {
      brand: 'LEGACY<span>+</span> Client',
      copy: "Packages, schedule, rewards, and settings in one private workspace.",
      nav: [
        { key: "home", href: "/client-dashboard.html", label: "Home" },
        { key: "planner", href: "/client-planner.html", label: "Planner" },
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
      copy: "Programming, roster, sessions, commissions, and approvals without the public-site clutter.",
      nav: [
        { key: "home", href: "/coach-dashboard.html", label: "Home" },
        { key: "clients", href: "/coach-clients.html", label: "Clients" },
        { key: "client_xp", href: "/XP%20gamification/staff.html", label: "Client XP" },
        { key: "programming", href: "/coach-programming.html", label: "Programming" },
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
          title: "Programming workspace",
          body: "Open Programming to build repeatable plans, assign them across your roster, and track adherence signals without leaving the coach workspace.",
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

  const role = body.dataset.requiredRole || "";
  const shellConfig = ROLE_SHELLS[role] || null;
  if (!shellConfig) {
    return;
  }

  const COACH_THEME_PRESETS = [
    {
      id: "ember-forge",
      legacyIds: ["luke"],
      name: "Ember Forge",
      subtitle: "Molten orange, bronze edge light, and the core LEGACY heat.",
      accentRgb: "255, 128, 0",
      accent: "#ff8000",
      altRgb: "254, 161, 42",
      alt: "#fea12a",
      deep: "#6c2d00",
    },
    {
      id: "vault-gold",
      legacyIds: ["ariff"],
      name: "Vault Gold",
      subtitle: "Championship gold with steadier contrast and a richer premium floor.",
      accentRgb: "212, 166, 74",
      accent: "#d4a64a",
      altRgb: "240, 207, 124",
      alt: "#f0cf7c",
      deep: "#5e4416",
    },
    {
      id: "sea-current",
      legacyIds: ["kylie"],
      name: "Sea Current",
      subtitle: "Clean tropical teal with an athletic tech finish.",
      accentRgb: "6, 168, 153",
      accent: "#06a899",
      altRgb: "66, 214, 203",
      alt: "#42d6cb",
      deep: "#04463f",
    },
    {
      id: "neon-orchid",
      legacyIds: ["jenita"],
      name: "Neon Orchid",
      subtitle: "Electric orchid and pink-violet glow with a fashion-led edge.",
      accentRgb: "192, 32, 160",
      accent: "#c020a0",
      altRgb: "238, 130, 238",
      alt: "#ee82ee",
      deep: "#531046",
    },
    {
      id: "solar-flare",
      legacyIds: ["shobana"],
      name: "Solar Flare",
      subtitle: "High-energy yellow with brighter gold impact lines.",
      accentRgb: "255, 255, 0",
      accent: "#ffff00",
      altRgb: "255, 213, 74",
      alt: "#ffd54a",
      deep: "#6b6200",
    },
    {
      id: "cobalt-strike",
      name: "Cobalt Strike",
      subtitle: "Electric cobalt and ice-blue edges for a sharper tactical feel.",
      accentRgb: "58, 126, 255",
      accent: "#3a7eff",
      altRgb: "138, 219, 255",
      alt: "#8adbff",
      deep: "#112d75",
    },
    {
      id: "crimson-iron",
      name: "Crimson Iron",
      subtitle: "Deep crimson, hot ember red, and a darker forged-metal frame.",
      accentRgb: "227, 70, 83",
      accent: "#e34653",
      altRgb: "255, 126, 118",
      alt: "#ff7e76",
      deep: "#5e1620",
    },
    {
      id: "jade-pulse",
      name: "Jade Pulse",
      subtitle: "Emerald-green intensity with a brighter neon athletic lift.",
      accentRgb: "44, 202, 129",
      accent: "#2cca81",
      altRgb: "132, 255, 191",
      alt: "#84ffbf",
      deep: "#0f4c34",
    },
    {
      id: "lunar-ice",
      name: "Lunar Ice",
      subtitle: "Frosted steel blue with colder white-blue highlights.",
      accentRgb: "137, 190, 255",
      accent: "#89beff",
      altRgb: "220, 242, 255",
      alt: "#dcf2ff",
      deep: "#1d3552",
    },
    {
      id: "rose-noir",
      name: "Rose Noir",
      subtitle: "Smoked rose copper with a darker noir luxury tone.",
      accentRgb: "219, 122, 148",
      accent: "#db7a94",
      altRgb: "255, 198, 184",
      alt: "#ffc6b8",
      deep: "#552130",
    },
  ];

  const COACH_THEME_LOOKUP = new Map(
    COACH_THEME_PRESETS.flatMap((preset) => [
      [preset.id, preset],
      ...(preset.legacyIds || []).map((legacyId) => [legacyId, preset]),
    ])
  );

  const pageKey = body.dataset.accountPage || inferPageKey(role, window.location.pathname);
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
  const avatarUploadInputNode = document.getElementById("account-avatar-upload");
  const avatarNameInputNode = document.getElementById("account-avatar-name");
  const avatarBackstoryInputNode = document.getElementById("account-avatar-backstory");
  const accountEmailNodes = Array.from(document.querySelectorAll("[data-account-email], #admin-email-display"));
  const localAppearanceKey = `legacy-account-appearance:${role || "default"}`;
  const tutorialStorageKey = `legacy-account-tutorial:${role}:${TUTORIAL_VERSION}`;
  const AUTH_ACCESS_CACHE_KEY = "legacy-auth-access:v1";
  const SHELL_CACHE_KEY = `legacy-account-shell-cache:v2:${role || "default"}`;
  const SHELL_CACHE_TTL_MS = 2 * 60 * 1000;
  const ACTIVE_PANEL_CACHE_KEY = `legacy-account-panel:v1:${role || "default"}:${pageKey || "default"}`;

  const shellState = {
    accessToken: "",
    activeBackgroundId: "",
    activeCoachThemeId: "",
    access: null,
    profileSummary: null,
    notifications: [],
    preferences: {},
    activeOverlay: "",
    activeOverlayAnchor: null,
    overlayExpandedByKind: {
      notifications: false,
      messages: false,
    },
    tutorialStepIndex: 0,
    tutorialForced: false,
    signOutBound: false,
    activePanelId: "",
    loadInFlight: false,
    refreshTimer: 0,
    pendingRefreshReason: "",
    pendingRefreshSilent: true,
    pendingCoachThemeId: "",
    pendingAvatarUrl: "",
    activeCharacterName: "",
    pendingCharacterName: "",
    activeCharacterBackstory: "",
    pendingCharacterBackstory: "",
    avatarStoryPage: 0,
    avatarCollectionId: "",
    avatarCharacterType: "",
    liveBindingsReady: false,
    realtimeChannel: null,
    realtimeSubscriptionKey: "",
    navPrefetchBound: false,
    prefetchedUrls: new Set(),
  };

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
    return getCoachThemePreset(themeId)?.name || "Client Default";
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
    } else {
      delete shellState.preferences.coachPaletteId;
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
        "coach-programming.html": "programming",
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
      .replace(/CRM pictures/gu, "CRM Pictures");
  }

  function getAvatarPreset(avatarUrl) {
    const normalized = normalizeAvatarPath(avatarUrl);
    return ACCOUNT_AVATAR_PRESETS.find((preset) => normalizeAvatarPath(preset.image) === normalized) || null;
  }

  function resolveAvatarUrl(avatarUrl, email) {
    const explicit = normalizeAvatarPath(avatarUrl);
    if (explicit) {
      return getAvatarPreset(explicit)?.image || explicit;
    }

    const emailDefault = ACCOUNT_AVATAR_DEFAULTS[normalizeEmail(email)] || "";
    if (emailDefault) {
      return normalizeAvatarPath(emailDefault);
    }

    return normalizeAvatarPath(ACCOUNT_ROLE_AVATAR_DEFAULTS[role] || "");
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

    commitCharacterProfile(preferences.characterProfile || {});

    if (accountEmailNodes.length && payload?.email) {
      accountEmailNodes.forEach((node) => {
        node.textContent = payload.email;
      });
    }

    return preferences;
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

  function loadFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read that image file."));
      reader.readAsDataURL(file);
    });
  }

  function loadImageElement(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to process that image."));
      image.src = src;
    });
  }

  async function prepareUploadedAvatar(file) {
    if (!(file instanceof File)) {
      throw new Error("Choose an image before uploading.");
    }

    if (!String(file.type || "").startsWith("image/")) {
      throw new Error("Use an image file for your portrait upload.");
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error("Keep the portrait image under 8 MB.");
    }

    const sourceDataUrl = await loadFileAsDataUrl(file);
    const image = await loadImageElement(sourceDataUrl);
    const fallbackWidth = 640;
    const fallbackHeight = 960;
    const sourceWidth = image.naturalWidth || image.width || fallbackWidth;
    const sourceHeight = image.naturalHeight || image.height || fallbackHeight;
    const targetRatio = 2 / 3;
    const sourceRatio = sourceWidth / sourceHeight;

    let cropWidth = sourceWidth;
    let cropHeight = sourceHeight;
    let cropX = 0;
    let cropY = 0;

    if (sourceRatio > targetRatio) {
      cropWidth = Math.round(sourceHeight * targetRatio);
      cropX = Math.max(0, Math.round((sourceWidth - cropWidth) / 2));
    } else if (sourceRatio < targetRatio) {
      cropHeight = Math.round(sourceWidth / targetRatio);
      cropY = Math.max(0, Math.round((sourceHeight - cropHeight) / 2));
    }

    const outputSizes = [
      { width: 640, height: 960 },
      { width: 560, height: 840 },
      { width: 480, height: 720 },
    ];
    const qualitySteps = [0.86, 0.76, 0.68, 0.6];
    const maxDataUrlLength = 1400000;

    for (const size of outputSizes) {
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("This browser cannot process portrait uploads.");
      }

      context.fillStyle = "#0b0f0c";
      context.fillRect(0, 0, size.width, size.height);
      context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, size.width, size.height);

      for (const quality of qualitySteps) {
        const webpUrl = canvas.toDataURL("image/webp", quality);
        if (webpUrl.startsWith("data:image/webp") && webpUrl.length <= maxDataUrlLength) {
          return webpUrl;
        }

        const jpegUrl = canvas.toDataURL("image/jpeg", quality);
        if (jpegUrl.startsWith("data:image/jpeg") && jpegUrl.length <= maxDataUrlLength) {
          return jpegUrl;
        }
      }
    }

    throw new Error("That portrait is still too heavy after compression. Try a slightly smaller image.");
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
    const fallbackAnchor = {
      right: window.innerWidth - viewportPadding,
      bottom: 70,
    };
    const resolvedAnchor = anchorRect || shellState.activeOverlayAnchor || fallbackAnchor;
    const left = Math.max(
      viewportPadding,
      Math.min(
        (resolvedAnchor.right || fallbackAnchor.right) - panelWidth,
        window.innerWidth - panelWidth - viewportPadding
      )
    );
    const top = Math.max(
      viewportPadding,
      Math.min(
        (resolvedAnchor.bottom || fallbackAnchor.bottom) + 10,
        window.innerHeight - viewportPadding - 180
      )
    );

    panelNode.style.width = `${panelWidth}px`;
    panelNode.style.left = `${left}px`;
    panelNode.style.top = `${top}px`;
  }

  function repositionActivePopover() {
    if (shellState.activeOverlay === "notifications" || shellState.activeOverlay === "messages") {
      const panelNode = document.querySelector("#crm-shell-overlay .crm-drawer");
      positionFloatingPanel(panelNode, shellState.activeOverlayAnchor, 420);
      return;
    }

    if (shellState.activeOverlay === "tutorial") {
      const tutorialNode = document.querySelector("#crm-tutorial-overlay .crm-tutorial");
      positionFloatingPanel(tutorialNode, shellState.activeOverlayAnchor, 480);
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
          .select("preferred_name, xp_points, gym_coins, member_id")
          .eq("id", userId)
          .maybeSingle(),
      ];
    } else if (role === "coach") {
      rolePromises = [
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
      displayName = clientProfile?.preferred_name || displayName;
      progress = buildProgress(Number(clientProfile?.xp_points || 0), "XP Progress");
      tokenCount = Number(clientProfile?.gym_coins || 0);
      tokenLabel = "Gym Coins";
      focusSummary = `${formatMetricCount(clientProfile?.xp_points || 0)} XP earned and ready to convert into visible progress.`;
      identityLabel = clientProfile?.member_id ? `MEMBER ID ${clientProfile.member_id}` : "MEMBER ID PENDING";
    } else if (role === "coach") {
      const activeAssignments = Number(extraResponses[0]?.count || 0);
      const completedSessions = Number(extraResponses[1]?.count || 0);
      progress = buildProgress(activeAssignments * 380 + completedSessions * 140, "Coach XP");
      tokenCount = activeAssignments;
      tokenLabel = "Active Clients";
      focusSummary = `${formatMetricCount(completedSessions)} completed sessions are already feeding your coach progression.`;
      identityLabel = `COACH ID ${formatCoachPublicId(userId)}`;
    } else if (role === "super_admin") {
      const coachCount = Number(extraResponses[0]?.count || 0);
      const convertedLeads = Number(extraResponses[1]?.count || 0);
      const paidOrders = Number(extraResponses[2]?.count || 0);
      progress = buildProgress(coachCount * 220 + convertedLeads * 240 + paidOrders * 140, "Admin XP");
      tokenCount = paidOrders;
      tokenLabel = "Paid Orders";
      focusSummary = `${formatMetricCount(coachCount)} coaches and ${formatMetricCount(convertedLeads)} converted leads are live in this workspace.`;
    }

    const unreadNotifications = notifications.filter((item) => !item.is_read);
    const summary = {
      id: userId,
      role,
      displayName,
      email: access.user.email || "",
      avatarUrl: resolveAvatarUrl(profile.avatar_url, access.user.email || ""),
      initials: getInitials(displayName),
      progress,
      tokenCount,
      tokenLabel,
      focusSummary,
      identityLabel,
      notificationCount: unreadNotifications.filter((item) => !isMessageNotification(item)).length,
      messageCount: unreadNotifications.filter((item) => isMessageNotification(item)).length,
    };

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

    const brandMarkup = `
      <div class="crm-sidebar__brand">
        <a class="crm-brand" href="${shellConfig.nav[0].href}">${shellConfig.brand}</a>
        <p class="crm-copy crm-sidebar-copy">${shellConfig.copy}</p>
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
              `<a class="crm-nav-link${item.key === pageKey ? " is-active is-current" : ""}" href="${item.href}">${item.label}</a>`
          )
          .join("")}
      </nav>
      <div class="crm-sidebar-footer">
        <a class="btn btn-ghost" href="https://www.legacycoaching.com.my/">Back to Website</a>
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
    const currentAvatarUrl = resolveAvatarUrl(summary.avatarUrl, summary.email || "");
    const activeCollection = getActiveAvatarCollection();
    const visiblePresets = getVisibleAvatarPresets(activeCollection);
    const fallbackPreset = visiblePresets[0] || null;
    const selectedAvatarUrl =
      resolveAvatarUrl(shellState.pendingAvatarUrl || currentAvatarUrl, summary.email || "")
      || fallbackPreset?.image
      || "";
    const selectedPreset = getAvatarPreset(selectedAvatarUrl);
    const isCustomSelected = Boolean(selectedAvatarUrl) && !selectedPreset;

    return {
      summary,
      currentAvatarUrl,
      selectedAvatarUrl,
      activeCollection,
      visiblePresets,
      fallbackPreset,
      selectedPreset,
      isCustomSelected,
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
      isCustomSelected,
    } = previewState;
    const avatarIdentity = getAvatarIdentity(previewState);
    const currentPreset = getAvatarPreset(currentAvatarUrl);
    const previewPreset = selectedPreset || fallbackPreset || currentPreset || null;
    const hasPrev = visiblePresets.length > 1;
    const hasNext = visiblePresets.length > 1;
    const previewThemeStyle = getAvatarPreviewThemeStyle(previewPreset, activeCollection);
    const previewThemeId = previewPreset?.collectionId || activeCollection?.id || "default";
    const previewSeed = previewPreset?.id ? Math.abs(hashAvatarSeed(previewPreset.id)) : 0;
    const activeCharacterProfile = getActiveCharacterProfile();
    const pendingCharacterProfile = getPendingCharacterProfile();
    const savedPortraitLabel = currentAvatarUrl
      ? activeCharacterProfile.name || currentPreset?.name || "Custom character"
      : "Initials only";
    const selectedPortraitLabel = avatarIdentity.name || (isCustomSelected ? "Custom character" : previewPreset?.name || "Portrait");
    const hasAvatarChange = Boolean(selectedAvatarUrl) && selectedAvatarUrl !== currentAvatarUrl;
    const hasProfileChange =
      pendingCharacterProfile.name !== activeCharacterProfile.name
      || pendingCharacterProfile.backstory !== activeCharacterProfile.backstory;

    syncCharacterProfileInputs();

    if (avatarCurrentNode) {
      avatarCurrentNode.textContent = `Saved character: ${savedPortraitLabel}`;
    }

    if (avatarPreviewNode) {
      avatarPreviewNode.innerHTML = currentAvatarUrl
        ? `<img alt="${escapeHtml(activeCharacterProfile.name || summary.displayName)}" class="crm-avatar__image" src="${escapeHtml(currentAvatarUrl)}" />`
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
      const hasPendingChange = hasAvatarChange || hasProfileChange;
      avatarApplyButtonNode.disabled = !hasPendingChange;
      avatarApplyButtonNode.textContent = hasPendingChange ? `Apply ${selectedPortraitLabel}` : "Character Applied";
    }

  }

  function setPendingAvatar(avatarUrl) {
    shellState.pendingAvatarUrl = resolveAvatarUrl(avatarUrl, shellState.profileSummary?.email || "");
    const preset = getAvatarPreset(shellState.pendingAvatarUrl);
    if (preset) {
      shellState.avatarCollectionId = preset.collectionId || shellState.avatarCollectionId;
      shellState.avatarCharacterType = preset.category || shellState.avatarCharacterType;
    }
    syncAvatarSelection();
  }

  function commitAvatar(avatarUrl) {
    const resolvedAvatarUrl = resolveAvatarUrl(avatarUrl, shellState.profileSummary?.email || "");
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
    const selectedAvatarUrl = resolveAvatarUrl(
      shellState.pendingAvatarUrl || shellState.profileSummary?.avatarUrl || "",
      shellState.profileSummary?.email || ""
    );
    const selectedPreset = getAvatarPreset(selectedAvatarUrl);

    if (!shellState.avatarCollectionId) {
      shellState.avatarCollectionId = selectedPreset?.collectionId || ACCOUNT_AVATAR_COLLECTIONS[0]?.id || "core";
    }

    let collection =
      ACCOUNT_AVATAR_COLLECTIONS.find((item) => item.id === shellState.avatarCollectionId) || ACCOUNT_AVATAR_COLLECTIONS[0];
    if (!collection) {
      return null;
    }

    const availableTypes = collection.characterTypes || [];
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

    collection =
      ACCOUNT_AVATAR_COLLECTIONS.find((item) => item.id === shellState.avatarCollectionId) || collection;
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

    const currentPendingUrl = resolveAvatarUrl(
      shellState.pendingAvatarUrl || shellState.profileSummary?.avatarUrl || "",
      shellState.profileSummary?.email || ""
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
          <span>${expanded ? `Showing all ${items.length}` : `Showing ${visibleItems.length} of ${items.length}`}</span>
          <strong>${items.filter((item) => !item.is_read).length} unread</strong>
        </div>
        ${visibleItems
          .map((item) => {
            const targetUrl = resolveNotificationTarget(item);
            const itemTag = targetUrl ? "a" : "article";
            const itemLabel = item.title || (isMessageView ? "message" : "notification");
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
                  <span class="chip chip--accent">${escapeHtml(item.category || "system")}</span>
                  <span>${escapeHtml(formatOverlayTimestamp(item.created_at))}</span>
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.body)}</p>
                <div class="crm-feed-item__footer">
                  <span class="crm-feed-item__state">${item.is_read ? "History" : "New"}</span>
                  <span class="crm-feed-item__cta">${targetUrl ? "Open task" : "Saved in history"}</span>
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
      : `<article class="crm-feed-item crm-feed-item--empty"><h3>No items waiting</h3><p>${
          isMessageView
            ? "Messages will appear here when a client, coach, or admin workflow creates a communication alert."
            : "Notifications will appear here when there are new approvals, leads, or payment-related updates."
        }</p></article>`;

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

  function renderTutorialStep() {
    const tutorial = document.getElementById("crm-tutorial-overlay");
    const steps = shellConfig.tutorial || [];
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
    navNode.innerHTML = shellConfig.nav
      .map(
        (item) => `
          <li class="${item.key === pageKey ? "is-current" : ""}">
            <span>${escapeHtml(item.label)}</span>
          </li>
        `
      )
      .join("");

    backButton.disabled = shellState.tutorialStepIndex === 0;
    nextButton.textContent = shellState.tutorialStepIndex === steps.length - 1 ? "Finish tutorial" : "Next";
    if (closeButton) {
      closeButton.hidden = false;
    }

    const tutorialPanel = tutorial.querySelector(".crm-tutorial");
    positionFloatingPanel(tutorialPanel, shellState.activeOverlayAnchor, 480);
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
          const total = (shellConfig.tutorial || []).length;
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
    const currentNavItem = shellConfig.nav.find((item) => item.key === pageKey) || shellConfig.nav[0];
    const pageDisplayTitle = resolveShellPageTitle(pageKey, currentNavItem?.label || "");
    headerNode.innerHTML = `
      <div class="crm-topbar__copy">
        <div class="crm-page-title-block">
          <h1 class="crm-topbar__display-title">${escapeHtml(pageDisplayTitle)}</h1>
        </div>
      </div>
      <div class="crm-topbar__utilities">
        <div class="crm-viewer" aria-label="Current workspace account">
          <strong>${escapeHtml(summary.displayName)}</strong>
          <span>${escapeHtml(summary.email || roleLabel(role))}</span>
        </div>
        <button class="crm-topbar__logout" type="button" data-account-sign-out aria-label="Log out">
          Log out
        </button>
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
    const avatarMarkup = summary.avatarUrl
      ? `<img alt="${escapeHtml(summary.displayName)}" class="crm-avatar__image" src="${escapeHtml(summary.avatarUrl)}" />`
      : escapeHtml(summary.initials);

    if (role !== "super_admin") {
      headerNode.insertAdjacentHTML(
        "afterend",
        `
          <section class="crm-identity-banner crm-identity-banner--profile crm-card reveal in-view" id="crm-identity-banner">
            <div class="crm-identity-banner__portrait-stage">
              <div class="crm-avatar crm-avatar--portrait-large">${avatarMarkup}</div>
              <div aria-label="Level ${level}" class="crm-level-orb" role="img">
                <div class="crm-level-orb__core">
                  <span>LV.${level}</span>
                </div>
              </div>
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
    if (!preset) {
      return "--coach-theme-preview-accent-rgb: 241, 89, 34; --coach-theme-preview-alt-rgb: 254, 161, 42; --coach-theme-preview-deep: #3a1807;";
    }

    return [
      `--coach-theme-preview-accent-rgb: ${preset.accentRgb}`,
      `--coach-theme-preview-alt-rgb: ${preset.altRgb}`,
      `--coach-theme-preview-deep: ${preset.deep}`,
      `--coach-theme-preview-accent: ${preset.accent}`,
      `--coach-theme-preview-alt: ${preset.alt}`,
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
          <strong>Client Default</strong>
          <span>Matches the standard client CRM palette until a coach chooses a custom theme.</span>
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

    const visiblePresets = ensurePendingAvatarInVisibleSet();
    const activeCharacterType = shellState.avatarCharacterType || activeCollection.characterTypes?.[0]?.id || "";

    avatarGridNode.innerHTML = `
      <div class="appearance-avatar-tabs" role="tablist" aria-label="Portrait collections">
        ${ACCOUNT_AVATAR_COLLECTIONS
          .map(
            (tab) => `
              <button
                class="appearance-avatar-tab${tab.id === activeCollection.id ? " is-active" : ""}"
                type="button"
                role="tab"
                aria-selected="${String(tab.id === activeCollection.id)}"
                data-avatar-collection="${tab.id}"
              >
                ${tab.label}
              </button>
            `
          )
          .join("")}
      </div>
      <div class="appearance-avatar-library__panel">
        <div class="appearance-avatar-subtabs" role="tablist" aria-label="${activeCollection.label} character types">
          ${activeCollection.characterTypes
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
        </div>
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
                  <img alt="${escapeHtml(preset.name)}" src="${escapeHtml(preset.image)}" />
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
        const currentUrl = resolveAvatarUrl(summary.avatarUrl || "", summary.email || "");
        const pendingUrl = resolveAvatarUrl(shellState.pendingAvatarUrl || currentUrl, summary.email || "");
        const activeCharacterProfile = getActiveCharacterProfile();
        const pendingCharacterProfile = getPendingCharacterProfile();
        const hasAvatarChange = Boolean(pendingUrl) && pendingUrl !== currentUrl;
        const hasProfileChange =
          pendingCharacterProfile.name !== activeCharacterProfile.name
          || pendingCharacterProfile.backstory !== activeCharacterProfile.backstory;

        if (!hasAvatarChange && !hasProfileChange) {
          return;
        }

        avatarApplyButtonNode.disabled = true;
        setAvatarFeedback("Saving your character settings...", "");

        try {
          if (hasAvatarChange) {
            const savedAvatarUrl = await saveServerAvatar(pendingUrl);
            commitAvatar(savedAvatarUrl);
          }

          if (hasProfileChange) {
            const savedPreferences = await saveServerPreferences({
              characterProfile: pendingCharacterProfile,
            });
            commitCharacterProfile(savedPreferences?.characterProfile || {});
          } else {
            syncCharacterProfileInputs();
          }

          syncAvatarSelection();
          setAvatarFeedback("Character settings saved.", "success");
        } catch (error) {
          if (hasAvatarChange) {
            shellState.pendingAvatarUrl = currentUrl;
          }
          if (hasProfileChange) {
            shellState.pendingCharacterName = activeCharacterProfile.name;
            shellState.pendingCharacterBackstory = activeCharacterProfile.backstory;
          }
          syncCharacterProfileInputs();
          syncAvatarSelection();
          setAvatarFeedback(error?.message || "Unable to save your character settings.", "error");
        }
      });
      avatarApplyButtonNode.dataset.bound = "true";
    }

    if (avatarNameInputNode instanceof HTMLInputElement && avatarNameInputNode.dataset.bound !== "true") {
      avatarNameInputNode.addEventListener("input", () => {
        shellState.pendingCharacterName = avatarNameInputNode.value.slice(0, 64);
        syncAvatarSelection();
      });
      avatarNameInputNode.dataset.bound = "true";
    }

    if (avatarBackstoryInputNode instanceof HTMLTextAreaElement && avatarBackstoryInputNode.dataset.bound !== "true") {
      avatarBackstoryInputNode.addEventListener("input", () => {
        shellState.pendingCharacterBackstory = avatarBackstoryInputNode.value.slice(0, 1400);
        syncAvatarSelection();
      });
      avatarBackstoryInputNode.dataset.bound = "true";
    }

    if (avatarUploadInputNode instanceof HTMLInputElement && avatarUploadInputNode.dataset.bound !== "true") {
      avatarUploadInputNode.addEventListener("change", async () => {
        const file = avatarUploadInputNode.files?.[0] || null;
        if (!file) {
          return;
        }

        avatarUploadInputNode.disabled = true;
        setAvatarFeedback("Preparing your uploaded portrait...", "");

        try {
          const uploadedAvatarUrl = await prepareUploadedAvatar(file);
          setPendingAvatar(uploadedAvatarUrl);
          setAvatarFeedback("Custom portrait ready. Click Apply Character to save it to your account.", "success");
        } catch (error) {
          setAvatarFeedback(error?.message || "Unable to prepare that portrait upload.", "error");
        } finally {
          avatarUploadInputNode.value = "";
          avatarUploadInputNode.disabled = false;
        }
      });
      avatarUploadInputNode.dataset.bound = "true";
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

  async function init() {
    setYear();
    ensureOverlayContainers();
    bindHeaderActions();
    bindSignOutButtons();
    bindOverlayControls();
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
