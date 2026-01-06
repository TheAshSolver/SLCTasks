"use client";

import { Children, useState } from "react";
import { usePathname } from "next/navigation";

import { Box, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import Icon from "components/Icon";
import ButtonLink from "components/Link";

export function isExternalLink(path) {
  return path.includes("http");
}

export function getActive(path, pathname) {
  if (path === "/") return pathname === path;
  path = path.split("?")[0];
  return pathname === path || pathname.startsWith(path + "/");
}

export function DrawerItem({ title, path, icon }) {
  const theme = useTheme();
  const pathname = usePathname();

  const active = getActive(path, pathname);
  const externalLink = isExternalLink(path);

  return (
    <ListItemButton
      component={ButtonLink}
      href={path}
      sx={{
        ...theme.typography.body2,
        position: "relative",
        height: 44,
        textTransform: "capitalize",
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1.5),
        marginBottom: theme.spacing(0.5),
        color: theme.palette.text.secondary,
        borderRadius: 1,
        // active
        ...(active && {
          ...theme.typography.subtitle2,
          color: theme.palette.accent,
          backgroundColor: alpha(
            theme.palette.accent,
            theme.palette.action.selectedOpacity,
          ),
        }),
      }}
      {...(externalLink
        ? {
            rel: "noopener noreferrer",
            target: "_blank",
          }
        : {})}
    >
      <ListItemIcon
        sx={{
          width: 22,
          height: 22,
          color: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon && icon}
      </ListItemIcon>
      <ListItemText
        disableTypography
        primary={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {title}
            {externalLink && <Icon variant="link" />}
          </Box>
        }
      />
    </ListItemButton>
  );
}

export function DrawerDropdown({ title, icon, children }) {
  const theme = useTheme();
  const pathname = usePathname();

  // Have to do this since children is not an array when only 1 children is present in the dropdown, https://react.dev/reference/react/Children#why-is-the-children-prop-not-always-an-array
  children = Children.toArray(children); //Without this the some() function down below will throw an error

  const active = children.some((child) =>
    getActive(child.props.path, pathname),
  );
  const [open, setOpen] = useState(active);

  return (
    <>
      <ListItemButton
        sx={{
          ...theme.typography.body2,
          position: "relative",
          height: 44,
          textTransform: "capitalize",
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(1.5),
          marginBottom: theme.spacing(0.5),
          color: theme.palette.text.secondary,
          borderRadius: 1,
          // active
          ...(active && {
            ...theme.typography.subtitle2,
            color: theme.palette.accent,
          }),
        }}
        onClick={() => setOpen(!open)}
      >
        <ListItemIcon
          sx={{
            width: 22,
            height: 22,
            color: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon && icon}
        </ListItemIcon>

        <ListItemText disableTypography primary={title} />

        <Box sx={{ flexGrow: 1 }} />

        <ListItemIcon
          sx={{
            width: 22,
            height: 22,
            color: "inherit",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Icon variant={open ? "expand-less" : "expand-more"} />
        </ListItemIcon>
      </ListItemButton>

      <Box sx={{ marginLeft: theme.spacing(1.5) }}>{open && children}</Box>
    </>
  );
}
