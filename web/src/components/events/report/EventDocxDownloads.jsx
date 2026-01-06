"use client";

import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

import { Button } from "@mui/material";

import Icon from "components/Icon";
import { PUBLIC_URL } from "utils/files";
import { audienceLabels, locationLabel } from "utils/formatEvent";
import { formatDateTime } from "utils/formatTime";

const LifeLogo = "/assets/life-logo-full-color-light.png";
const IIITLogo = "/assets/iiit-logo-color.png";
const CCLogo = "/assets/cc-logo-color.png";

export function DownloadEventReportDocx({
  event,
  eventReport,
  submittedUser,
  clubs,
}) {
  const submittedDate = formatDateTime(eventReport?.submittedTime);
  const startDate = event?.datetimeperiod
    ? formatDateTime(event.datetimeperiod[0])
    : null;
  const endDate = event?.datetimeperiod
    ? formatDateTime(event.datetimeperiod[1])
    : null;
  const isStudentBodyEvent =
    clubs.find((club) => club.cid === event?.clubid)?.category === "body" ||
    event?.collabclubs?.some(
      (collab) =>
        clubs.find((club) => club.cid === collab)?.category === "body",
    );

  const fetchImageBuffer = async (url) => {
    const response = await fetch(url);
    return await response.arrayBuffer();
  };

  const generateDocx = async () => {
    const lifeLogoBuffer = await fetchImageBuffer(LifeLogo);
    const IIITLogoBuffer = await fetchImageBuffer(IIITLogo);
    const ccLogoBuffer = await fetchImageBuffer(CCLogo);

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              fontSize: 24,
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 30,
              bold: true,
              color: "2e74b5",
            },
            paragraph: {
              spacing: {
                before: 240,
                after: 120,
              },
            },
          },
          {
            id: "Heading3",
            name: "Heading 3",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 28,
              bold: true,
              color: "062785",
            },
            paragraph: {
              spacing: {
                before: 200,
                after: 80,
              },
            },
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                isStudentBodyEvent
                  ? new ImageRun({
                      data: lifeLogoBuffer,
                      transformation: {
                        width: 150,
                        height: 75,
                      },
                      floating: {
                        horizontalPosition: {
                          offset: 614400,
                        },
                        verticalPosition: {
                          offset: 214400,
                        },
                      },
                    })
                  : new ImageRun({
                      data: ccLogoBuffer,
                      transformation: {
                        width: 120,
                        height: 75,
                      },
                      floating: {
                        horizontalPosition: {
                          offset: 614400,
                        },
                        verticalPosition: {
                          offset: 214400,
                        },
                      },
                    }),
                new ImageRun({
                  data: IIITLogoBuffer,
                  transformation: {
                    width: 150,
                    height: 75,
                  },
                  floating: {
                    horizontalPosition: {
                      relative: HorizontalPositionRelativeFrom.RIGHT_MARGIN,
                      offset: -1014400,
                    },
                    verticalPosition: {
                      offset: 214400,
                    },
                  },
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({}),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Event Report: ${event?.name || "Unnamed Event"}`,
                  bold: true,
                  color: "FF0000",
                  size: 32,
                  underline: {
                    type: UnderlineType.SINGLE,
                    color: "FF0000",
                  },
                  spacing: {
                    after: 200,
                  },
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `Submitted On: ${submittedDate.dateString} ${submittedDate.timeString}`,
                  bold: true,
                }),
              ],
              spacing: {
                before: 200, // Adds space before this paragraph (200 twips = 10 points)
              },
            }),
            new Paragraph({
              text: "Event Details",
              heading: "Heading2",
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Event Code: ",
                  bold: true,
                }),
                new TextRun({
                  text: `#${event?.code || "N/A"}`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Organized By: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${
                    clubs?.find((club) => club?.cid === event?.clubid)?.name ||
                    "N/A"
                  }`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Collaborators: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${
                    event?.collabclubs
                      ?.map(
                        (collab) =>
                          clubs?.find((club) => club?.cid === collab)?.name,
                      )
                      .join(", ") || "None"
                  }`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Event Dates: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${
                    startDate && endDate
                      ? `${
                          startDate.dateString +
                          " " +
                          startDate.timeString +
                          " IST"
                        } to ${
                          endDate.dateString + " " + endDate.timeString + " IST"
                        }`
                      : "N/A"
                  }`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Event Link: ",
                  bold: true,
                }),
                new ExternalHyperlink({
                  children: [
                    new TextRun({
                      text: `${PUBLIC_URL + "/events/" + event._id}`,
                      style: "Hyperlink",
                    }),
                  ],
                  link: `${PUBLIC_URL + "/events/" + event._id}`,
                }),
              ],
            }),
            new Paragraph({
              text: "Budget Overview",
              heading: "Heading2",
            }),
            event?.budget?.length
              ? new Table({
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Description",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                          width: {
                            size: 50,
                            type: WidthType.PERCENTAGE,
                          },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Amount",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                          width: {
                            size: 25,
                            type: WidthType.PERCENTAGE,
                          },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Advance",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                          width: {
                            size: 25,
                            type: WidthType.PERCENTAGE,
                          },
                        }),
                      ],
                    }),
                    ...event.budget.map(
                      (item) =>
                        new TableRow({
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph(item?.description || "Unknown"),
                              ],
                              width: {
                                size: 50,
                                type: WidthType.PERCENTAGE,
                              },
                            }),
                            new TableCell({
                              children: [
                                new Paragraph(
                                  item?.amount?.toString() || "Unknown",
                                ),
                              ],
                              width: {
                                size: 25,
                                type: WidthType.PERCENTAGE,
                              },
                            }),
                            new TableCell({
                              children: [
                                new Paragraph(item?.advance ? "Yes" : "No"),
                              ],
                              width: {
                                size: 25,
                                type: WidthType.PERCENTAGE,
                              },
                            }),
                          ],
                        }),
                    ),
                  ],
                })
              : new Paragraph({
                  text: "No budget details available.",
                  italics: true,
                }),

            new Paragraph({
              text: "Sponsor Overview",
              heading: "Heading2",
            }),
            event?.sponsor?.length
              ? new Table({
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Sponsor Name",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                          width: {
                            size: 20,
                            type: WidthType.PERCENTAGE,
                          },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Amount",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                          width: {
                            size: 15,
                            type: WidthType.PERCENTAGE,
                          },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Previously Sponsored?",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                          width: {
                            size: 15,
                            type: WidthType.PERCENTAGE,
                          },
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Comment",
                                  bold: true,
                                }),
                              ],
                            }),
                          ],
                          width: {
                            size: 50,
                            type: WidthType.PERCENTAGE,
                          },
                        }),
                      ],
                    }),
                    ...event.sponsor.map(
                      (item) =>
                        new TableRow({
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph(item?.name || "Unknown"),
                              ],
                              width: {
                                size: 25,
                                type: WidthType.PERCENTAGE,
                              },
                            }),
                            new TableCell({
                              children: [
                                new Paragraph(
                                  item?.amount?.toString() || "Unknown",
                                ),
                              ],
                              width: {
                                size: 20,
                                type: WidthType.PERCENTAGE,
                              },
                            }),
                            new TableCell({
                              children: [
                                new Paragraph(
                                  item?.previously_sponsored ? "Yes" : "No",
                                ),
                              ],
                              width: {
                                size: 15,
                                type: WidthType.PERCENTAGE,
                              },
                            }),
                            new TableCell({
                              children: [
                                new Paragraph(item?.comment || "Unknown"),
                              ],
                              width: {
                                size: 50,
                                type: WidthType.PERCENTAGE,
                              },
                            }),
                          ],
                        }),
                    ),
                  ],
                })
              : new Paragraph({
                  text: "No budget details available.",
                  italics: true,
                }),

            new Paragraph({
              text: "Participation Overview",
              heading: "Heading2",
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Audience: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${
                    event?.audience
                      ? audienceLabels(event?.audience)
                          .map(({ name }) => name)
                          .join(", ")
                      : "Unknown"
                  }`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Estimated Participation: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${event?.population || "N/A"}`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Actual Attendance: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${eventReport?.attendance || "N/A"}`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Estimated External Participation: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${event?.externalPopulation || "N/A"}`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Actual external Attendance: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${eventReport?.externalAttendance || "N/A"}`,
                }),
              ],
            }),
            new Paragraph({
              text: "Venue Information",
              heading: "Heading2",
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Mode: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${
                    event?.mode
                      ? event.mode.charAt(0).toUpperCase() + event.mode.slice(1)
                      : "Unknown"
                  }`,
                }),
              ],
            }),
            ...(event?.location?.length
              ? event.location.map(
                  (venue) =>
                    new Paragraph({
                      text:
                        venue === "other"
                          ? event.otherLocation || "Other"
                          : locationLabel(venue)?.name || "Unknown",
                      bullet: {
                        level: 0,
                      },
                    }),
                )
              : event?.mode !== "online"
                ? [
                    new Paragraph({
                      text: "No venue information available.",
                      italics: true,
                      bullet: {
                        level: 0,
                      },
                    }),
                  ]
                : ""),

            new Paragraph({
              text: "Prizes",
              heading: "Heading2",
            }),
            ...(eventReport?.prizes?.length
              ? eventReport.prizes.map(
                  (prize) =>
                    new Paragraph({
                      text: prize.replace(/_/g, " ").toUpperCase(),
                      bullet: {
                        level: 0,
                      },
                    }),
                )
              : [
                  new Paragraph({
                    text: "No Prizes.",
                    italics: true,
                    bullet: {
                      level: 0,
                    },
                  }),
                ]),

            ...(eventReport?.prizes?.length
              ? [
                  new Paragraph({
                    text: "Prizes Breakdown: ",
                    heading: "Heading3",
                  }),
                  ...(eventReport.prizesBreakdown
                    ? eventReport.prizesBreakdown.split("\n").map(
                        (line) =>
                          new Paragraph({
                            text: line.trim(),
                          }),
                      )
                    : [
                        new Paragraph({
                          text: "N/A",
                        }),
                      ]),
                  new Paragraph({
                    text: "Winners: ",
                    heading: "Heading3",
                  }),
                  ...(eventReport.winners
                    ? eventReport.winners.split("\n").map(
                        (line) =>
                          new Paragraph({
                            text: line.trim(),
                          }),
                      )
                    : [
                        new Paragraph({
                          text: "N/A",
                        }),
                      ]),
                ]
              : []),

            new Paragraph({
              text: "Equipment",
              heading: "Heading2",
            }),
            ...(event?.equipment
              ? event?.equipment.split("\n").map(
                  (line) =>
                    new Paragraph({
                      text: line.trim(),
                    }),
                )
              : [
                  new Paragraph({
                    text: "No equipment used.",
                    italics: true,
                  }),
                ]),

            new Paragraph({
              text: "Additional Information",
              heading: "Heading2",
            }),
            ...(event?.additional
              ? event.additional.split("\n").map(
                  (line) =>
                    new Paragraph({
                      text: line.trim(),
                    }),
                )
              : [
                  new Paragraph({
                    text: "No additional information available.",
                    italics: true,
                  }),
                ]),

            new Paragraph({
              text: "Photos/Videos Link",
              heading: "Heading2",
            }),
            new Paragraph({
              children: [
                new ExternalHyperlink({
                  children: [
                    new TextRun({
                      text: eventReport?.photosLink,
                      style: "Hyperlink",
                    }),
                  ],
                  link: eventReport?.photosLink,
                }),
              ],
            }),

            new Paragraph({
              text: "Event Summary",
              heading: "Heading2",
            }),
            ...(eventReport?.summary
              ? eventReport.summary.split("\n").map(
                  (line) =>
                    new Paragraph({
                      text: line.trim(),
                    }),
                )
              : [
                  new Paragraph({
                    text: "No summary provided.",
                    italics: true,
                  }),
                ]),

            new Paragraph({
              text: "Feedback CC/College",
              heading: "Heading2",
            }),
            ...(eventReport?.feedbackCc
              ? eventReport.feedbackCc.split("\n").map(
                  (line) =>
                    new Paragraph({
                      text: line.trim(),
                    }),
                )
              : [
                  new Paragraph({
                    text: "No feedback provided.",
                    italics: true,
                  }),
                ]),

            new Paragraph({
              text: "Submitted By",
              heading: "Heading2",
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Name: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${
                    `${submittedUser?.data?.firstName} ${submittedUser?.data?.lastName}` ||
                    "Unknown"
                  }`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "ID Number: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${submittedUser?.data?.rollno || "Unknown"}`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Email: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${submittedUser?.data?.email || "Unknown"}`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Phone Number: ",
                  bold: true,
                }),
                new TextRun({
                  text: `${submittedUser?.data?.phone || "Unknown"}`,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(
      buffer,
      `${event?.name?.replace(/\s+/g, "_") || "event"}_report.docx`,
    );
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={generateDocx}
      startIcon={<Icon variant="description" />}
    >
      Report Doc
    </Button>
  );
}
