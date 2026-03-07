# 🏟️ Système de Visualisation de Terrain & Profils Joueurs

## 📐 Architecture Complète

### 1. Modèle de Données - Player (Joueur)

```javascript
// server/src/models/Player.js

const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  // Informations de base
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  commonName: String,
  photo: String,
  
  // Profil
  dateOfBirth: Date,
  nationality: {
    name: String,
    code: String,
    flag: String,
  },
  height: Number, // cm
  weight: Number, // kg
  
  // Informations sportives
  position: {
    type: String,
    enum: [
      // Football
      'GK', 'RB', 'CB', 'LB', 'RWB', 'LWB',
      'CDM', 'CM', 'CAM', 'RM', 'LM',
      'RW', 'LW', 'CF', 'ST',
      // Hockey
      'G', 'D', 'C', 'LW', 'RW'
    ],
  },
  primaryPosition: String,
  secondaryPositions: [String],
  
  jerseyNumber: Number,
  preferredFoot: {
    type: String,
    enum: ['Left', 'Right', 'Both'],
  },
  
  // Équipe actuelle
  currentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  teamName: String,
  teamLogo: String,
  
  // Contrat
  contractUntil: Date,
  joinedDate: Date,
  
  // Statistiques globales
  stats: {
    // Globales
    appearances: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 },
    
    // Avancées
    shotsOnTarget: { type: Number, default: 0 },
    shotsTotal: { type: Number, default: 0 },
    passAccuracy: { type: Number, default: 0 }, // %
    tacklesWon: { type: Number, default: 0 },
    interceptions: { type: Number, default: 0 },
    clearances: { type: Number, default: 0 },
    
    // Gardien
    saves: { type: Number, default: 0 },
    cleanSheets: { type: Number, default: 0 },
    goalsConceded: { type: Number, default: 0 },
    penaltiesSaved: { type: Number, default: 0 },
  },
  
  // Ratings
  rating: {
    overall: { type: Number, min: 0, max: 100 },
    pace: { type: Number, min: 0, max: 100 },
    shooting: { type: Number, min: 0, max: 100 },
    passing: { type: Number, min: 0, max: 100 },
    dribbling: { type: Number, min: 0, max: 100 },
    defending: { type: Number, min: 0, max: 100 },
    physical: { type: Number, min: 0, max: 100 },
  },
  
  // Valeur marchande
  marketValue: {
    value: Number,
    currency: {
      type: String,
      default: 'EUR',
    },
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  injuryStatus: {
    isInjured: { type: Boolean, default: false },
    injuryType: String,
    expectedReturn: Date,
  },
  
  // Metadata
  apiFootballId: Number,
  lastSyncedAt: Date,
}, {
  timestamps: true,
});

// Virtuals
playerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

playerSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Index
playerSchema.index({ firstName: 'text', lastName: 'text' });
playerSchema.index({ currentTeam: 1, position: 1 });
playerSchema.index({ 'rating.overall': -1 });

module.exports = mongoose.model('Player', playerSchema);
```

---

## 🎮 Modèle Match Lineup (Composition de Match)

```javascript
// server/src/models/MatchLineup.js

const mongoose = require('mongoose');

const lineupPlayerSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  
  // Position sur le terrain
  position: String,
  positionX: Number, // 0-100 (% de la largeur)
  positionY: Number, // 0-100 (% de la hauteur)
  
  // Infos match
  jerseyNumber: Number,
  isStarter: {
    type: Boolean,
    default: true,
  },
  isCaptain: {
    type: Boolean,
    default: false,
  },
  
  // Temps de jeu
  minutesPlayed: Number,
  
  // Stats du match
  matchStats: {
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    shots: { type: Number, default: 0 },
    shotsOnTarget: { type: Number, default: 0 },
    passes: { type: Number, default: 0 },
    passesCompleted: { type: Number, default: 0 },
    tackles: { type: Number, default: 0 },
    interceptions: { type: Number, default: 0 },
    fouls: { type: Number, default: 0 },
    yellowCard: { type: Boolean, default: false },
    redCard: { type: Boolean, default: false },
    rating: Number, // 1-10
  },
  
  // Substitution
  substituted: {
    isSubstituted: { type: Boolean, default: false },
    minute: Number,
    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
    },
  },
});

const matchLineupSchema = new mongoose.Schema({
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  
  // Formation (ex: 4-3-3, 4-4-2)
  formation: {
    type: String,
    required: true,
  },
  
  // Joueurs
  startingEleven: [lineupPlayerSchema],
  substitutes: [lineupPlayerSchema],
  
  // Coach
  coach: {
    name: String,
    photo: String,
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MatchLineup', matchLineupSchema);
```

---

## 🎨 Composant React - Football Field

```typescript
// src/components/match/FootballField.tsx

import React from 'react';

interface FieldPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  x: number; // 0-100
  y: number; // 0-100
  photo?: string;
  rating?: number;
}

interface FootballFieldProps {
  players: FieldPlayer[];
  formation?: string;
  teamColor?: string;
  onPlayerClick?: (player: FieldPlayer) => void;
}

export const FootballField: React.FC<FootballFieldProps> = ({
  players,
  formation = '4-3-3',
  teamColor = '#F9D406',
  onPlayerClick,
}) => {
  return (
    <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-green-600 to-green-700 rounded-2xl overflow-hidden shadow-2xl">
      {/* Field Lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Border */}
        <rect
          x="2%"
          y="2%"
          width="96%"
          height="96%"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Center Line */}
        <line
          x1="50%"
          y1="2%"
          x2="50%"
          y2="98%"
          stroke="white"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Center Circle */}
        <circle
          cx="50%"
          cy="50%"
          r="10%"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Center Spot */}
        <circle
          cx="50%"
          cy="50%"
          r="0.5%"
          fill="white"
          opacity="0.8"
        />
        
        {/* Left Penalty Area */}
        <rect
          x="2%"
          y="30%"
          width="16%"
          height="40%"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Left Goal Area */}
        <rect
          x="2%"
          y="40%"
          width="8%"
          height="20%"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Right Penalty Area */}
        <rect
          x="82%"
          y="30%"
          width="16%"
          height="40%"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Right Goal Area */}
        <rect
          x="90%"
          y="40%"
          width="8%"
          height="20%"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Left Penalty Spot */}
        <circle
          cx="11%"
          cy="50%"
          r="0.5%"
          fill="white"
          opacity="0.8"
        />
        
        {/* Right Penalty Spot */}
        <circle
          cx="89%"
          cy="50%"
          r="0.5%"
          fill="white"
          opacity="0.8"
        />
      </svg>

      {/* Players */}
      {players.map((player) => (
        <button
          key={player.id}
          onClick={() => onPlayerClick?.(player)}
          className="absolute group cursor-pointer transition-transform hover:scale-110 active:scale-95"
          style={{
            left: `${player.x}%`,
            top: `${player.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Player Circle */}
          <div className="relative">
            {/* Glow Effect */}
            <div
              className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity"
              style={{ backgroundColor: teamColor }}
            />
            
            {/* Player Avatar */}
            <div
              className="relative w-12 h-12 rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg"
              style={{ borderColor: teamColor }}
            >
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: teamColor }}
                >
                  {player.number}
                </div>
              )}
            </div>

            {/* Jersey Number Badge */}
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-md"
              style={{ backgroundColor: teamColor }}
            >
              {player.number}
            </div>

            {/* Rating Badge (if available) */}
            {player.rating && (
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-yellow-400">
                {player.rating.toFixed(1)}
              </div>
            )}
          </div>

          {/* Player Name */}
          <div className="mt-1 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <span className="text-xs font-medium text-white">
              {player.name}
            </span>
          </div>

          {/* Position Label */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-bold" style={{ color: teamColor }}>
              {player.position}
            </span>
          </div>
        </button>
      ))}

      {/* Formation Label */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full border border-white/20">
        <span className="text-sm font-bold text-white">{formation}</span>
      </div>
    </div>
  );
};
```

---

## 👤 Composant Player Profile Card

```typescript
// src/components/match/PlayerProfileCard.tsx

import React from 'react';
import { X, TrendingUp, Award, Activity, Calendar } from 'lucide-react';

interface PlayerStats {
  goals: number;
  assists: number;
  appearances: number;
  rating: number;
  yellowCards: number;
  redCards: number;
}

interface PlayerProfileCardProps {
  player: {
    id: string;
    name: string;
    photo: string;
    number: number;
    position: string;
    age: number;
    nationality: {
      name: string;
      flag: string;
    };
    team: {
      name: string;
      logo: string;
    };
    stats: PlayerStats;
    rating: {
      overall: number;
      pace: number;
      shooting: number;
      passing: number;
      dribbling: number;
      defending: number;
      physical: number;
    };
  };
  onClose: () => void;
}

export const PlayerProfileCard: React.FC<PlayerProfileCardProps> = ({
  player,
  onClose,
}) => {
  const statAttributes = [
    { label: 'Pace', value: player.rating.pace, color: 'bg-blue-500' },
    { label: 'Shooting', value: player.rating.shooting, color: 'bg-red-500' },
    { label: 'Passing', value: player.rating.passing, color: 'bg-green-500' },
    { label: 'Dribbling', value: player.rating.dribbling, color: 'bg-purple-500' },
    { label: 'Defending', value: player.rating.defending, color: 'bg-yellow-500' },
    { label: 'Physical', value: player.rating.physical, color: 'bg-orange-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-surface-dark to-card-dark rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Header with Player Photo */}
        <div className="relative h-64 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Player Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Overall Rating Badge */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-primary to-yellow-500 rounded-2xl flex flex-col items-center justify-center shadow-xl rotate-[-5deg] border-4 border-black">
                <span className="text-4xl font-black text-black">
                  {player.rating.overall}
                </span>
                <span className="text-xs font-bold text-black/70">OVR</span>
              </div>

              {/* Player Photo */}
              <div className="w-48 h-48 rounded-full border-4 border-primary overflow-hidden shadow-2xl">
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Jersey Number */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl rotate-[5deg] border-4 border-black">
                <span className="text-3xl font-black text-black">
                  {player.number}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="p-6 space-y-6">
          {/* Name and Basic Info */}
          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-2">
              {player.name}
            </h2>
            <div className="flex items-center justify-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <img
                  src={player.nationality.flag}
                  alt={player.nationality.name}
                  className="w-6 h-4 object-cover rounded"
                />
                <span className="text-sm">{player.nationality.name}</span>
              </div>
              <span className="text-sm">•</span>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span className="text-sm">{player.age} ans</span>
              </div>
              <span className="text-sm">•</span>
              <span className="text-sm font-bold text-primary">
                {player.position}
              </span>
            </div>
          </div>

          {/* Team */}
          <div className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 rounded-xl border border-white/10">
            <img
              src={player.team.logo}
              alt={player.team.name}
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-white">{player.team.name}</span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-primary">
                {player.stats.goals}
              </div>
              <div className="text-xs text-gray-400 mt-1">Buts</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-primary">
                {player.stats.assists}
              </div>
              <div className="text-xs text-gray-400 mt-1">Passes D.</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-primary">
                {player.stats.appearances}
              </div>
              <div className="text-xs text-gray-400 mt-1">Matchs</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-primary">
                {player.stats.rating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Note Moy.</div>
            </div>
          </div>

          {/* Attribute Bars */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
              <Activity size={18} className="text-primary" />
              <span>Attributs</span>
            </div>
            {statAttributes.map((attr) => (
              <div key={attr.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{attr.label}</span>
                  <span className="font-bold text-white">{attr.value}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${attr.color} rounded-full transition-all duration-500`}
                    style={{ width: `${attr.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Cards */}
          {(player.stats.yellowCards > 0 || player.stats.redCards > 0) && (
            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-gray-400">Cartons:</span>
              {player.stats.yellowCards > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-6 bg-yellow-400 rounded-sm" />
                  <span className="text-sm font-bold text-white">
                    {player.stats.yellowCards}
                  </span>
                </div>
              )}
              {player.stats.redCards > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-6 bg-red-500 rounded-sm" />
                  <span className="text-sm font-bold text-white">
                    {player.stats.redCards}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

Suite dans le prochain fichier avec la page complète de match et l'intégration ! 🚀
