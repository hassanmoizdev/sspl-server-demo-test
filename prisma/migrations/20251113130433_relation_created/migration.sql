-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "MembershipPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
