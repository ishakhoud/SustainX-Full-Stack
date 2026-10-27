import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { pipeline } from '@huggingface/transformers'
import { Embeddings } from '@langchain/core/embeddings'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { ChatOllama } from '@langchain/ollama'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const knowledgeBasePath = resolve(backendRoot, process.env.KNOWLEDGE_BASE_PATH || 'data/environment.txt')
let botPromise

class LocalEmbeddings extends Embeddings {
  constructor(extractor) { super({}); this.extractor = extractor }
  async embed(text) {
    const output = await this.extractor(text, { pooling: 'mean', normalize: true })
    return Array.from(output.data)
  }
  async embedDocuments(texts) { return Promise.all(texts.map(text => this.embed(text))) }
  async embedQuery(text) { return this.embed(text) }
}

async function createEcoBot() {
  const content = (await readFile(knowledgeBasePath, 'utf8')).trim()
  if (!content) throw new Error(`Knowledge base is empty: ${knowledgeBasePath}`)

  const chunkSize = Number(process.env.RAG_CHUNK_SIZE || 500)
  const chunkOverlap = Number(process.env.RAG_CHUNK_OVERLAP || 80)
  const topK = Number(process.env.RAG_TOP_K || 3)
  if (!Number.isInteger(chunkSize) || chunkSize < 1 || !Number.isInteger(chunkOverlap) || chunkOverlap < 0 || chunkOverlap >= chunkSize || !Number.isInteger(topK) || topK < 1) {
    throw new Error('EcoBot chunking and retrieval settings are invalid.')
  }

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap })
  const documents = await splitter.createDocuments([content], [{ source: 'environment.txt' }])
  documents.forEach((document, index) => { document.metadata.chunk = index + 1 })

  const embeddingModel = process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2'
  console.log(`Loading EcoBot embedding model (${embeddingModel})...`)
  const extractor = await pipeline('feature-extraction', embeddingModel)
  const embeddings = new LocalEmbeddings(extractor)
  const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings)
  const model = new ChatOllama({
    model: process.env.OLLAMA_MODEL || 'gemma3:1b',
    temperature: 0,
    numPredict: 128,
    ...(process.env.OLLAMA_BASE_URL ? { baseUrl: process.env.OLLAMA_BASE_URL } : {}),
  })

  return {
    async ask(question) {
      const matches = await vectorStore.similaritySearchWithScore(question, topK)
      if (!matches.length) return { answer: "I don't have enough information in the provided sources.", sources: [] }

      const sources = matches.map(([document, score]) => ({
        text: document.pageContent,
        source: String(document.metadata.source || 'environment.txt'),
        chunk: Number(document.metadata.chunk || 0),
        score,
      }))
      const context = sources.map((source, index) => `[Source ${index + 1} | chunk ${source.chunk}]\n${source.text}`).join('\n\n')
      const prompt = `You are EcoBot, a concise environmental assistant.

Answer the user's question directly using only the environmental sources below.
Do not use outside knowledge, guess, add background, or repeat the source text.
If the sources do not clearly contain the answer, reply exactly:
"I don't have enough information in the provided sources."
Use at most 2 short sentences and 50 words. Include only details needed to answer.
Cite factual statements with the matching source label, such as [Source 1].
Do not add a greeting, introduction, conclusion, or a list unless the user asks for one.

Environmental sources:
${context}

User question:
${question}`
      const response = await model.invoke(prompt)
      const answer = String(response.content).trim()
      if (!answer) throw new Error('EcoBot model returned an empty answer.')
      return { answer, sources }
    },
  }
}

export async function askEcoBot(question) {
  botPromise ||= createEcoBot().catch(error => { botPromise = undefined; throw error })
  const bot = await botPromise
  return bot.ask(question)
}
