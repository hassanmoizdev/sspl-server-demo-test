import { RequestHandler } from "express";
import {
  createAbstractSubmission,
  getAbstractPlan,
  updateAbstractSubmission,
} from "../../@core/services/abstractSubmission";

export const handleCreate: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const file = req.file;
    const acc_id = req?.user?.id || 0;
    const { conferenceId, attachment, ...rest } = data;
    const modifiedConferenceId =
      req.body.conferenceId && req.body.conferenceId !== "null"
        ? parseInt(req.body.conferenceId)
        : null;

    const modifiedMeetingId =
      req.body.meetingId && req.body.meetingId !== "null"
        ? parseInt(req.body.meetingId)
        : null;

    await createAbstractSubmission(acc_id, {
      ...rest,
      conferenceId: modifiedConferenceId,
      meetingId: modifiedMeetingId,
      fileUrl: file?.path || "",
    });

    res.json({ message: "Abstract Submitted Successfully" });
  } catch (err) {
    next(err);
  }
};

export const handleGetAbstractSubmission: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const statusType = req.query.status;

    const [records, meta] = await getAbstractPlan({
      page,
      limit,
      status: statusType,
    });

    res.json({
      records,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateAbstractSubmission: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const data = req.body;

    await updateAbstractSubmission(data);

    res.json({
      message: "Abstract Updated Successfully",
    });
  } catch (err) {
    next(err);
  }
};
