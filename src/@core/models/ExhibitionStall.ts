import { existsSync, unlinkSync } from "fs";
import db from "../utils/db";

class ExhibitionStall {
  static create(acc_id: any, data: any) {
    const { products, ...rest } = data;
    return db.exhibitionStall.create({
      data: {
        ...rest,
        products: {
          create: JSON.parse(products),
        },
        creator_id: acc_id,
      },
      include: { products: true },
    });
  }
  static getMany({ skip, take, status }: any) {
    const whereCondition: any = {};

    if (status) {
      whereCondition.status = status;
    }
    return db.$transaction([
      db.exhibitionStall.findMany({
        where: whereCondition,
        include: { products: true },
        orderBy: {
          created_at: "desc",
        },
        skip: skip ?? 0,
        take: take ?? 10,
      }),
      db.exhibitionStall.count(),
    ]);
  }

  static async update(stall_id: any, data: any) {
    const { products, req: attachedFile, ...stallData } = data;

    const existingExhibitionStall = await db.exhibitionStall.findUnique({
      where: { id: stall_id },
    });

    const typeChangedProducst = JSON.parse(products || []);

    const productOps = await Promise.all(
      (typeChangedProducst || []).map(async (p: any) => {
        if (p.id && p.is_delete) {
          return db.product.delete({
            where: { id: p.id },
          });
        } else if (p.id) {
          return db.product.update({
            where: { id: p.id },
            data: {
              name: p.name,
              description: p.description,
            },
          });
        } else {
          return db.product.create({
            data: {
              name: p.name,
              description: p.description,
              stall_id: stall_id,
            },
          });
        }
      })
    );

    if (
      attachedFile?.file?.path &&
      existingExhibitionStall?.company_logo &&
      existsSync(existingExhibitionStall?.company_logo)
    ) {
      try {
        unlinkSync(existingExhibitionStall.company_logo);
        data.company_logo = attachedFile?.file?.path;
      } catch (err) {
        console.warn("Error deleting old picture:", err);
      }
    }

    const hasNewLogo = !!attachedFile.file;
    const wantsLogoRemoved = data.company_logo === "";
    const oldLogo = existingExhibitionStall?.company_logo;

    if (!hasNewLogo && wantsLogoRemoved && oldLogo && existsSync(oldLogo)) {
      try {
        unlinkSync(oldLogo);
        data.company_logo = "";
      } catch (err) {
        console.warn("Error deleting old logo:", err);
      }
    }

    if (!oldLogo && !data?.company_logo) {
      data.company_logo = attachedFile?.file?.path;
    }

    const stall = await db.exhibitionStall.update({
      where: { id: stall_id },
      data: {
        ...stallData,
        company_logo: data?.company_logo,
      },
      include: { products: true },
    });

    return { ...stall, productOps };
  }

  static delete(id: number) {
    return db.exhibitionStall.delete({
      where: {
        id,
      },
    });
  }

  static getById(id: number) {
    return db.exhibitionStall.findUnique({
      where: {
        id,
      },
      include: { products: true },
    });
  }
}

export default ExhibitionStall;
