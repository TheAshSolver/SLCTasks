import { Container } from "@mui/material";

import DataForm from "components/events/DataForm";

export const metadata = {
  title: "Download Events data",
};

export default function DownloadEventsData() {
  // default form values
  const defaultValues = {
    clubid: "",
    datetimeperiod: [null, null],
    allEvents: false,
  };

  return (
    <Container>
      <DataForm defaultValues={defaultValues} action="create" />
    </Container>
  );
}
