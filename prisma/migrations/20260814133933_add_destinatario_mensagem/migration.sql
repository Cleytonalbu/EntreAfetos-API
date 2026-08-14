/*
  Warnings:

  - Added the required column `destinatarioId` to the `Mensagem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mensagem" ADD COLUMN     "destinatarioId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Mensagem_remetenteId_destinatarioId_idx" ON "Mensagem"("remetenteId", "destinatarioId");

-- CreateIndex
CREATE INDEX "Mensagem_destinatarioId_lida_idx" ON "Mensagem"("destinatarioId", "lida");

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
