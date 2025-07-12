import { GoogleGenAI } from "@google/genai";
import { env } from "../env.ts";

const gemini = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY
})

const model = 'gemini-2.5-flash'

export async function transcribeAudio(audioAsBase64: string, mimeType: string){
    const reponse = await gemini.models.generateContent({
        model,
        contents: [
            {
                text: 'Transcreva o áudio para português do Brasil, Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado.'
            },
            {
                inlineData: {
                    mimeType,
                    data: audioAsBase64
                }
            }
        ]   
    })

    if(!reponse.text){
        throw new Error('Não foi possível converter o áudio')
    }

    return reponse.text

}

export async function generateEmbeddings(text: string) {
    const reponse = await gemini.models.embedContent({
        model: 'text-embedding-004',
        contents: [{text}],
        config: {
            taskType: 'RETRIEVAL_DOCUMENT',
        }
    })

    if(!reponse.embeddings?.[0].values){
        throw new Error('Não foi possível gerar os embeddings.')
    }

    return reponse.embeddings[0].values
}