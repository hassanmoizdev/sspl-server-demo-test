
import Guest from '../models/Guest';
import Person from '../models/Person';
import guestValidator from '../validators/guest-data-validator';

export const reformatGuest = ({id, person: {id:_, ...personalInfo}, ...guest}:any) => {
  return {
    id,
    ...guest,
    ...personalInfo,
    profiles: undefined,
    profile: personalInfo.profiles && personalInfo.profiles[0]
  };
};

export const createGuest = async (data:any) => {
  const parsedData = guestValidator.parse(data);

  // Check if guest already exists.
  // if (await Guest.exists(parsedData.email))
  //   throw new Error('Guest already exists with this email address.');

  // Create guest in db.
  return Guest.create(parsedData);
};

export const updateGuest = async (id:number, data:any) => {
  const guest = await Guest.getById(id);
  if (!guest)
    throw new Error('Guest not found.');

  const customValidator = guestValidator.omit({ email: true });
  await Person.update(guest.person.id, customValidator.partial().parse(data));

  return Guest.update(id, guestValidator.partial().parse(data));
};

export const getGuest = (id:number) => {
  return Guest.getById(id);
};

export const listGuests = () => {
  return Guest.listAll();
};

export const deleteGuest = (id:number) => {
  return Guest.delete(id);
};
