
import Venue from '../models/Venue';
import venueValidator from '../validators/venue-data-validator';

export const createVenue = (data:any) => {
  return Venue.create(venueValidator.parse(data));
};

export const updateVenue = (id:number, data:any) => {
  return Venue.update(id, venueValidator.partial().parse(data));
};

export const getVenue = (id:number) => {
  return Venue.getById(id);
};

export const listVenues = () => {
  return Venue.listAll();
};