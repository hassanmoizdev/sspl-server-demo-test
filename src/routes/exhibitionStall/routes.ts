import { Router } from "express";
import * as ctl from "./handlers";
import multer from "multer";
import { existsSync, mkdirSync } from "fs";
import { randomUUID } from "crypto";
import mimeTypes from "mime-types";

const exhibitionStallRouter = Router();

const exhibitionStallStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = `uploads/exhibition/${req.user?.id || 0}/`;
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

const companyLogo = multer({ storage: exhibitionStallStorage });

exhibitionStallRouter.post(
  "/create",
  companyLogo.single("company_logo"),
  ctl.handleCreate
);
exhibitionStallRouter.get("/:stall_id", ctl.handleGetSingleStall);
exhibitionStallRouter.put(
  "/update/:stall_id",
  companyLogo.single("company_logo"),
  ctl.handleUpdateExhibitionStall
);
exhibitionStallRouter.get("/", ctl.handleGetExhibitionStall);
exhibitionStallRouter.delete("/:exhibition_id", ctl.handleDelete);

export default exhibitionStallRouter;
