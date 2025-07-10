import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './env.ts'
import { getQuestionsRoute } from './http/routes/get-questions.ts'
import { getRoomsRoute } from './http/routes/get-rooms.ts'
import { postQuestionsRoute } from './http/routes/post-questions.ts'
import { postRoomsRoute } from './http/routes/post-rooms.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: 'http://localhost:5173',
})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.get('/health', () => {
  return 'Ok'
})

app.register(getRoomsRoute)
app.register(postRoomsRoute)
app.register(getQuestionsRoute)
app.register(postQuestionsRoute)

app.listen({ port: env.PORT })
