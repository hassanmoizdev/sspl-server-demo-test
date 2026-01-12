import {
  createComment,
  createPost,
  deletePost,
  getPost,
  likePost,
  listComments,
  listMePosts,
  listPosts,
  reportPost,
  updatePost,
} from "../../@core/services/posts";
import { RequestHandler } from "express";

export const handleCreatePost: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const file = req.file;
    const acc_id = req?.user?.id || 0;

    // if (!file) throw new Error("Picture not uploaded.");

    const newPost = await createPost(acc_id, {
      text: data?.text,
      picture: file?.path || "",
    });

    res.json(newPost);
  } catch (err) {
    next(err);
  }
};

export const handleUpdatePost: RequestHandler = async (req, res, next) => {
  try {
    const post_id = parseInt(req.params.post_id);
    const data = req.body;
    const file = req.file;

    const updatedPost = await updatePost(post_id, {
      text: data?.text,
      picture: file?.path || "",
    });

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};

export const handleListPosts: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const filter = req.query.filter || "ACTIVE";

    const [records, meta] = await listPosts(filter, { page, limit });

    res.json({
      records,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

export const handleListMePosts: RequestHandler = async (req, res, next) => {
  try {
    const acc_id = Number(req?.user?.id);
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    const [records, meta] = await listMePosts(acc_id, { page, limit });

    res.json({
      records,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

export const handleLikePost: RequestHandler = async (req, res, next) => {
  try {
    const post_id = parseInt(req.params.post_id);
    const acc_id = Number(req?.user?.id);
    const like = req.params.like;
    const likeType = like === "true" ? true : like === "false" ? false : null;

    await likePost(post_id, acc_id, likeType);
    res.json({
      // status: 200,
      message:
        like === "true"
          ? `post liked successfully`
          : like === "false"
          ? `post DisLiked successfully`
          : `post Unlike successfully`,
    });
  } catch (err) {
    next(err);
  }
};

export const handleCreateComment: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const acc_id = Number(req?.user?.id);
    const post_id = parseInt(req.params.post_id);

    const newComment = await createComment(acc_id, post_id, data);
    res.json(newComment);
  } catch (err) {
    next(err);
  }
};

export const handleGetComments: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const post_id = parseInt(req.params.post_id as string);

    const [records, meta] = await listComments(post_id, { page, limit });

    console.log(records, "records");
    res.json({
      records,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

export const handleDeletePost: RequestHandler = async (req, res, next) => {
  try {
    const post_id = parseInt(req.params.post_id as string);

    await deletePost(post_id);

    res.json({ message: `Post deleted successfully` });
  } catch (err) {
    next(err);
  }
};

export const handleReportPost: RequestHandler = async (req, res, next) => {
  try {
    const post_id = parseInt(req.params.post_id as string);

    await reportPost(post_id);

    res.json({
      message: `Post Reported Successfully`,
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetPost: RequestHandler = async (req, res, next) => {
  try {
    const post_id = parseInt(req.params.post_id as string);

    const post = await getPost(post_id);

    res.json({
      data: post,
    });
  } catch (err) {
    next(err);
  }
};
