import ExhibitionStall from "../models/ExhibitionStall";
import path from "path";
import { promisify } from "util";
import { unlink } from "fs";

const unlinkAsync = promisify(unlink);

export const createExhibitionStall = async (acc_id: any, data: any) => {
  return ExhibitionStall.create(acc_id, data);
};

export const getSingleExhibitionStall = async (stall_id: number) => {
  const stall = await ExhibitionStall.getById(stall_id);
  if (!stall) throw new Error("Exhibition Stall does not exist.");

  return ExhibitionStall.getById(stall_id);
};

export const getExhibitionStall = async ({ page, limit, status }: any) => {
  let _page = Math.abs(page);
  _page = !_page ? 0 : _page - 1;
  let _limit = Math.abs(limit) || 20;

  const [records, count]: any = await ExhibitionStall.getMany({
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

export const updateExhibitionStall = async (stall_id: any, data: any) => {
  return ExhibitionStall.update(stall_id, data);
};

export const deleteExhibitionStall = async (id: any) => {
  const exhibition = await ExhibitionStall.getById(id);
  if (!exhibition) throw new Error("Exhibition does not exist.");

  if (exhibition.company_logo) {
    const filePath = path.resolve(process.cwd(), exhibition.company_logo);

    await unlinkAsync(filePath);
  }
  return ExhibitionStall.delete(id);
};
