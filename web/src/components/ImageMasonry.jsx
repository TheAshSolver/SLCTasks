"use client";

import { useState } from "react";
import Image from "next/image";

import {
  Box,
  Card,
  CardActionArea,
  Grid,
  ImageList,
  ImageListItem,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ImageModal from "components/ImageModal";

export default function ImageMasonry({ images, limit = undefined, cols = 4 }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [openImage, setOpenImage] = useState(null);
  const [loadedImages, setLoadedImages] = useState(0);
  const totalImages = limit ? Math.min(images.length, limit) : images.length;

  const handleImageLoad = () => {
    setLoadedImages((prev) => prev + 1);
  };

  return (
    <>
      {loadedImages !== totalImages && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Grid container spacing={5} sx={{ width: "100%" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <Grid
                key={i}
                size={{
                  xs: 6,
                  lg: 3,
                }}
              >
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={0}
                  animation="wave"
                  sx={{
                    paddingTop: "75%",
                    borderRadius: 2,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      {loadedImages === totalImages && (
        <ImageList variant="masonry" cols={isDesktop ? cols : 2} gap={10}>
          {images.slice(0, limit).map((url, id) => {
            return (
              <ImageListItem key={id}>
                <Card
                  variant="outlined"
                  component="div"
                  sx={{
                    lineHeight: 0,
                    display: "block",
                    overflow: "hidden",
                    boxShadow: `0px 4px 6px ${theme.palette.primary.dark}80`,
                    "& .wrapper": {
                      width: 1,
                      height: 1,
                      backgroundSize: "cover !important",
                    },
                    margin: "1%",
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      setOpenImage(id);
                    }}
                    sx={{ lineHeight: 0 }}
                  >
                    <Image
                      src={url}
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
                  </CardActionArea>
                </Card>
              </ImageListItem>
            );
          })}
        </ImageList>
      )}
      <ImageModal
        images={images}
        id={openImage}
        onClose={() => setOpenImage(null)}
      />
      {/* Hidden Pre-loading for the images */}
      {images.slice(0, limit).map((url, i) => (
        <Image
          key={i}
          src={url}
          width={0}
          height={0}
          sizes="100vw"
          alt={`hidden-img-${i}`}
          onLoad={() => {
            handleImageLoad();
          }}
          priority={true}
          style={{ display: "none" }}
        />
      ))}
    </>
  );
}
