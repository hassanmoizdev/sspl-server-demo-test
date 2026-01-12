import { AccountStatus } from "@prisma/client";
import db from "../utils/db";

class Account {
  static getByEmail(email: string, withPassword = false) {
    return db.account.findUnique({
      where: {
        email,
        // status: { not: 'DELETED' }
      },
      omit: {
        password: !withPassword,
      },
      include: {
        user: {
          omit: {
            prefix: true,
          },
          include: {
            profiles: {
              where: {
                org_id: db.account.orgId(),
              },
              include: {
                contact: {
                  omit: {
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        memberships: {
          where: {
            org_id: db.account.orgId(),
          },
          omit: {
            acc_id: true,
          },
        },
      },
    });
  }

  static getByEmailWithAllMemberships(email: string, withPassword = false) {
    return db.account.findUnique({
      where: {
        email,
      },
      omit: {
        password: !withPassword,
      },
      include: {
        user: {
          include: {
            profiles: true,
          },
        },
        memberships: true,
      },
    });
  }

  static getByPhone(phone: string) {
    return db.account.findFirst({
      // TODO: Make phone a unique field in database and use findUnique
      where: {
        phone,
        // status: { not: 'DELETED' }
      },
      include: {
        user: {
          omit: {
            prefix: true,
          },
          include: {
            profiles: {
              where: {
                org_id: db.account.orgId(),
              },
              include: {
                contact: {
                  omit: {
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        memberships: {
          where: {
            org_id: db.account.orgId(),
          },
          omit: {
            acc_id: true,
          },
        },
      },
    });
  }

  static getById(id: number, withPassword = false, userDetails = false) {
    return db.account.findUnique({
      where: {
        id,
        // status: { not: 'DELETED' }
      },
      omit: {
        password: !withPassword,
      },
      include: {
        user: {
          // omit: {
          //   prefix: true,
          // },
          include: {
            profiles: {
              where: {
                org_id: db.account.orgId(),
              },
              include: {
                contact: {
                  omit: {
                    email: userDetails ? !userDetails : true,
                    phone: userDetails ? !userDetails : true,
                  },
                },
              },
            },
          },
        },
        memberships: {
          where: {
            org_id: db.account.orgId(),
          },
          omit: {
            acc_id: true,
          },
        },
      },
    });
  }

  static getAccount() {
    return db.person.findUnique({
      where: {
        id: db.person.currentUserId(),
      },
      include: {
        account: {
          select: {
            email: true,
            phone: true,
            id: true,
            memberships: {
              omit: {
                org_id: true,
                acc_id: true,
              },
            },
          },
        },
        profiles: {
          where: {
            org_id: db.person.currentUserOrgId() || db.person.orgId(),
          },
          include: {
            contact: true,
          },
        },
      },
    });
  }

  static async exists(email: string) {
    const account = await db.account.findFirst({
      where: { email },
      // where: { email, status: { not: 'DELETED' } }
    });

    return !!account;
  }

  static create(data: any) {
    return db.account.create({
      data: {
        ...data,
        user: {
          create: {
            ...data.user,
            profile: undefined,
            profiles: data.user.profile && {
              create: {
                ...data.user.profile,
                org_id: db.account.orgId(),
                contact: data.user.profile.contact && {
                  create: data.user.profile.contact,
                },
              },
            },
          },
        },
        memberships: {
          create: data.memberships.map((mem: any) => ({
            ...mem,
            org_id: db.account.orgId(),
          })),
        },
      },
      include: {
        user: {
          omit: {
            prefix: true,
          },
          include: {
            profiles: {
              where: {
                org_id: db.account.orgId(),
              },
              include: {
                contact: {
                  omit: {
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        memberships: {
          where: {
            org_id: db.account.orgId(),
          },
          omit: {
            acc_id: true,
          },
        },
      },
    });
  }

  static updatePassword(id: number, pwdHash: string) {
    return db.account.update({
      where: {
        id,
        // status: {not: 'DELETED'}
      },
      data: {
        password: pwdHash,
      },
      include: {
        user: {
          omit: {
            prefix: true,
          },
          include: {
            profiles: {
              where: {
                org_id: db.account.orgId(),
              },
              include: {
                contact: {
                  omit: {
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        memberships: {
          where: {
            org_id: db.account.orgId(),
          },
          omit: {
            acc_id: true,
          },
        },
      },
    });
  }

  static delete(id: number) {
    return db.account.delete({
      where: { id },
    });
  }

  static update(id: number, data: any) {
    const { user, memberships, ...accountData } = data;
    const { password, ...accountRestData } = accountData;
    const { profile, ...rest } = user;

    return db.account.update({
      where: {
        id,
      },
      data: {
        ...accountRestData,
        ...(password ? { password } : {}),
        user: {
          update: {
            ...rest,
            profile: undefined,
            profiles: profile && {
              update: {
                where: {
                  owner_id_org_id: {
                    owner_id: user?.id,
                    org_id: db.account.orgId(),
                  },
                },
                data: {
                  ...data.user.profile,
                  org_id: db.account.orgId(),
                  contact: data.user.profile.contact && {
                    update: data.user.profile.contact,
                  },
                },
              },
            },
          },
        },
        memberships: {
          update: data.memberships.map((mem: any) => ({
            where: {
              acc_id_org_id: {
                acc_id: id,
                org_id: db.account.orgId(),
              },
            },
            data: {
              ...mem,
              org_id: db.account.orgId(),
            },
          })),
        },
      },
      include: {
        user: {
          include: {
            profiles: {
              where: {
                org_id: db.account.orgId(),
              },
              include: {
                contact: {
                  omit: {
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static listAll(paging?: { skip: number; take: number }) {
    return db.$transaction([
      db.account.findMany({
        orderBy: {
          created_at: "asc",
        },
        skip: paging?.skip ?? 0,
        take: paging?.take ?? 10,
        include: {
          memberships: true,
          user: {
            include: {
              profiles: true,
            },
          },
        },
      }),
      db.account.count(),
    ]);
  }

  static filterList(filter: any, paging?: { skip: number; take: number }) {
    const {
      search,
      statusType,
      roleType,
    }: { statusType: AccountStatus; search: string; roleType: any } = filter;

    const whereCondition: any = {
      status: statusType,
      memberships: {
        some: {
          role: roleType,
        },
      },
    };

    if (search && search.trim().length > 0) {
      whereCondition.AND = [
        {
          OR: [
            { user: { first_name: { contains: search, mode: "insensitive" } } },
            { user: { last_name: { contains: search, mode: "insensitive" } } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    return db.$transaction([
      db.account.findMany({
        where: whereCondition,
        orderBy: {
          created_at: "asc",
        },
        skip: paging?.skip ?? 0,
        take: paging?.take ?? 10,
        include: {
          memberships: true,
          user: {
            include: {
              profiles: true,
            },
          },
        },
      }),
      db.account.count({
        where: whereCondition,
      }),
    ]);
  }

  static allUsersList() {
    return db.account.findMany({
      orderBy: {
        created_at: "asc",
      },
      include: {
        memberships: {
          include: {
            membershipPlan: true,
          },
        },
        user: {
          include: {
            profiles: true,
          },
        },
      },
    });
  }
}

export default Account;
