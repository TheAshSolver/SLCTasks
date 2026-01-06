"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  AppBar,
  Box,
  Drawer as MUIDrawer,
  IconButton,
  List,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";

import { useMode } from "contexts/ModeContext";

import { useAuth } from "components/AuthProvider";
import { DrawerDropdown, DrawerItem } from "components/DrawerItem";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Logo from "components/Logo";
import { ModeSwitch } from "components/ModeSwitch";
import AccountPopover from "components/profile/AccountPopover";
import ScrollbarWrapper from "components/ScrollbarWrapper";
import { bgBlur } from "utils/cssStyles";

// define top bar width
const BAR_HEIGHT_MOBILE = 64;
const BAR_HEIGHT_DESKTOP = 85;

// define navigation drawer width
const DRAWER_WIDTH = 280;

// bug report external link
export const BUG_REPORT_URL =
  "https://help.iiit.ac.in/projects/web-administration/issues/new";

function Bar({ onOpenDrawer }) {
  const theme = useTheme();
  const { isDark, setMode } = useMode(); // Accessing isDark and setMode from ModeContext

  const handleChange = () => {
    // handleupdate();
    setMode(!isDark); // Toggle the mode
  };

  return (
    <AppBar
      sx={{
        ...bgBlur({ color: theme.palette.background.default }),
        boxShadow: "none",
        [theme.breakpoints.up("lg")]: {
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: BAR_HEIGHT_MOBILE,
          [theme.breakpoints.up("lg")]: {
            minHeight: BAR_HEIGHT_DESKTOP,
            padding: theme.spacing(0, 5),
          },
        }}
      >
        <IconButton
          onClick={onOpenDrawer}
          sx={{
            mr: 1,
            color: "text.primary",
            display: { lg: "none" },
          }}
          aria-label="Open Menu Drawer"
        >
          <Icon variant="menu-rounded" />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          spacing={{
            xs: 1,
            sm: 1.5,
          }}
          sx={{
            alignItems: "center",
          }}
        >
          <ModeSwitch
            checked={isDark}
            onChange={handleChange}
            slotProps={{ input: { "aria-label": "Toggle dark mode" } }}
          />
          <AccountPopover />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

function Drawer({ drawerOpen, onCloseDrawer }) {
  const theme = useTheme();
  const pathname = usePathname();
  const { user } = useAuth();

  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    if (drawerOpen) onCloseDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // nav items that everybody can see
  const publicItems = (
    <List
      disablePadding
      sx={{ p: 1, pb: ["slo", "cc", "club"].includes(user.role) ? 0 : 1 }}
    >
      <DrawerItem
        title="home"
        path="/"
        icon={<Icon variant="home-outline-rounded" />}
      />
      <DrawerDropdown
        title="clubs council"
        icon={<EmojiEventsOutlinedIcon sx={{ width: 20, height: 20 }} />}
      >
        <DrawerItem
          title="clubs"
          path="/clubs"
          icon={<Icon variant="explore-outline-rounded" />}
        />
        <DrawerItem
          title="About CC"
          path="/clubs-council"
          icon={<Icon variant="admin-panel-settings-outline-rounded" />}
        />
      </DrawerDropdown>
      <DrawerItem
        title="student bodies"
        path="/student-bodies"
        icon={<Icon variant="groups-3-outline-rounded" />}
      />
      <DrawerDropdown
        title="events"
        icon={<Icon variant="local-activity-outline-rounded" />}
      >
        <DrawerItem
          title="list of events"
          path="/events"
          icon={<Icon variant="list-alt-outline-rounded" />}
        />
        <DrawerItem
          title="calendar"
          path="/calendar"
          icon={<Icon variant="calendar-month-outline-rounded" />}
        />
      </DrawerDropdown>
      <DrawerItem
        title="gallery"
        path="/gallery"
        icon={<Icon variant="gallery-thumbnail-outline-rounded" />}
      />
    </List>
  );

  const manageEventItems = (
    <DrawerDropdown
      title="events"
      icon={<Icon variant="local-activity-outline-rounded" />}
    >
      <DrawerItem
        title="Events List/Status"
        path="/manage/events"
        icon={<Icon variant="beenhere-outline-rounded" />}
      />
      <DrawerItem
        title="Data Download"
        path="/manage/data-events"
        icon={<Icon variant="sim-card-download-outline-rounded" />}
      />
      <DrawerItem
        title="Finances"
        path="/manage/finances"
        icon={<Icon variant="receipt-long-outline-rounded" />}
      />
    </DrawerDropdown>
  );

  //nav dropdown for member managment
  const manageMemberItems = (
    <DrawerDropdown
      title="members"
      // TODO: Change icon for this
      icon={<Icon variant="group-outline-rounded" />}
    >
      <DrawerItem
        title="Members List"
        path="/manage/members"
        icon={<Icon variant="group-outline-rounded" />}
      />
      <DrawerItem
        title="Data Download"
        path="/manage/data-members"
        icon={<Icon variant="sim-card-download-outline-rounded" />}
      />
    </DrawerDropdown>
  );

  // nav items that only club accounts can see
  const clubItems = (
    <List disablePadding sx={{ p: 1 }}>
      <Box
        sx={{
          px: 4,
        }}
      >
        <Typography variant="overline">Manage</Typography>
      </Box>
      <DrawerItem
        title="club/Student Body"
        path="/manage/clubs"
        icon={<Icon variant="explore-outline-rounded" />}
      />
      {manageEventItems}
      {manageMemberItems}
    </List>
  );

  // nav items that only CC can see
  const ccItems = (
    <List disablePadding sx={{ p: 1 }}>
      <Box
        sx={{
          px: 4,
        }}
      >
        <Typography variant="overline">Manage</Typography>
      </Box>
      <DrawerItem
        title="clubs & bodies"
        path="/manage/clubs"
        icon={<Icon variant="explore-outline-rounded" />}
      />
      {manageEventItems}
      <DrawerItem
        title="Holidays"
        path="/manage/holidays"
        icon={<Icon variant="event-busy-outline-rounded" />}
      />
      {manageMemberItems}
    </List>
  );

  const privilegedItems = (
    <List disablePadding sx={{ p: 1, pt: 0 }}>
      <DrawerItem
        title="Important Docs"
        path="/docs"
        icon={<Icon variant="article-outline-rounded" />}
      />
    </List>
  );

  // nav items that only SLC can see
  const SLCItems = (
    <List disablePadding sx={{ p: 1 }}>
      <Box
        sx={{
          px: 4,
        }}
      >
        <Typography variant="overline">Manage</Typography>
      </Box>
      <DrawerDropdown
        title="events"
        icon={<Icon variant="local-activity-outline-rounded" />}
      >
        <DrawerItem
          title="Events List/Status"
          path="/manage/events"
          icon={<Icon variant="beenhere-outline-rounded" />}
        />
        <DrawerItem
          title="Data Download"
          path="/manage/data-events"
          icon={<Icon variant="sim-card-download-outline-rounded" />}
        />
      </DrawerDropdown>
    </List>
  );

  // nav items that only SLO can see
  const SLOItems = (
    <List disablePadding sx={{ p: 1, pt: 1 }}>
      <Box
        sx={{
          px: 4,
        }}
      >
        <Typography variant="overline">Manage</Typography>
      </Box>
      {manageEventItems}
      <DrawerItem
        title="Holidays"
        path="/manage/holidays"
        icon={<Icon variant="event-busy-outline-rounded" />}
      />
      <DrawerDropdown
        title="members"
        // TODO: Change icon for this
        icon={<Icon variant="group-outline-rounded" />}
      >
        <DrawerItem
          title="Data Download"
          path="/manage/data-members"
          icon={<Icon variant="sim-card-download-outline-rounded" />}
        />
      </DrawerDropdown>
    </List>
  );

  // nav items with about info that everybody can see
  const aboutItems = (
    <List disablePadding sx={{ p: 1, pt: 1 }}>
      <Box
        sx={{
          px: 4,
        }}
      >
        <Typography variant="overline">About</Typography>
      </Box>
      <DrawerItem
        title="supervisory bodies"
        path="/supervisory-bodies"
        icon={<Icon variant="info-outline-rounded" />}
      />
      <DrawerItem
        title="SLC Tech Team"
        path="/tech-team"
        icon={<Icon variant="laptop-chromebook-outline-rounded" />}
      />
    </List>
  );

  // nav items with help info that everybody can see
  const helpItems = (
    <List disablePadding sx={{ p: 1, pt: 1 }}>
      <Box
        sx={{
          px: 4,
        }}
      >
        <Typography variant="overline">Help</Typography>
      </Box>
      <DrawerItem
        title="Report Bugs & Features"
        path="/bug-report"
        icon={<Icon variant="bug-report-outline-rounded" />}
      />
    </List>
  );

  const drawerContent = (
    <ScrollbarWrapper hideScrollbar={true}>
      <Box sx={{ px: 2.5, py: 3, display: "inline-flex" }}>
        <Logo />
      </Box>
      {publicItems}
      {["slo", "cc", "club"].includes(user.role) ? privilegedItems : null}
      {["club"].includes(user.role) ? clubItems : null}
      {["cc"].includes(user.role) ? ccItems : null}
      {["slc"].includes(user.role) ? SLCItems : null}
      {["slo"].includes(user.role) ? SLOItems : null}
      {aboutItems}
      {helpItems}
      <Box sx={{ flexGrow: 1 }} />
    </ScrollbarWrapper>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: DRAWER_WIDTH },
      }}
    >
      {isDesktop ? (
        <MUIDrawer
          open
          variant="permanent"
          slotProps={{
            paper: {
              sx: {
                width: DRAWER_WIDTH,
                bgcolor: "background.default",
                borderRightStyle: "dashed",
              },
            },
          }}
        >
          {drawerContent}
        </MUIDrawer>
      ) : (
        <MUIDrawer
          open={drawerOpen}
          onClose={onCloseDrawer}
          ModalProps={{
            keepMounted: true,
          }}
          slotProps={{
            paper: {
              sx: { width: DRAWER_WIDTH },
            },
          }}
        >
          {drawerContent}
        </MUIDrawer>
      )}
    </Box>
  );
}

export function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Bar onOpenDrawer={() => setDrawerOpen(true)} />
      <Drawer
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
      />
    </>
  );
}

export function Content({ children }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <ScrollbarWrapper scrollbarColor={theme.palette.primary.main}>
      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          display: "flex",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Box
          component="main"
          sx={{
            overflow: "auto",
            width: "100%",
            paddingTop: `${BAR_HEIGHT_MOBILE}px`,
            paddingBottom: theme.spacing(5),
            [theme.breakpoints.up("lg")]: {
              paddingTop: `${BAR_HEIGHT_DESKTOP}px`,
              paddingLeft: `${DRAWER_WIDTH}px`,
              paddingRight: theme.spacing(2),
            },
          }}
        >
          <Box
            sx={{
              px: isDesktop ? 4 : 2,
            }}
          >
            {children}
            <Footer />
          </Box>
        </Box>
      </Box>
    </ScrollbarWrapper>
  );
}
