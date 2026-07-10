import { Prisma } from '@prisma/client'

export function tratarErroPrisma(err: unknown): { status: number; mensagem: string } {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        const campo = (err.meta?.target as string[])?.join(', ') ?? 'campo'
        return {
          status: 409,
          mensagem: `Já existe um registro com esse ${campo}`,
        }
      case 'P2025':
        return {
          status: 404,
          mensagem: 'Registro não encontrado',
        }
      case 'P2003':
        return {
          status: 400,
          mensagem: 'Referência inválida — registro relacionado não existe',
        }
      case 'P2014':
        return {
          status: 400,
          mensagem: 'Violação de relacionamento entre registros',
        }
      default:
        return {
          status: 500,
          mensagem: `Erro no banco de dados: ${err.code}`,
        }
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return {
      status: 400,
      mensagem: 'Dados inválidos enviados ao banco de dados',
    }
  }

  // Erro de negócio lançado pelos services
  if (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    'mensagem' in err
  ) {
    return {
      status: (err as any).status,
      mensagem: (err as any).mensagem,
    }
  }

  return {
    status: 500,
    mensagem: 'Erro interno do servidor',
  }
}