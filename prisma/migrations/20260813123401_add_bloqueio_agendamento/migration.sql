-- CreateEnum
CREATE TYPE "TipoAgendamento" AS ENUM ('ATENDIMENTO', 'BLOQUEIO');

-- DropForeignKey
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_servicoId_fkey";

-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "dataFim" TIMESTAMP(3),
ADD COLUMN     "motivo" TEXT,
ADD COLUMN     "tipo" "TipoAgendamento" NOT NULL DEFAULT 'ATENDIMENTO',
ALTER COLUMN "pacienteId" DROP NOT NULL,
ALTER COLUMN "servicoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
