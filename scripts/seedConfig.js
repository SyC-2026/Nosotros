// scripts/seedConfig.js
// Crea el documento de configuración en Firestore
// Ejecutar UNA SOLA VEZ con: node scripts/seedConfig.js

import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

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

await setDoc(doc(db, 'config', 'site'), {
  maintenanceMode: false   // ← false = sitio normal, true = pantalla de mantenimiento
})

console.log('✅ Documento config/site creado. maintenanceMode = false')
process.exit(0)
