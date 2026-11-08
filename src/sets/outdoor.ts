// Outdoor sets registry (owned by the outdoor-sets builder). Entries merge into SETS in index.ts.
import type { SetDef } from './index';
import { CITY_MARKS, CitySet } from './city';
import { PARK_MARKS, ParkSet } from './park';
import { STADIUM_MARKS, StadiumSet } from './stadium';
import { ROOFTOP_MARKS, RooftopSet } from './rooftop';
import { APARTMENTS_MARKS, Apartments } from './apartments';

export const OUTDOOR_SETS: Record<string, SetDef> = {
  city: {
    component: CitySet,
    palette: 'afternoon',
    marks: CITY_MARKS,
    shadowBox: 24,
    description:
      'Downtown street, tiles forever along x (40 m blocks). Road |z|<6 (y 0), sidewalks 6<|z|<10.5 (top y 0.15), shops+towers behind at z=-10.5; zebra crossing x=12; parking lot with cones at z 11–32 (block 0). Palettes: afternoon, golden, dusk, cityNight (night ok). Cams: street {pos:[0,1.6,2],look:[0,1.3,-8]}; down-street {pos:[-16,1.4,-3],look:[6,2.2,-6]}; lot {pos:[0,1.5,12],look:[1,1.1,21]}.',
  },
  park: {
    component: ParkSet,
    palette: 'afternoon',
    marks: PARK_MARKS,
    shadowBox: 22,
    description:
      'City park: lawn (y 0) with a round paved plaza + two-tier fountain at the origin (plaza top y 0.03), curving paths to +z, -x and +x/-z (top y 0.02), duck pond at (-17,-14), benches, park lamps, flower beds, picnic blanket at (9,9), tree line + hills. Sit on `bench` with rot 135. Palettes: afternoon, day, golden, dusk, night. Cams: plaza {pos:[0,1.6,13],look:[0,1.2,3]}; path {pos:[-1,1.5,32],look:[-2,1.1,20]}; pond {pos:[-6,1.7,-2],look:[-15,0.6,-12]}.',
  },
  stadium: {
    component: StadiumSet,
    palette: 'afternoon',
    marks: STADIUM_MARKS,
    shadowBox: 30,
    description:
      'American-football stadium. Field along x: end lines x=±54.86, sidelines z=±24.38, turf top y 0.02, goal posts at x=±54.86, end zones x>45.7. Stands (instanced crowd ~14k) front walls z=±33 and x=±64; floodlights at corners; scoreboard above the west (-x) stand. Palettes: afternoon, golden, dusk, stadiumNight (floodlit night). variant odd = empty stands. Cams: sideline {pos:[0,1.7,14],look:[0,1.4,0]}; end zone {pos:[36,1.6,5],look:[52,2.5,0]}; wide {pos:[-42,17,21],look:[0,2,-4]}.',
  },
  apartments: {
    component: Apartments,
    palette: 'golden',
    marks: APARTMENTS_MARKS,
    shadowBox: 22,
    description:
      'Apartment street for the fire set piece: five-storey sand-coloured block (front z=-9.5, x∈[-14,14], floors every 3 m from y 0.15) with balconies on bays x=-8,0,8 (levels 1–4; slab 3 m wide, front rail z=-8.1). The 4th-floor flat in bay 0 (floor y 9.15) burns: flames in the balcony doorway + window x=4, soot, smoke rising up the facade. Road |z|<5 (y 0), sidewalks 5<|z|<9.5 (top y 0.15), buildings across the street, towers behind. Ladder truck goes at `truck` (prop firetruck, rot 0, cab -x); a `basket` prop with from = the `pivot` mark draws the ladder to it. Cams: street up {pos:[3,1.4,6],look:[0,8.5,-9]}; balcony {pos:[2.2,10.4,-4.6],look:[0,9.9,-9]}; crowd {pos:[-2,1.6,-3],look:[1,1.4,7]}.',
  },
  rooftop: {
    component: RooftopSet,
    palette: 'rooftopNight',
    marks: ROOFTOP_MARKS,
    shadowBox: 16,
    description:
      'City rooftop 45 m up: tar roof floor y 0 inside a 1.1 m parapet (x ±12.65, z ±9.65), stair door hut + water tower + AC bank on the +z side, string lights, little lounge; lit skyline all round, big moon over the front (-z) ledge. Palettes: rooftopNight (default), night, dusk, golden. Cams: moon {pos:[-0.5,1.4,-2.5],look:[1.5,2.6,-14]} (hero at `ledge`, rot 0); roof wide {pos:[9,4.5,-8.5],look:[-3,1.2,4]}; on-the-ledge from outside {pos:[8,-1,-17],look:[4.5,1.6,-9.8]} (hero `onLedge`, rot 180).',
  },
};
