import { RequestHandler } from "express";
import {
  updateMembership,
  createMembershipPlan,
  getMembershipPlan,
  getPlan,
  updateMembershipPlan,
  getMembershipList,
  getMembership,
} from "../../@core/services/membership";

export const handleCreate: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;

    await createMembershipPlan({
      ...data,
    });

    res.json({ message: "Membership Plan Created Successfully" });
  } catch (err) {
    next(err);
  }
};

export const handleGetMembershipPlan: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const [records, meta] = await getMembershipPlan({ page, limit });

    res.json({
      records,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetPlan: RequestHandler = async (req, res, next) => {
  try {
    const plan_id = parseInt(req.params.plan_id);

    const record = await getPlan(plan_id);

    res.json({
      ...record,
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdate: RequestHandler = async (req, res, next) => {
  try {
    const plan_id = parseInt(req.params.plan_id);
    const data = req.body;

    await updateMembershipPlan(plan_id, data);

    res.json({
      message: "Membership Plan Updated Successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateMembership: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const data = req.body;

    await updateMembership({
      ...data,
    });

    res.json({ message: "Membership Updated Successfully" });
  } catch (err) {
    next(err);
  }
};

export const handleMembershipList: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const statusType = req.query.status;

    const [records, meta] = await getMembershipList({
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

export const handleGetMembership: RequestHandler = async (req, res, next) => {
  try {
    const membership_id = parseInt(req.params.membership_id);

    const record = await getMembership(membership_id);

    res.json({
      ...record,
    });
  } catch (err) {
    next(err);
  }
};
