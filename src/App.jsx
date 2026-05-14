import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Menu, X, Sun, Moon, LogIn, LogOut, Trophy, Users, 
  Settings, Share2, PlusCircle, Bell
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';

// Firebase Setup (Following strict rules for the environment)
let app, auth, db, appId;
try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ? __app_id : 'fixture-2026-demo';
} catch (e) {
  console.warn("Firebase not fully configured for standalone, running in memory mode.", e);
}

const GROUPS_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

// 1. Asignar 48 selecciones usando FlagCDN para solucionar el problema de renderizado de Emojis en Windows
const TEAMS = {
  // Grupo A (Sede: México)
  'A1': { id: 'A1', name: 'México', flagUrl: 'https://flagcdn.com/w40/mx.png', group: 'A' },
  'A2': { id: 'A2', name: 'Sudáfrica', flagUrl: 'https://flagcdn.com/w40/za.png', group: 'A' },
  'A3': { id: 'A3', name: 'Polonia', flagUrl: 'https://flagcdn.com/w40/pl.png', group: 'A' },
  'A4': { id: 'A4', name: 'Nueva Zelanda', flagUrl: 'https://flagcdn.com/w40/nz.png', group: 'A' },
  
  // Grupo B (Sede: Canadá)
  'B1': { id: 'B1', name: 'Canadá', flagUrl: 'https://flagcdn.com/w40/ca.png', group: 'B' },
  'B2': { id: 'B2', name: 'Suecia', flagUrl: 'https://flagcdn.com/w40/se.png', group: 'B' },
  'B3': { id: 'B3', name: 'Camerún', flagUrl: 'https://flagcdn.com/w40/cm.png', group: 'B' },
  'B4': { id: 'B4', name: 'Corea del Sur', flagUrl: 'https://flagcdn.com/w40/kr.png', group: 'B' },
  
  // Grupo C
  'C1': { id: 'C1', name: 'Argentina', flagUrl: 'https://flagcdn.com/w40/ar.png', group: 'C' },
  'C2': { id: 'C2', name: 'Gales', flagUrl: 'https://flagcdn.com/w40/gb-wls.png', group: 'C' },
  'C3': { id: 'C3', name: 'Costa Rica', flagUrl: 'https://flagcdn.com/w40/cr.png', group: 'C' },
  'C4': { id: 'C4', name: 'Irak', flagUrl: 'https://flagcdn.com/w40/iq.png', group: 'C' },
  
  // Grupo D (Sede: EE.UU.)
  'D1': { id: 'D1', name: 'EE.UU.', flagUrl: 'https://flagcdn.com/w40/us.png', group: 'D' },
  'D2': { id: 'D2', name: 'Colombia', flagUrl: 'https://flagcdn.com/w40/co.png', group: 'D' },
  'D3': { id: 'D3', name: 'Dinamarca', flagUrl: 'https://flagcdn.com/w40/dk.png', group: 'D' },
  'D4': { id: 'D4', name: 'China', flagUrl: 'https://flagcdn.com/w40/cn.png', group: 'D' },
  
  // Grupo E
  'E1': { id: 'E1', name: 'Francia', flagUrl: 'https://flagcdn.com/w40/fr.png', group: 'E' },
  'E2': { id: 'E2', name: 'Ecuador', flagUrl: 'https://flagcdn.com/w40/ec.png', group: 'E' },
  'E3': { id: 'E3', name: 'Japón', flagUrl: 'https://flagcdn.com/w40/jp.png', group: 'E' },
  'E4': { id: 'E4', name: 'Mali', flagUrl: 'https://flagcdn.com/w40/ml.png', group: 'E' },
  
  // Grupo F
  'F1': { id: 'F1', name: 'España', flagUrl: 'https://flagcdn.com/w40/es.png', group: 'F' },
  'F2': { id: 'F2', name: 'Croacia', flagUrl: 'https://flagcdn.com/w40/hr.png', group: 'F' },
  'F3': { id: 'F3', name: 'Venezuela', flagUrl: 'https://flagcdn.com/w40/ve.png', group: 'F' },
  'F4': { id: 'F4', name: 'Nigeria', flagUrl: 'https://flagcdn.com/w40/ng.png', group: 'F' },
  
  // Grupo G
  'G1': { id: 'G1', name: 'Brasil', flagUrl: 'https://flagcdn.com/w40/br.png', group: 'G' },
  'G2': { id: 'G2', name: 'Suiza', flagUrl: 'https://flagcdn.com/w40/ch.png', group: 'G' },
  'G3': { id: 'G3', name: 'Egipto', flagUrl: 'https://flagcdn.com/w40/eg.png', group: 'G' },
  'G4': { id: 'G4', name: 'Jamaica', flagUrl: 'https://flagcdn.com/w40/jm.png', group: 'G' },
  
  // Grupo H
  'H1': { id: 'H1', name: 'Inglaterra', flagUrl: 'https://flagcdn.com/w40/gb-eng.png', group: 'H' },
  'H2': { id: 'H2', name: 'Austria', flagUrl: 'https://flagcdn.com/w40/at.png', group: 'H' },
  'H3': { id: 'H3', name: 'Marruecos', flagUrl: 'https://flagcdn.com/w40/ma.png', group: 'H' },
  'H4': { id: 'H4', name: 'Arabia Saudita', flagUrl: 'https://flagcdn.com/w40/sa.png', group: 'H' },
  
  // Grupo I
  'I1': { id: 'I1', name: 'Portugal', flagUrl: 'https://flagcdn.com/w40/pt.png', group: 'I' },
  'I2': { id: 'I2', name: 'Uruguay', flagUrl: 'https://flagcdn.com/w40/uy.png', group: 'I' },
  'I3': { id: 'I3', name: 'Irán', flagUrl: 'https://flagcdn.com/w40/ir.png', group: 'I' },
  'I4': { id: 'I4', name: 'Argelia', flagUrl: 'https://flagcdn.com/w40/dz.png', group: 'I' },
  
  // Grupo J
  'J1': { id: 'J1', name: 'Alemania', flagUrl: 'https://flagcdn.com/w40/de.png', group: 'J' },
  'J2': { id: 'J2', name: 'Senegal', flagUrl: 'https://flagcdn.com/w40/sn.png', group: 'J' },
  'J3': { id: 'J3', name: 'Perú', flagUrl: 'https://flagcdn.com/w40/pe.png', group: 'J' },
  'J4': { id: 'J4', name: 'Omán', flagUrl: 'https://flagcdn.com/w40/om.png', group: 'J' },
  
  // Grupo K
  'K1': { id: 'K1', name: 'Bélgica', flagUrl: 'https://flagcdn.com/w40/be.png', group: 'K' },
  'K2': { id: 'K2', name: 'Serbia', flagUrl: 'https://flagcdn.com/w40/rs.png', group: 'K' },
  'K3': { id: 'K3', name: 'Costa de Marfil', flagUrl: 'https://flagcdn.com/w40/ci.png', group: 'K' },
  'K4': { id: 'K4', name: 'Panamá', flagUrl: 'https://flagcdn.com/w40/pa.png', group: 'K' },
  
  // Grupo L
  'L1': { id: 'L1', name: 'Ucrania', flagUrl: 'https://flagcdn.com/w40/ua.png', group: 'L' },
  'L2': { id: 'L2', name: 'Países Bajos', flagUrl: 'https://flagcdn.com/w40/nl.png', group: 'L' },
  'L3': { id: 'L3', name: 'Paraguay', flagUrl: 'https://flagcdn.com/w40/py.png', group: 'L' },
  'L4': { id: 'L4', name: 'Honduras', flagUrl: 'https://flagcdn.com/w40/hn.png', group: 'L' },
};

const INITIAL_MATCHES = [];
let matchCounter = 1;

// Función para generar fechas sin errores de zona horaria del navegador
const parseDate = (daysToAdd) => {
  const d = new Date('2026-06-11T12:00:00Z');
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().split('T')[0];
};

// 3. Generar dinámicamente los 104 PARTIDOS para tener el calendario completo
// -> 72 Partidos de Fase de Grupos (Del 11 al 27 de Junio)
GROUPS_LETTERS.forEach((g, idx) => {
  const dayOffset = Math.floor(idx / 1.5); 
  
  let stadium1 = 'Sede a definir';
  let city1 = 'Norteamérica';
  // Asignaciones específicas reales de la FIFA
  if (g === 'A') { stadium1 = 'Estadio Azteca'; city1 = 'CDMX'; }
  else if (g === 'B') { stadium1 = 'BMO Field'; city1 = 'Toronto'; }
  else if (g === 'D') { stadium1 = 'SoFi Stadium'; city1 = 'Los Ángeles'; }

  INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(dayOffset), time: '14:00', t1: `${g}1`, t2: `${g}2`, stadium: stadium1, city: city1, phase: 'Fase de Grupos', group: g });
  INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(dayOffset + 1), time: '17:00', t1: `${g}3`, t2: `${g}4`, stadium: 'Sede a definir', city: 'Norteamérica', phase: 'Fase de Grupos', group: g });
  
  INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(dayOffset + 5), time: '15:00', t1: `${g}1`, t2: `${g}3`, stadium: 'Sede a definir', city: 'Norteamérica', phase: 'Fase de Grupos', group: g });
  INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(dayOffset + 6), time: '18:00', t1: `${g}4`, t2: `${g}2`, stadium: 'Sede a definir', city: 'Norteamérica', phase: 'Fase de Grupos', group: g });
  
  INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(dayOffset + 10), time: '16:00', t1: `${g}4`, t2: `${g}1`, stadium: 'Sede a definir', city: 'Norteamérica', phase: 'Fase de Grupos', group: g });
  INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(dayOffset + 11), time: '16:00', t1: `${g}2`, t2: `${g}3`, stadium: 'Sede a definir', city: 'Norteamérica', phase: 'Fase de Grupos', group: g });
});

// -> 16avos de Final (16 partidos)
for(let i=0; i<16; i++) INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(17 + Math.floor(i/3)), time: '15:00', t1: `1° o 2° de Grupo`, t2: `2° o 3° de Grupo`, stadium: 'Sede Eliminatoria', city: 'Norteamérica', phase: '16avos de Final', group: '-' });
// -> Octavos de Final (8 partidos)
for(let i=0; i<8; i++) INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(23 + Math.floor(i/2)), time: '16:00', t1: `Ganador 16avos`, t2: `Ganador 16avos`, stadium: 'Sede Eliminatoria', city: 'Norteamérica', phase: 'Octavos de Final', group: '-' });
// -> Cuartos de Final (4 partidos)
for(let i=0; i<4; i++) INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(28 + Math.floor(i/1.5)), time: '17:00', t1: `Ganador Octavos`, t2: `Ganador Octavos`, stadium: 'Sede Eliminatoria', city: 'Norteamérica', phase: 'Cuartos de Final', group: '-' });
// -> Semifinales (2 partidos)
for(let i=0; i<2; i++) INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(33 + i), time: '18:00', t1: `Ganador Cuartos`, t2: `Ganador Cuartos`, stadium: 'Sede Eliminatoria', city: 'Norteamérica', phase: 'Semifinal', group: '-' });
// -> Tercer Puesto
INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(37), time: '15:00', t1: `Perdedor Semifinal`, t2: `Perdedor Semifinal`, stadium: 'Hard Rock Stadium', city: 'Miami', phase: 'Tercer Puesto', group: '-' });
// -> Final (19 de Julio)
INITIAL_MATCHES.push({ id: `m${matchCounter++}`, date: parseDate(38), time: '16:00', t1: `Ganador Semifinal`, t2: `Ganador Semifinal`, stadium: 'MetLife Stadium', city: 'Nueva York/NJ', phase: 'Final', group: '-' });

const generateGCalLink = (match) => {
  const t1Name = TEAMS[match.t1]?.name || match.t1;
  const t2Name = TEAMS[match.t2]?.name || match.t2;
  const title = `Mundial 2026: ${t1Name} vs ${t2Name}`;
  const details = `Partido de ${match.phase} - Grupo ${match.group}.%0AEstadio: ${match.stadium}`;
  
  // Basic date formatting for GCal (YYYYMMDDTHHmmssZ)
  // Note: Assuming local time for demo, proper timezone conversion needed for prod
  const startStr = `${match.date.replace(/-/g, '')}T${match.time.replace(':', '')}00`;
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${startStr}&details=${details}&location=${encodeURIComponent(match.stadium + ', ' + match.city)}`;
};

const MatchCard = ({ match, predictions, penalties, handleScoreChange, handlePenaltyChange, theme }) => {
  const defaultFlag = "https://placehold.co/40x26/1e293b/38bdf8?text=+-+";
  // Aseguramos de que si no existe el equipo, se muestre una imagen neutral
  const t1 = TEAMS[match.t1] || { name: match.t1, flagUrl: defaultFlag };
  const t2 = TEAMS[match.t2] || { name: match.t2, flagUrl: defaultFlag };
  const pred = predictions[match.id] || { t1: '', t2: '' };
  const pen = penalties[match.id] || { t1: '', t2: '' };

  const isKnockout = match.phase !== 'Fase de Grupos';
  const isTied = pred.t1 !== null && pred.t2 !== null && pred.t1 === pred.t2 && pred.t1 !== undefined && pred.t1 !== '';

  return (
    <div className={`p-4 rounded-2xl backdrop-blur-md border shadow-lg transition-all hover:shadow-xl ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
      <div className="flex justify-between items-center mb-3 text-xs md:text-sm font-semibold opacity-70">
        <span>{match.phase} - Grupo {match.group}</span>
        <span>{match.time} Local</span>
      </div>
      
      <div className="flex justify-between items-center my-4">
        {/* Team 1 */}
        <div className="flex flex-col items-center w-1/3 text-center">
          <img src={t1.flagUrl} alt={t1.name} className="w-10 h-7 md:w-12 md:h-8 mb-2 object-cover rounded shadow-sm border border-slate-200 dark:border-slate-700" />
          <span className="font-bold truncate w-full">{t1.name}</span>
        </div>

        {/* Score Inputs */}
        <div className="flex items-center space-x-2 w-1/3 justify-center">
          <input 
            type="number" min="0" max="20"
            value={pred.t1 ?? ''}
            onChange={(e) => handleScoreChange(match.id, 't1', e.target.value)}
            onKeyDown={(e) => { if (['-', 'e', '+', '.', ','].includes(e.key)) e.preventDefault(); }}
            className={`w-12 h-14 text-center text-2xl font-black rounded-lg outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 text-cyan-400 border border-slate-700 focus:border-cyan-400' : 'bg-slate-100 text-blue-600 border border-slate-300 focus:border-blue-500'}`}
          />
          <span className="font-black text-xl opacity-50">-</span>
          <input 
            type="number" min="0" max="20"
            value={pred.t2 ?? ''}
            onChange={(e) => handleScoreChange(match.id, 't2', e.target.value)}
            onKeyDown={(e) => { if (['-', 'e', '+', '.', ','].includes(e.key)) e.preventDefault(); }}
            className={`w-12 h-14 text-center text-2xl font-black rounded-lg outline-none transition-all ${theme === 'dark' ? 'bg-slate-900 text-cyan-400 border border-slate-700 focus:border-cyan-400' : 'bg-slate-100 text-blue-600 border border-slate-300 focus:border-blue-500'}`}
          />
        </div>

        {/* Team 2 */}
        <div className="flex flex-col items-center w-1/3 text-center">
          <img src={t2.flagUrl} alt={t2.name} className="w-10 h-7 md:w-12 md:h-8 mb-2 object-cover rounded shadow-sm border border-slate-200 dark:border-slate-700" />
          <span className="font-bold truncate w-full">{t2.name}</span>
        </div>
      </div>

      {isKnockout && isTied && (
        <div className={`mt-2 pt-3 border-t animate-fade-in rounded-xl p-3 mb-2 ${theme === 'dark' ? 'border-slate-700/50 bg-slate-900/40' : 'border-slate-200 bg-amber-50'}`}>
          <div className="text-center mb-2">
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
              ⏱️ Alargue y Penales
            </span>
          </div>
          <div className="flex justify-center items-center gap-6">
             <input 
                type="number" min="0" max="30"
                value={pen.t1 ?? ''}
                placeholder="Pen."
                onChange={(e) => handlePenaltyChange(match.id, 't1', e.target.value)}
                onKeyDown={(e) => { if (['-', 'e', '+', '.', ','].includes(e.key)) e.preventDefault(); }}
                className={`w-12 h-10 rounded-lg text-center text-sm font-bold text-amber-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border border-slate-600 focus:border-amber-500' : 'bg-white border border-amber-300 focus:border-amber-500'}`}
              />
            <span className="text-xs font-black opacity-50">vs</span>
             <input 
                type="number" min="0" max="30"
                value={pen.t2 ?? ''}
                placeholder="Pen."
                onChange={(e) => handlePenaltyChange(match.id, 't2', e.target.value)}
                onKeyDown={(e) => { if (['-', 'e', '+', '.', ','].includes(e.key)) e.preventDefault(); }}
                className={`w-12 h-10 rounded-lg text-center text-sm font-bold text-amber-500 outline-none transition-all ${theme === 'dark' ? 'bg-slate-800 border border-slate-600 focus:border-amber-500' : 'bg-white border border-amber-300 focus:border-amber-500'}`}
              />
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row justify-between items-center gap-2 text-xs md:text-sm">
        <div className="flex items-center opacity-70">
          <span className="truncate max-w-[200px]">{match.stadium}, {match.city}</span>
        </div>
        <a 
          href={generateGCalLink(match)}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center px-3 py-1.5 rounded-full font-medium transition-colors ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-cyan-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}
        >
          <CalendarIcon size={14} className="mr-1.5" /> Agregar
        </a>
      </div>
    </div>
  );
};

const BannerAd = () => {
  const [currentSponsor, setCurrentSponsor] = useState(0);
  const sponsors = [
    { name: "Sponsor Premium 1", color: "from-blue-600 to-cyan-600", text: "El banco oficial del Mundial 2026" },
    { name: "Sponsor Premium 2", color: "from-red-600 to-orange-600", text: "Refresca tu pasión" },
    { name: "Sponsor Premium 3", color: "from-green-600 to-emerald-600", text: "Movilidad global para fans" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSponsor((prev) => (prev + 1) % sponsors.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sponsors.length]);

  return (
    <div className={`w-full text-white overflow-hidden transition-all duration-500 bg-gradient-to-r ${sponsors[currentSponsor].color} p-3 flex items-center justify-center text-center shadow-inner text-sm md:text-base`}>
        <span className="font-bold mr-2">{sponsors[currentSponsor].name}:</span>
        <span className="opacity-90">{sponsors[currentSponsor].text}</span>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('fixture');
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-06-11');
  const [predictions, setPredictions] = useState({});
  const [penalties, setPenalties] = useState({});
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Referencia para el scroll del calendario
  const calendarRef = useRef(null);

  useEffect(() => {
    const localData = localStorage.getItem('prode_predictions');
    if (localData) {
      try { setPredictions(JSON.parse(localData)); } catch(e) {}
    }
    
    const localPenalties = localStorage.getItem('prode_penalties');
    if (localPenalties) {
      try { setPenalties(JSON.parse(localPenalties)); } catch(e) {}
    }

    if (!user || !db) return;
    
    const docRef = doc(db, 'artifacts', appId, 'prode_data', user.uid);
    
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data().matches || {};
        const penData = docSnap.data().penalties || {};
        setPredictions(data);
        setPenalties(penData);
        localStorage.setItem('prode_predictions', JSON.stringify(data));
        localStorage.setItem('prode_penalties', JSON.stringify(penData));
      }
    }).catch(err => {
      // Manejo silencioso de permisos
    });
  }, [user]);

  const handleScoreChange = (matchId, team, score) => {
    if (score === '') {
      setPredictions(prev => ({ ...prev, [matchId]: { ...prev[matchId], [team]: null } }));
      return;
    }

    let val = parseInt(score, 10);
    if (isNaN(val) || val < 0) return;
    if (val > 20) val = 20;

    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: val
      }
    }));
  };

  const handlePenaltyChange = (matchId, team, score) => {
    if (score === '') {
      setPenalties(prev => ({ ...prev, [matchId]: { ...prev[matchId], [team]: null } }));
      return;
    }

    let val = parseInt(score, 10);
    if (isNaN(val) || val < 0) return;
    if (val > 30) val = 30;

    setPenalties(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: val
      }
    }));
  };

  const saveToFirebase = async () => {
    setIsSaving(true);
    localStorage.setItem('prode_predictions', JSON.stringify(predictions));
    localStorage.setItem('prode_penalties', JSON.stringify(penalties));

    if (user && db) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'prode_data', user.uid);
        await setDoc(docRef, { matches: predictions, penalties: penalties, updatedAt: new Date() }, { merge: true });
      } catch (error) {
        console.error("Error saving data:", error);
      }
    }
    setTimeout(() => setIsSaving(false), 600);
  };

  const calculateStandings = useMemo(() => {
    const standings = {};
    
    // Inicializar posiciones con todas las 48 selecciones
    Object.values(TEAMS).forEach(t => {
      standings[t.id] = { ...t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    });

    // Iterar solo por los partidos de fase de grupos
    INITIAL_MATCHES.filter(m => m.phase === 'Fase de Grupos').forEach(m => {
      const pred = predictions[m.id];
      if (pred && pred.t1 !== null && pred.t2 !== null && pred.t1 !== undefined && pred.t2 !== '') {
        const s1 = parseInt(pred.t1, 10);
        const s2 = parseInt(pred.t2, 10);
        
        if (isNaN(s1) || isNaN(s2)) return;

        const st1 = standings[m.t1];
        const st2 = standings[m.t2];
        
        if(!st1 || !st2) return;

        st1.p++; st2.p++;
        st1.gf += s1; st1.ga += s2;
        st2.gf += s2; st2.ga += s1;

        if (s1 > s2) { st1.w++; st2.l++; st1.pts += 3; }
        else if (s1 < s2) { st2.w++; st1.l++; st2.pts += 3; }
        else { st1.d++; st2.d++; st1.pts += 1; st2.pts += 1; }

        st1.gd = st1.gf - st1.ga;
        st2.gd = st2.gf - st2.ga;
      }
    });

    const grouped = {};
    Object.values(standings).forEach(t => {
      if(!grouped[t.group]) grouped[t.group] = [];
      grouped[t.group].push(t);
    });

    // Ordenar por Puntos, Diferencia de Gol, y Goles a Favor
    Object.keys(grouped).forEach(g => {
      grouped[g].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    });

    return grouped;
  }, [predictions]);

  const uniqueDates = useMemo(() => {
    return [...new Set(INITIAL_MATCHES.map(m => m.date))].sort();
  }, []);

  const filteredMatches = INITIAL_MATCHES.filter(m => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const t1 = TEAMS[m.t1]?.name.toLowerCase() || '';
      const t2 = TEAMS[m.t2]?.name.toLowerCase() || '';
      return t1.includes(q) || t2.includes(q) || m.city.toLowerCase().includes(q) || m.stadium.toLowerCase().includes(q);
    }
    return m.date === selectedDate;
  });

  const baseClasses = theme === 'dark' 
    ? 'bg-slate-900 text-slate-100 min-h-screen font-sans selection:bg-cyan-500/30' 
    : 'bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-blue-500/30';

  return (
    <div className={baseClasses}>
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button className="md:hidden p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('fixture')}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-black">26</div>
              <span className="font-black text-lg hidden sm:block tracking-tight">Fixture<span className={theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'}>Mundial</span></span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {['fixture', 'grupos', 'prode'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all capitalize ${activeTab === tab ? (theme === 'dark' ? 'bg-slate-800 text-cyan-400' : 'bg-slate-200 text-blue-600') : 'hover:opacity-70'}`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className={`hidden lg:flex items-center px-3 py-1.5 rounded-full border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              <Search size={16} className="opacity-50 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar país, grupo..." 
                className="bg-transparent outline-none text-sm w-40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-slate-500/20 transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button 
              onClick={saveToFirebase}
              disabled={isSaving}
              className={`p-2 rounded-full transition-colors flex items-center justify-center ${isSaving ? 'animate-pulse' : ''} ${theme === 'dark' ? 'hover:bg-slate-500/20 text-cyan-400' : 'hover:bg-slate-500/20 text-blue-600'}`}
              title="Guardar mis resultados"
            >
              {isSaving ? <span className="text-xs font-bold px-1">...</span> : <PlusCircle size={20} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className={`md:hidden border-b px-4 py-4 space-y-3 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <input 
              type="text" 
              placeholder="Buscar país, ciudad..." 
              className={`w-full p-3 rounded-xl border outline-none ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex flex-col space-y-2">
               {['fixture', 'grupos', 'prode'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => { setActiveTab(tab); setIsMenuOpen(false); }}
                  className={`p-3 text-left rounded-xl font-bold capitalize ${activeTab === tab ? (theme === 'dark' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-50 text-blue-600') : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <BannerAd />

      <main className="max-w-5xl mx-auto px-4 py-8 pb-24">
        
        {activeTab === 'fixture' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold mb-1">Fixture</h1>
                <p className="opacity-70 text-sm">Completa los resultados para simular la clasificación.</p>
              </div>
            </div>

            {!searchQuery && (
              <div className="relative group flex items-center">
                
                {/* Botón Izquierdo para Desktop */}
                <button 
                  onClick={() => calendarRef.current?.scrollBy({ left: -250, behavior: 'smooth' })}
                  className={`hidden md:flex absolute -left-4 z-10 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${theme === 'dark' ? 'bg-slate-700 text-cyan-400 hover:bg-slate-600' : 'bg-white text-blue-600 hover:bg-slate-50 border border-slate-200'}`}
                >
                  <ChevronLeft size={24} />
                </button>

                <div ref={calendarRef} className={`flex overflow-x-auto hide-scrollbar space-x-3 pb-4 snap-x w-full scroll-smooth ${theme === 'dark' ? '[color-scheme:dark]' : ''}`}>
                  {uniqueDates.map(dateStr => {
                    const [year, month, day] = dateStr.split('-');
                    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    const monthName = monthNames[parseInt(month, 10) - 1];
                    
                    return (
                      <button 
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`snap-start shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border transition-all ${
                          selectedDate === dateStr 
                            ? (theme === 'dark' ? 'bg-gradient-to-b from-slate-700 to-slate-800 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-gradient-to-b from-blue-500 to-blue-600 text-white border-blue-600 shadow-md')
                            : (theme === 'dark' ? 'bg-slate-800/50 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300')
                        }`}
                      >
                        <span className="text-xs uppercase font-bold opacity-70 mb-1">{monthName}</span>
                        <span className="text-2xl font-bold">{day}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Botón Derecho para Desktop */}
                <button 
                  onClick={() => calendarRef.current?.scrollBy({ left: 250, behavior: 'smooth' })}
                  className={`hidden md:flex absolute -right-4 z-10 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 ${theme === 'dark' ? 'bg-slate-700 text-cyan-400 hover:bg-slate-600' : 'bg-white text-blue-600 hover:bg-slate-50 border border-slate-200'}`}
                >
                  <ChevronRight size={24} />
                </button>

              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMatches.length > 0 ? (
                filteredMatches.map(match => (
              <MatchCard 
                key={match.id} 
                match={match} 
                predictions={predictions} 
                penalties={penalties}
                handleScoreChange={handleScoreChange} 
                handlePenaltyChange={handlePenaltyChange}
                theme={theme} 
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center opacity-50 flex flex-col items-center">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p>No se encontraron partidos para la búsqueda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'grupos' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl md:text-3xl font-semibold mb-8">Tablas de Posiciones</h1>
            <p className="opacity-70 mb-6 -mt-6">Actualizadas en tiempo real según los resultados ingresados.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Object.keys(calculateStandings).sort().map(groupKey => (
                <div key={groupKey} className={`rounded-3xl border overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className={`px-6 py-4 border-b font-black text-xl flex items-center justify-between ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span>Grupo {groupKey}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className={`text-xs uppercase font-bold opacity-60 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <tr>
                          <th className="px-4 py-3">Selección</th>
                          <th className="px-2 py-3 text-center">PJ</th>
                          <th className="px-2 py-3 text-center">G</th>
                          <th className="px-2 py-3 text-center">E</th>
                          <th className="px-2 py-3 text-center">P</th>
                          <th className="px-2 py-3 text-center">GF</th>
                          <th className="px-2 py-3 text-center">GC</th>
                          <th className="px-2 py-3 text-center">DG</th>
                          <th className="px-4 py-3 text-center text-base">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {calculateStandings[groupKey].map((team, index) => (
                          <tr key={team.id} className={`transition-colors ${index < 2 ? (theme === 'dark' ? 'bg-cyan-500/5' : 'bg-blue-50/50') : ''}`}>
                            <td className="px-4 py-3 font-bold flex items-center gap-2">
                              <span className="opacity-50 text-xs w-4">{index + 1}</span>
                              <img src={team.flagUrl} alt={team.name} className="w-6 h-4 object-cover rounded shadow-sm border border-slate-200 dark:border-slate-700" />
                              <span className="truncate max-w-[100px]">{team.name}</span>
                            </td>
                            <td className="px-2 py-3 text-center opacity-80">{team.p}</td>
                            <td className="px-2 py-3 text-center opacity-80">{team.w}</td>
                            <td className="px-2 py-3 text-center opacity-80">{team.d}</td>
                            <td className="px-2 py-3 text-center opacity-80">{team.l}</td>
                            <td className="px-2 py-3 text-center opacity-80">{team.gf}</td>
                            <td className="px-2 py-3 text-center opacity-80">{team.ga}</td>
                            <td className="px-2 py-3 text-center font-medium">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                            <td className="px-4 py-3 text-center font-black text-lg">{team.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'prode' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Trophy size={48} color="white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">Modo "Mi Prode"</h1>
            <p className="text-lg opacity-80 max-w-2xl mx-auto mb-8">
              Predice los resultados, crea ligas privadas con tus amigos y compite por ser el mejor estratega del Mundial 2026.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
              <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
                <Users className="mb-4 text-cyan-500" size={32} />
                <h3 className="text-xl font-bold mb-2">Ligas Privadas</h3>
                <p className="opacity-70 text-sm">Crea grupos con código de invitación. Ideal para la oficina o familia.</p>
              </div>
              <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
                <Trophy className="mb-4 text-yellow-500" size={32} />
                <h3 className="text-xl font-bold mb-2">Ranking Global</h3>
                <p className="opacity-70 text-sm">Compara tus aciertos con miles de usuarios en tiempo real.</p>
              </div>
              <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
                <Bell className="mb-4 text-pink-500" size={32} />
                <h3 className="text-xl font-bold mb-2">Notificaciones</h3>
                <p className="opacity-70 text-sm">Recibe alertas antes de cada partido para no olvidar tus predicciones.</p>
              </div>
            </div>

            <button className={`mt-12 px-8 py-4 rounded-full font-black text-lg transition-transform hover:scale-105 shadow-xl ${theme === 'dark' ? 'bg-cyan-500 text-slate-900 shadow-cyan-500/20' : 'bg-blue-600 text-white shadow-blue-600/20'}`}>
              Jugar ahora
            </button>
          </div>
        )}

      </main>

      <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t pb-safe pt-2 px-6 flex justify-between items-center backdrop-blur-xl z-50 ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <button onClick={() => setActiveTab('fixture')} className={`flex flex-col items-center p-2 ${activeTab === 'fixture' ? (theme === 'dark' ? 'text-cyan-400' : 'text-blue-600') : 'opacity-50'}`}>
          <CalendarIcon size={24} />
          <span className="text-[10px] font-bold mt-1">Partidos</span>
        </button>
        <button onClick={() => setActiveTab('grupos')} className={`flex flex-col items-center p-2 ${activeTab === 'grupos' ? (theme === 'dark' ? 'text-cyan-400' : 'text-blue-600') : 'opacity-50'}`}>
          <Users size={24} />
          <span className="text-[10px] font-bold mt-1">Grupos</span>
        </button>
        <button onClick={() => setActiveTab('prode')} className={`flex flex-col items-center p-2 ${activeTab === 'prode' ? (theme === 'dark' ? 'text-cyan-400' : 'text-blue-600') : 'opacity-50'}`}>
          <Trophy size={24} />
          <span className="text-[10px] font-bold mt-1">Mi Prode</span>
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
      `}} />
    </div>
  );
}