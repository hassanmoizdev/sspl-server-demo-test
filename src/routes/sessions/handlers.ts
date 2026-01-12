
import { RequestHandler } from 'express';
import { getDaysSchedule, submitSessionFeedback } from '../../@core/services/conferences';
import { listSessions, createSession, updateSession, getSession, deleteSession } from '../../@core/services/sessions';
import { reformatGuest } from '../../@core/services/guests';
import { createQuestionnaire, getQuestionnaire } from '../../@core/services/questionnaires';

export const handleListSessions:RequestHandler = async (req, res, next) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId);
    const query = req.query;
    const sessions = await listSessions(conferenceId);

    const formattedSessions = sessions.map((sess) => ({
      ...sess,
      breakdown: sess.breakdown && sess.breakdown.map((slot) => ({
        ...slot,
        speakers: slot.speakers && slot.speakers.map(reformatGuest)
      }))
    }));

    if (query.format === 'days') {
      res.json(getDaysSchedule(sessions));
    }
    else
      res.json(formattedSessions);
  }
  catch (err) {
    next(err);
  }
};

export const handleCreateSession:RequestHandler = async (req, res, next) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId);
    const data = req.body;
    const session = await createSession(conferenceId, data);

    const formattedSession = {
      ...session,
      breakdown: session.breakdown && session.breakdown.map((slot) => ({
        ...slot,
        speakers: slot.speakers && slot.speakers.map(reformatGuest)
      }))
    };

    res.json(formattedSession);
  }
  catch (err) {
    next(err);
  }
};

export const handleUpdateSession:RequestHandler = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const data = req.body;
    const session = await updateSession(sessionId, data);

    const formattedSession = {
      ...session,
      breakdown: session.breakdown && session.breakdown.map((slot) => ({
        ...slot,
        speakers: slot.speakers && slot.speakers.map(reformatGuest)
      }))
    };

    res.json(formattedSession);
  }
  catch (err) {
    next(err);
  }
};

export const handleGetSession:RequestHandler = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const session = await getSession(sessionId);

    if (!session)
      throw new Error('Session not found.');

    const formattedSession = {
      ...session,
      breakdown: session.breakdown && session.breakdown.map((slot) => ({
        ...slot,
        speakers: slot.speakers && slot.speakers.map(reformatGuest)
      }))
    };

    res.json(formattedSession);
  }
  catch (err) {
    next(err);
  }
};

export const handleDeleteSession:RequestHandler = async (req, res, next) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    await deleteSession(sessionId);

    res.json({ id: sessionId });
  }
  catch (err) {
    next(err);
  }
};

export const handleSubmitFeedback:RequestHandler = async (req, res, next) => {
  try {
    const conferenceId = parseInt(req.params.conferenceId);
    const sessionId = parseInt(req.params.sessionId);
    const data = req.body;
    await submitSessionFeedback(conferenceId, sessionId, data.data);
    res.json({
      "message": "Feedback submitted successfuly"
    });
  }
  catch (err) {
    next(err);
  }
};
