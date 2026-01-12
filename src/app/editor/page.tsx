"use client";

import App from './App';
import { AnimatePresence } from 'framer-motion';

export default function EditorPage() {
  return (
    <AnimatePresence mode="wait">
      <App />
    </AnimatePresence>
  );
}
