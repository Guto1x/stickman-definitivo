import { Config } from '@remotion/cli/config';

// GPU WebGL through ANGLE (Windows); lossless PNG frames so the final encode is the only lossy step.
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(14);
Config.setOverwriteOutput(true);
