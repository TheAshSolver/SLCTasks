"use client";

import { useState } from "react";
import Image from "next/image";

import { Avatar } from "@mui/material";

import { getFile } from "utils/files";
import { getPlaceholder } from "utils/placeholder";

export default function ClubLogo({ name, logo, width, height, ...rest }) {
  const [img, setImg] = useState(
    logo ? getFile(logo) : getPlaceholder({ seed: name, w: width, h: height }),
  );

  return (
    <Avatar sx={{ width: width, height: height, ...rest }}>
      <Image
        alt={name}
        src={img}
        width={width + 50}
        height={height + 50}
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
        }}
        onError={() =>
          setImg(getPlaceholder({ seed: name, w: width, h: height }))
        }
      />
    </Avatar>
  );
}
