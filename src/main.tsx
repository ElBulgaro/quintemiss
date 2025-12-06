import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register background processing utility for one-time use
import './utils/processAllCandidateBackgrounds';

createRoot(document.getElementById("root")!).render(<App />);
