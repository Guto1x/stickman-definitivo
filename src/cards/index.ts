// Card registry: full-frame 2D shots (IFOLOGY's navy "blueprint" explainers, title cards…).
// A card is a React component that draws the whole 1920×1080 frame for its shot.
// To add a card: build it in src/cards/<name>.tsx and register it here.
// Shared look (fonts, palette, navy background, gold text) lives in ./kit, line-art icons in ./icons
// (icon names: ICON_NAMES). All cards are pure functions of `t`.
import type React from 'react';
import { StatCard } from './stat';
import { CompareCard } from './compare';
import { DistanceCard } from './distance';
import { SpeedCard } from './speed';
import { ClockCard } from './clock';
import { ChainCard } from './chain';
import { RulesCard } from './rules';
import { IconCard, TitleCard } from './iconCard';

export type CardProps = {
  t: number; // seconds since the shot started
  dur: number; // shot duration in seconds
  spec: Record<string, unknown>; // the card shot's fields from episode.json (minus kind/vo/hold)
  W: number;
  H: number;
};

export type CardDef = {
  component: React.FC<CardProps>;
  description: string; // one line + the spec fields it reads, for Claude when writing episodes
  example: Record<string, unknown>; // a valid spec, used by CardLab and docs
};

export const CARDS: Record<string, CardDef> = {
  stat: {
    component: StatCard,
    description:
      'Big gold serif number counting up, unit beside it, gold rule, cream caps label; optional line-art icon on the left. ' +
      'Fields: value (number counts up; a string like "1/3" just pops), from? (count start, default 0), prefix? ("$"), unit? ("CALORIES"), ' +
      'label? (caps line under), decimals? (default: as written), icon? (icon name), countDur? (s, default ~1).',
    example: { value: 14000, unit: 'CALORIES', label: 'burned every single day', icon: 'heart' },
  },
  compare: {
    component: CompareCard,
    description:
      'NORMAL vs YOU: two rows, each a line-art figure + caps label + bar growing to its value; values count up at the bar tips and the winner turns gold and glows, then an "N× MORE" badge. ' +
      'Fields: left {label, value, unit?, icon?, display?, at?}, middle? (optional third row, same fields), right {…same}, at = reveal time (seconds or "@word"), unit? (shared), title?, lowerWins? (true for reaction times), ratio? (badge on/off, default true), ratioLabel? (default "MORE"; "FASTER" when lowerWins).',
    example: { title: 'TOP SPEED', unit: 'KM/H', left: { label: 'NORMAL', value: 25, icon: 'walk' }, right: { label: 'YOU', value: 250, icon: 'run' }, ratioLabel: 'FASTER' },
  },
  distance: {
    component: DistanceCard,
    description:
      'Line-art stick figure(s) on a ground line with a gold dimension arrow and "14 METERS" label. count>1 = a row of strides (chronophotography); count=1 measures to a target icon. ' +
      'Fields: value? (number, counts up), unit? (default "METERS"), label? (text instead of / under the number), count? (1–9, default 1), pose? (run|walk|stand|…, default run), ' +
      'target? (icon at the far end when count=1, default flag), time? (corner stopwatch with this caps text, e.g. "IN ONE STEP").',
    example: { value: 14, unit: 'METERS', count: 7, time: 'ONE SECOND' },
  },
  speed: {
    component: SpeedCard,
    description:
      'Line-art figure sprinting through flowing wind lines with afterimages, gold count-up speed and a spinning stopwatch. ' +
      'Fields: value (number) or label (text), unit? (default "KM/H"), from? (count start), label? (caps line under the number when value is set), stopwatch? (default true), cadence? (strides/s, default 2.4).',
    example: { value: 250, unit: 'KM/H', label: 'FASTER THAN A RACE CAR' },
  },
  clock: {
    component: ClockCard,
    description:
      'Big line-art clock; the gold second hand sweeps, then at `at` freezes (jolt, gold shock ring, background dust stops), slows ×12, races ×8, or just ticks. ' +
      'Fields: mode? (freeze|slow|fast|tick, default freeze), at? (s, default min(1.4, 40% of the shot)), label? (caps, appears at the change), labelAt? (s), value? (gold text beside the clock, e.g. "0.25 s"), speed? (°/s before the change, default 150), bar? (progress bar under the clock).',
    example: { mode: 'freeze', at: 1.2, label: 'TIME STOPS' },
  },
  chain: {
    component: ChainCard,
    description:
      'Cause→effect chain: 2–4 line-art icon nodes in circles joined by arrows; a gold pulse travels along and each node lights gold in turn, then pulses keep flowing. ' +
      'Fields: nodes ([{icon, label, value?}] or icon-name strings), title?, step? (s between nodes, default fits the shot).',
    example: { nodes: [{ icon: 'eye', label: 'EYES' }, { icon: 'brain', label: 'BRAIN' }, { icon: 'muscle', label: 'MUSCLES' }], title: 'REACTION TIME' },
  },
  rules: {
    component: RulesCard,
    description:
      '"RULE 1/2/3" list: rows slide in one by one, then the current rule gets a gold box and the others dim. ' +
      'Fields: rules (strings or {text, icon?}, max 6), current? (1-based rule to highlight, 0 = none), title?, prefix? (default "RULE"; e.g. "DAY", "STEP").',
    example: { title: 'THE RULES', rules: ['YOU CAN ONLY STOP TIME FOR 10 SECONDS', 'NOBODY CAN SEE YOU MOVE', 'EVERY USE COSTS YOU ENERGY'], current: 2 },
  },
  icon: {
    component: IconCard,
    description:
      'One big line-art icon drawing itself on over a soft gold glow, caps caption and optional gold sub-line. ' +
      'Fields: icon (name from cards/icons ICON_NAMES: stand run walk think jump sit cheer point fall eye brain clock stopwatch heart lightning house phone pill warning check cross arrow calendar globe muscle money flag question), caption?, sub?, size? (px, default 430).',
    example: { icon: 'brain', caption: 'YOUR BRAIN', sub: '20% OF YOUR ENERGY' },
  },
  title: {
    component: TitleCard,
    description:
      'IFOLOGY episode title: small cream serif line + big gold gradient serif line with a letter-pop and shimmer. ' +
      'Fields: big (e.g. "STOP TIME?"), small? ("WHAT IF YOU COULD"), bg? (default true = navy card; false = transparent, to lay over 3D), icon? (line-art icon above, navy only), ' +
      'pos? (top|center when bg=false, default top), size? (px), out? (animate out at the end; default true when bg=false).',
    example: { small: 'WHAT IF YOU COULD', big: 'STOP TIME?' },
  },
};
