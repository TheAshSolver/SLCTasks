/*
/* COPY OF `src/app/clubs/[id]/page.jsx`
*/

import { permanentRedirect } from "next/navigation";

import Club from "app/clubs/[id]/page";
import { getClub } from "utils/fetchData";

export async function generateMetadata(props) {
  const params = await props.params;
  const { id } = params;

  const club = await getClub(id);
  if (club?.category != "body") return permanentRedirect(`/clubs/${id}`);

  return {
    title: club.name,
  };
}

export default async function StudentBody(props) {
  const params = await props.params;
  return Club({ params });
}
