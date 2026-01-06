import { getClient } from "gql/client";
import { GET_HOLIDAYS } from "gql/queries/holidays";

import ManageHolidaysClient from "components/holidays/ManageHolidaysClient";

export const metadata = {
  title: "Manage Holidays",
};

export default async function ManageHolidays() {
  const { data: { holidays } = {} } = await getClient().query(GET_HOLIDAYS);

  return <ManageHolidaysClient holidays={holidays} />;
}
