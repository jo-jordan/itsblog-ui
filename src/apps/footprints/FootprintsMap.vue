<template>
  <div ref="map" class="fp-map" :class="{ 'is-picking': picking }" />
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { tiles } from '../../config/map'

function pinIcon(kind) {
  return L.divIcon({
    className: `fp-pin fp-pin--${kind}`,
    html: '<span class="fp-pin__needle"></span><span class="fp-pin__head"></span>',
    iconSize: [24, 34],
    iconAnchor: [12, 33],
    tooltipAnchor: [0, -30]
  })
}

export default {
  name: 'FootprintsMap',
  props: {
    places: { type: Array, default: () => [] },
    selectedId: { type: Number, default: null },
    // Picking mode: clicks on the map choose a location instead
    picking: { type: Boolean, default: false },
    point: { type: Object, default: null },
    // Width covered on the right (the details drawer); centre places left of it
    offsetRight: { type: Number, default: 0 }
  },
  emits: ['pick', 'select'],
  watch: {
    places() {
      this.drawPlaces()
      // A shared /places/:id link selects before the places have loaded
      if (!this.focusSelected()) {
        this.fitPlaces()
      }
    },
    selectedId() {
      this.drawPlaces()
      this.focusSelected()
    },
    point() {
      this.drawPoint()
    }
  },
  mounted() {
    this.map = L.map(this.$refs.map, { worldCopyJump: true, zoomSnap: 0.5 }).setView([30, 110], 3)
    L.tileLayer(tiles.url, tiles.options).addTo(this.map)
    this.placeLayer = L.layerGroup().addTo(this.map)
    this.map.on('click', event => {
      if (this.picking) {
        this.$emit('pick', { lat: event.latlng.lat, lng: event.latlng.wrap().lng })
      }
    })
    // Windows resize and zoom, so keep Leaflet's idea of the size current
    this.observer = new ResizeObserver(() => this.map.invalidateSize())
    this.observer.observe(this.$refs.map)
    this.drawPlaces()
    this.fitPlaces()
    this.drawPoint()
  },
  beforeUnmount() {
    this.observer.disconnect()
    this.map.remove()
  },
  methods: {
    drawPlaces() {
      this.placeLayer.clearLayers()
      this.places.forEach(place => {
        const selected = place.id === this.selectedId
        L.marker([place.lat, place.lng], {
          icon: pinIcon(selected ? 'selected' : 'place'),
          title: place.name,
          zIndexOffset: selected ? 1000 : 0
        })
          .bindTooltip(place.name, { direction: 'top' })
          .on('click', () => this.$emit('select', place.id))
          .addTo(this.placeLayer)
      })
    },
    fitPlaces() {
      if (this.picking && this.point) {
        this.map.setView([this.point.lat, this.point.lng], 10)
      } else if (this.places.length === 1) {
        this.map.setView([this.places[0].lat, this.places[0].lng], 8)
      } else if (this.places.length > 1) {
        this.map.fitBounds(L.latLngBounds(this.places.map(p => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 8 })
      }
    },
    drawPoint() {
      if (this.pointMarker) {
        this.pointMarker.remove()
        this.pointMarker = null
      }
      if (this.point) {
        this.pointMarker = L.marker([this.point.lat, this.point.lng], { icon: pinIcon('picked') }).addTo(this.map)
      }
    },
    focusSelected() {
      const place = this.places.find(p => p.id === this.selectedId)
      if (!place) {
        return false
      }
      const zoom = Math.max(this.map.getZoom(), 6)
      const target = this.map.unproject(this.map.project([place.lat, place.lng], zoom).add([this.offsetRight / 2, 0]), zoom)
      this.map.flyTo(target, zoom, { duration: 0.8 })
      return true
    },
    centerOn(lat, lng) {
      this.map.setView([lat, lng], Math.max(this.map.getZoom(), 10))
    }
  }
}
</script>

<style lang="scss">
.fp-map {
  width: 100%;
  height: 100%;
  font-family: var(--aqua-font);
  background: #dfe6ee;

  &.is-picking {
    cursor: crosshair;
  }

  .leaflet-tooltip {
    font-size: 12px;
    font-weight: bold;
    border: 1px solid #000;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  }

  .leaflet-control-zoom a {
    font-family: var(--aqua-font);
    color: #333;
    background: linear-gradient(to bottom, #fdfdfd, #dadada);
  }
}

// Glossy Aqua pushpins. Leaflet positions the .fp-pin element itself with an
// absolute transform, so only its children may be styled or animated.
.fp-pin__needle {
  position: absolute;
  left: 11px;
  top: 16px;
  width: 2px;
  height: 18px;
  border-radius: 1px;
  background: linear-gradient(to right, #6b7480, #e3e7ec, #6b7480);
}

.fp-pin__head {
  position: absolute;
  left: 2px;
  top: 0;
  width: 20px;
  height: 20px;
  border: 1px solid #7a110d;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff 0, #ffb3a8 12%, #e8352a 45%, #8e1410 100%);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.45);
}

.fp-pin--selected .fp-pin__head,
.fp-pin--picked .fp-pin__head {
  border-color: var(--aqua-gel-border);
  background: radial-gradient(circle at 35% 30%, #fff 0, var(--aqua-gel-top) 14%, var(--aqua-gel-mid) 50%, #1d4f9c 100%);
}

.fp-pin--selected span {
  animation: fp-pin-drop 0.35s ease-out;
}

@keyframes fp-pin-drop {
  0% { transform: translateY(-14px); }
  70% { transform: translateY(2px); }
}
</style>
