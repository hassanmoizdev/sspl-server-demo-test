
import { Router, ErrorRequestHandler } from 'express';
import { existsSync, mkdirSync, unlink } from 'fs';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import multer from 'multer';
import mimeTypes from 'mime-types';
import * as ctl from './handlers';

const unlinkAsync = promisify(unlink);
const conferencesRouter = Router();

const attendancePicturesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = `uploads/attendance/${req.user?.id || 0}/`;
    if (!existsSync(path))
      mkdirSync(path, { recursive: true });

    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user?.id || 0}_${randomUUID()}.${mimeTypes.extension(file.mimetype)}`);
  }
});

const attendancePictures = multer({ storage: attendancePicturesStorage });

conferencesRouter.post('/', ctl.handleCreateConference);
conferencesRouter.get('/', ctl.handleListConferences);
conferencesRouter.get('/:conferenceId', ctl.handleGetConference);
conferencesRouter.put('/:conferenceId', ctl.handleUpdateConference);
conferencesRouter.delete('/:conferenceId', ctl.handleDeleteConference);
conferencesRouter.post('/:conferenceId/feedback-form', ctl.handleCreateFeedbackForm);
conferencesRouter.get('/:conferenceId/feedback-form', ctl.handleGetFeedbackForm);
conferencesRouter.get('/feedback/result', ctl.handleGetFeedbackResult);
conferencesRouter.get('/feedback/result/users-list', ctl.handleGetFeedbackUsersList);
conferencesRouter.post('/:conferenceId/feedback', ctl.handleSubmitFeedback);

conferencesRouter.put('/:conferenceId/sessions/:sessionId/attendees', ctl.handleCreateAttendance);
conferencesRouter.post('/:conferenceId/sessions/:sessionId/attendees', attendancePictures.single('picture'), ctl.handleUploadAttendance);
conferencesRouter.get('/:conferenceId/attendees', ctl.handleListAttendance);
conferencesRouter.put('/:conferenceId/sessions/:sessionId/attendees/:attendeeId/review', ctl.handleReviewAttendance);

// Remove any uploaded file on error
const attendanceErrorHandler:ErrorRequestHandler = async (err, req, res, next) => {
  try {
    if (req.file)
      attendancePicturesStorage._removeFile(req, req.file, ()=>next(err));
    else
      throw err;
  }
  catch (err) {
    next(err);
  }
};
conferencesRouter.post("/certificate/generate", ctl.handleGenerateCertificate);
conferencesRouter.get("/certificate/verify/:serial", ctl.handleVerifyCertificate);
conferencesRouter.use('/:conferenceId/sessions/:sessionId/attendance', attendanceErrorHandler);

export default conferencesRouter;
