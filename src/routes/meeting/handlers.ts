import { Role } from "@prisma/client";
import {
  createMeeting,
  getMeeting,
  listMeetings,
  listUserMeetings,
  updateMeeting,
} from "../../@core/services/meeting";
import { RequestHandler } from "express";

export const handleCreate: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;

    const newMeeting = await createMeeting({
      title: data?.title,
      allow: data?.allow,
      start: data?.start,
      end: data?.end,
      summary: data?.summary,
      url: data?.url,
    });

    res.json({ message: "Meeting Created Successfully" });
  } catch (err) {
    next(err);
  }
};

export const handleGetMeeting: RequestHandler = async (req, res, next) => {
  try {
    const meeting_id = parseInt(req.params.meeting_id);

    const record = await getMeeting(meeting_id);

    res.json({
      ...record,
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetUserMeetings: RequestHandler = async (req, res, next) => {
  try {
    const role = req?.user?.role as Role;

    const records = await listUserMeetings(role);

    res.json({
      records: records,
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetMeetings: RequestHandler = async (req, res, next) => {
  try {
    const role = req?.user?.role as Role;
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const [records, meta] = await listMeetings({ page, limit, role });

    res.json({
      records,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdate: RequestHandler = async (req, res, next) => {
  try {
    const meeting_id = parseInt(req.params.meeting_id);
    const data = req.body;

    await updateMeeting(meeting_id, data);

    res.json({
      message: "Meeting Updated Successfully",
    });
  } catch (err) {
    next(err);
  }
};
