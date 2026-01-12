import path from "path";
import pusher, { channels } from "./pusher";
import Conference from "../models/Conference";
import Questionnaire from "../models/Questionnaire";
import Session from "../models/Session";
import Attendee from "../models/Attendee";
import conferenceValidator from "../validators/conference-data-validator";
import attendeeValidator from "../validators/attendee-data-validator";
import { questionnaireSubmissionsSchema } from "../validators/questionnaire-data-validator";
import Account from "../../@core/models/Account";
import Certificate from "../../@core/models/Certificate";
import puppeteer from "puppeteer";
import { existsSync, mkdirSync } from "fs";
import fs from "fs";
import { randomUUID } from "crypto";
import {
  certificateHtml,
  generateNumericSerial,
} from "../../@core/utils/constant";
import QRCode from "qrcode";

// import getDistanceBetween from "../utils/geo-distance";

export const createConference = async (data: any) => {
  const newConference = await Conference.create(
    conferenceValidator.parse(data)
  );

  pusher
    .trigger(channels.GENERAL, "new-conference", {
      id: newConference.id,
      title: newConference.title,
      start_date: newConference.start_date,
    })
    .catch((err) => {
      console.log(err);
    });

  return newConference;
};

export const updateConference = (id: number, data: any) => {
  return Conference.update(id, conferenceValidator.partial().parse(data));
};

export const getConference = async (id: number) => {
  const conference = await Conference.getById(id);
  if (!conference) throw new Error("Conference not found.");

  const sessions = conference.sessions.map((sess) => {
    const { attendees, ...sessData } = sess;
    if (attendees.length > 0)
      // @ts-ignore
      sessData.attendance = attendees[0];

    return sessData;
  });

  return {
    ...conference,
    sessions,
  };
};

export const listConferences = (filter: any, allow: string) => {
  const parsedFilter = conferenceValidator
    .pick({ type: true, is_active: true })
    .partial()
    .optional()
    .parse(filter);
  return Conference.listAll(parsedFilter, allow);
};

export const deleteConference = (id: number) => {
  return Conference.delete(id);
};

export const getDaysSchedule = (sessions: any) => {
  const refDate = new Date(0);
  const sorted = sessions.sort(
    (a: any, b: any) => (a.starts_at || refDate) - (b.starts_at || refDate)
  );

  const daysMap = sorted.reduce((map: Map<string, any>, sess: any) => {
    const date = (sess.starts_at || refDate).toDateString();
    const day = map.get(date) || {
      date: new Date(date),
      breaks: [],
      sessions: [],
    };

    if (sess.is_break) day.breaks.push(sess);
    else day.sessions.push(sess);

    map.set(date, day);
    return map;
  }, new Map<string, any>());

  return Array.from(daysMap.values());
};

export const createAttendance = async (
  id: number,
  session_id: number,
  data: any
) => {
  const session = await Session.getById(session_id);

  if (!session) throw new Error("Session doesnot exists.");

  const now = new Date();

  if (session.starts_at && now < session.starts_at)
    throw new Error("Session has not started yet.");

  const dueDate = session.ends_at || new Date();
  dueDate.setMinutes(dueDate.getMinutes() + 15);

  if (now > dueDate)
    throw new Error(
      "Session has been ended for more than 15 minutes. Cannot submit attendance."
    );

  return Attendee.create({
    session_id,
    conference_id: id,
    person_id: data.person_id,
    status: "ACCEPTED",
  });
};

export const uploadAttendance = async (
  id: number,
  session_id: number,
  data: any
) => {
  const session = await Session.getById(session_id);
  if (!session) throw new Error("Session doesnot exist.");

  // const now = new Date();

  // if (session.starts_at && now < session.starts_at)
  //   throw new Error('Session has not started yet.');

  // const dueDate = session.ends_at || new Date();
  // dueDate.setMinutes(dueDate.getMinutes() + 15);

  // if (now > dueDate)
  //   throw new Error('Session has been ended for more than 15 minutes. Cannot submit attendance.');

  return Attendee.create({
    session_id,
    conference_id: id,
    picture: data.picture,
    person_id: data.person_id,
    status: "PENDING",
  });
};

// export const createAttendance = async (id:number, session_id:number, data:any) => {
//   const session = await Session.getById(session_id);
//   if (!session)
//     throw new Error('Session doesnot exists.');

//   const now = new Date();

//   if (now > session.endsAt())
//     throw new Error('Session has already ended.');

//   if (!session.venue)
//     throw new Error('Unable to identify venue for this session.');

//   const distance = getDistanceBetween(data, session.venue);

//   if (!session.venue.radius || distance > session.venue.radius)
//     throw new Error('Unable to create attendance by location. Use another method.');

//   return Attendee.create({
//     session_id,
//     conference_id: id,
//     status: 'ACCEPTED'
//   });
// };

export const listAttendance = async (
  id: number,
  query: any,
  paging: { page: number; limit: number }
) => {
  const parsedQuery = attendeeValidator
    .pick({ status: true })
    .partial()
    .optional()
    .parse(query);

  let _page = Math.abs(paging.page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(paging.limit) || 20;

  const [records, count] = await Attendee.listAll(id, parsedQuery, {
    skip: _page * _limit,
    take: _limit,
  });

  return [
    records.map((att) => ({
      ...att,
      picture:
        att.picture && path.join(process.env.API_HOST as string, att.picture),
      person: {
        ...att.person,
        profiles: undefined,
        profile: att.person.profiles[0],
      },
    })),
    {
      total_records: count,
      current_page: _page + 1,
      total_pages: Math.ceil(count / _limit),
      limit: _limit,
    },
  ];
};

export const updateAttendanceReview = (
  sessionId: number,
  personId: number,
  data: any
) => {
  return Attendee.review(sessionId, personId, data);
};

export const generateCertificate = async (data: any) => {
  const userExist = await Account.getById(data?.personId);

  if (!userExist) throw new Error("User not found.");

  const session = await Session.getById(data?.sessionId);
  if (!session) throw new Error("Session not found.");

  const attendance: any = await Attendee.getUniqueAttendance(data?.personId);

  if (attendance?.status !== "ACCEPTED") {
    return {
      message: "Attendance not completed.",
    };
  }

  // 2. Check if already generated
  const existing = await Certificate.getByParameters(
    data?.personId,
    data?.sessionId
  );

  if (existing) {
    return {
      message: "Certificate already generated.",
      certificate: existing,
    };
  }

  const genericSerialNum = generateNumericSerial();

  const verificationUrl = `http://localhost:3000/conferences/certificate/verify/CERT-${genericSerialNum}`;

  const qrCodeBase64 = await QRCode.toDataURL(verificationUrl);

  const html = certificateHtml(
    {
      name: `${attendance.person.first_name} ${attendance.person.last_name}`,
      title: attendance.session?.title,
      genericSerialNum: genericSerialNum,
    },
    qrCodeBase64
  );

  // Generate PDF (you will plug in your function)
  const pdfBuffer = await generatePdfCertificate(html);

  const userFolder = `./uploads/certificates/${data?.personId}/`;
  if (!existsSync(userFolder)) {
    mkdirSync(userFolder, { recursive: true });
  }

  const filename = `CERT-${data?.personId}-${randomUUID()}.pdf`;
  const filePath = path.join(userFolder, filename);

  await fs.promises.writeFile(filePath, pdfBuffer);

  const certificate = await Certificate.create({
    personId: data?.personId,
    sessionId: data?.sessionId,
    fileUrl: filePath,
    serialNumber: "CERT-" + genericSerialNum,
  });

  return {
    message: "Certificate generated.",
    certificate,
  };
};

export const submitConferenceFeedback = async (
  conference_id: number,
  data: any
) => {
  const conference = await Conference.getById(conference_id);

  if (!conference) throw new Error("Conference not found.");

  if (
    !!(await Questionnaire.getSubmission({ conference_id, session_id: null }))
  )
    throw new Error("Feedback had been submitted already.");

  const parsedData = questionnaireSubmissionsSchema.parse(data);
  return Questionnaire.createSubmition(parsedData, { conference_id });
};

export const feedbackResult = async ({
  conference_id,
  session_id,
  submitter_id,
}: any) => {
  if (conference_id) {
    const conference = await Conference.getById(conference_id);
    if (!conference) throw new Error("Conference not found.");
  }

  if (session_id) {
    const session = await Session.getById(session_id);
    if (!session) throw new Error("Session not found.");
  }

  const records = await Questionnaire.getSubmissionConferenceResult({
    submitter_id: Number(submitter_id),
    conference_id: Number(conference_id),
    session_id: Number(session_id),
  });

  return records;
};

export const feedbackSubmitter = async ({
  conference_id,
  session_id,
  paging,
}: any) => {
  if (conference_id) {
    const conference = await Conference.getById(conference_id);
    if (!conference) throw new Error("Conference not found.");
  }

  if (session_id) {
    const session = await Session.getById(session_id);
    if (!session) throw new Error("Session not found.");
  }

  let _page = Math.abs(paging.page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(paging.limit) || 20;

  const [records, count] = await Questionnaire.getConferenceSubmitterList({
    conference_id: Number(conference_id),
    session_id: Number(session_id),
    paging: {
      skip: _page * _limit,
      take: _limit,
    },
  });

  return {
    records: records.map((elem) => elem?.submitted_by),
    _meta: {
      total_records: count,
      current_page: _page + 1,
      total_pages: Math.ceil(count / _limit),
      limit: _limit,
    },
  };
};

export const submitSessionFeedback = async (
  conference_id: number,
  session_id: number,
  data: any
) => {
  const now = new Date();
  const session = await Session.getById(session_id);
  if (!session || session.conference_id !== conference_id)
    throw new Error("Session not found.");

  if (!!(await Questionnaire.getSubmission({ conference_id, session_id })))
    throw new Error("Feedback had been submitted already.");

  const nbfDate = session.ends_at;

  if (nbfDate && now < nbfDate)
    throw new Error(`Cannot submit feedback before session ends.`);

  const dueDate = session.ends_at || new Date();
  dueDate.setHours(dueDate.getHours() + 24);

  if (now > dueDate)
    throw new Error(
      "Session has been ended for more than 24 hours. Cannot submit feedback."
    );

  const parsedData = questionnaireSubmissionsSchema.parse(data);
  return Questionnaire.createSubmition(parsedData, {
    conference_id,
    session_id,
  });
};

export const feedbackOverallResult = async () => {
  const records = await Questionnaire.getSubmissionOverallConferenceResult();

  return records;
};

async function generatePdfCertificate(html: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
}

export const verifyCertificate = async (serial: any) => {
  const certificate = await Certificate.getOnlyBySerial(serial);

  if (certificate) {
    return {
      verified: true,
      certificate: certificate,
    };
  } else {
    return { verified: false };
  }
};
