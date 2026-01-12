import { RequestHandler } from "express";
import {
  getTransactionDetail,
  getTransactionDetailByMembership,
  getTranscationHistoryList,
} from "../../@core/services/transactionHistory";

export const handleGet: RequestHandler = async (req, res, next) => {
  try {
    const transaction_id = parseInt(req.params.transaction_id);

    const data = await getTransactionDetail(transaction_id);

    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const handleGetByMembership: RequestHandler = async (req, res, next) => {
  try {
    const membership_id = parseInt(req.params.membership_id);

    const data = await getTransactionDetailByMembership(membership_id);

    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const handleGetList: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const statusType = req.query.status;
    const user = req?.user;

    const [records, meta] = await getTranscationHistoryList({
      page,
      limit,
      status: statusType,
      user,
    });

    res.json({
      records,
      meta,
    });
  } catch (err) {
    next(err);
  }
};
