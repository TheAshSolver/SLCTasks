"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Box,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import Icon from "components/Icon";
import ButtonLink from "components/Link";
import SLCTechLogo from "components/SLCTechLogo";
import LifeLogo from "components/svg/life-logo-full-color.svg";

const IIITLogo = "/assets/iiit-logo-white.png";

const PRIVACY_POLICY_URL = "https://www.iiit.ac.in/privacy-policy/";
const TWITTER_URL = "https://twitter.com/iiit_hyderabad";
const FACEBOOK_URL = "https://www.facebook.com/IIITH";
const INSTAGRAM_URL = "https://www.instagram.com/iiit.hyderabad/";
// const DISCORD_URL = "https://discord.gg/V8C7QSRtat";
const EMAIL_URL = "mailto:clubs@iiit.ac.in";
const IIIT_MAIN_URL = "https://www.iiit.ac.in/";

const socialsData = [
  {
    href: EMAIL_URL,
    icon: "akar-icons:envelope",
    ariaLabel: "Email Us",
  },
  // {
  //   href: DISCORD_URL,
  //   icon: "akar-icons:discord-fill",
  //   ariaLabel: "Join Discord",
  // },
  {
    href: TWITTER_URL,
    icon: "akar-icons:x-fill",
    ariaLabel: "Follow on Twitter",
  },
  {
    href: FACEBOOK_URL,
    icon: "akar-icons:facebook-fill",
    ariaLabel: "Check our Facebook",
  },
  {
    href: INSTAGRAM_URL,
    icon: "akar-icons:instagram-fill",
    ariaLabel: "Follow on Instagram",
  },
];

export default function Footer() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Divider sx={{ py: 4 }} />
      <Grid container sx={{ py: 5 }} spacing={2} justifyContent="space-between">
        <Grid
          display="flex"
          alignItems="center"
          justifyContent={isDesktop ? "flex-start" : "center"}
          size={{
            xs: 12,
            lg: "grow",
          }}
        >
          <Box sx={{ mr: 3 }}>
            <Link href={IIIT_MAIN_URL} target="_blank" rel="noreferrer">
              <Image
                src={IIITLogo}
                alt={"IIIT Hyderabad"}
                height={50}
                width={99}
                style={{
                  filter:
                    theme.palette.mode == "light" ? "invert(100%)" : "none",
                }}
              />
            </Link>
          </Box>
          <Box sx={{ mx: 3 }}>
            <div
              style={{
                color: theme.palette.mode === "light" ? "#000" : "#fff",
              }}
            >
              <LifeLogo alt="Life Logo" height={50} width={90} />
            </div>
          </Box>
          <Box>
            <SLCTechLogo height={40} width={150} />
          </Box>
        </Grid>
        <Grid
          display="flex"
          alignItems="center"
          justifyContent={isDesktop ? "flex-end" : "center"}
          size={{
            xs: 12,
            lg: "grow",
          }}
        >
          {socialsData.map((social, index) => (
            <IconButton
              key={index}
              component="a"
              target="_blank"
              rel="noreferrer"
              href={social.href}
              sx={{ mx: 1, color: "text.primary" }}
              aria-label={social.ariaLabel}
            >
              <Icon external variant={social.icon} />
            </IconButton>
          ))}
        </Grid>
      </Grid>
      {isDesktop ? (
        <Stack direction="row" spacing={1}>
          <Typography
            variant="body2"
            fontWeight={500}
            color={theme.palette.text.primary}
          >
            © 2021-{new Date().getFullYear()}, IIIT Hyderabad
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              textDecoration: "none",
              color: theme.palette.text.primary,
              // "&:hover": {
              //   textDecoration: "underline",
              // },
            }}
          >
            Developed & Maintained with ❤️ by{" "}
            <Typography
              variant="body2"
              component={ButtonLink}
              href={"/tech-team"}
              sx={{
                fontWeight: 500,
                textDecoration: "none",
                color: theme.palette.text.primary,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              SLC Tech Team
            </Typography>{" "}
            (An initiative by Clubs Council)
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Typography
            variant="body2"
            component={ButtonLink}
            href="/changelog"
            sx={{
              fontWeight: 600,
              textDecoration: "none",
              color: theme.palette.text.primary,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Changelog
          </Typography>
          <Box sx={{ mx: 1 }}>·</Box>
          <Typography
            variant="body2"
            component={ButtonLink}
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noreferrer"
            sx={{
              fontWeight: 600,
              textDecoration: "none",
              color: theme.palette.text.primary,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Privacy Policy
          </Typography>
        </Stack>
      ) : (
        <>
          <Grid
            display="flex"
            alignItems="center"
            justifyContent={"center"}
            sx={{ mb: isTablet ? 3 : 2 }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                textDecoration: "none",
                color: theme.palette.text.primary,
                // "&:hover": {
                //   textDecoration: "underline",
                // },
              }}
            >
              Developed & Maintained with ❤️ by{" "}
              <Typography
                variant="body2"
                component={ButtonLink}
                href={"/tech-team"}
                sx={{
                  fontWeight: 500,
                  textDecoration: "none",
                  color: theme.palette.text.primary,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                SLC Tech Team
              </Typography>{" "}
              (Initiative by Clubs Council)
            </Typography>
          </Grid>

          <Stack direction="row" spacing={1}>
            <Typography variant="body2" fontWeight={500}>
              © 2021-{new Date().getFullYear()}, IIIT Hyderabad
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <Typography
              variant="body2"
              component={ButtonLink}
              href="/changelog"
              sx={{
                fontWeight: 600,
                textDecoration: "none",
                color: theme.palette.text.primary,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Changelog
            </Typography>
            <Box sx={{ mx: 1 }}>·</Box>
            <Typography
              variant="body2"
              component={ButtonLink}
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noreferrer"
              sx={{
                fontWeight: 600,
                textDecoration: "none",
                color: theme.palette.text.primary,
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Privacy Policy
            </Typography>
          </Stack>
        </>
      )}
    </Box>
  );
}
