import prisma from '../lib/prisma'
import { Papel } from '@prisma/client'

export class RepositorioUsuarios {

  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } })
  }

  async buscarPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        foto: true,
        ativo: true,
        criadoEm: true,
      },
    })
  }

  async listarPorPapel(papel: Papel, busca?: string) {
    return prisma.usuario.findMany({
      where: {
        papel,
        ativo: true,
        ...(busca && {
          OR: [
            { nome:  { contains: busca, mode: 'insensitive' } },
            { email: { contains: busca, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        foto: true,
        ativo: true,
        criadoEm: true,
      },
      orderBy: { nome: 'asc' },
    })
  }

  async criar(dados: {
    nome: string
    email: string
    senha: string
    papel: string
  }) {
    return prisma.usuario.create({
      data: dados as any,
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        criadoEm: true,
      },
    })
  }

  async atualizar(id: string, dados: { nome?: string; foto?: string }) {
    return prisma.usuario.update({
      where: { id },
      data: dados,
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        foto: true,
        ativo: true,
      },
    })
  }

  async inativar(id: string) {
    return prisma.usuario.update({
      where: { id },
      data: { ativo: false },
    })
  }
}