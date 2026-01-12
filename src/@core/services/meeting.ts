import Meeting from "../models/Meeting";
import { Role } from "@prisma/client";

export const createMeeting = async (data: any) => {
  return Meeting.create(data);
};

export const listUserMeetings = async (role: Role) => {
  return Meeting.getUserListing(role);
};

export const getMeeting = async (meeting_id: number) => {
  const meeting = await Meeting.getOnlyById(meeting_id);
  if (!meeting) throw new Error("Meeting does not exist.");

  return Meeting.getSingle(meeting_id);
};

export const listMeetings = async ({ page, limit, role }: any) => {
  let _page = Math.abs(page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(limit) || 20;

  const [records, count]: any = await Meeting.getMany({
    skip: _page * _limit,
    take: _limit,
    role,
  });

  return [
    records,
    {
      total_records: count,
      current_page: _page + 1,
      total_pages: Math.ceil(count / _limit),
      limit: _limit,
    },
  ];
};

export const updateMeeting = async (meeting_id: number, data: any) => {
  return Meeting.update(meeting_id, data);
};