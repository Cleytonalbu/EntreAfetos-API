-- AlterTable
ALTER TABLE "Evolucao" ADD COLUMN     "modeloEvolucaoId" TEXT,
ADD COLUMN     "respostas" JSONB;

-- AddForeignKey
ALTER TABLE "Evolucao" ADD CONSTRAINT "Evolucao_modeloEvolucaoId_fkey" FOREIGN KEY ("modeloEvolucaoId") REFERENCES "ModeloEvolucao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
