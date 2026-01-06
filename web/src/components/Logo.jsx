import { useTheme } from "@mui/material/styles";

import LifeLogo from "components/svg/life-logo-full-color.svg";

export default function Logo() {
  const theme = useTheme();
  const color = theme.palette.mode === "light" ? "#803db2" : "#1ec3bd";

  return (
    <div style={{ color }}>
      <LifeLogo width={140} height={60} alt="Life Logo" />
    </div>
  );
}
