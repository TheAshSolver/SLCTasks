"use client";

import Image from "next/image";

import { Box, Modal } from "@mui/material";

export default function ImageModal({ images, id = null, onClose = () => {} }) {
  return (
    <Modal
      open={id !== null}
      onClose={() => onClose()}
      sx={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <Box
        component="div"
        sx={{
          lineHeight: 0,
          display: "block",
          overflow: "hidden",
          "& .wrapper": {
            width: 1,
            height: 1,
            backgroundSize: "cover !important",
          },
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Image
          src={images[id]}
          width={0}
          height={0}
          sizes="100vw"
          alt={`Gallery Image ${id}`}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "100vh",
            maxWidth: "100vw",
          }}
        />
      </Box>
    </Modal>
  );
}
