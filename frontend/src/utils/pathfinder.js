export const calculateRescuePath = (mission, stats) => {
  if (!stats || stats.length === 0) return { rescuePath: [], teamLandingZone: null, evacuationZone: null };

  const GRID_SIZE = 80;

  // ── 1. Bounding box ───────────────────────────────────────────────────────
  let bMinLat = Infinity, bMaxLat = -Infinity, bMinLng = Infinity, bMaxLng = -Infinity;
  stats.forEach(s => {
    const lat = parseFloat(s.latitude), lng = parseFloat(s.longitude);
    if (lat < bMinLat) bMinLat = lat; if (lat > bMaxLat) bMaxLat = lat;
    if (lng < bMinLng) bMinLng = lng; if (lng > bMaxLng) bMaxLng = lng;
  });

  const padding = 0.001;
  const minLat = bMinLat - padding, maxLat = bMaxLat + padding;
  const minLng = bMinLng - padding, maxLng = bMaxLng + padding;

  const toGrid = (lat, lng) => ({
    r: Math.max(0, Math.min(GRID_SIZE - 1,
      Math.floor(((parseFloat(lat) - minLat) / (maxLat - minLat)) * (GRID_SIZE - 1)))),
    c: Math.max(0, Math.min(GRID_SIZE - 1,
      Math.floor(((parseFloat(lng) - minLng) / (maxLng - minLng)) * (GRID_SIZE - 1))))
  });

  const toLatLng = (r, c) => [
    minLat + (r / (GRID_SIZE - 1)) * (maxLat - minLat),
    minLng + (c / (GRID_SIZE - 1)) * (maxLng - minLng)
  ];

  // ── 2. Fixed endpoints: nearest real data point to SW and NE corners ──────
  const nearestTo = (tLat, tLng, exclude) =>
    stats.reduce((best, s) => {
      if (s === exclude) return best;
      const d  = (parseFloat(s.latitude) - tLat) ** 2 + (parseFloat(s.longitude) - tLng) ** 2;
      const bd = (parseFloat(best.latitude) - tLat) ** 2 + (parseFloat(best.longitude) - tLng) ** 2;
      return d < bd ? s : best;
    });

  const teamLandingZone = nearestTo(bMinLat, bMinLng, null);
  const evacuationZone  = nearestTo(bMaxLat, bMaxLng, teamLandingZone);

  // ── 3. Obstacle grid ──────────────────────────────────────────────────────
  // grid[r][c] = Infinity → hard wall (never entered)
  // grid[r][c] = low      → preferred (high survivor probability)
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(1));

  // Reward safe cells near survivor hotspots
  stats.forEach(s => {
    if (s.structuralGapFound) {
      const { r, c } = toGrid(s.latitude, s.longitude);
      const prob = parseFloat(s.survivorProbability) || 0;
      grid[r][c] = Math.min(grid[r][c], Math.max(0.1, 1 - 0.9 * prob));
    }
  });

  // Hard-block exact obstacle cells only (no dilation — prevents merged walls)
  stats.forEach(s => {
    if (!s.structuralGapFound) {
      const { r, c } = toGrid(s.latitude, s.longitude);
      grid[r][c] = Infinity;
    }
  });

  const isWall = (r, c) =>
    r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE || grid[r][c] === Infinity;

  // Unblock key nodes
  const unblock = (lat, lng) => {
    const { r, c } = toGrid(lat, lng);
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc] === Infinity)
          grid[nr][nc] = 1;
      }
  };

  // ── 4. Waypoints: top survivor hotspots ordered by nearest-neighbour ───────
  const candidates = [...stats]
    .filter(s => s.structuralGapFound && (s.survivorProbability || 0) >= 0.5)
    .sort((a, b) => b.survivorProbability - a.survivorProbability)
    .slice(0, 6)
    .filter(s => s !== teamLandingZone && s !== evacuationZone);

  // Greedy nearest-neighbour ordering from teamLandingZone
  const ordered = [];
  const remaining = [...candidates];
  let cur = teamLandingZone;
  while (remaining.length > 0) {
    let bestIdx = 0, bestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = (parseFloat(s.latitude) - parseFloat(cur.latitude)) ** 2 +
                (parseFloat(s.longitude) - parseFloat(cur.longitude)) ** 2;
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    ordered.push(remaining[bestIdx]);
    cur = remaining[bestIdx];
    remaining.splice(bestIdx, 1);
  }

  // All stops: start → waypoints → end
  const stops = [teamLandingZone, ...ordered, evacuationZone];
  stops.forEach(s => unblock(s.latitude, s.longitude));

  // ── 5. A* between each consecutive pair of stops ──────────────────────────
  const dirs = [
    [0,1],[1,0],[0,-1],[-1,0],
    [1,1],[1,-1],[-1,1],[-1,-1]
  ];

  const astar = (fromLatLng, toLatLng_node) => {
    const sg = toGrid(fromLatLng.latitude, fromLatLng.longitude);
    const eg = toGrid(toLatLng_node.latitude, toLatLng_node.longitude);

    if (sg.r === eg.r && sg.c === eg.c)
      return [[parseFloat(fromLatLng.latitude), parseFloat(fromLatLng.longitude)]];

    const open   = [{ r: sg.r, c: sg.c, g: 0, f: 0, parent: null }];
    const closed = new Map();

    while (open.length > 0) {
      // Pop node with lowest f
      let mi = 0;
      for (let i = 1; i < open.length; i++) if (open[i].f < open[mi].f) mi = i;
      const cur = open[mi]; open[mi] = open[open.length - 1]; open.pop();

      const ck = `${cur.r},${cur.c}`;
      if (closed.has(ck)) continue;
      closed.set(ck, cur);

      if (cur.r === eg.r && cur.c === eg.c) {
        // Reconstruct
        const seg = [];
        let node = cur;
        while (node) { seg.unshift(toLatLng(node.r, node.c)); node = node.parent; }
        return seg;
      }

      for (const [dr, dc] of dirs) {
        const nr = cur.r + dr, nc = cur.c + dc;
        if (isWall(nr, nc)) continue;
        if (closed.has(`${nr},${nc}`)) continue;
        const step = (dr === 0 || dc === 0) ? 1 : 1.414;
        const ng   = cur.g + grid[nr][nc] * step;
        const h    = Math.sqrt((eg.r - nr) ** 2 + (eg.c - nc) ** 2);
        open.push({ r: nr, c: nc, g: ng, f: ng + h, parent: cur });
      }
    }
    return []; // no path found for this segment
  };

  // ── 6. Chain all segments into one full main path ─────────────────────────
  let fullPath = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const seg = astar(stops[i], stops[i + 1]);
    if (seg.length === 0) continue;
    if (fullPath.length > 0) seg.shift();
    fullPath = fullPath.concat(seg);
  }

  if (fullPath.length > 0) {
    fullPath[0]               = [parseFloat(teamLandingZone.latitude), parseFloat(teamLandingZone.longitude)];
    fullPath[fullPath.length - 1] = [parseFloat(evacuationZone.latitude), parseFloat(evacuationZone.longitude)];
  }

  return { rescuePath: fullPath, teamLandingZone, evacuationZone };
};
