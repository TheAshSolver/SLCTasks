import Link from "next/link";

import { Box, Button, Grid, Stack, Typography } from "@mui/material";

import Gallery from "app/gallery/page";
import Carousel from "components/carousel/Carousel";
import EventsGrid from "components/events/EventsGrid";
import Icon from "components/Icon";
import ButtonLink from "components/Link";
import Statistic from "components/Statistic";

// carousel images
import carousel1 from "assets/carousel/1.jpg";
// import carousel2 from "assets/carousel/2.jpg";
import carousel3 from "assets/carousel/3.jpg";
import carousel4 from "assets/carousel/4.jpg";
import carousel5 from "assets/carousel/5.jpg";
import carousel6 from "assets/carousel/6.jpg";
import carousel7 from "assets/carousel/7.jpg";
import carousel8 from "assets/carousel/8.jpg";
import carousel9 from "assets/carousel/9.webp";
import carousel10 from "assets/carousel/10.jpg";
// import carousel11 from "assets/carousel/11.jpg";
import carousel12 from "assets/carousel/12.jpg";

export const metadata = {
  title: "Home | Life @ IIIT-H",
};

export default function Home() {
  return (
    <Box>
      <Carousel items={carouselItems} sx={{ mb: 3 }} />
      <Stack
        direction="row"
        sx={{
          pt: 2,
          mb: 2,
        }}
      >
        <Typography variant="h4">Upcoming & Recent Events</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            variant="none"
            color="secondary"
            component={ButtonLink}
            href="/events"
          >
            <Typography
              variant="button"
              sx={{
                color: "text.primary",
              }}
            >
              View all
            </Typography>
            <Icon variant="chevron-right" />
          </Button>
        </Box>
      </Stack>
      <EventsGrid type="recent" limit={4} />
      <Typography variant="h3" sx={{ mb: 2, mt: 4 }}>
        Life @ IIITH
      </Typography>
      <Typography variant="body">
        IIIT H is where bright, committed, innovative people congregate to
        learn, live, play and work. Diverse in every sense of the word, our
        community is a fertile breeding ground for opportunity in the heart of
        one of the leading tech hubs of the country. &quot;Work hard and play
        harder&quot; is our unofficial motto and students choose their own
        extracurricular pursuits, from a jaw dropping cauldron of ways to
        participate in music, dance, sports, quizzes, etc.
      </Typography>
      <Box
        sx={{
          my: 3,
        }}
      >
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <Link href="/student-bodies" style={{ textDecoration: "none" }}>
              <Statistic
                color="warning"
                icon="diversity-3-rounded"
                total={13}
                title="Student Bodies"
                sx={{ height: 200, p: 3 }}
              />
            </Link>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <Link href="/clubs" style={{ textDecoration: "none" }}>
              <Statistic
                color="info"
                icon="nightlife-rounded"
                total={"25+"}
                title="Clubs & Affinity Groups"
                sx={{ height: 200, p: 3 }}
              />
            </Link>
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          my: 3,
        }}
      >
        <Stack
          direction="row"
          sx={{
            pt: 2,
          }}
        >
          <Typography variant="h4">Gallery</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Button
              variant="none"
              color="secondary"
              component={ButtonLink}
              href={"/gallery"}
            >
              <Typography
                variant="button"
                sx={{
                  color: "text.primary",
                }}
              >
                View more
              </Typography>
              <Icon variant="chevron-right" />
            </Button>
          </Box>
        </Stack>
        <Gallery limit={8} />
      </Box>
    </Box>
  );
}

const carouselItems = [
  {
    image: carousel1,
    title: "Clubs at IIIT",
    description: "Explore your student life beyond the classroom.",
  },
  {
    image: carousel12,
    title: "Experience IIIT",
    description: "Expand your mind, explore your passion.",
  },
  {
    image: carousel3,
    title: "Success Stories",
    description: "Witness legends in the making.",
  },
  {
    image: carousel4,
    title: "Perform Together",
    description: "Let the beat take over.",
  },
  {
    image: carousel6,
    title: "Connect IIIT",
    description: "Come together to learn, work, live and play.",
  },
  {
    image: carousel5,
    title: "Campus Life",
    description: "A vibrant residential community.",
  },
  {
    image: carousel7,
    title: "Artistry",
    description: "Unleash your creativity.",
  },
  {
    image: carousel8,
    title: "Challengers",
    description: "Up the potential for fun.",
  },
  {
    image: carousel9,
    title: "Unrestricted Fun!",
    description: "Join in on fun events!",
  },
  {
    image: carousel10,
    title: "Life at IIIT",
    description: "Eat. Sleep. Code? Not Quite.",
  },
];
