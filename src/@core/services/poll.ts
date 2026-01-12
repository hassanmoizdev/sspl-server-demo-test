import { Role } from "@prisma/client";
import PollOption from "../models/PollOption";
import Poll from "../models/Poll";
import Vote from "../models/Vote";

export const createPoll = async (data: any) => {
  return Poll.create(data);
};

export const createOption = async (poll_id: number, data: any) => {
  const poll = await Poll.getOnlyById(poll_id);
  if (!poll) throw new Error("Poll does not exist.");

  return PollOption.createMany(poll_id, data);
};

export const listPoll = async (statusFilter:any, acc_id: number, role: Role) => {
  return Poll.getMany(statusFilter, acc_id, role);
};

export const getPoll = async (poll_id: number) => {
  const poll = await Poll.getOnlyById(poll_id);
  if (!poll) throw new Error("Poll does not exist.");

  return Poll.getSingle(poll_id);
};

export const updatePoll = async (poll_id: number, data: any) => {
  return Poll.update(poll_id, data);
};

export const updateOption = async (poll_id: number, data: any) => {
  return PollOption.update(poll_id, data);
};

export const createVote = async (poll_id: number, option_id: number) => {
  const poll = await Poll.getOnlyById(poll_id);
  if (!poll) throw new Error("Poll does not exist.");

  const option = await PollOption.getById(option_id);
  if (!option) throw new Error("Option does not exist.");

  const existingVote = await Vote.getAlreadyVoted(poll_id);

  if (existingVote) {
    return Vote.updateExisting(existingVote.id, option_id);
  }

  return Vote.create(poll_id, option_id);
};

export const getResult = async (poll_id: any) => {
  return Poll.getPollResult(poll_id);
};

export const deletePoll = async (poll_id: number) => {
  return Poll.delete(poll_id);
};
