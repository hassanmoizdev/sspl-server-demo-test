import { AccountStatus } from "@prisma/client";
import {
  getUser,
  getOfficeBearersUsers,
  resetPassword,
  signupUser,
  updateUser,
  getUsers,
  getAccount,
  getAllUsersList,
  updateDeviceToken,
} from "../../@core/services/users";
import { RequestHandler } from "express";

export const handleCreateOfficeBearers: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const data = req.body;
    const acc_id = req?.user?.id || 0;

    const authData = await signupUser(data, acc_id);
    res.json(authData);
  } catch (err) {
    next(err);
  }
};

export const handleGetOfficeBearers: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const [records, meta] = await getOfficeBearersUsers({ page, limit });

    res.json({
      records,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetUsers: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const statusType = req.query.status as AccountStatus;
    const roleType = req.query.role;
    const search = req.query.search as string;

    const [records, meta] = await getUsers(
      { search, statusType, roleType },
      { page, limit }
    );

    res.json({
      records,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetAllUsersList: RequestHandler = async (req, res, next) => {
  try {
    const records= await getAllUsersList();

    res.json(records);
  } catch (err) {
    next(err);
  }
};

export const handleGetUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await getUser();

    res.json({
      ...(user || {}),
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetAccount: RequestHandler = async (req, res, next) => {
  try {
    const userId = parseInt(req?.params?.acc_id);

    const user = await getAccount(userId);

    res.json({
      ...(user || {}),
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req?.user?.id);
    const data = req.body;

    const user = await updateUser(userId, data);

    res.json({
      ...(user || {}),
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateAccount: RequestHandler = async (req, res, next) => {
  try {
    const userId = parseInt(req?.params?.acc_id);
    const data = req.body;

    const user = await updateUser(userId, data);

    res.json({
      ...(user || {}),
    });
  } catch (err) {
    next(err);
  }
};

export const handleResetPassword: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;

    const user = await resetPassword(data);

    res.json({
      ...(user || {}),
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateDeviceToken: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req?.user?.id);
    const { device_token, device_platform } = req.body;

    if (!device_token || !device_platform) {
      res.status(400).json({
        error: 'device_token and device_platform are required'
      });
      return;
    }

    if (device_platform !== 'ios' && device_platform !== 'android') {
      res.status(400).json({
        error: 'device_platform must be either "ios" or "android"'
      });
      return;
    }

    await updateDeviceToken(userId, device_token, device_platform);

    res.json({
      message: 'Device token updated successfully'
    });
  } catch (err) {
    next(err);
  }
};
