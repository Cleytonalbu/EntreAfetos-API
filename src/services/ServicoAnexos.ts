import { RepositorioAnexos } from '../repositories/RepositorioAnexos'
import { RepositorioEvolucoes } from '../repositories/RepositorioEvolucoes'
import { storage } from '../lib/storage'

const repositorio = new RepositorioAnexos()
const repoEvolucoes = new RepositorioEvolucoes()

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const TAMANHO_MAXIMO = 10 * 1024 * 1024 // 10MB

export class ServicoAnexos {

  async enviar(evolucaoId: string, arquivo: { nomeOriginal: string; mimeType: string; buffer: Buffer }) {
    const evolucao = await repoEvolucoes.buscarPorId(evolucaoId)
    if (!evolucao) {
      throw { status: 404, mensagem: 'Evolução não encontrada' }
    }
    if (evolucao.assinadoEm) {
      throw { status: 400, mensagem: 'Não é possível anexar arquivos a uma evolução já assinada' }
    }
    if (!TIPOS_PERMITIDOS.includes(arquivo.mimeType)) {
      throw { status: 400, mensagem: 'Tipo de arquivo não permitido. Aceitos: PDF, JPG, PNG, WEBP, DOC, DOCX' }
    }
    if (arquivo.buffer.byteLength > TAMANHO_MAXIMO) {
      throw { status: 400, mensagem: 'Arquivo excede o limite de 10MB' }
    }

    const chave = await storage.upload(
      `evolucoes/${evolucaoId}`,
      arquivo.nomeOriginal,
      arquivo.buffer,
      arquivo.mimeType,
    )

    return repositorio.criar({
      evolucaoId,
      nomeArquivo: arquivo.nomeOriginal,
      tipo: arquivo.mimeType,
      tamanhoBytes: arquivo.buffer.byteLength,
      url: chave,
    })
  }

  async listarPorEvolucao(evolucaoId: string) {
    return repositorio.listarPorEvolucao(evolucaoId)
  }

  async gerarUrlDownload(id: string) {
    const anexo = await repositorio.buscarPorId(id)
    if (!anexo) {
      throw { status: 404, mensagem: 'Anexo não encontrado' }
    }
    const url = await storage.urlAssinada(anexo.url)
    return { url, nomeArquivo: anexo.nomeArquivo, expiraEmSegundos: 300 }
  }

  async remover(id: string) {
    const anexo = await repositorio.buscarPorId(id)
    if (!anexo) {
      throw { status: 404, mensagem: 'Anexo não encontrado' }
    }
    await storage.remover(anexo.url)
    return repositorio.remover(id)
  }
}