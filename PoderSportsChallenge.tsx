import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Target, 
  Timer, 
  User, 
  ChevronRight,
  RotateCcw,
  Volume2,
  Gamepad2,
  Medal,
  Activity,
  Dribbble as BasketballIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---

interface Question {
  sentence: string;
  options: string[];
  correct: string;
  translation: string;
}

// --- Data ---

const QUESTIONS: Question[] = [
  { sentence: "Yo no ___ hablar español.", options: ["puedo", "puede"], correct: "puedo", translation: "Ես չեմ կարողանում խոսել իսպաներեն:" },
  { sentence: "Tú ___ correr muy rápido.", options: ["puedes", "pueden"], correct: "puedes", translation: "Դու կարող ես շատ արագ վազել:" },
  { sentence: "Ella ___ nadar muy bien.", options: ["puede", "puedo"], correct: "puede", translation: "Նա կարող է շատ լավ լողալ:" },
  { sentence: "Nosotros ___ ir al cine hoy.", options: ["podemos", "pueden"], correct: "podemos", translation: "Մենք կարող ենք այսօր կինո գնալ:" },
  { sentence: "Vosotros ___ jugar al fútbol.", options: ["podéis", "puedes"], correct: "podéis", translation: "Դուք կարող եք ֆուտբոլ խաղալ:" },
  { sentence: "Ellos ___ cantar muy bonito.", options: ["pueden", "podemos"], correct: "pueden", translation: "Նրանք կարող են շատ գեղեցիկ երգել:" },
  { sentence: "Mi madre ___ cocinar muy rico.", options: ["puede", "puedes"], correct: "puede", translation: "Մայրս կարող է շատ համեղ եփել:" },
  { sentence: "Mis amigos ___ bailar salsa.", options: ["pueden", "puede"], correct: "pueden", translation: "Ընկերներս կարող են սալսա պարել:" },
  { sentence: "¿___ tú ayudarme con esto?", options: ["Puedes", "Pueden"], correct: "Puedes", translation: "Կարո՞ղ ես դու ինձ օգնել սրա հետ:" },
  { sentence: "Yo no ___ dormir por el ruido.", options: ["puedo", "podemos"], correct: "puedo", translation: "Ես չեմ կարողանում քնել աղմուկի պատճառով:" },
  { sentence: "Nosotros ___ ganar el partido.", options: ["podemos", "puede"], correct: "podemos", translation: "Մենք կարող ենք հաղթել խաղը:" },
  { sentence: "Usted ___ pasar ahora mismo.", options: ["puede", "pueden"], correct: "puede", translation: "Դուք կարող եք հիմա անցնել:" },
  { sentence: "María ___ tocar el piano.", options: ["puede", "podéis"], correct: "puede", translation: "Մարիան կարող է դաշնամուր նվագել:" },
  { sentence: "Pedro y Juan ___ saltar muy alto.", options: ["pueden", "puedes"], correct: "pueden", translation: "Պեդրոն և Խուանը կարող են շատ բարձր ցատկել:" },
  { sentence: "¿___ nosotros entrar a la sala?", options: ["Podemos", "Puedo"], correct: "Podemos", translation: "Կարո՞ղ ենք մենք ներս մտնել դահլիճ:" },
  { sentence: "¿Qué ___ hacer tú para ayudar?", options: ["puedes", "pueden"], correct: "puedes", translation: "Ի՞նչ կարող ես դու անել օգնելու համար:" }
];

// --- Utilities ---

const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }
};

// --- Components ---

const Hoop = ({ score, total }: { score: number, total: number }) => (
  <div className="relative w-32 h-32 flex flex-col items-center justify-end">
    <div className="absolute top-0 w-24 h-1.5 bg-red-600 rounded-full shadow-lg" />
    <div className="w-20 h-24 border-x-2 border-b-2 border-white/20 rounded-b-3xl bg-white/5 backdrop-blur-sm relative overflow-hidden">
       {/* Net pattern */}
       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
    </div>
    <div className="mt-2 font-black text-2xl text-white drop-shadow-md">{score}</div>
  </div>
);

const Ball = ({ isFlying, target }: { isFlying: boolean, target: 'Gor' | 'Gayane' }) => (
  <motion.div
    initial={{ scale: 0, y: 100, opacity: 0 }}
    animate={isFlying ? {
      scale: [1, 1.2, 0.8],
      y: [0, -300, -200],
      x: target === 'Gor' ? [0, -150, -250] : [0, 150, 250],
      opacity: [1, 1, 0],
    } : { scale: 0, opacity: 0 }}
    transition={{ duration: 1, ease: "easeOut" }}
    className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-500 rounded-full border-4 border-orange-700 shadow-2xl flex items-center justify-center p-1"
  >
    <div className="w-full h-full border-2 border-black/20 rounded-full flex items-center justify-center">
       <div className="w-px h-full bg-black/20" />
       <div className="h-px w-full bg-black/20 absolute" />
    </div>
  </motion.div>
);

export default function PoderSportsChallenge() {
  const [view, setView] = useState<'intro' | 'game' | 'finish'>('intro');
  const [turn, setTurn] = useState<'Gor' | 'Gayane'>('Gor');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState({ Gor: 0, Gayane: 0 });
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQ = QUESTIONS[currentIdx];

  const handleAnswer = (opt: string) => {
    if (feedback !== 'none' || isAnimating) return;
    
    if (opt === currentQ.correct) {
      setFeedback('correct');
      setIsAnimating(true);
      speak(currentQ.sentence.replace('___', opt));
      
      setTimeout(() => {
        setScores(prev => ({ ...prev, [turn]: prev[turn] + 1 }));
        confetti({ 
          particleCount: 50, 
          spread: 50, 
          origin: { y: 0.3, x: turn === 'Gor' ? 0.2 : 0.8 },
          colors: turn === 'Gor' ? ['#ef4444', '#ffffff'] : ['#eab308', '#ffffff']
        });
      }, 800);

      setTimeout(() => {
        nextTurn();
      }, 2000);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        nextTurn();
      }, 1500);
    }
  };

  const nextTurn = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTurn(turn === 'Gor' ? 'Gayane' : 'Gor');
      setFeedback('none');
      setIsAnimating(false);
    } else {
      setView('finish');
    }
  };

  const winner = scores.Gor > scores.Gayane ? 'Gor' : scores.Gayane > scores.Gor ? 'Gayane' : 'Tie';

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-orange-500/30 overflow-hidden flex flex-col">
      
      <AnimatePresence mode="wait">
        
        {view === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12 relative"
          >
             {/* Court Background Lines */}
             <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[10px] border-white rounded-full" />
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white -translate-y-1/2" />
             </div>
             
             <div className="space-y-4">
                <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="w-24 h-24 bg-orange-600 rounded-full mx-auto flex items-center justify-center shadow-[0_0_60px_rgba(234,88,12,0.4)] border-4 border-white/20 p-4"
                >
                   <BasketballIcon size={64} className="text-white" />
                </motion.div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none italic">
                  PODER <br /><span className="text-orange-500">CHALLENGE</span>
                </h1>
                <p className="text-stone-500 font-bold uppercase tracking-[0.4em] text-[10px] max-w-sm mx-auto">
                   Dual Arena: Gor vs Gayane <br /> Տիրապետիր PODER բային
                </p>
             </div>

             <div className="flex gap-16 md:gap-32">
                <div className="flex flex-col items-center gap-4">
                   <div className="w-20 h-20 rounded-3xl bg-red-600 flex items-center justify-center border-4 border-white/10 shadow-2xl rotate-[-6deg]">
                      <User size={40} />
                   </div>
                   <p className="font-black italic uppercase tracking-widest text-sm text-red-500">Gor</p>
                </div>
                <div className="flex flex-col items-center gap-4">
                   <div className="w-20 h-20 rounded-3xl bg-yellow-500 flex items-center justify-center border-4 border-white/10 shadow-2xl rotate-[6deg]">
                      <User size={40} />
                   </div>
                   <p className="font-black italic uppercase tracking-widest text-sm text-yellow-500">Gayane</p>
                </div>
             </div>

             <button 
                onClick={() => setView('game')}
                className="group relative px-16 py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
             >
                <span className="relative z-10">Enter Arena</span>
                <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
             </button>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
             {/* Scoreboard Area */}
             <div className="h-[30vh] bg-stone-900 border-b-4 border-stone-800 flex items-center justify-between px-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-[at_50%_0%] from-orange-500/10 to-transparent opacity-50" />
                
                {/* Gor's Side */}
                <div className={`flex flex-col items-center gap-2 transition-all ${turn === 'Gor' ? 'scale-110 opacity-100' : 'scale-90 opacity-40'}`}>
                   <Hoop score={scores.Gor} total={QUESTIONS.length / 2} />
                   <p className="font-black uppercase tracking-widest text-xs text-red-500">Team Gor</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                   <div className="text-stone-600 font-black italic tracking-widest text-xs uppercase bg-black/40 px-6 py-2 rounded-full border border-white/5">
                      Round {currentIdx + 1} / {QUESTIONS.length}
                   </div>
                   <Timer className="text-white/20 animate-pulse" />
                </div>

                {/* Gayane's Side */}
                <div className={`flex flex-col items-center gap-2 transition-all ${turn === 'Gayane' ? 'scale-110 opacity-100' : 'scale-90 opacity-40'}`}>
                   <Hoop score={scores.Gayane} total={QUESTIONS.length / 2} />
                   <p className="font-black uppercase tracking-widest text-xs text-yellow-500">Team Gayane</p>
                </div>
             </div>

             {/* Question Area */}
             <div className="flex-1 p-8 flex flex-col items-center justify-start md:justify-center gap-10 relative overflow-y-auto">
                <Ball isFlying={isAnimating} target={turn} />

                {/* Who's playing indicator - Moved to top of content area to avoid overlap */}
                <div className={`mt-4 px-10 py-4 rounded-full border-2 transition-all duration-500 flex items-center gap-4 shrink-0 ${turn === 'Gor' ? 'bg-red-600/10 border-red-600' : 'bg-yellow-500/10 border-yellow-500'}`}>
                   <span className="p-1.5 rounded-full bg-white/20">
                      <User size={18} />
                   </span>
                   <span className="font-black italic uppercase tracking-[0.2em] text-sm whitespace-nowrap">
                      Turno de: <span className={turn === 'Gor' ? 'text-red-500' : 'text-yellow-500'}>{turn}</span>
                   </span>
                </div>

                <motion.div 
                  key={currentIdx}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="max-w-4xl w-full space-y-12 text-center"
                >
                   <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">
                         <Activity size={14} className="text-orange-500" /> Action Required
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black italic tracking-tight leading-tight">
                        {currentQ.sentence.split('___')[0]}
                        <span className={`mx-4 border-b-8 ${feedback === 'correct' ? 'border-emerald-500 text-emerald-500' : feedback === 'wrong' ? 'border-red-500 text-red-500' : 'border-stone-700 text-stone-700'} transition-all px-8 pb-1 inline-block min-w-[220px]`}>
                           {feedback === 'correct' ? currentQ.correct : feedback === 'wrong' ? '???' : '...'}
                        </span>
                        {currentQ.sentence.split('___')[1]}
                      </h2>
                      <p className="text-stone-500 font-bold uppercase tracking-widest text-sm italic">{currentQ.translation}</p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                      {currentQ.options.map((opt) => (
                        <motion.button
                          key={opt}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(opt)}
                          disabled={feedback !== 'none' || isAnimating}
                          className={`group relative p-8 rounded-[40px] border-4 font-black text-3xl uppercase italic overflow-hidden transition-all ${
                            feedback === 'correct' && opt === currentQ.correct
                              ? 'bg-emerald-600 border-white text-white shadow-[0_0_40px_rgba(16,185,129,0.4)]'
                              : feedback === 'wrong' && opt !== currentQ.correct
                              ? 'bg-red-600 border-white text-white'
                              : feedback === 'wrong' && opt === currentQ.correct
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500'
                              : 'bg-stone-900 border-white/5 hover:border-white/20 text-stone-500 hover:text-white'
                          }`}
                        >
                          <span className="relative z-10">{opt}</span>
                          <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10 ${turn === 'Gor' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        </motion.button>
                      ))}
                   </div>
                </motion.div>
             </div>
          </motion.div>
        )}

        {view === 'finish' && (
          <motion.div 
            key="finish"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-10"
          >
             <div className="space-y-6">
                <div className={`w-40 h-40 rounded-[3rem] mx-auto flex items-center justify-center shadow-3xl border-4 border-white/20 p-8 ${winner === 'Gor' ? 'bg-red-600 shadow-red-500/20' : winner === 'Gayane' ? 'bg-yellow-500 shadow-yellow-500/20' : 'bg-stone-800 shadow-stone-500/20'}`}>
                   <Trophy size={96} className="text-white animate-pulse" />
                </div>
                <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
                  {winner === 'Tie' ? '¡EMPATE!' : '¡CAMPEÓN!'}<br />
                  <span className={winner === 'Gor' ? 'text-red-500' : winner === 'Gayane' ? 'text-yellow-500' : 'text-stone-400'}>
                    {winner}
                  </span>
                </h1>
                <div className="flex gap-8 justify-center">
                   <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl">
                      <p className="text-[10px] font-black uppercase text-stone-500">Gor</p>
                      <p className="text-3xl font-black text-red-500">{scores.Gor}</p>
                   </div>
                   <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl">
                      <p className="text-[10px] font-black uppercase text-stone-500">Gayane</p>
                      <p className="text-3xl font-black text-yellow-500">{scores.Gayane}</p>
                   </div>
                </div>
                <p className="text-stone-500 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-relaxed">
                   Great match! You both demonstrated excellent control over the verb "Poder".
                </p>
             </div>

             <div className="flex flex-col gap-4 w-full max-w-xs">
                <button 
                  onClick={() => {
                    setView('intro');
                    setScores({ Gor: 0, Gayane: 0 });
                    setCurrentIdx(0);
                    setFeedback('none');
                    setIsAnimating(false);
                    setTurn('Gor');
                  }}
                  className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Rematch
                </button>
                <div className="flex justify-center gap-4 opacity-50">
                   <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em]"><Gamepad2 size={12}/> PVP Mode</div>
                   <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em]"><Medal size={12}/> Pro Series</div>
                </div>
             </div>
          </motion.div>
        )}

      </AnimatePresence>

      <footer className="p-8 border-t border-white/5 flex items-center justify-between opacity-30 mt-auto">
         <div className="flex items-center gap-3">
            <Target size={16} />
            <p className="text-[10px] font-black uppercase tracking-[0.8em]">Sports League v4.0</p>
         </div>
         <div className="hidden md:block text-[8px] font-medium text-stone-500 uppercase tracking-widest">
            Developed for Spanish mastery
         </div>
      </footer>
    </div>
  );
}
