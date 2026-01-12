import db from "../utils/db";

class Comment {
  static create(acc_id: number, post_id: number, data: any) {
    return db.comment.create({
      data: {
        ...data,
        creator_id: acc_id,
        post_id,
      },
    });
  }

  static listAll(post_id: number, paging?: { skip: number; take: number }) {
    return db.$transaction([
      db.comment.findMany({
        where: {
          post_id: post_id,
        },
        orderBy: {
          created_at: "asc",
        },
        skip: paging?.skip ?? 0,
        take: paging?.take ?? 10,
        include: {
          post: {
            select: {
              id: true,
            },
          },
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              account: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      db.comment.count({
        where: {
          post_id: post_id,
        },
      }),
    ]);
  }
}

export default Comment;
