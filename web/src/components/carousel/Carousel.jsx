"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import Slider from "react-slick";

import { Box } from "@mui/material";
import { Card, CardContent, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import "slick-carousel/slick/slick.css";
import "./slick-theme.css";

export default function Carousel({ items, sx }) {
  const settings = {
    dots: false,
    lazyLoad: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipeToSlide: true,
    accessibility: true,
    fade: true,
  };

  return (
    <Card sx={sx}>
      <Slider {...settings}>
        {items.map((item, key) => (
          <CarouselItem key={key} item={item} />
        ))}
      </Slider>
    </Card>
  );
}

function CarouselItem({ item }) {
  const { image, title, description } = item;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [size, setSize] = useState("40%");
  useEffect(
    () => setSize(isDesktop ? "40%" : isMobile ? "120%" : "60%"),
    [isDesktop, isMobile],
  );

  return (
    <>
      <Box
        sx={{
          position: "relative",
          pt: size,
          "&:after": {
            top: 0,
            content: "''",
            width: "100%",
            height: "100%",
            position: "absolute",
            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.4),
          },
        }}
      >
        <Image
          priority
          placeholder="blur"
          alt={title}
          src={image}
          fill={true}
          style={{
            top: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
          }}
        />
      </Box>
      <CardContent
        sx={{
          px: isDesktop ? 4 : 2,
          py: isDesktop ? 4 : 2,
          bottom: 0,
          width: "100%",
          position: "absolute",
        }}
      >
        <Typography
          variant={isDesktop ? "h3" : "h4"}
          sx={{
            overflow: "hidden",
            WebkitLineClamp: 2,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            color: "common.white",
          }}
        >
          {title}
        </Typography>

        <Typography
          gutterBottom
          variant={isDesktop ? "h6" : "body2"}
          sx={{
            fontWeight: 400,
            color: "common.white",
            display: "flex",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </>
  );
}
