import React, { useState, useEffect } from 'react';
import { Calendar, Search, MapPin, Clock, Trophy, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

// Base de datos de equipos con banderas reales (simulando un sorteo coherente sin equipos eliminados)
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
  SEN: { name: 'Senegal', flag: 'https://flagcdn.com/w40/sn.png' },
  JPN: { name: 'Japón', flag: 'https://flagcdn.com/w40/jp.png' },
  KOR: { name: 'Corea del Sur', flag: 'https://flagcdn.com/w40/kr.png' },
  MAR: { name: 'Marruecos', flag: 'https://flagcdn.com/w40/ma.png' },
  // ... más equipos para completar los 48 ...
};

export default function App() {
  const [activeTab, setActiveTab] = useState('fixture');
  const [scores, setScores] = useState({});
  const [penalties, setPenalties] = useState({});

  // Función para manejar el ingreso de goles con validación estricta
  const handleScoreChange = (matchId, team, value) => {
    // Evitar que ingresen signos, letras o números negativos
    if (value === '') {
      setScores(prev => ({ ...prev, [matchId]: { ...prev[matchId], [team]: '' } }));
      return;
    }
    
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    if (num > 15) num = 15; // Límite máximo de goles por partido para no romper UI
    
    setScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [team]: num }
    }));
  };

  const handlePenaltyChange = (matchId, team, value) => {
    if (value === '') {
      setPenalties(prev => ({ ...prev, [matchId]: { ...prev[matchId], [team]: '' } }));
      return;
    }
    let num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    if (num > 20) num = 20;
    
    setPenalties(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [team]: num }
    }));
  };

  // Componente de Tarjeta de Partido
  const MatchCard = ({ match }) => {
    const localScore = scores[match.id]?.local ?? '';
    const visitorScore = scores[match.id]?.visitor ?? '';
    
    // Determinar si es fase eliminatoria y hay empate
    const isKnockout = match.stage !== 'Fase de Grupos';
    const isTied = localScore !== '' && visitorScore !== '' && localScore === visitorScore;

    return (
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700 hover:border-blue-500/50 transition-all shadow-lg">
        <div className="flex justify-between items-center mb-4 text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1"><Clock size={12}/> {match.date} - {match.time}</span>
          <span className="bg-slate-700/50 px-2 py-1 rounded-full">{match.stage}</span>
        </div>
        
        <div className="flex items-center justify-between gap-4">
          {/* Local */}
          <div className="flex flex-col items-center flex-1">
            <img src={match.local.flag} alt={match.local.name} className="w-12 h-8 object-cover rounded shadow-sm mb-2" />
            <span className="text-sm font-bold text-center">{match.local.name}</span>
          </div>

          {/* Inputs de Goles (Tiempo Regular) */}
          <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-2 shadow-inner">
            <input 
              type="number" 
              min="0" max="15"
              value={localScore}
              onChange={(e) => handleScoreChange(match.id, 'local', e.target.value)}
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '.' || e.key === ',') e.preventDefault(); }}
              className="w-10 h-12 bg-slate-800 rounded-lg text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            />
            <span className="text-slate-500 font-bold">-</span>
            <input 
              type="number" 
              min="0" max="15"
              value={visitorScore}
              onChange={(e) => handleScoreChange(match.id, 'visitor', e.target.value)}
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '.' || e.key === ',') e.preventDefault(); }}
              className="w-10 h-12 bg-slate-800 rounded-lg text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            />
          </div>

          {/* Visitante */}
          <div className="flex flex-col items-center flex-1">
            <img src={match.visitor.flag} alt={match.visitor.name} className="w-12 h-8 object-cover rounded shadow-sm mb-2" />
            <span className="text-sm font-bold text-center">{match.visitor.name}</span>
          </div>
        </div>

        {/* Panel desplegable de Alargue y Penales */}
        {isKnockout && isTied && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 animate-fade-in">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full">
                ⏱️ Alargue y Penales
              </span>
            </div>
            <div className="flex justify-center items-center gap-8">
              <input 
                type="number" 
                placeholder="Pen."
                value={penalties[match.id]?.local ?? ''}
                onChange={(e) => handlePenaltyChange(match.id, 'local', e.target.value)}
                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                className="w-12 h-10 bg-slate-900 border border-slate-600 rounded-lg text-center text-sm font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-500 font-semibold">vs</span>
              <input 
                type="number" 
                placeholder="Pen."
                value={penalties[match.id]?.visitor ?? ''}
                onChange={(e) => handlePenaltyChange(match.id, 'visitor', e.target.value)}
                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                className="w-12 h-10 bg-slate-900 border border-slate-600 rounded-lg text-center text-sm font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1"><MapPin size={12}/> {match.stadium}</span>
          <button className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            + Calendar
          </button>
        </div>
      </div>
    );
  };

  // Ejemplo de un partido simulado en el estado
  const sampleMatches = [
    {
      id: 'm1',
      date: '11 Jun',
      time: '13:00',
      stage: 'Fase de Grupos',
      local: teamsData.MEX,
      visitor: teamsData.SEN,
      stadium: 'Estadio Azteca, CDMX'
    },
    {
      id: 'm104',
      date: '19 Jul',
      time: '15:00',
      stage: 'Final',
      local: teamsData.ARG,
      visitor: teamsData.FRA,
      stadium: 'MetLife Stadium, NY/NJ'
    }
  ];

  return (
    <div className="min-h-screen pb-20 bg-slate-900 text-white font-sans">
      {/* Banner y Header simplificado para visualización */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 p-4">
        <h1 className="text-xl font-semibold text-center tracking-tight">Copa Mundial 2026</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {sampleMatches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}