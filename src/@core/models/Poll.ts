import { rolesDBKeys, selection_category } from "../../@core/utils/constant";
import db from "../utils/db";

class Poll {
  static create(data: any) {
    return db.poll.create({
      data: {
        ...data,
      },
    });
  }

  static update(poll_id: number, data: any) {
    return db.poll.update({
      where: {
        id: poll_id,
      },
      data: {
        ...data,
      },
    });
  }

  static getSingle(id: number) {
    return db.poll.findUnique({
      where: {
        id,
      },
      include: {
        options: true,
        votes: {
          where: { id },
          select: { option_id: true },
        },
      },
    });
  }

  static getOnlyById(id: number) {
    return db.poll.findUnique({
      where: {
        id,
      },
    });
  }

  static getMany(
    statusFilter: "ALL" | "ARCHIVED" | "ACTIVE",
    acc_id: number,
    allow: string
  ) {
    const now = new Date();
    const statusCondition =
      statusFilter === selection_category?.ALL
        ? {}
        : statusFilter === selection_category?.ARCHIVED
        ? {
            expires_at: {
              lte: now.toISOString(),
            },
          }
        : {
            expires_at: {
              gt: now.toISOString(),
            },
          };

    const whereCondition = {
      ...(statusCondition || {}),
      starts_at: {
        lte: now.toISOString(),
      },
      ...(allow !== rolesDBKeys?.SUPER_ADMIN && {
        expires_at: {
          gt: new Date().toISOString(),
        },
      }),
      ...(allow !== rolesDBKeys?.SUPER_ADMIN && {
        OR: [{ allow: allow }, { allow: selection_category?.ALL }],
      }),
    };

    return db.poll.findMany({
      where: statusFilter === selection_category?.ALL ? {} : whereCondition,
      orderBy: {
        created_at: "desc",
      },
      include: {
        options: true,
        votes: {
          where: {
            creator_id: acc_id,
          },
          select: { option_id: true },
        },
      },
    });
  }

  static delete(id: number) {
    return db.$transaction([
      db.vote.deleteMany({
        where: {
          poll_id: id,
        },
      }),
      db.option.deleteMany({
        where: {
          poll_id: id,
        },
      }),
      db.poll.delete({
        where: {
          id: id,
        },
      }),
    ]);
  }

  static getPollResult(poll_id: any) {
    return db.poll.findFirst({
      where: {
        id: poll_id,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });
  }
}

export default Poll;
