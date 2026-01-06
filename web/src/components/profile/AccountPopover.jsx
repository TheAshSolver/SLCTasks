// AccountPopover.js

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Avatar,
  Box,
  Button,
  ClickAwayListener,
  Divider,
  Fade,
  IconButton,
  MenuItem,
  Popper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import { useMode2 } from "contexts/ModeContext";

import { useAuth } from "components/AuthProvider";
import Icon from "components/Icon";
import ButtonLink from "components/Link";
import LoginLogo from "components/svg/login.svg";
import { login, logout } from "utils/auth";
import { getFile } from "utils/files";

export default function AccountPopover() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { isiframe } = useMode2();
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

  const handleToggle = (event) => {
    setOpen((prev) => (prev ? null : event.currentTarget));
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const AUTHENTICATED_MENU_OPTIONS = [
    {
      label: "Profile",
      icon: "person",
      url: "/profile",
    },
  ];

  if (isiframe) return null;

  if (!isAuthenticated) {
    return (
      <Tooltip title={"Login"} placement="bottom" enterDelay={300}>
        <Button
          onClick={() => login(pathname)}
          sx={{
            borderRadius: "100%",
            px: 1.5,
            pt: 1.25,
            pb: 0.75,
            minWidth: "auto",
            bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.5),
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.8),
            },
          }}
        >
          <div
            style={{
              color: theme.palette.mode === "light" ? "#000" : "#fff",
            }}
          >
            <LoginLogo alt="Login" height={20} width={20} />
          </div>
        </Button>
      </Tooltip>
    );
  }

  return (
    <>
      <IconButton
        onClick={handleToggle}
        aria-label="Account Popover"
        sx={{
          color: "white",
          ...(open && {
            "&:before": {
              content: "''",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.5),
            },
          }),
          ...(!open && {
            // "&:after": {
            "&:before": {
              content: "''",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.1),
            },
            // },
          }),
        }}
      >
        <Avatar
          width={40}
          height={40}
          {...(user?.firstName && {
            children: `${user?.firstName?.[0]}${
              user?.lastName == "" ? "" : user?.lastName?.[0]
            }`,
          })}
        >
          {user?.img ? (
            <Image
              alt={user?.firstName}
              src={getFile(user?.img)}
              width={400}
              height={400}
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
              }}
            />
          ) : user?.firstName ? (
            `${user?.firstName?.[0]}${
              user?.lastName === "" ? "" : user?.lastName?.[0]
            }`
          ) : null}
        </Avatar>
      </IconButton>

      {open && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <Popper
            open={Boolean(open)}
            anchorEl={open}
            transition
            sx={{ zIndex: theme.zIndex.modal }}
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps}>
                <Box
                  sx={{
                    borderRadius: 1,
                    px: 1,
                    pb: 0.5,
                    pt: 1.5,
                    bgcolor: "background.paper",
                    minWidth: 200,
                    mr: 1,
                    boxShadow:
                      "2px 2px 5px rgba(0, 0, 0, 0.125), -2px -2px 5px rgba(0, 0, 0, 0.01)",
                  }}
                >
                  <Stack sx={{ my: 1.5, px: 1.5 }}>
                    <Typography variant="subtitle2" noWrap>
                      {`${user?.firstName} ${user?.lastName}`}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                      noWrap
                    >
                      {user?.email}
                    </Typography>
                  </Stack>

                  {[...AUTHENTICATED_MENU_OPTIONS].length > 0 ? (
                    <>
                      <Divider sx={{ borderStyle: "dashed" }} />

                      <Stack sx={{ p: 1 }}>
                        {[...AUTHENTICATED_MENU_OPTIONS].map((option) => (
                          <MenuItem
                            component={ButtonLink}
                            key={option.label}
                            href={option.url}
                            sx={{
                              ml: 0,
                            }}
                          >
                            <Icon
                              variant={option.icon}
                              sx={{ mr: 2, ml: -1 }}
                            />
                            <Typography variant="body2">
                              {option.label}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Stack>
                    </>
                  ) : null}

                  <Divider sx={{ borderStyle: "dashed" }} />

                  <MenuItem
                    onClick={() => logout(pathname)}
                    sx={{ m: 1, ml: 0 }}
                  >
                    <Typography variant="body2">Logout</Typography>
                  </MenuItem>
                </Box>
              </Fade>
            )}
          </Popper>
        </ClickAwayListener>
      )}
    </>
  );
}
