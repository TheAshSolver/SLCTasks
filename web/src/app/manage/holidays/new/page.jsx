import { Container, Typography } from "@mui/material";

import HolidayForm from "components/holidays/HolidayForm";

export const metadata = {
  title: "New Holiday",
};

export default async function EditHoliday() {
  // default form values
  const defaultValues = {
    name: "",
    date: null,
    description: "",
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
        Create a New Holiday
      </Typography>
      <HolidayForm defaultValues={defaultValues} action="create" />
    </Container>
  );
}
