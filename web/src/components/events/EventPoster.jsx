"use client";

import { useState } from "react";
import Image from "next/image";

import { getFile } from "utils/files";
import { getPlaceholder } from "utils/placeholder";

export default function EventPoster({ name, poster, width, height, style }) {
  const [img, setImg] = useState(
    poster
      ? getFile(poster)
      : getPlaceholder({ seed: name, w: width, h: height }),
  );

  return (
    <Image
      alt={name}
      src={img}
      width={width}
      height={height}
      style={{
        top: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        position: "absolute",
        ...style,
      }}
      onError={() =>
        setImg(getPlaceholder({ seed: name, w: width, h: height }))
      }
      priority={true}
    />
  );
}
