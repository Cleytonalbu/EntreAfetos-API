import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PREFIXO = process.env.STORAGE_PREFIX ? `${process.env.STORAGE_PREFIX}/` : ''

export const storage = {
  async upload(pasta: string, nomeOriginal: string, buffer: Buffer, mimeType: string) {
    const extensao = nomeOriginal.includes('.') ? nomeOriginal.split('.').pop() : ''
    const chave = `${PREFIXO}${pasta}/${randomUUID()}${extensao ? `.${extensao}` : ''}`

    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: chave,
      Body: buffer,
      ContentType: mimeType,
    }))

    return chave
  },

  async remover(chave: string) {
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: chave }))
  },

  async urlAssinada(chave: string, expiraEmSegundos = 300) {
    return getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: chave }), { expiresIn: expiraEmSegundos })
  },
}