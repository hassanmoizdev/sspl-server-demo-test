import { Role } from "@prisma/client";
import {
  createOption,
  createPoll,
  createVote,
  deletePoll,
  getPoll,
  getResult,
  listPoll,
  updateOption,
  updatePoll,
} from "../../@core/services/poll";
import { RequestHandler } from "express";

export const handleCreatePoll: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;

    const newPoll = await createPoll({
      title: data?.title,
      allow: data?.allow,
      starts_at: data?.starts_at,
      expires_at: data?.expires_at,
    });

    await createOption(newPoll?.id, data?.options);

    res.json({ message: "Poll Created Successfully" });
  } catch (err) {
    next(err);
  }
};

export const handleGetPoll: RequestHandler = async (req, res, next) => {
  try {
    const acc_id = Number(req?.user?.id);
    const role = req?.user?.role as Role;
    const statusFilter = req.query.filter || "ACTIVE";

    const records = await listPoll(statusFilter, acc_id, role);

    const modifiedRecords = records.map((poll: any) => {
      const votedOptionId = poll.votes?.[0]?.option_id;

      const updatedOptions = poll.options.map((opt: any) => ({
        ...opt,
        selected: opt.id === votedOptionId,
      }));

      return {
        ...poll,
        options: updatedOptions,
      };
    });

    res.json({
      records: modifiedRecords,
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetSinglePoll: RequestHandler = async (req, res, next) => {
  try {
    const poll_id = parseInt(req.params.poll_id);

    const record = await getPoll(poll_id);

    res.json({
      ...record,
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdate: RequestHandler = async (req, res, next) => {
  try {
    const poll_id = parseInt(req.params.poll_id);
    const data = req.body;

    await updatePoll(poll_id, {
      title: data?.title,
      allow: data?.allow,
      starts_at: data?.starts_at,
      expires_at: data?.expires_at,
    });

    await updateOption(poll_id, data?.options);

    res.json({
      message: "Poll Updated Successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const handleSubmitVote: RequestHandler = async (req, res, next) => {
  try {
    const poll_id = parseInt(req.params.poll_id);
    const option_id = parseInt(req.params.option_id);

    const newVote = await createVote(poll_id, option_id);

    res.json(newVote);
  } catch (err) {
    next(err);
  }
};

export const handleResult: RequestHandler = async (req, res, next) => {
  try {
    const poll_id = parseInt(req.params.poll_id);

    const results: any = await getResult(poll_id);

    const totalVotes = results?.options?.reduce(
      (sum: any, opt: any) => sum + opt._count.votes,
      0
    );

    const optionsWithResults = results?.options?.map((opt: any) => ({
      id: opt.id,
      text: opt.text,
      voteCount: opt._count.votes,
      percentage:
        totalVotes > 0
          ? ((opt._count.votes / totalVotes) * 100).toFixed(2) + "%"
          : "0%",
    }));

    res.json({
      poll_id: results.id,
      title: results.title,
      totalVotes,
      expires_at: results.expires_at,
      created_at: results.created_at,
      options: optionsWithResults,
    });
  } catch (err) {
    next(err);
  }
};

export const handleDelete: RequestHandler = async (req, res, next) => {
  try {
    const poll_id = parseInt(req.params.poll_id);

    await deletePoll(poll_id);

    res.json({
      message: "Poll Deleted Successfully",
    });
  } catch (err) {
    next(err);
  }
};
