import React from 'react';
import { Composition } from 'remotion';
import { CharacterLab } from './Lab';
import { CardLab, SetLab } from './RegistryLab';
import { PillSprint, PILL_SPRINT_SECONDS } from './demo/PillSprint';
import { calculateEpisodeMetadata, Episode } from './episode/Episode';
import { Thumbnail } from './Thumbnail';
import { AuditView, calcAudit, calcSelfTest, SelfTestView } from './episode/QA';

export const Root: React.FC = () => (
  <>
    <Composition id="CharacterLab" component={CharacterLab} width={1920} height={1080} fps={30} durationInFrames={90} defaultProps={{ view: 'full' as const, pose: 'stand', face: 'smile' }} />
    <Composition id="SetLab" component={SetLab} width={1920} height={1080} fps={30} durationInFrames={90} defaultProps={{ set: 'suburb' }} />
    <Composition id="CardLab" component={CardLab} width={1920} height={1080} fps={30} durationInFrames={150} defaultProps={{ card: 'stat' }} />
    <Composition id="Episode" component={Episode} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{ slug: 'pipetest' }} calculateMetadata={calculateEpisodeMetadata} />
    <Composition id="Thumbnail" component={Thumbnail} width={1280} height={720} fps={30} durationInFrames={1} defaultProps={{}} />
    <Composition id="Audit" component={AuditView} width={320} height={180} fps={30} durationInFrames={1} defaultProps={{ slug: 'pipetest' }} calculateMetadata={calcAudit} />
    <Composition id="SelfTest" component={SelfTestView} width={320} height={180} fps={30} durationInFrames={1} defaultProps={{}} calculateMetadata={calcSelfTest} />
    <Composition id="PillSprint" component={PillSprint} width={1920} height={1080} fps={30} durationInFrames={Math.round(PILL_SPRINT_SECONDS * 30)} />
  </>
);
