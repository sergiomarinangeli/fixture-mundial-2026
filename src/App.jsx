import React, { useState, useRef } from 'react';
import { 
  Calendar, Search, MapPin, Clock, Trophy, ChevronLeft, ChevronRight, 
  Menu, X, Sun, Moon, PlusCircle, Users, LayoutGrid
} from 'lucide-react';

// Banderas y países corregidos (Sin Italia, sin Chile. Con clasificados reales/probables)
const teamsData = {
  MEX: { name: 'México', flag: 'https://flagcdn.com/w40/mx.png' },
  CAN: { name: 'Canadá', flag: 'https://flagcdn.com/w40/ca.png' },
  USA: { name: 'EE.UU.', flag: 'https://flagcdn.com/w40/us.png' },
  ARG: { name: 'Argentina', flag: 'https://flagcdn.com/w40/ar.png' },
  BRA: { name: 'Brasil', flag: 'https://flagcdn.com/w40/br.png' },
  FRA: { name: 'Francia', flag: 'https://flagcdn.com/w40/fr.png' },
  ESP: { name: 'España', flag: 'https://flagcdn.com/w40/es.png' },
  ENG: { name: 'Inglaterra', flag: 'https://flagcdn.com/w40/gb-eng.png' },
  GER: { name: 'Alemania', flag: 'https://flagcdn.com/w40/de.png' },
  NED: { name: 'Países Bajos', flag: 'https://flagcdn.com/w40/nl.png' },
  POR: { name: 'Portugal', flag: 'https://flagcdn.com/w40/pt.png' },
  COL: { name: 'Colombia', flag: 'https://flagcdn.com/w40/co.png' },
  URU: { name: 'Uruguay', flag: 'https://flagcdn.com/w40/uy.png' },
  ECU: { name: 'Ecuador', flag: 'https://flagcdn.com/w40/ec.png' },
  RSA: { name: 'Sudáfrica', flag: 'https://flagcdn.com/w40/za.png' },
  JPN: { name: 'Japón', flag: 'https://flagcdn.com/w40/jp.png' },
  MAR: { name: 'Marruecos', flag: 'https://flagcdn.com/w40/ma.png' },
  SEN: { name: 'Senegal', flag: 'https://flagcdn.com/w40/sn.png' },
  TBD: { name: 'Por Definir', flag: 'https://flagcdn.com/w40/un.png' }
};

// Generador de días del Mundial (11 Jun al 19 Jul)
const generateTournamentDays = () => {
  const days = [];
  const start = new Date(2026, 5, 11);
  const end = new Date(2026, 6, 19);
  let current = new Date(start);
  while (current <= end) {
    days.push({
      id: current.toISOString().split('T')[0],
      day: current.getDate(),
      month: current.toLocaleString('es-ES', { month: 'short' }).replace('.', ''),
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const tournamentDays = generateTournamentDays();

// Base de datos de partidos de prueba
const matchesData = [
  { id: 'm1', date: '2026-06-11', time: '13:00', stage: 'Fase de Grupos', group: 'A', local: teamsData.MEX, visitor: teamsData.RSA, stadium: 'Estadio Azteca, CDMX' },
  { id: 'm2', date: '2026-06-12', time: '15:00', stage: 'Fase de Grupos', group: 'B', local: teamsData.CAN, visitor: teamsData.MAR, stadium: 'BMO Field, Toronto' },
  { id: 'm3', date: '2026-06-12', time: '18:00', stage: 'Fase de Grupos', group: 'D', local: teamsData.USA, visitor: teamsData.SEN, stadium: 'SoFi Stadium, LA' },
  { id: 'm4', date: '2026-06-13', time: '14:00', stage: 'Fase de Grupos', group: 'C', local: teamsData.ARG, visitor: teamsData.JPN, stadium: 'MetLife Stadium, NY/NJ' },
  { id: 'k1', date: '2026-06-28', time: '16:00', stage: '16avos de Final', local: teamsData.ARG, visitor: teamsData.ENG, stadium: 'Hard Rock Stadium, Miami' },
  { id: 'k2', date: '2026-07-19', time: '15:00', stage: 'Final', local: teamsData.FRA, visitor: teamsData.BRA, stadium: 'MetLife Stadium, NY/NJ' }
];

const initialGroups = [
  { name: 'Grupo A', teams: [teamsData.MEX, teamsData.RSA, teamsData.NED, teamsData.JPN] },
  { name: 'Grupo B', teams: [teamsData.CAN, teamsData.MAR, teamsData.ESP, teamsData.COL] },
  { name: 'Grupo C', teams: [teamsData.ARG, teamsData.GER, teamsData.SEN, teamsData.ECU] },
];

const BannerAd = () => {
  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2 text-center text-sm font-semibold shadow-inner">
      <span>Patrocinador Oficial: El banco de la Copa Mundial 2026</span>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('fixture');
  const [theme, setTheme] = useState('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-06-11');
  const [scores, setScores] = useState({});
  const [penalties, setPenalties] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const calendarRef = useRef(null);

  const scrollCalendar = (dir) => {
    if (calendarRef.current) {
      calendarRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  };

  const handleScoreChange = (matchId, team, value) => {
    if (value === '') {
      setScores(prev => ({ ...prev, [matchId]: { ...prev[matchId], [team]: '' } }));
      return;
    }
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    if (num > 15) num = 15;
    
    setScores(prev => ({ ...prev, [matchId]: { ...prev[matchId], [team]: num } }));
  };

  const handlePenaltyChange = (matchId, team, value) => {
    if (value === '') {
      setPenalties(prev => ({ ...prev, [matchId]: { ...prev[matchId], [team]: '' } }));
      return;
    }
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    if (num > 20) num = 20;
    
    setPenalties(prev => ({ ...prev, [matchId]: { ...prev[matchId], [team]: num } }));
  };

  const saveToCloud = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const MatchCard = ({ match }) => {
    const localScore = scores[match.id]?.local ?? '';
    const visitorScore = scores[match.id]?.visitor ?? '';
    const isKnockout = match.stage !== 'Fase de Grupos';
    const isTied = localScore !== '' && visitorScore !== '' && localScore === visitorScore;

    return (
      <div className={`rounded-2xl p-4 border transition-all shadow-lg mb-4 ${theme === 'dark' ? 'bg-slate-800/60 backdrop-blur-md border-slate-700/50 hover:border-cyan-500/30' : 'bg-white border-slate-200 hover:border-blue-500/30'}`}>
        <div className={`flex justify-between items-center mb-4 text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className="flex items-center gap-1"><Clock size={12}/> {match.time} Local</span>
          <span className={`px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'}`}>{match.stage} {match.group ? `- Grupo ${match.group}` : ''}</span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center flex-1">
            <img src={match.local.flag} alt={match.local.name} className="w-12 h-8 object-cover rounded shadow-sm border border-slate-200 dark:border-slate-700 mb-2" />
            <span className="text-sm font-bold text-center truncate w-full">{match.local.name}</span>
          </div>

          <div className={`flex items-center gap-2 rounded-xl p-2 ${theme === 'dark' ? 'bg-slate-900 shadow-inner' : 'bg-slate-100 border border-slate-200'}`}>
            <input 
              type="number" min="0" max="15" value={localScore}
              onChange={(e) => handleScoreChange(match.id, 'local', e.target.value)}
              onKeyDown={(e) => { if (['-', 'e', '.', ','].includes(e.key)) e.preventDefault(); }}
              className={`w-10 h-12 rounded-lg text-center text-xl font-bold focus:outline-none appearance-none transition-colors ${theme === 'dark' ? 'bg-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'}`}
            />
            <span className={`font-bold opacity-50`}>-</span>
            <input 
              type="number" min="0" max="15" value={visitorScore}
              onChange={(e) => handleScoreChange(match.id, 'visitor', e.target.value)}
              onKeyDown={(e) => { if (['-', 'e', '.', ','].includes(e.key)) e.preventDefault(); }}
              className={`w-10 h-12 rounded-lg text-center text-xl font-bold focus:outline-none appearance-none transition-colors ${theme === 'dark' ? 'bg-slate-800 text-white focus:ring-2 focus:ring-cyan-500' : 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'}`}
            />
          </div>

          <div className="flex flex-col items-center flex-1">
            <img src={match.visitor.flag} alt={match.visitor.name} className="w-12 h-8 object-cover rounded shadow-sm border border-slate-200 dark:border-slate-700 mb-2" />
            <span className="text-sm font-bold text-center truncate w-full">{match.visitor.name}</span>
          </div>
        </div>

        {isKnockout && isTied && (
          <div className={`mt-4 pt-3 border-t animate-fade-in rounded-xl p-2 ${theme === 'dark' ? 'border-slate-700/50 bg-slate-900/30' : 'border-slate-200 bg-amber-50'}`}>
            <div className="text-center mb-2">
              <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                ⏱️ Penales
              </span>
            </div>
            <div className="flex justify-center items-center gap-6">
               <input 
                  type="number" value={penalties[match.id]?.local ?? ''}
                  onChange={(e) => handlePenaltyChange(match.id, 'local', e.target.value)}
                  onKeyDown={(e) => { if (['-', 'e', '.', ','].includes(e.key)) e.preventDefault(); }}
                  className={`w-10 h-8 rounded text-center text-sm font-bold text-amber-500 focus:outline-none ${theme === 'dark' ? 'bg-slate-800 border border-slate-600 focus:border-amber-500' : 'bg-white border border-amber-200'}`}
                />
              <span className="text-xs font-semibold opacity-50">vs</span>
              <input 
                  type="number" value={penalties[match.id]?.visitor ?? ''}
                  onChange={(e) => handlePenaltyChange(match.id, 'visitor', e.target.value)}
                  onKeyDown={(e) => { if (['-', 'e', '.', ','].includes(e.key)) e.preventDefault(); }}
                  className={`w-10 h-8 rounded text-center text-sm font-bold text-amber-500 focus:outline-none ${theme === 'dark' ? 'bg-slate-800 border border-slate-600 focus:border-amber-500' : 'bg-white border border-amber-200'}`}
                />
            </div>
          </div>
        )}

        <div className={`mt-4 pt-3 border-t flex justify-between items-center text-xs ${theme === 'dark' ? 'border-slate-700/50 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          <span className="flex items-center gap-1 truncate"><MapPin size={12}/> {match.stadium}</span>
          <button className={`font-medium px-3 py-1.5 rounded-full flex items-center transition-colors ${theme === 'dark' ? 'bg-slate-700 text-cyan-400 hover:bg-slate-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
            + Calendar
          </button>
        </div>
      </div>
    );
  };

  const filteredMatches = matchesData.filter(m => m.date === selectedDate);
  const baseClasses = theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';

  return (
    <div className={`min-h-screen pb-20 font-sans transition-colors duration-300 ${baseClasses}`}>
      
      {/* HEADER PRINCIPAL */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-black text-sm">26</div>
              <span className="font-bold text-lg hidden sm:block tracking-tight">Fixture<span className={theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'}>Mundial</span></span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-2">
            {['fixture', 'grupos', 'prode'].map((tab) => (
              <button 
                key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all capitalize ${activeTab === tab ? (theme === 'dark' ? 'bg-slate-800 text-cyan-400' : 'bg-slate-200 text-blue-600') : 'hover:opacity-70'}`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-slate-500/20 transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={saveToCloud} className={`p-2 rounded-full transition-colors ${isSaving ? 'animate-pulse' : ''} ${theme === 'dark' ? 'hover:bg-slate-500/20 text-cyan-400' : 'hover:bg-slate-500/20 text-blue-600'}`}>
              <PlusCircle size={20} />
            </button>
          </div>
        </div>
      </header>

      <BannerAd />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'fixture' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold">Partidos</h1>
            
            {/* CALENDARIO CON FLECHAS */}
            <div className="relative group flex items-center">
              <button onClick={() => scrollCalendar(-1)} className={`hidden md:flex absolute -left-4 z-10 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all ${theme === 'dark' ? 'bg-slate-700 text-cyan-400 hover:bg-slate-600' : 'bg-white text-blue-600 border border-slate-200'}`}>
                <ChevronLeft size={20} />
              </button>
              
              <div ref={calendarRef} className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {tournamentDays.map((d) => (
                  <button
                    key={d.id} onClick={() => setSelectedDate(d.id)}
                    className={`snap-start shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${
                      selectedDate === d.id 
                        ? (theme === 'dark' ? 'bg-slate-800 border-cyan-400 text-cyan-400' : 'bg-blue-600 border-blue-600 text-white')
                        : (theme === 'dark' ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500')
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold mb-1 opacity-80">{d.month}</span>
                    <span className="text-xl font-bold">{d.day}</span>
                  </button>
                ))}
              </div>

              <button onClick={() => scrollCalendar(1)} className={`hidden md:flex absolute -right-4 z-10 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all ${theme === 'dark' ? 'bg-slate-700 text-cyan-400 hover:bg-slate-600' : 'bg-white text-blue-600 border border-slate-200'}`}>
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMatches.length > 0 ? (
                filteredMatches.map(match => <MatchCard key={match.id} match={match} />)
              ) : (
                <div className="col-span-full py-12 text-center opacity-50">
                  <p>No hay partidos en esta fecha.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'grupos' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <h1 className="text-2xl font-bold mb-6">Tablas de Posiciones</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialGroups.map((group, idx) => (
                <div key={idx} className={`rounded-2xl border overflow-hidden shadow-sm ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className={`px-4 py-3 border-b font-bold ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    {group.name}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className={`text-xs uppercase opacity-60 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <tr>
                          <th className="px-4 py-2 font-semibold">Selección</th>
                          <th className="px-2 py-2 text-center font-semibold">Pts</th>
                          <th className="px-2 py-2 text-center font-semibold">PJ</th>
                          <th className="px-2 py-2 text-center font-semibold">DIF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.teams.map((team, tIdx) => (
                          <tr key={tIdx} className={`border-b border-opacity-50 ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                            <td className="px-4 py-3 flex items-center gap-2">
                              <img src={team.flag} alt={team.name} className="w-5 h-3 object-cover rounded-sm shadow-sm" />
                              <span className="font-medium">{team.name}</span>
                            </td>
                            <td className="px-2 py-3 text-center font-bold">0</td>
                            <td className="px-2 py-3 text-center opacity-70">0</td>
                            <td className="px-2 py-3 text-center opacity-70">0</td>
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
      </main>

      {/* FOOTER MÓVIL (Navegación tipo App) */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t pb-safe flex justify-around items-center backdrop-blur-xl z-50 ${theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <button onClick={() => setActiveTab('fixture')} className={`flex flex-col items-center p-3 ${activeTab === 'fixture' ? (theme === 'dark' ? 'text-cyan-400' : 'text-blue-600') : 'opacity-50'}`}>
          <Calendar size={22} />
          <span className="text-[10px] font-bold mt-1">Partidos</span>
        </button>
        <button onClick={() => setActiveTab('grupos')} className={`flex flex-col items-center p-3 ${activeTab === 'grupos' ? (theme === 'dark' ? 'text-cyan-400' : 'text-blue-600') : 'opacity-50'}`}>
          <LayoutGrid size={22} />
          <span className="text-[10px] font-bold mt-1">Grupos</span>
        </button>
        <button onClick={() => setActiveTab('prode')} className={`flex flex-col items-center p-3 ${activeTab === 'prode' ? (theme === 'dark' ? 'text-cyan-400' : 'text-blue-600') : 'opacity-50'}`}>
          <Trophy size={22} />
          <span className="text-[10px] font-bold mt-1">Mi Prode</span>
        </button>
      </div>
    </div>
  );
}