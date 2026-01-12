import MembershipDAO from "../../@core/AccountsManager/MembershipDAO";
import AbstractSubmission from "../models/AbstractSubmission";

export const createAbstractSubmission = async (acc_id: any, data: any) => {
  return AbstractSubmission.create(acc_id, data);
};

export const getAbstractPlan = async ({ page, limit, status }: any) => {
  let _page = Math.abs(page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(limit) || 20;

  const [records, count]: any = await AbstractSubmission.getMany({
    skip: _page * _limit,
    take: _limit,
    status,
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

export const updateAbstractSubmission = async (data: any) => {
  return AbstractSubmission.update(data);
};
