import db from "../utils/db";

class PollOption {
  static createMany(poll_id: number, data: any) {
    const optionsWithPollId = data.map((item: any) => ({
      ...item,
      poll_id,
    }));

    return db.option.createMany({
      data: optionsWithPollId,
    });
  }

  static getById(id: number) {
    return db.option.findUnique({
      where: {
        id,
      },
    });
  }

  static update(poll_id: number, data: any) {
    const operations = data.map((item: any) => {
      if (item.id && item.is_delete) {
        return db.$transaction([
          db.vote.deleteMany({
            where: {
              poll_id: poll_id,
              option_id: item.id,
            },
          }),
          db.option.delete({
            where: {
              id: item.id,
              poll_id: poll_id,
            },
          }),
        ]);
      } else if (item.id) {
        return db.option.update({
          where: {
            id: item.id,
            poll_id: poll_id,
          },
          data: {
            ...item,
            poll_id,
          },
        });
      } else {
        return db.option.create({
          data: {
            ...item,
            poll_id,
          },
        });
      }
    });

    return Promise.all(operations);
  }

}

export default PollOption;
