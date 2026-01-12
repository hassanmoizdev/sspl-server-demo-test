-- DropForeignKey
ALTER TABLE "TransactionHistory" DROP CONSTRAINT "TransactionHistory_payer_id_fkey";

-- AlterTable
ALTER TABLE "TransactionHistory" ALTER COLUMN "mode_of_payment" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
