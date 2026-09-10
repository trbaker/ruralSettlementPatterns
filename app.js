(function () {
const svgNS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(svgNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const HOUSE_PATH = "M-7,3 L-7,-4 L0,-10 L7,-4 L7,3 Z";
  const houseGlyph = (parent, x, y, cls) => {
    const g = el("g", { class: cls || "house", transform: `translate(${x},${y})` }, parent);
    el("path", { d: HOUSE_PATH, fill: "var(--house)", stroke: "var(--roof)", "stroke-width": 1.6, "stroke-linejoin": "round" }, g);
    el("path", { d: "M-7,-4 L0,-10 L7,-4", fill: "var(--roof)" }, g);
    return g;
  };

  
  /* ---------- MAP HELPERS ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flyTo = (mapEl, lon, lat, zoom) => {
    if (mapEl.view && mapEl.view.ready) {
      mapEl.view.goTo({ center: [lon, lat], zoom }, { duration: reduceMotion ? 0 : 1400, easing: "in-out-cubic" }).catch(() => {});
    } else {
      mapEl.center = [lon, lat];
      mapEl.zoom = zoom;
    }
  };
  const agolLink = (lon, lat, zoom) =>
    `https://www.arcgis.com/apps/mapviewer/index.html?center=${lon},${lat}&level=${zoom}&basemapUrl=${encodeURIComponent("https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer")}`;

  /* ---------- REAL PLACES ----------
     Edit or add examples here: [name, longitude, latitude, zoom, note].
     Zoom 12–13 shows the regional pattern; 15–16 shows a single village. */
  const PLACES = {
    clustered: [
      ["Castle Combe, England", -2.2286, 51.4935, 15, "A nucleated Cotswold village: the houses press together along the valley, and the fields begin only where the last house ends."],
      ["Woodstock, Vermont", -72.5188, 43.6245, 15, "A New England town built around a green and a church. Puritan settlers were required to live in the village and walk out to their fields."],
      ["Rundling villages, Wendland, Germany", 11.067, 52.983, 14, "Pan around: Lübeln, Satemin, and Küsten are round villages with a single entrance and farmhouses facing an inner green. A clustered sub-form called a Rundling."],
      ["Hongcun, Anhui, China", 117.988, 29.905, 15, "A tightly packed village of several hundred houses surrounded by rice paddies. Clustered settlement is the norm across rural East and South Asia."]
    ],
    dispersed: [
      ["Story County, Iowa", -93.40, 42.05, 13, "One farmstead per square. The roads run exactly one mile apart on township-and-range section lines."],
      ["Perkins County, Nebraska", -101.60, 40.90, 12, "Center-pivot irrigation circles, each on a farm large enough to hold one. Houses are miles apart."],
      ["Champaign County, Illinois", -88.40, 40.20, 13, "Corn Belt grid: isolated farm buildings in a sea of square fields, with small towns only where the railroad stopped."],
      ["South of Regina, Saskatchewan", -104.30, 50.30, 12, "The Dominion Land Survey copied the U.S. grid across the Prairies. Same pattern, different country."]
    ],
    linear: [
      ["Île d'Orléans, Québec", -70.98, 46.90, 13, "French long lots: every strip runs from the river back toward the island's spine, and the houses sit in a line along the shore road."],
      ["Mississippi River near Donaldsonville, Louisiana", -90.97, 30.10, 13, "Long lots fan out from the river bends. Houses cluster on the natural levee along the river road."],
      ["Bayou Lafourche near Thibodaux, Louisiana", -90.80, 29.78, 13, "Called the longest street in the world: houses line both banks of the bayou for a hundred miles."],
      ["St. Lawrence lowland near Nicolet, Québec", -72.55, 46.25, 12, "Zoom out and the rangs (rows) of long lots stack up in parallel bands away from the river."]
    ]
  };
  const CARD_TEXT = {
    clustered: {
      name: "Clustered settlement", aka: "also called nucleated",
      what: "Homes, barns, and a church are packed together in a village. The farmland lies outside it, so farmers walk out to their fields each day.",
      why: ["Safety in numbers — easier to defend", "Shared resources: one well, one mill, common pasture", "Communal land systems (feudal open fields) required cooperation", "Farmland is scarce, so houses don't take it up"],
      where: "Medieval Europe, New England colonial villages, much of rural South and East Asia, Spanish colonial towns built around a plaza."
    },
    dispersed: {
      name: "Dispersed settlement", aka: "isolated farmsteads",
      what: "Each family lives on its own farm, with fields all around the house. Neighbors are a field or a mile away. There is no village — just a crossroads store or grain elevator now and then.",
      why: ["Land is abundant and cheap", "Private ownership: you build on your own plot", "Large mechanized farms need space, not neighbors", "Enclosure in Britain broke up village open fields", "Township and range surveys sold land in square blocks"],
      where: "U.S. Midwest and Great Plains, Canadian Prairies, Australia, rural Britain after the 1700s."
    },
    linear: {
      name: "Linear settlement", aka: "ribbon or long-lot settlement",
      what: "Houses line up along a river, road, canal, or coast, and each farm is a narrow strip running back from that line.",
      why: ["Everyone wants access to the water or road", "Narrow strips let the most families touch the river", "French long-lot survey deliberately created these strips", "Later roads attract new houses along their edges"],
      where: "Québec along the St. Lawrence, Louisiana bayous, the Rio Grande in Texas, road villages (Strassendorf) in Germany and Eastern Europe."
    }
  };

  const exploreMap = document.getElementById("explore-map");
  const chips = document.getElementById("place-chips");
  const placeNote = document.getElementById("place-note");
  const patternCard = document.getElementById("pattern-card");
  let currentPattern = "clustered";

  const showPlace = (pattern, idx) => {
    const [name, lon, lat, zoom, note] = PLACES[pattern][idx];
    chips.querySelectorAll(".chip").forEach((c, i) => c.setAttribute("aria-pressed", i === idx ? "true" : "false"));
    flyTo(exploreMap, lon, lat, zoom);
    placeNote.innerHTML = `<strong>${name}.</strong> ${note} <a class="agol" href="${agolLink(lon, lat, zoom)}" target="_blank" rel="noopener">Open in ArcGIS Online</a>`;
  };
  const setPattern = (pattern) => {
    currentPattern = pattern;
    patternCard.dataset.pattern = pattern;
    document.getElementById("explore").dataset.pattern = pattern;
    document.querySelectorAll(".tab[data-pattern]").forEach(t => t.setAttribute("aria-selected", t.dataset.pattern === pattern ? "true" : "false"));
    chips.innerHTML = "";
    PLACES[pattern].forEach(([name], i) => {
      const b = document.createElement("button");
      b.className = "chip"; b.textContent = name; b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => showPlace(pattern, i));
      chips.appendChild(b);
    });
    const c = CARD_TEXT[pattern];
    patternCard.innerHTML = `
      <h3>${c.name}</h3>
      <div class="aka">${c.aka}</div>
      <dl>
        <dt>What it looks like</dt><dd>${c.what}</dd>
        <dt>Why it forms</dt><dd><ul>${c.why.map(w => `<li>${w}</li>`).join("")}</ul></dd>
        <dt>Where you see it</dt><dd>${c.where}</dd>
        <dt>What to look for on the map</dt><dd id="look-for"></dd>
      </dl>`;
    document.getElementById("look-for").textContent = {
      clustered: "A dense knot of roofs with a sharp edge where fields begin. Roads converge on it like spokes.",
      dispersed: "Small clumps of buildings (house, barn, silo, shelter trees) spaced evenly, often one per square mile.",
      linear: "A single row of roofs hugging a river or road, with long thin fields striped behind it."
    }[pattern];
    showPlace(pattern, 0);
  };
  document.querySelectorAll(".tab[data-pattern]").forEach(t => t.addEventListener("click", () => setPattern(t.dataset.pattern)));
  setPattern("clustered");

/* ---------- EXPLORE: the simulator ---------- */
  const riverY = x => 285 + 18 * Math.sin(x / 130);
  const riverPath = (fn) => {
    let d = "";
    for (let x = -10; x <= 810; x += 10) d += (x === -10 ? "M" : "L") + x + "," + fn(x).toFixed(1) + " ";
    return d;
  };
  document.getElementById("river").setAttribute("d", riverPath(riverY));

  const HOUSES = {
    clustered: [[380,170],[418,170],[356,192],[396,192],[436,192],[372,214],[412,214],[452,214],[386,236],[428,236],[340,216],[470,236],[398,148],[440,148]],
    dispersed: [[70,80],[250,70],[440,90],[660,70],[150,180],[350,170],[560,200],[740,180],[90,300],[270,340],[460,320],[650,330],[760,300],[570,110]],
    linear: [55,110,165,220,275,330,385,440,495,550,605,660,715,770].map(x => [x, riverY(x) - 24])
  };

  // Clustered layer: open fields around a village, roads converging on it, a commons
  (function buildClustered() {
    const g = document.getElementById("layer-clustered");
    el("polygon", { points: "0,40 300,40 300,250 0,250", fill: "url(#stripes)" }, g);
    el("polygon", { points: "500,40 800,40 800,250 500,250", fill: "url(#stripes)" }, g);
    el("polygon", { points: "300,0 500,0 500,110 300,110", fill: "url(#stripes-h)" }, g);
    el("ellipse", { cx: 400, cy: 262, rx: 130, ry: 28, fill: "var(--pasture)" }, g);
    el("path", { d: "M0,140 L400,192 L800,140", fill: "none", stroke: "var(--road)", "stroke-width": 6 }, g);
    el("path", { d: "M400,192 L400,300", fill: "none", stroke: "var(--road)", "stroke-width": 6 }, g);
    // church at the centre
    el("rect", { x: 396, y: 186, width: 12, height: 12, fill: "var(--house)", stroke: "var(--roof)", "stroke-width": 1.6 }, g);
    el("path", { d: "M402,186 L402,176 M398,180 L406,180", stroke: "var(--roof)", "stroke-width": 1.8 }, g);
  })();

  // Dispersed layer: township-and-range grid of section roads, each section a patchwork of fields
  (function buildDispersed() {
    const g = document.getElementById("layer-dispersed");
    const shades = ["var(--field-a)", "var(--field-b)", "var(--field-c)"];
    let s = 0;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
      const x = c * 100, y = r * 100;
      el("rect", { x, y, width: 100, height: 100, fill: shades[s++ % 3] }, g);
      const half = (c + r) % 2 === 0;
      el("rect", half ? { x: x + 50, y, width: 50, height: 100 } : { x, y: y + 50, width: 100, height: 50 }, g)
        .setAttribute("fill", shades[(s + 1) % 3]);
    }
    for (let i = 0; i <= 8; i++) el("line", { x1: i * 100, y1: 0, x2: i * 100, y2: 400, stroke: "var(--road)", "stroke-width": 3 }, g);
    for (let i = 0; i <= 4; i++) el("line", { x1: 0, y1: i * 100, x2: 800, y2: i * 100, stroke: "var(--road)", "stroke-width": 3 }, g);
  })();

  // Linear layer: long lots perpendicular to the river, a road along the bank
  (function buildLinear() {
    const g = document.getElementById("layer-linear");
    const w = 55;
    for (let i = 0; i < 15; i++) {
      const x0 = i * w - 15, x1 = x0 + w;
      const fill = i % 2 ? "var(--field-a)" : "var(--field-b)";
      el("polygon", { points: `${x0},0 ${x1},0 ${x1},${riverY(x1)} ${x0},${riverY(x0)}`, fill, stroke: "var(--field-c)", "stroke-width": 1.5 }, g);
      el("polygon", { points: `${x0},${riverY(x0)} ${x1},${riverY(x1)} ${x1},400 ${x0},400`, fill: i % 2 ? "var(--field-c)" : "var(--field-a)", stroke: "var(--field-b)", "stroke-width": 1.5 }, g);
    }
    el("path", { d: riverPath(x => riverY(x) - 44), fill: "none", stroke: "var(--road)", "stroke-width": 5 }, g);
  })();

  // Trees, static
  (function trees() {
    const g = document.getElementById("trees");
    const spots = [[30,370],[52,380],[770,40],[790,60],[120,20],[700,380],[725,372],[15,15]];
    spots.forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 9, fill: "var(--tree)", opacity: 0.85 }, g));
  })();

  const housesG = document.getElementById("houses");
  const houseNodes = HOUSES.clustered.map(([x, y]) => houseGlyph(housesG, x, y));

  const setMode = (mode) => {
    document.querySelectorAll("[data-mode]").forEach(t => t.setAttribute("aria-selected", t.dataset.mode === mode ? "true" : "false"));
    ["clustered", "dispersed", "linear"].forEach(m => document.getElementById("layer-" + m).classList.toggle("on", m === mode));
    HOUSES[mode].forEach(([x, y], i) => houseNodes[i].setAttribute("transform", `translate(${x},${y})`));
  };
  document.querySelectorAll("[data-mode]").forEach(t => t.addEventListener("click", () => setMode(t.dataset.mode)));
  setMode("clustered");

  
  /* ---------- SURVEY MAP ---------- */
  const SURVEY_PLACES = {
    metes: [-83.05, 39.36, 11, "Chillicothe, Ohio. West of the Scioto River is the Virginia Military District, surveyed by metes and bounds: roads wander and parcels are irregular. East of the river the federal township grid begins. Zoom out to see the seam."],
    township: [-93.40, 42.05, 12, "Story County, Iowa. Roads on every section line, one mile apart; each square is 640 acres. Count the farmsteads per square."],
    longlot: [-70.98, 46.90, 13, "Île d'Orléans, Québec. Strips run perpendicular to the St. Lawrence so that every farm reaches the water."]
  };
  const surveyMap = document.getElementById("survey-map");
  const surveyNote = document.getElementById("survey-note");
  window.__onSurveyChange = (key) => {
    const [lon, lat, zoom, note] = SURVEY_PLACES[key];
    flyTo(surveyMap, lon, lat, zoom);
    surveyNote.innerHTML = `${note} <a class="agol" href="${agolLink(lon, lat, zoom)}" target="_blank" rel="noopener">Open in ArcGIS Online</a>`;
  };

/* ---------- SURVEY SYSTEMS ---------- */
  const label = (parent, x, y, text, size, anchor) =>
    el("text", { x, y, "font-size": size || 13, "text-anchor": anchor || "middle", fill: "var(--ink)",
      "font-family": "Bricolage Grotesque, Helvetica Neue, Arial, sans-serif", "font-weight": 500 }, parent).textContent = text;

  // Metes and bounds: irregular parcels tied to a creek, an oak, a boulder
  (function buildMetes() {
    const g = document.getElementById("survey-metes");
    const parcels = [
      ["0,0 260,0 230,140 120,200 0,150", "var(--field-b)"],
      ["260,0 520,0 470,120 330,160 230,140", "var(--field-a)"],
      ["520,0 800,0 800,170 600,190 470,120", "var(--field-c)"],
      ["0,150 120,200 230,140 330,160 300,300 150,400 0,400", "var(--field-a)"],
      ["330,160 470,120 600,190 640,330 500,400 300,300", "var(--field-b)"],
      ["640,330 600,190 800,170 800,400 500,400", "var(--field-a)"]
    ];
    parcels.forEach(([pts, fill]) => el("polygon", { points: pts, fill, stroke: "var(--ink)", "stroke-width": 1.8, "stroke-linejoin": "round" }, g));
    el("path", { d: "M120,200 C170,190 190,160 230,140 C270,125 300,150 330,160 C370,175 420,150 470,120", fill: "none", stroke: "var(--river)", "stroke-width": 7, "stroke-linecap": "round" }, g);
    el("circle", { cx: 230, cy: 140, r: 10, fill: "var(--tree)" }, g);
    el("circle", { cx: 600, cy: 190, r: 7, fill: "var(--ink-soft)" }, g);
    label(g, 230, 118, "old oak");
    label(g, 600, 216, "boulder");
    label(g, 300, 205, "Miller's Creek", 12);
    label(g, 130, 75, "Hale farm, 38 acres");
    label(g, 640, 85, "Reed farm, 61 acres");
    label(g, 150, 320, "Perry farm, 52 acres");
    label(g, 480, 270, "Cole farm, 44 acres");
    label(g, 385, 60, "Ames farm, 29 acres");
    label(g, 700, 320, "Dunn farm, 47 acres");
    houseGlyph(g, 105, 100, "");
    houseGlyph(g, 385, 90, "");
    houseGlyph(g, 660, 120, "");
    houseGlyph(g, 175, 350, "");
    houseGlyph(g, 470, 300, "");
    houseGlyph(g, 715, 350, "");
  })();

  // Township and range: a 6×6-mile township of 36 sections, and one section split into quarter sections
  (function buildTownship() {
    const g = document.getElementById("survey-township");
    const ox = 30, oy = 30, s = 56;
    el("rect", { x: ox, y: oy, width: s * 6, height: s * 6, fill: "var(--field-b)" }, g);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
      const n = r % 2 === 0 ? r * 6 + (6 - c) : r * 6 + c + 1;
      el("rect", { x: ox + c * s, y: oy + r * s, width: s, height: s, fill: (r + c) % 2 ? "var(--field-b)" : "var(--field-c)", stroke: "var(--road)", "stroke-width": 2 }, g);
      label(g, ox + c * s + s / 2, oy + r * s + s / 2 + 5, n, 14);
    }
    el("rect", { x: ox, y: oy, width: s * 6, height: s * 6, fill: "none", stroke: "var(--ink)", "stroke-width": 2.5 }, g);
    el("rect", { x: ox + 2 * s, y: oy + 2 * s, width: s, height: s, fill: "none", stroke: "var(--accent)", "stroke-width": 4 }, g);
    label(g, ox + s * 3, oy + s * 6 + 24, "One township: 6 miles × 6 miles, 36 sections", 13);
    // blown-up section
    const bx = 440, by = 40, bs = 300;
    el("path", { d: `M${ox + 3 * s},${oy + 2 * s} L${bx},${by} M${ox + 3 * s},${oy + 3 * s} L${bx},${by + bs}`, stroke: "var(--accent)", "stroke-width": 1.5, "stroke-dasharray": "5 5", fill: "none" }, g);
    el("rect", { x: bx, y: by, width: bs, height: bs, fill: "var(--field-a)", stroke: "var(--ink)", "stroke-width": 2.5 }, g);
    el("line", { x1: bx + bs / 2, y1: by, x2: bx + bs / 2, y2: by + bs, stroke: "var(--ink)", "stroke-width": 1.5 }, g);
    el("line", { x1: bx, y1: by + bs / 2, x2: bx + bs, y2: by + bs / 2, stroke: "var(--ink)", "stroke-width": 1.5 }, g);
    [["NW ¼", 0, 0], ["NE ¼", 1, 0], ["SW ¼", 0, 1], ["SE ¼", 1, 1]].forEach(([t, cx, cy]) => {
      const x = bx + cx * bs / 2 + bs / 4, y = by + cy * bs / 2 + bs / 4;
      label(g, x, y - 6, t, 16);
      label(g, x, y + 14, "160 acres", 12);
      houseGlyph(g, x + (cx ? 40 : -40), y + 45, "");
    });
    label(g, bx + bs / 2, by + bs + 24, "One section: 1 mile × 1 mile, 640 acres", 13);
    el("rect", { x: bx, y: by, width: bs, height: bs, fill: "none", stroke: "var(--accent)", "stroke-width": 4 }, g);
  })();

  // Long-lot: narrow strips perpendicular to the river, houses at the water
  (function buildLongLot() {
    const g = document.getElementById("survey-longlot");
    const rf = x => 250 + 14 * Math.sin(x / 150);
    const w = 62;
    for (let i = 0; i < 14; i++) {
      const x0 = i * w - 20, x1 = x0 + w;
      el("polygon", { points: `${x0},0 ${x1},0 ${x1},${rf(x1)} ${x0},${rf(x0)}`, fill: i % 2 ? "var(--field-a)" : "var(--field-b)", stroke: "var(--ink)", "stroke-width": 1.2 }, g);
      el("polygon", { points: `${x0},${rf(x0)} ${x1},${rf(x1)} ${x1},400 ${x0},400`, fill: i % 2 ? "var(--field-c)" : "var(--field-a)", stroke: "var(--ink)", "stroke-width": 1.2 }, g);
      if (i > 0 && i < 13) {
        houseGlyph(g, x0 + w / 2, rf(x0 + w / 2) - 26, "");
        if (i % 3 === 0) houseGlyph(g, x0 + w / 2, rf(x0 + w / 2) + 30, "");
      }
    }
    el("path", { d: riverPath(rf), fill: "none", stroke: "var(--river)", "stroke-width": 16, "stroke-linecap": "round" }, g);
    el("path", { d: riverPath(x => rf(x) - 50), fill: "none", stroke: "var(--road)", "stroke-width": 5 }, g);
    const bg = el("rect", { x: 250, y: 70, width: 300, height: 46, rx: 8, fill: "var(--panel)", stroke: "var(--line)" }, g);
    label(g, 400, 90, "Each lot is narrow but deep,", 13);
    label(g, 400, 108, "so every family touches the river", 13);
  })();

  const SURVEY_CARDS = {
    metes: {
      name: "Metes and bounds",
      aka: "English system · original 13 colonies",
      what: "Property lines are described with landmarks, distances, and compass directions: \"from the old oak, north along the creek to the boulder.\" Parcels come out irregular and every size.",
      why: ["Brought from England before any national survey existed", "Follows terrain: creeks, ridges, and tree lines become boundaries", "Landmarks move or die, so disputes were common"],
      where: "The eastern United States (the original thirteen colonies and Kentucky, Tennessee), England, and much of the world settled before modern surveying.",
      pattern: "No single pattern. Settlement follows the land — clustered villages in New England, scattered farms along creeks in the South."
    },
    township: {
      name: "Township and range",
      aka: "Public Land Survey System · Land Ordinance of 1785",
      what: "A grid laid over the land regardless of terrain. Townships are 6 miles square and split into 36 sections of one square mile (640 acres). Sections divide into 160-acre quarter sections.",
      why: ["Congress needed to sell western land quickly and fairly", "Squares are easy to survey, number, and record", "The Homestead Act (1862) gave families a 160-acre quarter section"],
      where: "Everything west of Ohio: the Midwest, the Great Plains, and the West. Look for the roads and county lines that run straight for miles.",
      pattern: "Dispersed. One family per plot means one farmhouse per quarter section, spread evenly across the grid."
    },
    longlot: {
      name: "Long-lot",
      aka: "French system · also Spanish in Texas",
      what: "Narrow strips of land run back from a river or road. Each family gets frontage on the water plus a long ribbon of land behind it.",
      why: ["The river was the highway: everyone needed a landing", "Equal access to water for fishing, irrigation, and transport", "Strips could be split lengthwise among heirs and still touch the river"],
      where: "Québec along the St. Lawrence, Louisiana bayous and the Mississippi, the Rio Grande valley in Texas, parts of the Detroit River and Vincennes, Indiana.",
      pattern: "Linear. Houses sit at the river end of each lot, forming a continuous line along the bank."
    }
  };
  const surveyCard = document.getElementById("survey-card");
  const setSurvey = (key) => {
    document.querySelectorAll("[data-survey]").forEach(t => t.setAttribute("aria-selected", t.dataset.survey === key ? "true" : "false"));
    ["metes", "township", "longlot"].forEach(k => document.getElementById("survey-" + k).classList.toggle("on", k === key));
    if (window.__onSurveyChange) window.__onSurveyChange(key);
    const c = SURVEY_CARDS[key];
    surveyCard.innerHTML = `
      <h3>${c.name}</h3>
      <div class="aka">${c.aka}</div>
      <dl>
        <dt>How it works</dt><dd>${c.what}</dd>
        <dt>Why it was used</dt><dd><ul>${c.why.map(w => `<li>${w}</li>`).join("")}</ul></dd>
        <dt>Where you see it</dt><dd>${c.where}</dd>
        <dt>Settlement pattern it produces</dt><dd>${c.pattern}</dd>
      </dl>`;
  };
  document.querySelectorAll("[data-survey]").forEach(t => t.addEventListener("click", () => setSurvey(t.dataset.survey)));
  setSurvey("metes");
  window.__setSurvey = setSurvey;

  
  /* ---------- SPOT THE PATTERN (real imagery) ---------- */
  const POOL = [];
  Object.keys(PLACES).forEach(p => PLACES[p].forEach(([name, lon, lat, zoom, note]) => POOL.push({ p, name, lon, lat, zoom, note })));
  const LABEL = { clustered: "Clustered", dispersed: "Dispersed", linear: "Linear" };
  const ROUNDS = 8;
  const gameMap = document.getElementById("game-map");
  const gScore = document.getElementById("g-score");
  const gFeedback = document.getElementById("g-feedback");
  const gNext = document.getElementById("g-next");
  const choiceBtns = Array.from(document.querySelectorAll("#g-choices .choice"));
  let deck = [], round = 0, score = 0, current = null, streak = 0;
  const gStreak = document.getElementById("g-streak");
  const gProgress = document.getElementById("g-progress");
  const GOOD = ["Nailed it.", "Correct.", "Sharp eyes.", "Yep.", "Geographer moment.", "Correct — easy for you."];
  const OOPS = ["Close, but no.", "Not that one.", "Tricky one.", "Nope."];
  const updateStreak = () => {
    gStreak.textContent = streak >= 2 ? `🔥 ${streak} in a row` : "";
    gStreak.classList.toggle("on", streak >= 2);
  };
  const confetti = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.createElement("div"); box.className = "confetti";
    const colors = ["var(--clustered)", "var(--dispersed)", "var(--linear)", "var(--pop)", "var(--gold)"];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--t", 1.8 + Math.random() * 1.6 + "s");
      p.style.setProperty("--d", Math.random() * 0.8 + "s");
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3800);
  };

  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const newDeck = () => {
    // one of each pattern first, then fill from the rest, so every game has all three
    const byP = { clustered: [], dispersed: [], linear: [] };
    shuffle(POOL.slice()).forEach(x => byP[x.p].push(x));
    const first = [byP.clustered.pop(), byP.dispersed.pop(), byP.linear.pop()];
    const rest = shuffle([...byP.clustered, ...byP.dispersed, ...byP.linear]);
    deck = shuffle(first.concat(rest.slice(0, ROUNDS - 3)));
  };
  function newRound() {
    round++;
    current = deck[round - 1];
    flyTo(gameMap, current.lon, current.lat, current.zoom);
    gScore.textContent = `Round ${round} of ${ROUNDS} · Score ${score}`;
    gProgress.style.width = ((round - 1) / ROUNDS * 100) + "%";
    gFeedback.textContent = ""; gFeedback.className = "feedback";
    choiceBtns.forEach(b => { b.disabled = false; b.className = "choice"; });
    gNext.disabled = true;
    gNext.textContent = round === ROUNDS ? "See results" : "Next place";
  }
  choiceBtns.forEach(b => b.addEventListener("click", () => {
    const ans = b.dataset.answer;
    choiceBtns.forEach(x => { x.disabled = true; if (x.dataset.answer === current.p) x.classList.add("correct"); });
    const reveal = `<em>${current.name}.</em> ${current.note} <a class="agol" href="${agolLink(current.lon, current.lat, current.zoom)}" target="_blank" rel="noopener">Open in ArcGIS Online</a>`;
    if (ans === current.p) {
      score++; streak++;
      gFeedback.className = "feedback good";
      gFeedback.innerHTML = `<strong>${GOOD[Math.floor(Math.random() * GOOD.length)]}</strong> ${reveal}`;
    } else {
      streak = 0;
      b.classList.add("wrong"); gFeedback.className = "feedback poor";
      gFeedback.innerHTML = `<strong>${OOPS[Math.floor(Math.random() * OOPS.length)]} It's ${LABEL[current.p].toLowerCase()}.</strong> ${reveal}`;
    }
    updateStreak();
    gScore.textContent = `Round ${round} of ${ROUNDS} · Score ${score}`;
    gProgress.style.width = (round / ROUNDS * 100) + "%";
    gNext.disabled = false;
  }));
  gNext.addEventListener("click", () => {
    if (round >= ROUNDS) {
      gScore.textContent = `Finished · ${score} of ${ROUNDS}`;
      const rank = score === ROUNDS ? ["🛰️", "Satellite Whisperer", "Every one. You can read a settlement pattern straight off the imagery."]
        : score >= 6 ? ["🧭", "Field Scout", "Solid. For the ones you missed, zoom out one level — the spacing between houses is the giveaway."]
        : score >= 4 ? ["🗺️", "Map Apprentice", "Getting there. Ask of every place: are the houses grouped, spread, or in a line?"]
        : ["🌱", "Rookie Surveyor", "Everyone starts here. Run it again — the patterns get obvious fast."];
      gFeedback.className = "feedback";
      gFeedback.innerHTML = `<div class="rank"><span class="big">${rank[0]}</span>${rank[1]}</div>${rank[2]}`;
      if (score === ROUNDS) confetti();
      gNext.textContent = "Play again";
      gNext.onclick = () => { round = 0; score = 0; streak = 0; updateStreak(); gNext.onclick = null; newDeck(); newRound(); };
      return;
    }
    newRound();
  });
  newDeck();
  newRound();

/* ---------- QUIZ ---------- */
  const QUIZ = [
    { stem: "A village in medieval England where families lived side by side and each farmed scattered strips in large shared fields is an example of which pattern?",
      options: ["Clustered", "Dispersed", "Linear"], answer: 0,
      explain: "Shared open fields and feudal ties pulled people into nucleated villages; the fields lay outside the village." },
    { stem: "Which survey system most directly encouraged dispersed settlement in the American Midwest?",
      options: ["Metes and bounds", "Township and range", "Long-lot"], answer: 1,
      explain: "Township and range divided land into square sections that were sold to individual families, who then built on their own plots." },
    { stem: "Farms along the St. Lawrence River in Québec are narrow strips that run back from the water, with houses at the river's edge. This creates a:",
      options: ["Clustered pattern", "Dispersed pattern", "Linear pattern"], answer: 2,
      explain: "The French long-lot system lined houses up along the river so every farm touched the water." },
    { stem: "The enclosure movement in Britain fenced off common fields and consolidated them into private farms. What effect did it have on settlement?",
      options: ["Villages grew more clustered", "Settlement became more dispersed", "Villages moved onto rivers and became linear"], answer: 1,
      explain: "Once land was privately held, farmers built houses on their own consolidated plots instead of staying in the village." },
    { stem: "Which of the following is NOT typical of a rural settlement?",
      options: ["Low population density", "Most jobs in the primary sector", "A large share of jobs in finance and professional services"], answer: 2,
      explain: "Rural settlements are defined by small, low-density populations working mainly in agriculture and other primary activities." },
    { stem: "A southern African village arranged in a ring around a central livestock enclosure is best classified as:",
      options: ["Circular clustered", "Dispersed", "Linear"], answer: 0,
      explain: "A kraal is a circular sub-form of the clustered pattern: homes grouped tightly around a shared center." },
    { stem: "Land is cheap and plentiful, farms are large, and machinery does most of the work. Which pattern is most likely?",
      options: ["Clustered", "Dispersed", "Linear"], answer: 1,
      explain: "With plenty of land and little need for shared labor, families spread out onto isolated farmsteads." },
    { stem: "Which clue in an aerial photo most strongly suggests a linear settlement?",
      options: ["Houses evenly spaced across a square grid", "A tight knot of houses with fields radiating outward", "A single row of houses with long thin fields behind them"], answer: 2,
      explain: "Houses in a row along a route, backed by strips of land, is the signature of linear (long-lot) settlement." },
    { stem: "A deed reads: \"from the large white oak, north 40 rods to Miller's Creek, then along the creek to the stone wall.\" Which survey system is this?",
      options: ["Metes and bounds", "Township and range", "Long-lot"], answer: 0,
      explain: "Metes and bounds uses landmarks, distances, and directions, which is why parcels in the eastern U.S. are so irregular." },
    { stem: "Under the Land Ordinance of 1785, a township measures six miles on each side and contains how many one-square-mile sections?",
      options: ["16", "36", "64"], answer: 1,
      explain: "Six by six miles gives 36 sections of 640 acres each; a 160-acre quarter section became the standard Homestead Act farm." },
    { stem: "Which pairing of survey system and resulting settlement pattern is correct?",
      options: ["Long-lot → clustered", "Township and range → dispersed", "Metes and bounds → linear"], answer: 1,
      explain: "Square private plots spread families out onto their own farmsteads. Long-lot produces linear settlement; metes and bounds gives irregular, terrain-following parcels." }
  ];
  const quizEl = document.getElementById("quiz");
  const quizScore = document.getElementById("quiz-score");
  const renderQuiz = () => {
    quizEl.innerHTML = "";
    QUIZ.forEach((q, i) => {
      const d = document.createElement("div"); d.className = "q";
      d.innerHTML = `<p class="stem">${q.stem}</p>
        <div class="choices">${q.options.map((o, j) => `<button class="choice" data-q="${i}" data-j="${j}">${o}</button>`).join("")}</div>
        <p class="explain">${q.explain}</p>`;
      quizEl.appendChild(d);
    });
    quizScore.textContent = "";
  };
  let answered = 0, right = 0;
  quizEl.addEventListener("click", (e) => {
    const b = e.target.closest(".choice"); if (!b || b.disabled) return;
    const i = +b.dataset.q, j = +b.dataset.j, q = QUIZ[i];
    const wrap = b.closest(".q");
    wrap.querySelectorAll(".choice").forEach(x => { x.disabled = true; if (+x.dataset.j === q.answer) x.classList.add("correct"); });
    if (j === q.answer) right++; else b.classList.add("wrong");
    wrap.classList.add("answered");
    answered++;
    if (answered === QUIZ.length) {
      const pct = right / QUIZ.length;
      const tag = pct === 1 ? "🏆 Perfect — go teach the class." : pct >= 0.8 ? "🎯 Exam-ready." : pct >= 0.6 ? "📈 Nearly there — reread the explanations you missed." : "🔁 Clear it and try again; the explanations are the study guide.";
      quizScore.textContent = `${right} of ${QUIZ.length} · ${tag}`;
      if (pct === 1) confetti();
    } else {
      quizScore.textContent = `${right} of ${answered} answered correctly`;
    }
  });
  document.getElementById("quiz-reset").addEventListener("click", () => { answered = 0; right = 0; renderQuiz(); });
  renderQuiz();

})();
