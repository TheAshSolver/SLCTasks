"use client";

import Image from "next/image";

import { useTheme } from "@mui/material/styles";

const SLCTechLogoPath = "/assets/slc-tech-logo-black.png";

export default function SLCTechLogo({ height, width }) {
  const theme = useTheme();

  return (
    <Image
      src={SLCTechLogoPath}
      alt={"SLC-Tech Logo"}
      height={height}
      width={width}
      style={{
        filter: theme.palette.mode == "light" ? "none" : "invert(100%)",
      }}
    />
  );
}
