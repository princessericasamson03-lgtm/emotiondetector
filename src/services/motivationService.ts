import { MOTIVATIONAL_PHRASES, GENERAL_MOTIVATION } from '../constants';

export async function getWellbeingAdvice(emotion: string) {
  // Simulate network delay for better UX
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const phrases = MOTIVATIONAL_PHRASES[emotion] || GENERAL_MOTIVATION;
  // Return 3 random phrases
  return [...phrases].sort(() => 0.5 - Math.random()).slice(0, 3);
}

export async function analyzeDiary(logs: any[]) {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (logs.length === 0) {
    return { 
      summary: "Nessun dato disponibile per l'analisi.", 
      advice: "Inizia a monitorare le tue emozioni per ricevere consigli personalizzati." 
    };
  }

  // Simple logic to find the most frequent emotion
  const counts: Record<string, number> = {};
  logs.forEach(log => {
    counts[log.emotion] = (counts[log.emotion] || 0) + 1;
  });

  const topEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  
  const summaries: Record<string, string> = {
    felicità: "Questa settimana hai sprizzato gioia da tutti i pori! È fantastico vedere così tanta positività.",
    tristezza: "Sembra che tu stia attraversando un periodo un po' malinconico. Ricorda che ogni emozione ha il suo valore.",
    rabbia: "Hai mostrato segni di tensione o frustrazione. È importante trovare valvole di sfogo sane.",
    paura: "C'è stata un po' di ansia o preoccupazione nelle tue rilevazioni. Respira, sei al sicuro.",
    disgusto: "Hai provato spesso fastidio o avversione. Prova a circondarti di cose che ti ispirano bellezza."
  };

  const advices: Record<string, string> = {
    felicità: "Continua a coltivare le attività che ti rendono felice e condividi il tuo buonumore.",
    tristezza: "Sii gentile con te stesso. Una passeggiata nella natura o parlare con un amico potrebbe aiutarti.",
    rabbia: "Prova tecniche di respirazione o attività fisica per canalizzare l'energia in eccesso.",
    paura: "Affronta le tue sfide a piccoli passi. La consapevolezza è il primo passo verso la calma.",
    disgusto: "Cerca di focalizzarti sugli aspetti positivi delle situazioni e pratica la gratitudine."
  };

  return {
    summary: summaries[topEmotion] || "Il tuo umore è stato vario questa settimana.",
    advice: advices[topEmotion] || "Mantieni uno stile di vita equilibrato e ascolta il tuo cuore."
  };
}
