import { RequestHandler } from "express";
import {
  createConference,
  listConferences,
  getConference,
  updateConference,
  deleteConference,
  createAttendance,
  uploadAttendance,
  listAttendance,
  updateAttendanceReview,
  getDaysSchedule,
  submitConferenceFeedback,
  feedbackResult,
  feedbackSubmitter,
  generateCertificate,
  verifyCertificate,
} from "../../@core/services/conferences";
import { reformatGuest } from "../../@core/services/guests";
import {
  createQuestionnaire,
  getAllQuestionnaire,
  getQuestionnaire,
} from "../../@core/services/questionnaires";
import { Role } from "@prisma/client";

export const handleCreateConference: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const data = req.body;
    const newConference = await createConference(data);

    res.json({
      ...newConference,
      sessions: newConference.sessions?.map((sess) => ({
        ...sess,
        breakdown:
          sess.breakdown &&
          sess.breakdown.map((slot) => ({
            ...slot,
            speakers: slot.speakers && slot.speakers.map(reformatGuest),
          })),
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateConference: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId);
    const data = req.body;
    const updatedConference = await updateConference(conferenceId, data);
    res.json({
      ...updatedConference,
      sessions: updatedConference.sessions.map((sess) => ({
        ...sess,
        breakdown:
          sess.breakdown &&
          sess.breakdown.map((slot) => ({
            ...slot,
            speakers: slot.speakers && slot.speakers.map(reformatGuest),
          })),
      })),
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetConference: RequestHandler = async (req, res, next) => {
  try {
    const query = req.query;
    const conferenceId = parseInt(req.params.conferenceId);
    const conference = await getConference(conferenceId);

    if (!conference) throw new Error("Not found");

    const formattedConference = {
      ...conference,
      sessions: conference.sessions.map((sess) => ({
        ...sess,
        breakdown:
          sess.breakdown &&
          sess.breakdown.map((slot) => ({
            ...slot,
            speakers: slot.speakers && slot.speakers.map(reformatGuest),
          })),
      })),
    };

    if (query.format === "days") {
      const { sessions, ...confMeta } = formattedConference;
      res.json({ ...confMeta, days: getDaysSchedule(sessions) });
    } else res.json(formattedConference);
  } catch (err) {
    next(err);
  }
};

export const handleListConferences: RequestHandler = async (req, res, next) => {
  try {
    const conferenceType = req.query.type;
    const role = req?.user?.role as Role;
    
    const filter: any = { type: conferenceType };
    
    if (req.query.is_active !== undefined) {
      filter.is_active = req.query.is_active === 'true';
    } else if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      filter.is_active = true;
    }

    const conferences = await listConferences(filter, role);
    res.json(conferences);
  } catch (err) {
    next(err);
  }
};

export const handleDeleteConference: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId);
    await deleteConference(conferenceId);
    res.status(200).end();
  } catch (err) {
    next(err);
  }
};

export const handleCreateAttendance: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { conferenceId, sessionId } = req.params;
    const attendance = await createAttendance(
      parseInt(conferenceId),
      parseInt(sessionId),
      { person_id: req.user?.id }
    );
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

export const handleUploadAttendance: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { conferenceId, sessionId } = req.params;
    const file = req.file;

    if (!file) throw new Error("Attendance picture not uploaded.");

    const attendance = await uploadAttendance(
      parseInt(conferenceId),
      parseInt(sessionId),
      { picture: file.path, person_id: req.user?.id }
    );
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

export const handleListAttendance: RequestHandler = async (req, res, next) => {
  try {
    const { conferenceId } = req.params;
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const status = req.query.status;

    const [records, _meta] = await listAttendance(
      parseInt(conferenceId),
      { status },
      { page, limit }
    );

    res.json({
      records,
      _meta,
    });
  } catch (err) {
    next(err);
  }
};

export const handleReviewAttendance: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { conferenceId, sessionId, attendeeId } = req.params;
    const data = req.body;

    const attendance = await updateAttendanceReview(
      parseInt(sessionId),
      parseInt(attendeeId),
      data
    );
    res.json(attendance);
  } catch (err) {
    next(err);
  }
};

export const handleCreateFeedbackForm: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const conference_id = parseInt(req.params.conferenceId);
    const data = req.body;
    const questionnaire = await createQuestionnaire({ ...data, conference_id });
    res.json(questionnaire);
  } catch (err) {
    next(err);
  }
};

export const handleGetFeedbackForm: RequestHandler = async (req, res, next) => {
  try {
    const conference_id = parseInt(req.params.conferenceId);
    const questionnaire = await getQuestionnaire({ conference_id });
    res.json(questionnaire);
  } catch (err) {
    next(err);
  }
};

export const handleSubmitFeedback: RequestHandler = async (req, res, next) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId);
    const data = req.body;
    await submitConferenceFeedback(conferenceId, data.data);
    res.json({
      message: "Feedback submitted successfuly",
    });
  } catch (err) {
    next(err);
  }
};

export const handleGenerateCertificate: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;

    const user = await generateCertificate(data);

    res.json({
      ...(user || {}),
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetFeedbackResult: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    function transformEvaluationData(form: any, responses: any) {
      const getColor = (label: any) => {
        const colors: any = {
          "Strongly Agree": "#27AE60",
          Agree: "#2ECC71",
          Neutral: "#F1C40F",
          DisAgree: "#E67E22",
          "Strongly Disagree": "#C0392B",
          Yes: "#27AE60",
          No: "#C0392B",
        };
        return colors[label] || "#BDC3C7";
      };

      return {
        ...form,
        questions: form?.questions?.map((questionGroup: any) => {
          const { statements = [], options = [], id, ...rest } = questionGroup;
          const hasOptions = Array.isArray(options) && options.length > 0;

          if (statements.length > 0) {
            return {
              ...rest,
              options: hasOptions ? options : undefined,
              statements: statements?.map((stmt: any) => {
                const relatedResponses = responses?.filter(
                  (resp: any) => resp.question_id === stmt.id
                );

                if (hasOptions) {
                  const total = relatedResponses.length || 1;
                  const valueCountMap: any = {};

                  relatedResponses?.forEach((resp: any) => {
                    valueCountMap[resp.value] =
                      (valueCountMap[resp.value] || 0) + 1;
                  });

                  const result = options?.map((opt) => {
                    const count = valueCountMap[opt.value] || 0;
                    const percentage = ((count / total) * 100).toFixed(2) + "%";
                    return {
                      name: opt.label,
                      percentage,
                      color: getColor(opt.label),
                    };
                  });

                  return {
                    ...stmt,
                    isOptionExist: true,
                    result,
                  };
                } else {
                  const textResponses = relatedResponses?.map(
                    (resp: any) => resp.value
                  );
                  return {
                    ...stmt,
                    isOptionExist: false,
                    response: textResponses,
                  };
                }
              }),
            };
          } else {
            const relatedResponses = responses?.filter(
              (resp: any) => resp.question_id === id
            );

            if (hasOptions) {
              const total = relatedResponses?.length || 1;
              const valueCountMap: any = {};

              relatedResponses?.forEach((resp: any) => {
                valueCountMap[resp.value] =
                  (valueCountMap[resp.value] || 0) + 1;
              });

              const result = options?.map((opt) => {
                const count = valueCountMap[opt.value] || 0;
                const percentage = ((count / total) * 100).toFixed(2) + "%";
                return {
                  name: opt.label,
                  percentage,
                  color: getColor(opt.label),
                };
              });

              return {
                ...rest,
                options,
                isOptionExist: true,
                result,
              };
            } else {
              const textResponses = relatedResponses?.map(
                (resp: any) => resp.value
              );
              return {
                ...rest,
                isOptionExist: false,
                response: textResponses,
              };
            }
          }
        }),
      };
    }

    const { conference_id, session_id, submitter_id } = req?.query;

    const questionnaireCompleteList = await getAllQuestionnaire();

    if (!conference_id && !session_id && !submitter_id) {
      const result = await feedbackResult({
        conference_id:
          typeof conference_id === "string"
            ? parseInt(conference_id)
            : undefined,
        session_id:
          typeof session_id === "string" ? parseInt(session_id) : undefined,
        submitter_id:
          typeof submitter_id === "string" ? parseInt(submitter_id) : undefined,
      });

      const responsesArray = result?.map((elem) => elem?.responses)?.flat();

      const modifiedResult = questionnaireCompleteList?.map((elem) => {
        const { question_groups, ...rest } = elem;
        return {
          ...rest,
          question_groups: question_groups?.map((questionGroupElem) => {
            return transformEvaluationData(questionGroupElem, responsesArray);
          }),
        };
      });

      res.json({
        submitterList: [],
        // genericResult: result,
        // allQuestionsList,
        // questionList: {
        //   questionnaireList,
        // },
        result: [],
      });
      return;
    }

    const questionnaireList = await getQuestionnaire({
      conference_id:
        typeof conference_id === "string" ? parseInt(conference_id) : undefined,
    });

    const result = await feedbackResult({
      conference_id:
        typeof conference_id === "string" ? parseInt(conference_id) : undefined,
      session_id:
        typeof session_id === "string" ? parseInt(session_id) : undefined,
      submitter_id:
        typeof submitter_id === "string" ? parseInt(submitter_id) : undefined,
    });
    const responsesArray = result?.map((elem) => elem?.responses)?.flat();

    const allQuestionsList = [...(questionnaireList?.question_groups || [])];
    const modifiedResult = allQuestionsList?.map((elem) => {
      return transformEvaluationData(elem, responsesArray);
    });

    const submitterList = result?.map((elem) => elem?.submitted_by);

    res.json({
      submitterList: submitterList,
      // genericResult: result,
      // allQuestionsList,
      // questionList: {
      //   questionnaireList,
      // },
      result: modifiedResult,
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetFeedbackUsersList: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { conference_id, session_id } = req?.query;
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const result = await feedbackSubmitter({
      conference_id:
        typeof conference_id === "string" ? parseInt(conference_id) : undefined,
      session_id:
        typeof session_id === "string" ? parseInt(session_id) : undefined,
      paging: { page: page, limit: limit },
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};



export const handleVerifyCertificate: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { serial } = req?.params;

    const result = await verifyCertificate(serial);

    res.json(result);
  } catch (err) {
    next(err);
  }
};