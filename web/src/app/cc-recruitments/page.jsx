import { redirect } from "next/navigation";

import { Container, Typography } from "@mui/material";

import { getClient } from "gql/client";
import { GET_USER } from "gql/queries/auth";
import { HAVE_APPLIED } from "gql/queries/recruitment";
import { GET_USER_PROFILE } from "gql/queries/users";

import RecruitmentForm from "components/cc-recruitments/RecruitmentForm";

export const metadata = {
  title: "New Application | Clubs Council @ IIIT-H",
};

const deadline = new Date("2025-04-30T17:00:00+05:30");

async function getUser(currentUser) {
  const { data: { userProfile, userMeta } = {} } = await getClient().query(
    GET_USER_PROFILE,
    {
      userInput: {
        uid: currentUser.uid,
      },
    },
  );
  const user = { ...userMeta, ...userProfile };
  return user;
}

export default async function NewApplication() {
  const {
    data: { userMeta: currentUserMeta, userProfile: currentUserProfile } = {},
  } = await getClient().query(GET_USER, { userInput: null });
  const currentUser = { ...currentUserMeta, ...currentUserProfile };

  if (!currentUser) {
    return (
      <Container>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{
            mt: 3,
          }}
        >
          You are not logged in. Please login to apply for Clubs Council
        </Typography>
      </Container>
    );
  }

  if (currentUser?.role === "cc") {
    return redirect("/cc-recruitments/all");
  }

  const { data: { haveAppliedForCC } = {} } = await getClient().query(
    HAVE_APPLIED,
    { userInput: null },
  );
  const user = await getUser(await currentUser);

  return (
    <Container>
      {haveAppliedForCC ? (
        <>
          <Typography
            variant="h5"
            gutterBottom
            align="center"
            sx={{
              mt: 6,
            }}
          >
            You have already applied for Clubs Council Position. Thank you!
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            align="center"
            sx={{
              mt: 3,
            }}
          >
            You will be notified about the next stages of the process shortly.
          </Typography>
        </>
      ) : new Date() > deadline ? (
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{
            mt: 3,
          }}
        >
          This form is disabled now. <br /> <br />
          The deadline for the form submission was <br />
          {deadline.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}
        </Typography>
      ) : (
        <>
          <Typography
            variant="h3"
            gutterBottom
            align="center"
            sx={{
              mb: 3,
            }}
          >
            Apply for Clubs Council
          </Typography>

          <Typography
            variant="h5"
            gutterBottom
            sx={{
              mb: 3,
            }}
          >
            Instructions
          </Typography>

          <ul>
            <li>
              The deadline for the form is{" "}
              {deadline.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}
            </li>
            <li>
              Only the following batches are allowed to apply for Clubs Council
              position this year:
              <ul>
                <li>UG 2k23</li>
                <li>UG 2k24</li>
                <li>LE 2k24</li>
                <li>PG 2k24</li>
              </ul>
            </li>
            <li>
              Form once submitted cannot be edited. Please fill the form
              carefully.
            </li>
          </ul>

          <Typography
            variant="h5"
            gutterBottom
            sx={{
              mb: 3,
            }}
          >
            Application Form
          </Typography>

          <RecruitmentForm user={user} />
        </>
      )}
      <Typography
        variant="body2"
        gutterBottom
        align="center"
        sx={{
          mt: 10,
        }}
      >
        Made with ❤️ by the SLC Tech Team. For any queries contact us at{" "}
        <a href="mailto:clubs@iiit.ac.in"> clubs@iiit.ac.in </a>
      </Typography>
    </Container>
  );
}
