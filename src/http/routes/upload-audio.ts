import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schema/index.ts'
import { generateEmbeddings, transcribeAudio } from '../../services/gemini.ts'

// 1- Trascrever o áudio
// 2- Gerar o vetor semântico / embeddings
// 3- Armazenar os vetores no banco de dados


export const uploadAudioRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/rooms/:roomId/audio',
    {
      schema: {
        params: z.object({
          roomId: z.string(),
        })
      },
    },
    async (request, reply) => {
      const { roomId } = request.params

      const audio = await request.file()

      // Streams

      if(!audio){
        throw new Error('Audio is required')
      }

      const audioBuffer = await audio.toBuffer()

      const audioAsBase64 = audioBuffer.toString('base64')

      const transcriptions = await transcribeAudio(
        audioAsBase64,
        audio.mimetype
      )

      const embeddings = await generateEmbeddings(transcriptions)


      const result = await db.insert(schema.audioChunks).values({
        roomId,
        transcriptions,
        embeddings
      }).returning()

      const chunk = result[0]

      if(!chunk){
        throw new Error('Erro ao salvar chunk de áudio')
      }

      return reply.status(201).send({chunkId: chunk.id})
    }
  )
}
