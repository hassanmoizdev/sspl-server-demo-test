import path from "path";
import Comment from "../models/Comment";
import Post from "../models/Posts";
import { promisify } from "util";
import { unlink } from "fs";

const unlinkAsync = promisify(unlink);

export const createPost = async (acc_id: number, data: any) => {
  return Post.create(acc_id, data);
};

export const updatePost = async (post_id: number, data: any) => {
  return await Post.update(post_id, data);
};

export const listPosts = async (
  statusFilter: any,
  paging: { page: number; limit: number }
) => {
  let _page = Math.abs(paging.page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(paging.limit) || 20;

  const [records, count]: any = await Post.listAll(statusFilter, {
    skip: _page * _limit,
    take: _limit,
  });

  const formattedRecords = records?.map((record: any) => {
    const like_count = record.postLiking.filter(
      (l: any) => l.like === true
    ).length;
    const dislike_count = record.postLiking.filter(
      (l: any) => l.like === false
    ).length;

    const { postLiking, ...rest } = record;

    return {
      ...rest,
      like_count,
      dislike_count,
    };
  });

  return [
    formattedRecords,
    {
      total_records: count,
      current_page: _page + 1,
      total_pages: Math.ceil(count / _limit),
      limit: _limit,
    },
  ];
};

export const listComments = async (
  post_id: number,
  paging: { page: number; limit: number }
) => {
  let _page = Math.abs(paging.page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(paging.limit) || 20;

  const [records, count]: any = await Comment.listAll(post_id, {
    skip: _page * _limit,
    take: _limit,
  });

  return [
    records,
    {
      total_records: count,
      current_page: _page + 1,
      total_pages: Math.ceil(count / _limit),
      limit: _limit,
    },
  ];
};

export const listMePosts = async (
  acc_id: number,
  paging: { page: number; limit: number }
) => {
  let _page = Math.abs(paging.page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(paging.limit) || 20;

  const [records, count]: any = await Post.listMeAll(acc_id, {
    skip: _page * _limit,
    take: _limit,
  });

  return [
    records,
    {
      total_records: count,
      current_page: _page + 1,
      total_pages: Math.ceil(count / _limit),
      limit: _limit,
    },
  ];
};

export const likePost = async (post_id: number, acc_id: number, like: any) => {
  const post = await Post.getById(post_id);
  if (!post) throw new Error("Post does not exist.");

  return Post.likeUpdate(post_id, acc_id, like);
};

export const createComment = async (
  acc_id: number,
  post_id: number,
  data: any
) => {
  const post = await Post.getById(post_id);
  if (!post) throw new Error("Post does not exist.");

  return Comment.create(acc_id, post?.id, data);
};

export const deletePost = async (post_id: number) => {
  const post = await Post.getById(post_id);
  if (!post) throw new Error("Post does not exist.");

  // if (post.picture) {
  //   const filePath = path.resolve(process.cwd(), post.picture);

  //   await unlinkAsync(filePath);
  // }

  return Post.delete(post_id);
};

export const reportPost = async (post_id: number) => {
  return Post.report(post_id);
};

export const getPost = async (post_id: number) => {
  const post = await Post.getById(post_id);
  if (!post) throw new Error("Post does not exist.");

  return post;
};
