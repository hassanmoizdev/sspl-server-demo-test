import { Router } from "express";
import * as ctl from "./handlers";
import multer from "multer";
import { existsSync, mkdirSync } from "fs";
import { randomUUID } from "crypto";
import mimeTypes from "mime-types";

const postsRouter = Router();

const postPicturesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = `uploads/posts/${req.user?.id || 0}/`;
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

const postPictures = multer({ storage: postPicturesStorage });

postsRouter.post(
  "/create",
  postPictures.single("attachment"),
  ctl.handleCreatePost
);
postsRouter.get("/", ctl.handleListPosts);
postsRouter.get("/me", ctl.handleListMePosts);
postsRouter.put("/like/:post_id/:like", ctl.handleLikePost);
postsRouter.get("/:post_id", ctl.handleGetPost);
postsRouter.post("/comment/create/:post_id", ctl.handleCreateComment);
postsRouter.get("/comment/:post_id", ctl.handleGetComments);
postsRouter.put("/report/:post_id", ctl.handleReportPost);
postsRouter.delete("/:post_id", ctl.handleDeletePost);
postsRouter.put(
  "/update/:post_id",
  postPictures.single("attachment"),
  ctl.handleUpdatePost
);

export default postsRouter;
