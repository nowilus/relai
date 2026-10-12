// Remotion CLI settings of the RelAI film (plan FILM_PREZENTACYJNY). Frames as PNG: the bars are
// small text on flat color, which JPEG smears.
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setEntryPoint('./src/index.ts');
