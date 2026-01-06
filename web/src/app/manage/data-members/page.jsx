import { Container, Typography } from "@mui/material";

import DataForm from "components/members/DataForm";

export const metadata = {
  title: "Download Members data",
};

export default function DownloadMembersData() {
  return (
    <Container>
      <DataForm action="create" />
    </Container>
  );
}
