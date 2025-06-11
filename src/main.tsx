import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './index.css'

// Import Inter Variable font for a modern, professional look
import '@fontsource-variable/inter';

createRoot(document.getElementById("root")!).render(<App />);
