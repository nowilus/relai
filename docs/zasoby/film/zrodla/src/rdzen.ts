// The one door from the film to core/panel: read-only imports, no copy (plan FILM_PREZENTACYJNY,
// case b1). The panel plugins sync byte copies of these files; the film reads the source itself.
export {
  ROOT, BAND, BAR, BATTERY, mix, leftColor,
  THEME, DIFF, NAMES, FEATURED, GROUPS, COST_COLORS, FLOW, iconName,
} from '../../../../../core/panel/theme.mjs';
