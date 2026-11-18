import React from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';
function App(){return <main><nav><strong>RenovAI Azure</strong><a href="/.auth/login/aad">Sign in</a></nav><section><h1>AI-assisted home concept planning</h1><p>Create renovation concepts, floor-plan ideas, and blueprint-style SVG exports.</p><a className="button" href="/.auth/login/aad">Get started</a></section><aside>Concept plans only. Verify all construction, code, structural, utility, and permit requirements with qualified local professionals.</aside></main>}
createRoot(document.getElementById('root')!).render(<App/>);
