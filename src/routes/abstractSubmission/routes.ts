import { Router } from "express";
import * as ctl from "./handlers";
import multer from "multer";
import { existsSync, mkdirSync } from "fs";
import { randomUUID } from "crypto";
import mimeTypes from "mime-types";

const abstractSubmissionRouter = Router();

const abstractSubmissionPDFStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = `uploads/abstracts/${req.user?.id || 0}/`;
    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${req.user?.id || 0}_${randomUUID()}.${mimeTypes.extension(
        file.mimetype
      )}`
    );
  },
});

const abstractSubmissionPDF = multer({ storage: abstractSubmissionPDFStorage });

abstractSubmissionRouter.post(
  "/create",
  abstractSubmissionPDF.single("attachment"),
  ctl.handleCreate
);
abstractSubmissionRouter.put("/update", ctl.handleUpdateAbstractSubmission);
abstractSubmissionRouter.get("/", ctl.handleGetAbstractSubmission);

export default abstractSubmissionRouter;
