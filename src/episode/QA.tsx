// QA compositions: their calculateMetadata runs the scene audit / engine self-tests and returns the
// results as props, which tools/qa.cjs reads (no frames are rendered).
import React from 'react';
import { AbsoluteFill, type CalculateMetadataFunction, staticFile } from 'remotion';
import type { Episode, Timing } from '../types';
import { auditEpisode, formatReport, type AuditReport } from './audit';
import { runSelfTests, type TestResult } from './selftest';

export type AuditProps = { slug: string; report?: AuditReport; text?: string };
export type SelfTestProps = { results?: TestResult[] };

export const AuditView: React.FC<AuditProps> = () => <AbsoluteFill style={{ background: '#111' }} />;
export const SelfTestView: React.FC<SelfTestProps> = () => <AbsoluteFill style={{ background: '#111' }} />;

export const calcAudit: CalculateMetadataFunction<AuditProps> = async ({ props }) => {
  const base = `episodes/${props.slug}`;
  const ep: Episode = await fetch(staticFile(`${base}/episode.json`)).then(r => r.json());
  const timing: Timing = await fetch(staticFile(`${base}/timing.json`)).then(r => r.json());
  const report = auditEpisode(ep, timing);
  return { durationInFrames: 1, props: { ...props, report, text: formatReport(report, props.slug) } };
};

export const calcSelfTest: CalculateMetadataFunction<SelfTestProps> = async ({ props }) => ({ durationInFrames: 1, props: { ...props, results: runSelfTests() } });
