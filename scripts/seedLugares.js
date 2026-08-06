// scripts/seedLugares.js
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore'

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

const lugaresIniciales = [
  {
    nombre:      'Primer Encuentro',
    descripcion: 'Nuestra primera cita cara a cara.',
    lat:         -34.6037,
    lng:         -58.3816,
    timestamp:   Timestamp.fromDate(new Date('2026-06-20T16:30:00-03:00')),
    foto:        '12.webp',
    createdAt:   Timestamp.now()
  },
  {
    nombre:      'Puerto Madero',
    descripcion: 'Paseo al atardecer junto al río.',
    lat:         -34.6118,
    lng:         -58.3642,
    timestamp:   Timestamp.fromDate(new Date('2026-07-02T18:00:00-03:00')),
    foto:        '',
    createdAt:   Timestamp.now()
  },
  {
    nombre:      'Jardín Japonés',
    descripcion: 'Un paseo tranquilo rodeados de naturaleza.',
    lat:         -34.5753,
    lng:         -58.4091,
    timestamp:   Timestamp.fromDate(new Date('2026-07-14T15:00:00-03:00')),
    foto:        '',
    createdAt:   Timestamp.now()
  }
]

async function seed() {
  console.log('🌱 Subiendo lugares iniciales a Firestore...')
  const snapshot = await getDocs(collection(db, 'lugares'))
  if (snapshot.size === 0) {
    for (const item of lugaresIniciales) {
      await addDoc(collection(db, 'lugares'), item)
      console.log(`  ✓ Subido lugar: ${item.nombre}`)
    }
  } else {
    console.log(`⚠️ Ya existen ${snapshot.size} lugares en Firestore.`)
  }
  console.log('✨ ¡Listo!')
  process.exit(0)
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
