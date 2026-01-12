
import { rolesDBKeys } from '../../@core/utils/constant';
import db from '../utils/db';

class Conference {
  static create (data:any) {
    return db.conference.create({
      data: {
        ...data,
        creator_id: db.conference.currentUserId(),
        org_id: db.conference.currentUserOrgId() || db.conference.orgId(),
        sessions: data.sessions && {
          create: data.sessions.map((sess:any) => ({
            ...sess,
            breakdown: sess.breakdown && {
              create: sess.breakdown.map((slot:any) => ({
                ...slot,
                speakers: slot.speakers && {
                  connect: slot.speakers.map((spId:any) => ({ id: spId }))
                }
              }))
            },
            add_on_sets: sess.add_on_sets && {
              create: sess.add_on_sets.map((addOnsSet:any) => ({
                ...addOnsSet,
                add_ons: addOnsSet.add_ons && {
                  create: addOnsSet.add_ons
                }
              }))
            }
          }))
        },
        add_on_sets: data.add_on_sets && {
          create: data.add_on_sets.map((addOnsSet:any) => ({
            ...addOnsSet,
            add_ons: addOnsSet.add_ons && {
              create: addOnsSet.add_ons
            }
          }))
        }
      },
      include: {
        venue: true,
        sessions: {
          orderBy: {
            starts_at: 'asc'
          },
          include: {
            add_on_sets: {
              include: {
                add_ons: true
              }
            },
            breakdown: {
              orderBy: {
                starts_at: 'asc'
              },
              include: {
                speakers: {
                  include: {
                    person: true
                  }
                }
              }
            },
            venue: true
          }
        },
        add_on_sets: {
          include: {
            add_ons: true
          }
        }
      }
    });
  }

  static update(id:number, data:any) {
    return db.conference.update({
      where: {
        id,
        org_id: db.conference.currentUserOrgId() || db.conference.orgId()
      },
      data: {
        ...data,
        sessions: data.sessions && {
          deleteMany: {
            conference_id: id
          },
          create: data.sessions.map((sess:any) => ({
            ...sess,
            breakdown: sess.breakdown && {
              create: sess.breakdown.map((slot:any) => ({
                ...slot,
                speakers: slot.speakers && {
                  connect: slot.speakers.map((spId:any) => ({ id: spId }))
                }
              }))
            },
            add_on_sets: sess.add_on_sets && {
              create: sess.add_on_sets.map((addOnsSet:any) => ({
                ...addOnsSet,
                add_ons: addOnsSet.add_ons && {
                  create: addOnsSet.add_ons
                }
              }))
            }
          }))
        },
        add_on_sets: data.add_on_sets && {
          deleteMany: {
            conference_id: id
          },
          create: data.add_on_sets.map((addOnsSet:any) => ({
            ...addOnsSet,
            add_ons: addOnsSet.add_ons && {
              create: addOnsSet.add_ons
            }
          }))
        }
      },
      include: {
        venue: true,
        sessions: {
          orderBy: {
            starts_at: 'asc'
          },
          include: {
            add_on_sets: {
              include: {
                add_ons: true
              }
            },
            breakdown: {
              orderBy: {
                starts_at: 'asc'
              },
              include: {
                speakers: {
                  include: {
                    person: true
                  }
                }
              }
            },
            venue: true
          }
        },
        add_on_sets: {
          include: {
            add_ons: true
          }
        }
      }
    });
  }

  static getById(id:number) {
    return db.conference.findFirst({
      where: {
        id,
        org_id: db.conference.currentUserOrgId() || db.conference.orgId()
      },
      include: {
        venue: true,
        sessions: {
          orderBy: {
            starts_at: 'asc'
          },
          include: {
            attendees: {
              where: {
                person_id: db.conference.currentUserId()
              }
            },
            add_on_sets: {
              include: {
                add_ons: true
              }
            },
            breakdown: {
              orderBy: {
                starts_at: 'asc'
              },
              include: {
                speakers: {
                  include: {
                    person: true
                  }
                }
              }
            },
            venue: true
          },
          omit: {
            conference_id: true
          }
        },
        add_on_sets: {
          include: {
            add_ons: true
          }
        }
      }
    });
  }

  static listAll (filter:any,allow:string ) {
    return db.conference.findMany({
      where: {
        ...filter,
        org_id: db.conference.currentUserOrgId() || db.conference.orgId(),
         ...(allow !== rolesDBKeys?.SUPER_ADMIN && {
        OR: [
          { allow: { has: allow } }, 
          { allow: { has: "ALL" } }, 
       ],
    }),
      },
      orderBy: {
        start_date: 'asc'
      },
      include: {
        venue: true
      }
    });
  }

  static delete (id:number) {
    return db.conference.delete({
      where: {
        id,
        org_id: db.conference.currentUserOrgId() || db.conference.orgId()
      }
    });
  }
}

export default Conference;
