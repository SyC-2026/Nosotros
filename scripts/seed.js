// scripts/seed.js
// Ejecutar con: node scripts/seed.js

import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

// ── Recuerdos de prueba ──────────────────────────────────────────────────────
// Las fechas están en hora de Argentina (UTC-3)
const recuerdos = [
  {
    titulo:    'Primera vez que hablamos por WhatsApp',
    timestamp: Timestamp.fromDate(new Date('2026-05-18T14:56:00-03:00'))
  },
  {
    titulo:    'Primera llamada de voz',
    timestamp: Timestamp.fromDate(new Date('2026-05-25T21:30:00-03:00'))
  },
  {
    titulo:    'Primera videollamada juntos',
    timestamp: Timestamp.fromDate(new Date('2026-06-03T20:00:00-03:00'))
  },
  {
    titulo:    'Primera vez que nos vimos en persona',
    timestamp: Timestamp.fromDate(new Date('2026-06-20T16:30:00-03:00'))
  },
  {
    titulo:    'Primer paseo juntos por el centro',
    timestamp: Timestamp.fromDate(new Date('2026-06-28T17:00:00-03:00'))
  },
  {
    titulo:    'Primera vez que fuimos al cine',
    timestamp: Timestamp.fromDate(new Date('2026-07-05T20:30:00-03:00'))
  },
  {
    titulo:    'El día que nos pusimos de novios',
    timestamp: Timestamp.fromDate(new Date('2026-07-14T00:00:00-03:00'))
  },
  {
    titulo:    'Primera noche mirando las estrellas',
    timestamp: Timestamp.fromDate(new Date('2026-07-19T22:00:00-03:00'))
  },
  {
    titulo:    'Primera foto juntos',
    timestamp: Timestamp.fromDate(new Date('2026-07-26T15:45:00-03:00'))
  },
]

// ── Subir a Firestore ────────────────────────────────────────────────────────
console.log(`\n🌸 Subiendo ${recuerdos.length} recuerdos de prueba...\n`)

for (const recuerdo of recuerdos) {
  try {
    const docRef = await addDoc(collection(db, 'recuerdos'), recuerdo)
    console.log(`  ✔  "${recuerdo.titulo}" → ${docRef.id}`)
  } catch (err) {
    console.error(`  ✘  Error al subir "${recuerdo.titulo}":`, err.message)
  }
}

console.log('\n✅ Listo! Todos los recuerdos fueron cargados.\n')
process.exit(0)
