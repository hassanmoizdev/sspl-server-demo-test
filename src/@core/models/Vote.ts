import db from "../utils/db";

class Vote {
  static create(poll_id: number, option_id: number) {
    return db.vote.create({
      data: {
        creator_id: db.vote.currentUserId(),
        poll_id,
        option_id,
      },
    });
  }

  static getAlreadyVoted(poll_id: number) {
    return db.vote.findUnique({
      where: {
        creator_id_poll_id: {
          creator_id: db.vote.currentUserId(),
          poll_id,
        },
      },
    });
  }

  static updateExisting(id: number, option_id: number) {
    return db.vote.update({
      where: {
        id: id,
      },
      data: {
        option_id,
      },
    });
  }
}

export default Vote;
