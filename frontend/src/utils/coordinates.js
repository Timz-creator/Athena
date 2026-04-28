// Convert lat/lng bounds to world coordinates (0-200)
export function buildCoordinateSystem(scenario) {
    const points = [
      scenario.blueBase,
      scenario.redBase,
      scenario.blueAsset,
      scenario.redAsset,
    ]
  
    const lngs = points.map(p => p.lng)
    const lats = points.map(p => p.lat)
  
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
  
    // Add 20% padding so agents don't spawn on the edge
    const lngPad = (maxLng - minLng) * 0.2
    const latPad = (maxLat - minLat) * 0.2
  
    const bounds = {
      minLng: minLng - lngPad,
      maxLng: maxLng + lngPad,
      minLat: minLat - latPad,
      maxLat: maxLat + latPad,
    }
  
    return bounds
  }
  
  // Convert lat/lng to world coordinates (0-200)
  export function lngLatToWorld(lng, lat, bounds) {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 200
    const y = ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 200
    return { x, y }
  }
  
  // Convert world coordinates back to lat/lng
  export function worldToLngLat(x, y, bounds) {
    const lng = bounds.minLng + (x / 200) * (bounds.maxLng - bounds.minLng)
    const lat = bounds.minLat + (y / 200) * (bounds.maxLat - bounds.minLat)
    return { lng, lat }
  }