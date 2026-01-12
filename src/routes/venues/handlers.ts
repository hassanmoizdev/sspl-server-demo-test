
import { RequestHandler } from 'express';
import { createVenue, updateVenue, getVenue, listVenues } from '../../@core/services/venues';

export const handleCreateVenue:RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const newVenue = await createVenue(data);
    res.json(newVenue);
  }
  catch (err) {
    next(err);
  }
};

export const handleUpdateVenue:RequestHandler = async (req, res, next) => {
  try {
    const venueId = parseInt(req.params.venueId);
    const data = req.body;

    const updatedVenue = await updateVenue(venueId, data);
    res.json(updatedVenue);
  }
  catch (err) {
    next(err);
  }
};

export const handleGetSpeaker:RequestHandler = async (req, res, next) => {
  try {
    const venueId = parseInt(req.params.venueId);
    const venue = await getVenue(venueId);
    res.json(venue);
  }
  catch (err) {
    next(err);
  }
};

export const handleListSpeakers:RequestHandler = async (req, res, next) => {
  try {
    const venues = await listVenues();
    res.json(venues);
  }
  catch (err) {
    next(err);
  }
};