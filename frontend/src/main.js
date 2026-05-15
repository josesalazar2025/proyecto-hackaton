import './style.css'
import { init } from './app.js'

init().catch((err) => console.error('Failed to initialize app:', err))
