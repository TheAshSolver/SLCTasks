"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

import { Avatar } from "@mui/material";

import { getFile } from "utils/files";
import { getPlaceholder } from "utils/placeholder";

const GenAvatar = dynamic(async () => await import("react-nice-avatar"), {
  ssr: false,
});
import { genConfig } from "react-nice-avatar";

export default function UserImage({
  image,
  name,
  gender,
  width,
  height,
  style = {},
}) {
  const [img, setImg] = useState(getFile(image));

  return img ? (
    <Avatar
      sx={{
        width: width,
        height: height,
      }}
    >
      <Image
        alt={name}
        src={img}
        width={width + 300}
        height={height + 300}
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          ...style,
        }}
        onError={() =>
          setImg(getPlaceholder({ seed: name, w: width, h: height }))
        }
      />
    </Avatar>
  ) : (
    <div
      style={{
        minWidth: width,
      }}
    >
      <GenAvatar
        style={{
          width: width,
          height: height,
        }}
        {...genConfig({
          sex: gender?.toLowerCase() === "male" ? "man" : "woman",
        })}
      />
    </div>
  );
}
