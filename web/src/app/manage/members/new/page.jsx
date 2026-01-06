import { Container, Typography } from "@mui/material";

import MemberForm from "components/members/MemberForm";

export const metadata = {
  title: "New Member",
};

export default function NewMember() {
  // default form values
  const defaultValues = {
    cid: "",
    uid: "",
    poc: false,
    roles: [],
  };

  return (
    <Container>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          mb: 3,
        }}
      >
        Add a New Member
      </Typography>
      <MemberForm defaultValues={defaultValues} action="create" />
    </Container>
  );
}
