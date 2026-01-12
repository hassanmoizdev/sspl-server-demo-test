
import Session from '../models/Session';
import sessionValidator from '../validators/session-data-validator';

export const createSession = (conferenceId:number, data:any) => {
  return Session.create(conferenceId, sessionValidator.parse(data));
};

export const updateSession = (id:number, data:any) => {
  return Session.update(id, sessionValidator.partial().parse(data));
};

export const getSession = (id:number) => {
  return Session.getById(id);
};

export const deleteSession = (id:number) => {
  return Session.delete(id);
};

export const listSessions = (conferenceId:number) => {
  return Session.list(conferenceId);
};
