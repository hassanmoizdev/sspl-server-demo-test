
import { PrismaClient, Prisma, Session, TimeSlot, Attendee } from '@prisma/client';
import { getContext } from './async-context';

interface SessionExtended extends Session {
  breakdown?: TimeSlot[];
  attendees?: Attendee[];
}

const dbClient = new PrismaClient({
  omit: {
    account: {
      password: true
    },
    person: {
      acc_id: true
    },
    post: {
      creator_id: true,
    },
    postLiking: {
      creator_id: true,
      post_id: true,
    },
    comment: {
      creator_id: true,
      post_id: true,
    },
    guest: {
      person_id: true,
      active_status: true,
      created_at: true,
      updated_at: true,
      creator_id: true,
      org_id: true
    },
    profile: {
      owner_id: true,
      org_id: true
    },
    contact: {
      person_id: true,
      org_id: true
    },
    venue: {
      active_status: true,
      created_at: true,
      updated_at: true,
      creator_id: true,
      org_id: true
    },
    conference: {
      active_status: true,
      creator_id: true,
      org_id: true
    },
    addOnsSet: {
      conference_id: true,
      id: true
    },
    addOn: {
      add_ons_set_id: true,
      id: true
    },
    session: {
    },
    sessionMetaSet: {
      session_id: true,
      id: true
    },
    sessionMeta: {
      session_meta_set_id: true,
      id: true
    },
    timeSlot: {
      id: true,
      session_id: true
    },
    attendee: {
      person_id: true,
      session_id: true,
      conference_id: true,
      reviewer_id: true
    },
    questionnaire: {
      creator_id: true,
      org_id: true
    },
    questionGroup: {
      id: true,
      questionnaire_id: true
    },
    question: {
      parent_question_id: true,
      question_group_id: true
    },
    questionResponseOption: {
      id: true,
      question_id: true
    }
  },
  log: ['error', 'info']

}).$extends({
  name: 'Current user',
  model: {
    $allModels: {
      orgId () {
        const ctx = getContext('org');
        if (!ctx)
          throw new Error('Unable to read organization context.');

        return ctx.id as number;
      },

      currentUserId () {
        const ctx = getContext('auth');
        if (!ctx)
          throw new Error('Unable to read current user context.');

        return ctx.user.id as number;
      },

      currentUserOrgId () {
        const ctx = getContext('auth');
        if (!ctx)
          throw new Error('Unable to read authentication context.');

        return ctx.user.org_id as number;
      },

      currentUserRole () {
        const ctx = getContext('auth');
        if (!ctx)
          throw new Error('Unable to read authentication context.');

        return ctx.user.role;
      }
    }
  }
}).$extends({
  result: {
    session: {
      attendance: {
        // @ts-ignore
        needs: {attendees: true},
        compute: (sess) => () => {
          if (!sess.attendees || sess.attendees.length === 0)
            return;

          return sess.attendees[0];
        }
      },
      starts_at: {
        // @ts-ignore
        needs: {breakdown: true, starts_at: true},
        compute: (sess) => {
          const breakdown = sess.breakdown || [];
          if (!sess.starts_at && breakdown.length > 0)
            return breakdown[0].starts_at;
          return sess.starts_at;
        }
      },
      ends_at: {
        // @ts-ignore
        needs: {breakdown: true, ends_at: true},
        compute: (sess) => {
          const breakdown = sess.breakdown || [];
          if (!sess.ends_at && breakdown.length > 0)
            return breakdown[breakdown.length-1].ends_at;
          return sess.ends_at;
        }
      }
    }
  }
});

export default dbClient;