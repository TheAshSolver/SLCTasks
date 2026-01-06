import { Container, Typography } from "@mui/material";

import ClubForm from "components/clubs/ClubForm";

export const metadata = {
  title: "New Club",
};

export default function NewClub() {
  // default form values
  const defaultValues = {
    cid: "",
    name: "",
    email: "",
    category: "cultural",
    tagline: null,
    description: "",
    socials: {
      website: null,
      instagram: null,
      facebook: null,
      youtube: null,
      twitter: null,
      linkedin: null,
      discord: null,
      whatsapp: null,
    },
    logo: "",
    banner: "",
    bannerSquare: "",
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
        Create a New Club
      </Typography>
      <ClubForm defaultValues={defaultValues} action="create" />
    </Container>
  );
}
