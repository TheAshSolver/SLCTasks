import { Container, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_ALL_RECRUITMENTS } from "gql/queries/recruitment";
import { GET_USER_PROFILE } from "gql/queries/users";

import CCRecruitmentsTable from "components/cc-recruitments/CCRecruitmentsTable";
import YearSelector from "components/cc-recruitments/YearSelector";

export const metadata = {
  title: "CC Recruitments",
};

export default async function AllRecruitmentsApplications(props) {
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();
  const year = parseInt(searchParams?.year) || currentYear;

  const { data: { ccApplications } = {} } = await getClient().query(
    GET_ALL_RECRUITMENTS,
    { year },
  );
  const userPromises =
    ccApplications?.map((applicant) =>
      getClient().query(GET_USER_PROFILE, {
        userInput: { uid: applicant.uid },
      }),
    ) || [];

  const users = await Promise.all(userPromises);
  const processedApplicants =
    ccApplications?.map((applicant, index) => ({
      ...applicant,
      ...users[index]?.data?.userProfile,
      ...users[index]?.data?.userMeta,
    })) || [];

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Typography variant="h3" gutterBottom>
          All CC Recruitment Applications
        </Typography>
        <YearSelector currentYear={currentYear} selectedYear={year} />
      </div>
      <CCRecruitmentsTable data={processedApplicants} year={year} />
    </Container>
  );
}
