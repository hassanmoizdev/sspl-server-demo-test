import { existsSync, unlinkSync } from "node:fs";
import db from "../utils/db";

class Post {
  static create(acc_id: number, data: any) {
    return db.post.create({
      data: {
        ...data,
        creator_id: acc_id,
      },
    });
  }

  static async update(post_id: number, data: any) {
    const existingPost = await db.post.findUnique({
      where: { id: post_id },
    });

    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (
      data?.picture &&
      existingPost?.picture &&
      existsSync(existingPost?.picture)
    ) {
      try {
        unlinkSync(existingPost.picture);
      } catch (err) {
        console.warn("Error deleting old picture:", err);
      }
    }

    return db.post.update({
      where: { id: post_id },
      data: {
        text: data?.text ?? existingPost.text,
        picture: data?.picture ? data?.picture : existingPost.picture,
      },
    });
  }

  static listAll(
    statusFilter: "ALL" | "ACTIVE" | "ARCHIVED" | "DELETED" = "ALL",
    paging?: { skip: number; take: number }
  ) {
    const whereCondition =
      statusFilter === "ALL"
        ? {}
        : {
            active_status: statusFilter,
          };
    return db.$transaction([
      db.post.findMany({
        where: whereCondition,
        orderBy: {
          created_at: "asc",
        },
        skip: paging?.skip ?? 0,
        take: paging?.take ?? 10,
        include: {
          postLiking: true,
        },
      }),
      db.post.count(),
    ]);
  }

  static listMeAll(acc_id: number, paging?: { skip: number; take: number }) {
    return db.$transaction([
      db.post.findMany({
        where: {
          creator_id: acc_id,
          active_status: {
            in: ["ACTIVE", "ARCHIVED"],
          },
        },
        orderBy: {
          created_at: "asc",
        },
        skip: paging?.skip ?? 0,
        take: paging?.take ?? 10,
      }),
      db.post.count({
        where: {
          creator_id: acc_id,
          active_status: {
            in: ["ACTIVE", "ARCHIVED"],
          },
        },
      }),
    ]);
  }

  static getById(id: number) {
    return db.post.findUnique({
      where: {
        id,
      },
    });
  }

  static async likeUpdate(id: number, acc_id: number, like: any) {
    const existing = await db.postLiking.findFirst({
      where: { creator_id: acc_id, post_id: id },
    });

    if (existing) {
      // If user already liked/disliked, update it
      return db.postLiking.update({
        where: { id: existing.id },
        data: { like },
      });
    } else {
      // Create new entry
      return db.postLiking.create({
        data: {
          creator_id: acc_id,
          post_id: id,
          like,
        },
      });
    }
  }

  static delete(id: number) {
    return db.post.update({
      where: {
        id,
      },
      data: {
        active_status: "DELETED",
      },
    });
  }

  static report(id: number) {
    return db.post.update({
      where: {
        id,
      },
      data: {
        report_count: {
          increment: 1,
        },
        active_status: "ARCHIVED",
      },
    });
  }
}

export default Post;
