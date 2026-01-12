import { rolesDBKeys } from "../../@core/utils/constant";
import db from "../utils/db";

class Meeting {
  static create(data: any) {
    return db.meeting.create({
      data: {
        ...data,
      },
    });
  }

  static update(meeting_id: number, data: any) {
    return db.meeting.update({
      where: {
        id: meeting_id,
      },
      data: {
        ...data,
      },
    });
  }

  static getSingle(id: number) {
    return db.meeting.findUnique({
      where: {
        id,
      },
    });
  }

  static getOnlyById(id: number) {
    return db.meeting.findUnique({
      where: {
        id,
      },
    });
  }

  static getUserListing(allow: string) {
    return db.meeting.findMany({
      where: {
        ...(allow !== rolesDBKeys?.SUPER_ADMIN && {
          end: {
            gt: new Date().toISOString(),
          },
        }),
        ...(allow !== rolesDBKeys?.SUPER_ADMIN && {
          OR: [{ allow: allow }, { allow: "ALL" }],
        }),
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  static getMany({ skip, take, role: allow }: any) {
    return db.$transaction([
      db.meeting.findMany({
        where: {
          ...(allow !== rolesDBKeys?.SUPER_ADMIN && {
            end: {
              gt: new Date().toISOString(),
            },
          }),
          ...(allow !== rolesDBKeys?.SUPER_ADMIN && {
            OR: [{ allow: allow }, { allow: "ALL" }],
          }),
        },
        orderBy: {
          created_at: "desc",
        },
        skip: skip ?? 0,
        take: take ?? 10,
      }),
      db.meeting.count(),
    ]);
  }

  // static delete(id: number) {
  //   return db.$transaction([
  //     db.vote.deleteMany({
  //       where: {
  //         poll_id: id,
  //       },
  //     }),
  //     db.option.deleteMany({
  //       where: {
  //         poll_id: id,
  //       },
  //     }),
  //     db.poll.delete({
  //       where: {
  //         id: id,
  //       },
  //     }),
  //   ]);
  // }
}

export default Meeting;
