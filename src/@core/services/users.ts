import personSchema from "../../@core/validators/person-data-validator";
import Account from "../../@core/models/Account";
import accountSchema, {
  passwordSchema,
} from "../../@core/validators/account-data-validator";
import profileSchema from "../../@core/validators/profile-data-validator";
import {
  createAccessToken,
  hashPassword,
  verifyPassword,
} from "../../@core/utils/auth";
import { isStrongPassword } from "validator";
import { z } from "zod";
import MembershipPlan from "../../@core/models/Membership";
import { plan_type } from "../../@core/utils/constant";
import TransactionHistory from "../../@core/models/transactionHistory";
import db from "../../@core/utils/db";

const DEFAULT_PROFILE = {
  contact: {},
};

const passwordsSchema = z.object({
  password: z
    .string()
    .trim()
    .refine(
      (v) =>
        isStrongPassword(v, {
          minLowercase: 0,
          minUppercase: 0,
          minNumbers: 0,
          minSymbols: 0,
        }),
      { message: "Password must be atleast 8 characters long." }
    )
    ?.optional(),
});

export const signupUser = async (data: any, acc_id: any) => {
  const schema = personSchema.extend({
    account: accountSchema.merge(passwordSchema),
    profile: profileSchema.optional(),
  });

  const parsedData = schema.parse(data);

  // Verify email address.
  if (await Account.exists(parsedData.account.email))
    throw new Error("Account already exists against this email address.");

  // Encrypt password.
  const pwdHash = await hashPassword(parsedData.account.password);

  const { account, profile, ...userData } = parsedData;

  let expires_at: Date | null = new Date();

  if (data?.membership?.plan_id) {
    const plan = await MembershipPlan.getOnlyById(data?.membership?.plan_id);
    if (!plan) throw new Error("Plan does not exist.");

    if (plan.type?.toLowerCase() === plan_type?.MONTH?.toLowerCase()) {
      expires_at.setMonth(expires_at.getMonth() + 1);
    } else if (plan.type?.toLowerCase() === plan_type?.YEAR?.toLowerCase()) {
      expires_at.setFullYear(expires_at.getFullYear() + 1);
    } else if (plan.type?.toLowerCase() === plan_type?.LIFE?.toLowerCase()) {
      expires_at = null;
    } else {
      throw new Error("Unsupported plan type.");
    }
  } else {
    expires_at = null;
  }

  const accountData = {
    ...account,
    password: pwdHash,
    memberships: [
      {
        role: data?.membership?.role,
        plan_id: data?.membership?.plan_id,
        expires_at: expires_at,
      },
    ],
    user: {
      ...userData,
      profile: profile || DEFAULT_PROFILE,
    },
  };

  // Create account.
  const { user, memberships, ...newAcc } = await Account.create(accountData);
  const membership = memberships[0];
  const userProfile = user?.profiles[0];

  if (data?.transactionDetails) {
    const transactionData = {
      payer_id: acc_id,
      membership_id: membership?.id,
      mode_of_payment: data?.transactionDetails?.mode_of_payment,
      bank_name: data?.transactionDetails?.bank_name || "",
      transaction_id: data?.transactionDetails?.transaction_id || "",
      status: data?.transactionDetails?.status || "PENDING",
    };

    await TransactionHistory?.create(transactionData);
  }

  // Generate access token.
  const tokenPayload = {
    sub: user?.id,
    aud: membership.org_id,
    rol: membership.role,
  };

  const access_token = createAccessToken(tokenPayload);

  return {
    access_token,

    user: {
      ...user,
      id: undefined,
      profiles: undefined,
      role: membership.role,
      profile: userProfile,
      account: {
        email: newAcc.email,
        phone: newAcc.phone,
      },
    },
  };
};

export const getOfficeBearersUsers = async (paging: {
  page: number;
  limit: number;
}) => {
  let _page = Math.abs(paging.page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(paging.limit) || 20;

  const [records, count]: any = await Account.listAll({
    skip: _page * _limit,
    take: _limit,
  });

  const modifiedRecords = records.map((user: any) => {
    const { user: person = { profiles: [] }, ...rest } = user;

    return {
      ...rest,
      user: {
        ...(person?.profiles?.[0] || null),
        first_name: person?.first_name,
        gender: person?.gender,
        id: person?.id,
        last_name: person?.last_name,
        prefix: person?.prefix,
      },
    };
  });

  const filteredData = modifiedRecords.filter(
    (record: any) => record.memberships?.[0]?.role === "OFFICE_BEARERS"
  );

  return [
    filteredData,
    {
      total_records: count,
      current_page: _page + 1,
      total_pages: Math.ceil(count / _limit),
      limit: _limit,
    },
  ];
};

export const getUsers = async (
  filter: any,
  paging: {
    page: number;
    limit: number;
  }
) => {
  let _page = Math.abs(paging.page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(paging.limit) || 20;

  const [records, count]: any = await Account.filterList(filter, {
    skip: _page * _limit,
    take: _limit,
  });

  const modifiedRecords = records.map((user: any) => {
    const { user: person = { profiles: [] }, ...rest } = user;

    return {
      ...rest,
      user: {
        ...(person?.profiles?.[0] || null),
        first_name: person?.first_name,
        gender: person?.gender,
        id: person?.id,
        last_name: person?.last_name,
        prefix: person?.prefix,
      },
    };
  });

  return [
    modifiedRecords,
    {
      total_records: count,
      current_page: _page + 1,
      total_pages: Math.ceil(count / _limit),
      limit: _limit,
    },
  ];
};

export const getAllUsersList = async () => {
  const allUsersList = await Account.allUsersList();

  const modifiedRecords = allUsersList.map((user: any) => {
    const { user: person = { profiles: [] }, ...rest } = user;

    return {
      ...rest,
      user: {
        ...(person?.profiles?.[0] || null),
        first_name: person?.first_name,
        gender: person?.gender,
        id: person?.id,
        last_name: person?.last_name,
        prefix: person?.prefix,
      },
    };
  });

  return modifiedRecords;
};

export const getUser = async () => {
  const user = await Account.getAccount();
  if (!user) throw new Error("User not found.");

  return user;
};

export const getAccount = async (id: number) => {
  const user = await Account.getById(id, true, true);
  if (!user) throw new Error("User not found.");

  return user;
};

export const updateUser = async (id: number, data: any) => {
  const schema = personSchema.extend({
    account: accountSchema.merge(passwordsSchema),
    profile: profileSchema.optional(),
  });

  const parsedData = schema.parse(data);

  // Encrypt password.
  const pwdHash = await hashPassword(parsedData.account.password || "");

  const { account, profile, ...userData } = parsedData;
  const { password, ...accountRestData } = account;

  const userExist = await Account.getById(id, true, true);

  if (!userExist) throw new Error("User not found.");

  const lastMembership =
    userExist?.memberships?.[userExist?.memberships?.length - 1];

  let expires_at: Date | null = new Date();

  if (data?.membership?.plan_id) {
    const plan = await MembershipPlan.getOnlyById(data?.membership?.plan_id);
    if (!plan) throw new Error("Plan does not exist.");

    if (plan.type?.toLowerCase() === plan_type?.MONTH?.toLowerCase()) {
      expires_at.setMonth(expires_at.getMonth() + 1);
    } else if (plan.type?.toLowerCase() === plan_type?.YEAR?.toLowerCase()) {
      expires_at.setFullYear(expires_at.getFullYear() + 1);
    } else if (plan.type?.toLowerCase() === plan_type?.LIFE?.toLowerCase()) {
      expires_at = null;
    } else {
      throw new Error("Unsupported plan type.");
    }
  } else {
    expires_at = lastMembership?.expires_at;
  }

  const accountData = {
    ...accountRestData,
    password: password ? pwdHash : "",
    status: account?.status || "ACTIVE", // TODO: Implement account verification.
    memberships: [
      {
        role: data?.membership?.role,
        plan_id: data?.membership?.plan_id,
        expires_at: expires_at,
      },
    ],
    user: {
      ...userData,
      profile: profile || DEFAULT_PROFILE,
    },
  };

  const userUpdatedData = await Account.update(id, accountData);

  // const { user: person = { profiles: [] }, ...rest } = userUpdatedData;

  return {
    ...userUpdatedData,
  };
};

export const updateDeviceToken = async (
  userId: number,
  device_token: string,
  device_platform: string
) => {
  const user = await Account.getById(userId, false, true);
  
  if (!user?.user) throw new Error("User not found.");

  const updatedPerson = await db.person.update({
    where: { id: user.user.id },
    data: {
      device_token,
      device_platform,
    },
  });

  return updatedPerson;
};

export const resetPassword = async (data: any) => {
  const personExist: any = await Account.getAccount();

  const userExist = await Account.getById(personExist?.account?.id, true);

  if (!userExist) throw new Error("User not found.");

  if (!(await verifyPassword(data?.oldPassword, userExist?.password)))
    throw new Error("Password do not match.");

  const pwdHash = await hashPassword(data?.newPassword || "");

  const account = await Account.updatePassword(
    personExist?.account?.id,
    pwdHash
  );

  return {
    ...account,
  };
};
