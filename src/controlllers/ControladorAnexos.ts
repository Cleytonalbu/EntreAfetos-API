import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoAnexos } from '../services/ServicoAnexos'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoAnexos()

export class ControladorAnexos {

  async enviar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const arquivo = await request.file()

      if (!arquivo) {
        return reply.status(400).send({ erro: 'Erro', mensagem: 'Nenhum arquivo enviado' })
      }

      const buffer = await arquivo.toBuffer()

      const anexo = await servico.enviar(id, {
        nomeOriginal: arquivo.filename,
        mimeType: arquivo.mimetype,
        buffer,
      })

      return reply.status(201).send({ anexo })
    } catch (err: any) {
      if (err.code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.status(400).send({ erro: 'Erro', mensagem: 'Arquivo excede o limite de 10MB' })
      }
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async listarPorEvolucao(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const anexos = await servico.listarPorEvolucao(id)
      return reply.send({ anexos })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async download(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const resultado = await servico.gerarUrlDownload(id)
      return reply.send(resultado)
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async remover(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      await servico.remover(id)
      return reply.status(204).send()
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}