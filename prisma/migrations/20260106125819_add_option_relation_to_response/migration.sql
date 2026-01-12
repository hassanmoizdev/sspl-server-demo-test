-- AddForeignKey
ALTER TABLE "ScenarioResponse" ADD CONSTRAINT "ScenarioResponse_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "ScenarioOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
