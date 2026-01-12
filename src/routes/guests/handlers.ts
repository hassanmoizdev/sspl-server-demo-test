
import { RequestHandler } from 'express';
import { createGuest, listGuests, getGuest, updateGuest, deleteGuest, reformatGuest } from '../../@core/services/guests';

export const handleCreateGuest:RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const newGuest = await createGuest(data);
    res.json(reformatGuest(newGuest));
  }
  catch (err) {
    next(err);
  }
};

export const handleUpdateGuest:RequestHandler = async (req, res, next) => {
  try {
    const guestId = parseInt(req.params.guestId);
    const data = req.body;
    const updatedGuest = await updateGuest(guestId, data);

    res.json(reformatGuest(updatedGuest));
  }
  catch (err) {
    next(err);
  }
};

export const handleGetGuest:RequestHandler = async (req, res, next) => {
  try {
    const guestId = parseInt(req.params.guestId);
    const guest = await getGuest(guestId);
    res.json(reformatGuest(guest));
  }
  catch (err) {
    next(err);
  }
};

export const handleListGuests:RequestHandler = async (req, res, next) => {
  try {
    const guests = await listGuests();
    res.json(guests.map(reformatGuest));
  }
  catch (err) {
    next(err);
  }
};

export const handleDeleteGuest:RequestHandler = async (req, res, next) => {
  try {
    const guestId = parseInt(req.params.guestId);
    const result = await deleteGuest(guestId);
    res.json(result);
  }
  catch (err) {
    next(err);
  }
};