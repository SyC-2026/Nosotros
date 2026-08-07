import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const events = [
  {
    titulo: 'Cumple Mes',
    tipo: 'Mensualmente',
    fecha: new Date('2026-08-14T00:00:00-03:00'),
    icon: 'mdi:heart-flash'
  },
  {
    titulo: 'Cumple de Santi',
    tipo: 'Anualmente',
    fecha: new Date('2026-09-07T00:00:00-03:00'),
    icon: 'mdi:cake-variant-outline'
  },
  {
    titulo: 'Cumple de Cami',
    tipo: 'Anualmente',
    fecha: new Date('2026-11-28T00:00:00-03:00'),
    icon: 'mdi:cake-variant-outline'
  },
  {
    titulo: 'Aniversario',
    tipo: 'Anualmente',
    fecha: new Date('2026-07-14T00:00:00-03:00'),
    icon: 'mdi:glass-toast'
  }
]

async function seed() {
  for (const evt of events) {
    try {
      await addDoc(collection(db, 'eventos'), {
        titulo: evt.titulo,
        tipo: evt.tipo,
        fecha: Timestamp.fromDate(evt.fecha),
        icon: evt.icon
      })
      console.log(`Added ${evt.titulo}`)
    } catch (e) {
      console.error(e)
    }
  }
  process.exit(0)
}

seed()
