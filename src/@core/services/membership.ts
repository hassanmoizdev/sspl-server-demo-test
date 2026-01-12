import { plan_type } from "../../@core/utils/constant";
import MembershipDAO from "../../@core/AccountsManager/MembershipDAO";
import MembershipPlan from "../models/Membership";

export const createMembershipPlan = async (data: any) => {
  return MembershipPlan.create(data);
};

export const getMembershipPlan = async ({ page, limit }: any) => {
  let _page = Math.abs(page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(limit) || 20;

  const [records, count]: any = await MembershipPlan.getMany({
    skip: _page * _limit,
    take: _limit,
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

export const getPlan = async (plan_id: number) => {
  const plan = await MembershipPlan.getOnlyById(plan_id);
  if (!plan) throw new Error("Plan does not exist.");

  return MembershipPlan.getSingle(plan_id);
};

export const updateMembershipPlan = async (plan_id: number, data: any) => {
  return MembershipPlan.update(plan_id, data);
};

export const updateMembership = async (data: any) => {
  const existingMembership: any = await MembershipDAO.getByAccIdAndOrgId({
    acc_id: data?.acc_id,
    org_id: data?.org_id,
  });

  if (!existingMembership) throw new Error("Membership not found.");

  let expires_at: Date | null = null;

  if (!data?.plan_id) {
    expires_at = existingMembership.expires_at
      ? new Date(existingMembership.expires_at)
      : null;
  }

  if (data?.plan_id) {
    const plan = await MembershipPlan.getOnlyById(data.plan_id);
    if (!plan) throw new Error("Plan does not exist.");

    expires_at = new Date();

    if (plan.type?.toLowerCase() === plan_type?.MONTH?.toLowerCase()) {
      expires_at.setMonth(expires_at.getMonth() + 1);
    } else if (plan.type?.toLowerCase() === plan_type?.YEAR?.toLowerCase()) {
      expires_at.setFullYear(expires_at.getFullYear() + 1);
    } else if (plan.type?.toLowerCase() === plan_type?.LIFE?.toLowerCase()) {
      expires_at = null;
    } else {
      throw new Error("Unsupported plan type.");
    }
  }

  const updatePayload = {
    acc_id: data?.acc_id ?? existingMembership.acc_id,
    org_id: data?.org_id ?? existingMembership.org_id,
    role: data?.role ?? existingMembership.role,
    plan_id: data?.plan_id ?? existingMembership.plan_id,
    status: data?.status ?? existingMembership.status,
    expires_at: expires_at ? expires_at.toISOString() : null,
  };

  const membership = await MembershipDAO.update(updatePayload);

  return membership;
};

export const getMembershipList = async ({ page, limit, status }: any) => {
  let _page = Math.abs(page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(limit) || 20;

  const [records, count]: any = await MembershipDAO.getMany({
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

export const getMembership = async (id: any) => {
  return MembershipDAO.getOnlyById(id);
};
