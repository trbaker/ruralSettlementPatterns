// Optional ArcGIS API key.
// Paste a key between the quotes if your organization requires one.
// The legacy "hybrid" and "satellite" basemaps used by this app work
// without a key for ArcGIS Online organizations such as schools.
const API_KEY = "";
if (API_KEY) {
  try {
    const { default: esriConfig } = await import("https://js.arcgis.com/5.1/@arcgis/core/config.js");
    esriConfig.apiKey = API_KEY;
  } catch (e) { console.warn("Could not apply API key", e); }
}
