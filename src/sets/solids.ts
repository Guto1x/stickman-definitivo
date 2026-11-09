// Solid stand-ins for furniture that is drawn as JSX components (kit Table/Chair/Bed/Desk, roomkit Sofa) and
// for free-standing scene props, recorded into a Batch for the clip audit. Each mirrors the drawn component's
// main volumes (top, legs, seat, back, body); keep the numbers in step when a component changes shape.
import type { Vec3 } from '../types';
import type { Batch } from './roomkit';

type R = number;
const K = '#000';

export function solidTable(b: Batch, p: Vec3, r: R = 0, w = 1.4, d = 0.8, h = 0.75, round = false) {
  b.at(p, r, () => {
    if (round) {
      b.add('cyl', K, [0, h, 0], [w / 2, 0.05, w / 2]);
      b.add('cyl', K, [0, h / 2, 0], [0.05, h, 0.05]);
      return;
    }
    b.box([0, h, 0], [w, 0.06, d], K);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => b.box([x * (w / 2 - 0.06), h / 2, z * (d / 2 - 0.06)], [0.06, h, 0.06], K));
  });
}

export function solidChair(b: Batch, p: Vec3, r: R = 0) {
  b.at(p, r, () => {
    b.box([0, 0.45, 0], [0.46, 0.05, 0.44], K);
    b.box([0, 0.78, -0.2], [0.46, 0.6, 0.05], K);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => b.box([x * 0.2, 0.22, z * 0.19], [0.04, 0.45, 0.04], K));
  });
}

export function solidBed(b: Batch, p: Vec3, r: R = 0) {
  b.at(p, r, () => {
    b.box([0, 0.2, 0], [1.5, 0.3, 2.1], K); // frame + headboard; the mattress is soft (sleepers sink in)
    b.box([0, 0.65, -1.05], [1.5, 0.95, 0.08], K);
  });
}

export function solidSofa(b: Batch, p: Vec3, r: R = 0, w = 2.2) {
  b.at(p, r, () => {
    b.box([0, 0.2, 0], [w, 0.2, 0.92], K); // frame only: the seat cushions above it are soft (sitters sink in)
    b.box([0, 0.68, -0.36], [w, 0.66, 0.2], K);
    [-1, 1].forEach(sd => b.box([sd * (w / 2 - 0.11), 0.48, 0.02], [0.22, 0.42, 0.92], K));
  });
}

export function solidCar(b: Batch, p: Vec3, r: R = 0) {
  b.at(p, r, () => {
    b.box([0, 0.5, 0], [1.8, 0.55, 4.0], K);
    b.box([0, 0.98, -0.2], [1.6, 0.48, 2.1], K);
  });
}
