import { RequestHandler } from "express";
import {
  createExhibitionStall,
  deleteExhibitionStall,
  getExhibitionStall,
  getSingleExhibitionStall,
  updateExhibitionStall,
} from "../../@core/services/exhibitionStall";

export const handleCreate: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const file = req.file;
    const acc_id = req?.user?.id || 0;

    await createExhibitionStall(acc_id, {
      ...data,
      company_logo: file?.path || "",
    });

    res.json({ message: "Submitted Successfully" });
  } catch (err) {
    next(err);
  }
};

export const handleGetSingleStall: RequestHandler = async (req, res, next) => {
  try {
    const stall_id = parseInt(req.params.stall_id);

    const record = await getSingleExhibitionStall(stall_id);

    res.json({
      ...record,
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetExhibitionStall: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const statusType = req.query.status;

    const [records, meta] = await getExhibitionStall({
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

export const handleUpdateExhibitionStall: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const data = req.body;
    const stall_id = parseInt(req.params.stall_id);
    const file = req.file;

    await updateExhibitionStall(stall_id, {
      ...data,
      req,
    });

    res.json({
      message: "Updated Successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const handleDelete: RequestHandler = async (req, res, next) => {
  try {
    const id = parseInt(req.params.exhibition_id as string);

    await deleteExhibitionStall(id);

    res.json({
      message: "Deleted Successfully",
    });
  } catch (err) {
    next(err);
  }
};
