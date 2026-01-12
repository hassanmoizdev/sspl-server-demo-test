
import { RequestHandler } from 'express';
import { getProfile, updateProfile } from '../../@core/services/profiles';

export const handleGetCurrentUserProfile:RequestHandler = async (req, res, next) => {
  try {
    const profile = await getProfile();
    res.json(profile);
  }
  catch (err) {
    next(err);
  }
};

export const handleUpdateCurrentUserProfile:RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const updatedProfile = await updateProfile(data);
    res.json(updatedProfile);
  }
  catch (err) {
    next(err);
  }
};