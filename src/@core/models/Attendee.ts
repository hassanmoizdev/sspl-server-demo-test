import db from "../utils/db";

class Attendance {
  static create(data: any) {
    return db.attendee.upsert({
      where: {
        person_id_session_id: {
          session_id: data.session_id,
          person_id: data.person_id,
        },
      },
      update: {
        ...data,
      },
      create: {
        ...data,
        person_id: data.person_id,
      },
    });
  }

  static listAll(
    conferenceId: number,
    query?: { status?: any },
    paging?: { skip: number; take: number }
  ) {
    return db.$transaction([
      db.attendee.findMany({
        where: {
          conference_id: conferenceId,
          ...query,
        },
        orderBy: {
          created_at: "asc",
        },
        ...paging,
        include: {
          person: {
            include: {
              profiles: {
                where: {
                  org_id: db.attendee.currentUserOrgId() || db.attendee.orgId(),
                },
              },
              account: {
                select: {
                  email: true,
                },
              },
            },
          },
          session: {
            select: {
              id: true,
              title: true,
            },
          },
          reviewer: true,
        },
      }),
      db.attendee.count({
        where: {
          conference_id: conferenceId,
          ...query,
        },
      }),
    ]);
  }

  static review(sessionId: number, personId: number, data: any) {
    return db.attendee.update({
      where: {
        person_id_session_id: {
          person_id: personId,
          session_id: sessionId,
        },
      },
      data: {
        ...data,
        reviewer_id: db.attendee.currentUserId(),
      },
      include: {
        person: true,
        session: {
          select: {
            id: true,
            title: true,
          },
        },
        reviewer: true,
      },
    });
  }

  static getUniqueAttendance(personId: number) {
    return db.attendee.findFirst({
      where: {
        person_id: personId,
      },
      include: {
        person: true,
        session: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}

export default Attendance;
