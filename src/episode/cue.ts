// Word cues: any effect time can be a number (seconds into the shot) or "@word", "@word#2",
// "@word+0.15" — resolved against the aligned narration so effects land on the spoken word.
export type Words = [string, number][] | undefined;

export function cue(spec: number | string | undefined, words: Words, fallback = 0): number {
  if (spec === undefined) return fallback;
  if (typeof spec === 'number') return spec;
  const m = /^@([\p{L}\p{N}']+)(?:#(\d+))?([+-][\d.]+)?$/iu.exec(spec.trim());
  if (!m) return fallback;
  const word = m[1].toLowerCase(), nth = m[2] ? parseInt(m[2], 10) : 1, off = m[3] ? parseFloat(m[3]) : 0;
  const hits = (words || []).filter(([w]) => w === word);
  const hit = hits[nth - 1] || hits[hits.length - 1];
  return hit ? hit[1] + off : fallback;
}
