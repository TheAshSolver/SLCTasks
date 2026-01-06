import { notFound } from "next/navigation";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";

import BulkEditForm from "components/members/BulkEditForm";

export const metadata = {
  title: "Bulk Add",
};

export default async function BulkEditPage() {
  const { data: { userMeta } = {} } = await getClient().query(GET_USER, {
    userInput: null,
  });
  const user = userMeta;

  if (user?.role !== "cc" && user?.role !== "club") {
    notFound();
  }

  return <BulkEditForm mode="add" />;
}
