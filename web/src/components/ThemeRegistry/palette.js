"use client";

import { alpha } from "@mui/material/styles";

function createGradient(color1, color2) {
  return `linear-gradient(to bottom, ${color1}, ${color2})`;
}

// SETUP COLORS
const PRIMARY_LIGHT = {
  lighter: "#b39ddb",
  light: "#7e57c2",
  main: "#803DB2",
  dark: "#5e35b1",
  darker: "#63358b",
};
const PRIMARY_DARK = {
  lighter: "#25fff8",
  light: "#53ece4",
  main: "#1EC3BD",
  dark: "#076676",
  darker: "#1F4D5D",
};
const SECONDARY_LIGHT = {
  lighter: "#C4CDD5",
  light: "#919EAB",
  main: "#637381",
  dark: "#454F5B",
  darker: "#212B36",
};
const SECONDARY_DARK = {
  darker: "#C4CDD5",
  dark: "#919EAB",
  main: "#637381",
  light: "#454F5B",
  lighter: "#212B36",
};
const INFO = {
  lighter: "#D0F2FF",
  light: "#74CAFF",
  main: "#1890FF",
  dark: "#0C53B7",
  darker: "#04297A",
};
const SUCCESS = {
  lighter: "#E9FCD4",
  light: "#AAF27F",
  main: "#54D62C",
  dark: "#229A16",
  darker: "#08660D",
};
const WARNING = {
  lighter: "#FFF7CD",
  light: "#FFE16A",
  main: "#FFC107",
  dark: "#B78103",
  darker: "#7A4F01",
};
const ERROR = {
  lighter: "#FFE7D9",
  light: "#FFA48D",
  main: "#FF4842",
  dark: "#B72136",
  darker: "#7A0C2E",
};

const GREY = {
  0: "#FFFFFF",
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#1e1e1e",
  900: "#111111",
  500_8: alpha("#919EAB", 0.08),
  500_12: alpha("#919EAB", 0.12),
  500_16: alpha("#919EAB", 0.16),
  500_24: alpha("#919EAB", 0.24),
  500_32: alpha("#919EAB", 0.32),
  500_48: alpha("#919EAB", 0.48),
  500_56: alpha("#919EAB", 0.56),
  500_80: alpha("#919EAB", 0.8),
};

const GRADIENTS = {
  primary: createGradient(PRIMARY_LIGHT.light, PRIMARY_DARK.main), // TODO: define PRIMARY_DARK palette
  info: createGradient(INFO.light, INFO.main),
  success: createGradient(SUCCESS.light, SUCCESS.main),
  warning: createGradient(WARNING.light, WARNING.main),
  error: createGradient(ERROR.light, ERROR.main),
};

const CHART_COLORS = {
  violet: ["#826AF9", "#9E86FF", "#D0AEFF", "#F7D2FF"],
  blue: ["#2D99FF", "#83CFFF", "#A5F3FF", "#CCFAFF"],
  green: ["#2CD9C5", "#60F1C8", "#A4F7CC", "#C0F2DC"],
  yellow: ["#FFE700", "#FFEF5A", "#FFF7AE", "#FFF3D6"],
  red: ["#FF6C40", "#FF8F6D", "#FFBD98", "#FFF2D4"],
};

const COMMON = {
  common: { black: "#000", white: "#fff" },
  info: { ...INFO, contrastText: "#fff" },
  success: { ...SUCCESS, contrastText: GREY[800] },
  warning: { ...WARNING, contrastText: GREY[800] },
  error: { ...ERROR, contrastText: "#fff" },
  grey: GREY,
  gradients: GRADIENTS,
  chart: CHART_COLORS,
  divider: GREY[500_24],
  action: {
    hover: GREY[500_8],
    selected: GREY[500_16],
    disabled: GREY[600],
    disabledBackground: GREY[500_24],
    focus: GREY[500_24],
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};

const palette = {
  light: {
    ...COMMON,
    primary: { ...PRIMARY_LIGHT, contrastText: "#fff" },
    secondary: { ...SECONDARY_LIGHT, contrastText: "#fff" },
    mode: "light",
    text: {
      primary: GREY[800],
      secondary: GREY[600],
      disabled: alpha(GREY[600], 0.7),
      link: "#0a12ab",
    },
    background: {
      paper: "#fff",
      default: "#fdfdfd",
      neutral: GREY[300],
      error: "#ffd9d9",
    },
    action: { active: GREY[600], ...COMMON.action },
    accent: PRIMARY_LIGHT.main,
  },
  dark: {
    ...COMMON,
    primary: { ...PRIMARY_DARK, contrastText: GREY[800] },
    secondary: { ...SECONDARY_DARK, contrastText: GREY[800] },
    mode: "dark",
    text: {
      primary: GREY[200],
      secondary: GREY[400],
      disabled: alpha(GREY[400], 0.85),
      link: "#11a1fb",
    },
    background: {
      paper: "#101010",
      default: "#1e1e1e",
      neutral: GREY[600],
      error: "#f66161",
    },
    action: { active: GREY[400], hover: GREY[500_48], ...COMMON.action },
    accent: PRIMARY_DARK.main,
    divider: GREY[500_48],
  },
};

export default palette;
