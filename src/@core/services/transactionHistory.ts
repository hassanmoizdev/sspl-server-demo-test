import TransactionHistory from "../../@core/models/transactionHistory";

export const getTransactionDetail = (transaction_id: number) => {
  return TransactionHistory.getOnlyById(transaction_id);
};

export const getTransactionDetailByMembership = (membership_id: number) => {
  return TransactionHistory.getOnlyByMembershipId(membership_id);
};

export const getTranscationHistoryList = async ({ page, limit, status, user }: any) => {
  let _page = Math.abs(page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(limit) || 20;

  const [records, count]: any = await TransactionHistory.getMany({
    skip: _page * _limit,
    take: _limit,
    status,
    user,
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