// Base map for Footprints.
//
// Without configuration the map uses OpenStreetMap's own tiles, which need no
// key and are fine for a low-traffic personal site under the OSM tile usage
// policy (https://operations.osmfoundation.org/policies/tiles/).
//
// CARTO's nicer Voyager style needs a free key (https://carto.com/basemaps/apikey).
// To use it, set VUE_APP_CARTO_KEY as a build variable in Workers Builds (or in
// .env.local for local builds); tile keys are public by design.
const cartoKey = import.meta.env.VUE_APP_CARTO_KEY

const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'

export const tiles = cartoKey
  ? {
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoKey)}`,
    options: {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: `${osmAttribution} &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>`
    }
  }
  : {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: osmAttribution
    }
  }
