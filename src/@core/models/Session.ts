
import db from '../utils/db';

class Session {
  static getById (id:number) {
    return db.session.findFirst({
      where: { id },
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
    });
  }

  static create (conference_id:number, data:any) {
    return db.session.create({
      data: {
        ...data,
        conference_id,
        breakdown: data.breakdown && {
          create: data.breakdown.map((slot:any) => ({
            ...slot,
            speakers: slot.speakers && {
              connect: slot.speakers.map((spId:any) => ({ id: spId }))
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
    });
  }

  static update (id:number, data:any) {
    return db.session.update({
      where: { id },
      data: {
        ...data,
        breakdown: data.breakdown && {
          deleteMany: { session_id: id },
          create: data.breakdown.map((slot:any) => ({
            ...slot,
            speakers: slot.speakers && {
              connect: slot.speakers.map((spId:any) => ({ id: spId }))
            }
          }))
        },
        add_on_sets: data.add_on_sets && {
          deleteMany: { session_id: id },
          create: data.add_on_sets.map((addOnsSet:any) => ({
            ...addOnsSet,
            add_ons: addOnsSet.add_ons && {
              create: addOnsSet.add_ons
            }
          }))
        }
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
    });
  }

  static delete (id:number) {
    return db.session.delete({
      where: { id }
    });
  }

  static list (conference_id:number) {
    return db.session.findMany({
      where: {
        conference_id
      },
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
    });
  }
}

export default Session;
