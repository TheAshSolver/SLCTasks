"""
Subjects and bodies for mails to CC and applicant after successful application.
"""

from string import Template

APPLICANT_CONFIRMATION_SUBJECT = Template(
    """
Clubs Council - Application Confirmation
"""
)

APPLICANT_CONFIRMATION_BODY = Template(
    """
Dear Applicant,

Thank you for applying to the Clubs Council. We have received your 
application and will get back to you shortly.

Best regards,
Clubs Council.

Note: This automated email has been generated from the Clubs Council website.
For more details, visit clubs.iiit.ac.in.
"""  # noqa: E501
)

CC_APPLICANT_CONFIRMATION_SUBJECT = Template(
    """
Clubs Council - CC Application Confirmation
"""
)

CC_APPLICANT_CONFIRMATION_BODY = Template(
    """
Dear Clubs Council,

A new application has been received for CC. The details are as follows:

    1. User ID: $uid
    2. Email: $email

    3. Which all teams would you like to apply for in Clubs Council?
        $teams
    4. Why did you choose the team(s) you have chosen?
        $why_this_position

    5. Why do you want to be a part of the Clubs Council? Tell us about your 
       vision and improvements you wish to make.
        $why_cc

    6. Why do you believe you are a good fit for the position you are applying
       to?
        $good_fit

    7. Did you often want to take part in an event, but couldn't or didn't? 
       What were the reasons? Why do you think that happened?
        $ideas1

    8. Tell us more about your ideas and thoughts to improve campus life (wrt. club activities) at IIIT Hyderabad.
        $ideas

    9. Have you been a part of any student-run bodies or clubs in our campus?
       If yes, tell us about your experience.
        $other_bodies

    10. Design Experience
        $design_experience

Best regards,
Tech Team
Clubs Council.

Note: This automated email has been generated from the Clubs Council website.
For more details, visit clubs.iiit.ac.in.
"""  # noqa: E501
)
