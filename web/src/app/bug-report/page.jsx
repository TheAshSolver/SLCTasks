import Link from "next/link";

import { Container, Typography } from "@mui/material";

export const metadata = {
  title: "Bug Report/Feature Request | Life @ IIIT-H",
};

export default async function BugReport() {
  return (
    <Container
      sx={{
        "& a": {
          color: "text.link",
        },
      }}
    >
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{
          mb: 3,
        }}
      >
        Bug Report & Feature Request
      </Typography>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mb: 3,
        }}
      >
        Bug Report
      </Typography>
      <Typography
        gutterBottom
        sx={{
          mb: 3,
        }}
      >
        We are sorry that you are facing issues with our platform. Please fill
        out any of the form below to help us understand the issue better, so
        that we can resolve it as soon as possible.
      </Typography>
      <Typography
        gutterBottom
        sx={{
          mb: 3,
        }}
      >
        You can report a bug using any of the following methods: (in order of
        preference)
      </Typography>
      <ul>
        <li>
          <Link
            href="https://help.iiit.ac.in/projects/web-administration/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            help.iiit.ac.in
          </Link>{" "}
          (Requires an IIIT email/account)
        </li>
        <li>
          <Link
            href="https://github.com/Clubs-Council-IIITH/web/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Issues
          </Link>{" "}
          (Requires a GitHub account)
        </li>
        <li>
          <Link
            href="https://forms.office.com/r/xs3v1sV7gX"
            target="_blank"
            rel="noreferrer"
          >
            Microsoft Form
          </Link>{" "}
          (Public)
        </li>
      </ul>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mb: 3,
        }}
      >
        Feature Request
      </Typography>
      <Typography
        gutterBottom
        sx={{
          mb: 3,
        }}
      >
        If you have any feature request, you can reach out to us using any of
        the following methods (not in any order):
      </Typography>
      <ul>
        <li>
          <Link
            href="https://github.com/Clubs-Council-IIITH/services/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Issues
          </Link>
        </li>
        <li>
          <Link
            href="https://forms.office.com/r/MTVxxp69Qr"
            target="_blank"
            rel="noreferrer"
          >
            Microsoft Form
          </Link>
        </li>
        {/* <li>
          Email:{" "}
          <Link href="mailto:clubs@iiit.ac.in" target="_blank" rel="noreferrer">
            clubs@iiit.ac.in
          </Link>
        </li> */}
        <li>
          Email:{" "}
          <Link
            href="mailto:webadmin@students.iiit.ac.in"
            target="_blank"
            rel="noreferrer"
          >
            webadmin@students.iiit.ac.in
          </Link>
        </li>
      </ul>
    </Container>
  );
}
