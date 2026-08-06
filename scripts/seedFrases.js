// scripts/seedFrases.js
// Ejecutar con: node scripts/seedFrases.js

import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore'

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

const frasesIniciales = [
  'Contigo, cada día ordinario se convierte en el favorito de mi vida.',
  'Sos mi lugar seguro en cualquier rincón del mundo.',
  'Encontrarte fue como escuchar mi canción favorita por primera vez.',
  'Cada segundo a tu lado vale una vida entera.',
  'Me gusta la vida, pero me gusta más si es con vos.',
  'Haces que todo lo bonito se vuelva aún más hermoso.',
  'Sos la casualidad más linda que me pasó en la vida.',
  'No importa a dónde vaya, mi hogar siempre va a ser con vos.',
  'A tu lado, el tiempo pasa volando pero los recuerdos quedan para siempre.',
  'Te elijo hoy, mañana y en cada una de mis vidas.'
]

async function seedFrases() {
  console.log('🌱 Subiendo frases románticas a Firestore...')

  const snapshot = await getDocs(collection(db, 'frases'))
  if (snapshot.size > 0) {
    console.log(`⚠️ Ya existen ${snapshot.size} frases en Firestore. Subiendo más...`)
  }

  for (const texto of frasesIniciales) {
    await addDoc(collection(db, 'frases'), { texto })
    console.log(`  ✓ Subida: "${texto}"`)
  }

  console.log('\n✨ ¡Frases subidas con éxito!')
  process.exit(0)
}

seedFrases().catch((err) => {
  console.error('❌ Error al subir frases:', err)
  process.exit(1)
})
