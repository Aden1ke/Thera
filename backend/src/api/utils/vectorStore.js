import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from "langchain/document";
import { embeddings } from './embeddings.js';


// let vectorStore = new MemoryVectorStore(embeddings);
let vectorStore = null;

async function createVectorStoreFromSeeds(seeds) {
    const docs = seeds.map(seed => ({
        pageContent: `${seed.prompt} ${seed.emotionTags.join(' ')} distress: ${seed.distressLevel}`,
        metadata: seed,
    }));

    vectorStore = await MemoryVectorStore.fromTexts(
        docs.map(d => d.pageContent),
        docs.map(d => d.metadata),
        embeddings
    );
}

async function addSeedToVectorStore(seed) {
    const doc = new Document({
        pageContent: `${seed.prompt} ${seed.emotionTags.join(' ')} distress: ${seed.distressLevel}`,
        metadata: seed,
    });

    await vectorStore.addDocuments([doc]);
}

function getVectorStore() {
    console.log("vectorStore in getVectorStore:", vectorStore);
    if (!vectorStore) throw new Error("Vector store not initialized!");
    return vectorStore;
}

let entryVectorStore = null;

// Entries
async function createEntryVectorStore(entries = []) {
    const docs = entries.map(entry => ({
        pageContent: `${entry.entry} emotions: ${entry.emotion?.join(' ')} distress: ${entry.distressScore}`,
        metadata: entry,
    }));

    entryVectorStore = await MemoryVectorStore.fromTexts(
        docs.map(d => d.pageContent),
        docs.map(d => d.metadata),
        embeddings
    );
}

async function addEntryToVectorStore(entry) {
    const doc = new Document({
        pageContent: `${entry.entry} emotions: ${entry.emotion?.join(' ')} distress: ${entry.distressScore}`,
        metadata: entry,
    });
    await entryVectorStore.addDocuments([doc]);
}

function getEntryVectorStore() {
    if (!entryVectorStore) throw new Error("Entry vector store not initialized!");
    return entryVectorStore;
}

export {
    createVectorStoreFromSeeds,
    addSeedToVectorStore,
    getVectorStore,
    createEntryVectorStore,
    addEntryToVectorStore,
    getEntryVectorStore   
}
