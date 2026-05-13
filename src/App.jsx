import React, { useState, useRef } from 'react';
import { Calendar, Search, MapPin, Clock, Trophy, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';

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
  const start = new Date(2026, 5, 11); // 11 Junio
  const end = new Date(2026, 6, 19);   // 19 Julio
  let current = new Date(start);
  while (current <= end) {
    days.push({
      id: current.toISOString().split('T')[0],
      day: current.getDate(),
      month: current.toLocaleString('es-ES', { month: 'short' }).replace('.', ''),
      isToday: false
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const tournamentDays = generateTournamentDays();

// Base de datos de partidos (Ejemplo representativo)
const matchesData = [
  { id: 'm1', date: '2026-06-11', time: '13:00', stage: 'Fase de Grupos', group: 'A', local: teamsData.MEX, visitor: teamsData.RSA, stadium: 'Estadio Azteca, CDMX' },
  { id: 'm2', date: '2026-06-12', time: '15:00', stage: 'Fase de Grupos', group: 'B', local: teamsData.CAN, visitor: teamsData.MAR, stadium: 'BMO Field, Toronto' },
  { id: 'm3', date: '2026-06-12', time: '18:00', stage: 'Fase de Grupos', group: 'D', local: teamsData.USA, visitor: teamsData.SEN, stadium: 'SoFi Stadium, LA' },
  { id: 'm4', date: '2026-06-13', time: '14:00', stage: 'Fase de Grupos', group: 'C', local: teamsData.ARG, visitor: teamsData.JPN, stadium: 'MetLife Stadium, NY/NJ' },
  // Fases eliminatorias para probar los penales
  { id: 'k1', date: '2026-06-28', time: '16:00', stage: '16avos de Final', local: teamsData.ARG, visitor: teamsData.ENG, stadium: 'Hard Rock Stadium, Miami' },
  { id: 'k2', date: '2026-07-19', time: '15:00', stage: 'Final', local: teamsData.FRA, visitor: teamsData.BRA, stadium: 'MetLife Stadium, NY/NJ' }
];

const initialGroups = [
  { name: 'Grupo A', teams: [teamsData.MEX, teamsData.RSA, teamsData.NED, teamsData.JPN] },
  { name: 'Grupo B', teams: [teamsData.CAN, teamsData.MAR, teamsData.ESP, teamsData.COL] },
  { name: 'Grupo C', teams: [teamsData.ARG, teamsData.GER, teamsData.SEN, teamsData.ECU] },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('fixture');
  const [selectedDate, setSelectedDate] = useState('2026-06-11');
  const [scores, setScores] = useState({});
  const [penalties, setPenalties] = useState({});
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

  const MatchCard = ({ match }) => {
    const localScore = scores[match.id]?.local ?? '';
    const visitorScore = scores[match.id]?.visitor ?? '';
    const isKnockout = match.stage !== 'Fase de Grupos';
    const isTied = localScore !== '' && visitorScore !== '' && localScore === visitorScore;

    return (
      <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50 hover:border-blue-500/30 transition-all shadow-xl mb-4">
        <div className="flex justify-between items-center mb-5 text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1"><Clock size={14}/> {match.time}</span>
          <span className="bg-slate-700/50 px-3 py-1 rounded-full text-slate-300">{match.stage} {match.group ? `- ${match.group}` : ''}</span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center flex-1">
            <img src={match.local.flag} alt={match.local.name} className="w-14 h-10 object-cover rounded shadow-md mb-2" />
            <span className="text-sm font-bold text-center">{match.local.name}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 rounded-xl p-2 border border-slate-700/50">
            <input 
              type="number" min="0" max="15" value={localScore}
              onChange={(e) => handleScoreChange(match.id, 'local', e.target.value)}
              onKeyDown={(e) => { if (['-', 'e', '.', ','].includes(e.key)) e.preventDefault(); }}
              className="w-12 h-12 bg-slate-800 rounded-lg text-center text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            />
            <span className="text-slate-500 font-bold text-xl">-</span>
            <input 
              type="number" min="0" max="15" value={visitorScore}
              onChange={(e) => handleScoreChange(match.id, 'visitor', e.target.value)}
              onKeyDown={(e) => { if (['-', 'e', '.', ','].includes(e.key)) e.preventDefault(); }}
              className="w-12 h-12 bg-slate-800 rounded-lg text-center text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            />
          </div>

          <div className="flex flex-col items-center flex-1">
            <img src={match.visitor.flag} alt={match.visitor.name} className="w-14 h-10 object-cover rounded shadow-md mb-2" />
            <span className="text-sm font-bold text-center">{match.visitor.name}</span>
          </div>
        </div>

        {/* Panel de Penales (Solo eliminatorias y empate) */}
        {isKnockout && isTied && (
          <div className="mt-5 pt-4 border-t border-slate-700/50 animate-fade-in bg-slate-900/30 rounded-xl p-3">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                ⏱️ Alargue y Penales
              </span>
            </div>
            <div className="flex justify-center items-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Penales</span>
                <input 
                  type="number" value={penalties[match.id]?.local ?? ''}
                  onChange={(e) => handlePenaltyChange(match.id, 'local', e.target.value)}
                  onKeyDown={(e) => { if (['-', 'e', '.', ','].includes(e.key)) e.preventDefault(); }}
                  className="w-12 h-10 bg-slate-800 border border-slate-600 rounded-lg text-center text-lg font-bold text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <span className="text-xs text-slate-500 font-semibold mt-4">vs</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Penales</span>
                <input 
                  type="number" value={penalties[match.id]?.visitor ?? ''}
                  onChange={(e) => handlePenaltyChange(match.id, 'visitor', e.target.value)}
                  onKeyDown={(e) => { if (['-', 'e', '.', ','].includes(e.key)) e.preventDefault(); }}
                  className="w-12 h-10 bg-slate-800 border border-slate-600 rounded-lg text-center text-lg font-bold text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1"><MapPin size={14}/> {match.stadium}</span>
          <button className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg">
            <Calendar size={14}/> Agendar
          </button>
        </div>
      </div>
    );
  };

  const filteredMatches = matchesData.filter(m => m.date === selectedDate);

  return (
    <div className="min-h-screen pb-20 bg-[#0B1120] text-white font-sans selection:bg-blue-500/30">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="text-blue-500" size={24} />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Mundial 2026
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="p-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition"><Search size={18} /></button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-800">
          <button onClick={() => setActiveTab('fixture')} className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'fixture' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-300'}`}>
            Fixture
            {activeTab === 'fixture' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>}
          </button>
          <button onClick={() => setActiveTab('groups')} className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'groups' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-300'}`}>
            Grupos
            {activeTab === 'groups' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {activeTab === 'fixture' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* CALENDARIO HORIZONTAL */}
            <div className="relative group">
              <button onClick={() => scrollCalendar(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-[#0B1120] to-transparent w-12 h-full flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={24} className="text-white drop-shadow-md" />
              </button>
              
              <div ref={calendarRef} className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {tournamentDays.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDate(d.id)}
                    className={`snap-start shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all ${
                      selectedDate === d.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-500' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50'
                    }`}
                  >
                    <span className="text-xs uppercase font-medium">{d.month}</span>
                    <span className="text-2xl font-bold">{d.day}</span>
                  </button>
                ))}
              </div>

              <button onClick={() => scrollCalendar(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-[#0B1120] to-transparent w-12 h-full flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={24} className="text-white drop-shadow-md" />
              </button>
            </div>

            {/* PARTIDOS */}
            <div>
              {filteredMatches.length > 0 ? (
                filteredMatches.map(match => <MatchCard key={match.id} match={match} />)
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Día de descanso.</p>
                  <p className="text-sm">No hay partidos programados para esta fecha.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <LayoutGrid size={20} className="text-blue-500" /> Tablas de Posiciones
            </h2>
            {initialGroups.map((group, idx) => (
              <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700/50">
                  <h3 className="font-bold text-slate-200">{group.name}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3 font-medium">Selección</th>
                        <th className="px-2 py-3 text-center font-medium">Pts</th>
                        <th className="px-2 py-3 text-center font-medium">PJ</th>
                        <th className="px-2 py-3 text-center font-medium">GF</th>
                        <th className="px-2 py-3 text-center font-medium">GC</th>
                        <th className="px-2 py-3 text-center font-medium">DIF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.teams.map((team, tIdx) => (
                        <tr key={tIdx} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                          <td className="px-4 py-3 flex items-center gap-3">
                            <img src={team.flag} alt={team.name} className="w-6 h-4 object-cover rounded-sm shadow-sm" />
                            <span className="font-semibold text-slate-200">{team.name}</span>
                          </td>
                          <td className="px-2 py-3 text-center font-bold text-white">0</td>
                          <td className="px-2 py-3 text-center text-slate-400">0</td>
                          <td className="px-2 py-3 text-center text-slate-400">0</td>
                          <td className="px-2 py-3 text-center text-slate-400">0</td>
                          <td className="px-2 py-3 text-center text-slate-400">0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}