// Indoor sets registry (owned by the indoor-sets builder). Entries merge into SETS in index.ts.
// All rooms: metres, y up, floor y=0, open toward +z (cameras outside a wall see straight in;
// a one-sided fourth wall at the +z edge only shows in reverse shots from inside). Pass
// time:'interiorNight' for night windows + lamps on. Building blocks live in roomkit.tsx.
import type { SetDef } from './index';
import { Home, HOME_MARKS, HOME_SOLIDS } from './home';
import { Bedroom, BEDROOM_MARKS, BEDROOM_SOLIDS } from './bedroom';
import { Classroom, CLASSROOM_MARKS, CLASSROOM_SOLIDS } from './classroom';
import { Cafeteria, CAFETERIA_MARKS, CAFETERIA_SOLIDS } from './cafeteria';
import { VoidStage, VOID_MARKS } from './voidstage';

export const INDOOR_SETS: Record<string, SetDef> = {
  home: {
    component: Home,
    solids: HOME_SOLIDS,
    palette: 'interior',
    marks: HOME_MARKS,
    shadowCenter: [0, 1, -0.5],
    shadowBox: 10,
    interior: true,
    room: { min: [-6, 0, -5], max: [6, 3, 40] },
    description:
      'IFOLOGY "Shapeshift" open-plan home, x∈[-6,6], back wall z=-5, ceiling 3, fourth wall z=6. Kitchen left (checker floor): fridge back-left, purple cabinets, tiled backsplash, sink under window x=-3.7, hob/oven/hood x=-2, dining table at (-3,-1.3) with chairs N/E/W (south side open to camera). Living right (wood floor, red rug): blue couch at x=1.6 facing +x toward wall TV on the right wall, coffee table, big window x=3.3, green door on right wall z=-3.6, wall clock + pin board on back wall. Marks: seat = north dining chair (sit, rot 0), couch = couch seat (sit, rot 90), tv = beside the TV console. Cams: wide pos[0,1.75,8.5] look[0,1.2,-1.5]; kitchen pos[-1.2,1.6,2.2] look[-3.4,1.2,-4]; living pos[0.2,1.55,4.2] look[3.4,1,-1.2]; reverse (inside) pos[1,1.6,-3.5] look[0,1.2,6].',
  },
  bedroom: {
    component: Bedroom,
    solids: BEDROOM_SOLIDS,
    palette: 'interior',
    marks: BEDROOM_MARKS,
    shadowCenter: [0, 1, -0.5],
    shadowBox: 8,
    interior: true,
    room: { min: [-4.5, 0, -4], max: [4.5, 2.8, 40] },
    description:
      'Teen bedroom, x∈[-4.5,4.5], back wall z=-4, ceiling 2.8, fourth wall z=5. Blue two-tone walls, wood floor, round yellow rug. Bed (headboard on back wall) at x=-2.55 with teddy + nightstand lamp; window with pink curtains x=0.45; desk with glowing monitor, desk lamp, PC and red gaming chair at x=2.75 (sitter faces the back wall, rot 180); bookshelf on the right wall (z=-1.4), clock + wardrobe (z=1) on the left wall, door on right wall z=2.6, beanbag. Cams: wide pos[0,1.6,7.6] look[0,1.15,-1.5]; desk over-shoulder pos[1.4,1.55,-0.6] look[2.9,1.05,-3.8]; bed pos[1.4,1.45,1.8] look[-2.4,0.75,-2.6].',
  },
  classroom: {
    component: Classroom,
    solids: CLASSROOM_SOLIDS,
    palette: 'interior',
    marks: CLASSROOM_MARKS,
    shadowCenter: [0, 1, 0],
    shadowBox: 11,
    interior: true,
    room: { min: [-6, 0, -5], max: [6, 3.2, 40] },
    description:
      'School classroom in IFOLOGY "Stop Time" colours (navy lower walls, yellow upper, grey checker floor, ceiling light panels), x∈[-6,6], back wall z=-5 (3 windows), ceiling 3.2, fourth wall z=6. Whiteboard ("What if time stopped?") + clock on the LEFT wall (x=-6); teacher desk with globe at (-4.3,2.2); 4×5 desks at seat x∈{-1.6,0.2,2,3.8}, z∈{-3.4,-1.7,0,1.7,3.4}, students face -x (sit rot -90). variant even = ~15 seated extras (seat1-3 kept free), odd = empty. Right wall: dot banner, map, pin board, cubbies. Cams: cross-section pos[0.8,2.3,10.5] look[-0.2,1,-0.5]; teacher POV of faces pos[-4.6,1.7,-0.2] look[3.5,0.95,0.6]; student POV to board pos[2.6,1.35,1] look[-6,1.5,-0.6].',
  },
  cafeteria: {
    component: Cafeteria,
    solids: CAFETERIA_SOLIDS,
    palette: 'interior',
    marks: CAFETERIA_MARKS,
    shadowCenter: [0, 1, 0],
    shadowBox: 11,
    interior: true,
    room: { min: [-6, 0, -5], max: [6, 3.2, 40] },
    description:
      'School cafeteria from IFOLOGY "Stop Time" (same navy/yellow shell as classroom), x∈[-6,6], back wall z=-5 with lunch menu board, clock and 2 windows, fourth wall z=6. Long white tables along x at z∈{-3.2,-0.8,1.6}, x=±3 (4 m), navy benches at table z±0.62, lunch trays; 2 m centre aisle x=0. Bins + tray return on the right wall. Seats on the north bench face +z (camera, rot 0); south bench faces -z (rot 180). variant even = ~30 seated extras (seat1-4 free), odd = empty. Cams: wide pos[0.5,2,10] look[0,1,-1]; table-level pos[3.4,1.35,3.4] look[1.2,1.05,-1.5]; down the aisle pos[0,1.6,6.5] look[0,1.1,-3].',
  },
  void: {
    component: VoidStage,
    palette: 'void',
    marks: VOID_MARKS,
    shadowCenter: [0, 0, 0],
    shadowBox: 8,
    interior: true, // draws its own backdrop that matches the fog colour at the horizon
    description:
      'Abstract navy mind-space for explanations: endless navy floor with a faint blueprint grid fading into a soft horizon glow, a blue spotlight pool + rings + soft beam at the origin, low-poly shapes drifting far behind (animated with t). Floor y=0. Cams: standard pos[0,1.5,7] look[0,1,0]; hero low-angle pos[1.3,0.7,4.2] look[0,1.3,0]; high pos[0,5.5,8.5] look[0,0.5,0].',
  },
};
