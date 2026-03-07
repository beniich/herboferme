# 🏟️ Page Complète de Match avec Visualisation - Partie 2

## 📊 Composant Match Statistics

```typescript
// src/components/match/MatchStatistics.tsx

import React from 'react';
import { TrendingUp, Target, Zap, Shield, Activity } from 'lucide-react';

interface TeamStats {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  passes: number;
  passAccuracy: number;
}

interface MatchStatisticsProps {
  homeTeam: {
    name: string;
    logo: string;
    stats: TeamStats;
  };
  awayTeam: {
    name: string;
    logo: string;
    stats: TeamStats;
  };
}

export const MatchStatistics: React.FC<MatchStatisticsProps> = ({
  homeTeam,
  awayTeam,
}) => {
  const stats = [
    {
      label: 'Possession',
      icon: Activity,
      home: homeTeam.stats.possession,
      away: awayTeam.stats.possession,
      unit: '%',
    },
    {
      label: 'Tirs',
      icon: Target,
      home: homeTeam.stats.shots,
      away: awayTeam.stats.shots,
    },
    {
      label: 'Tirs cadrés',
      icon: Zap,
      home: homeTeam.stats.shotsOnTarget,
      away: awayTeam.stats.shotsOnTarget,
    },
    {
      label: 'Corners',
      icon: TrendingUp,
      home: homeTeam.stats.corners,
      away: awayTeam.stats.corners,
    },
    {
      label: 'Fautes',
      icon: Shield,
      home: homeTeam.stats.fouls,
      away: awayTeam.stats.fouls,
    },
    {
      label: 'Hors-jeu',
      icon: Activity,
      home: homeTeam.stats.offsides,
      away: awayTeam.stats.offsides,
    },
    {
      label: 'Précision passes',
      icon: Target,
      home: homeTeam.stats.passAccuracy,
      away: awayTeam.stats.passAccuracy,
      unit: '%',
    },
  ];

  return (
    <div className="space-y-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const total = stat.home + stat.away;
        const homePercentage = total > 0 ? (stat.home / total) * 100 : 50;
        const awayPercentage = total > 0 ? (stat.away / total) * 100 : 50;

        return (
          <div key={index} className="space-y-2">
            {/* Label */}
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-400">
              <Icon size={16} />
              <span>{stat.label}</span>
            </div>

            {/* Values */}
            <div className="flex items-center justify-between text-lg font-bold text-white">
              <span>{stat.home}{stat.unit || ''}</span>
              <span>{stat.away}{stat.unit || ''}</span>
            </div>

            {/* Bar */}
            <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${homePercentage}%` }}
              />
              <div
                className="bg-gradient-to-l from-red-500 to-red-600 transition-all duration-500"
                style={{ width: `${awayPercentage}%` }}
              />
            </div>
          </div>
        );
      })}

      {/* Cards */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Cartons</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-4 bg-yellow-400 rounded-sm" />
              <span className="font-bold text-white">
                {homeTeam.stats.yellowCards}
              </span>
            </div>
            {homeTeam.stats.redCards > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-4 bg-red-500 rounded-sm" />
                <span className="font-bold text-white">
                  {homeTeam.stats.redCards}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {awayTeam.stats.redCards > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {awayTeam.stats.redCards}
                </span>
                <div className="w-3 h-4 bg-red-500 rounded-sm" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">
                {awayTeam.stats.yellowCards}
              </span>
              <div className="w-3 h-4 bg-yellow-400 rounded-sm" />
            </div>
            <span className="text-sm text-gray-400">Cartons</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 📅 Composant Match Timeline (Événements)

```typescript
// src/components/match/MatchTimeline.tsx

import React from 'react';
import { Target, ArrowRightLeft, AlertCircle, Flag } from 'lucide-react';

interface TimelineEvent {
  minute: number;
  type: 'goal' | 'substitution' | 'card' | 'var';
  team: 'home' | 'away';
  player: string;
  detail?: string;
}

interface MatchTimelineProps {
  events: TimelineEvent[];
  homeTeam: { name: string; logo: string };
  awayTeam: { name: string; logo: string };
}

export const MatchTimeline: React.FC<MatchTimelineProps> = ({
  events,
  homeTeam,
  awayTeam,
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <Target size={16} className="text-primary" />;
      case 'substitution':
        return <ArrowRightLeft size={16} className="text-blue-400" />;
      case 'card':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'var':
        return <Flag size={16} className="text-purple-400" />;
      default:
        return null;
    }
  };

  const getEventLabel = (type: string, detail?: string) => {
    switch (type) {
      case 'goal':
        return detail || 'But';
      case 'substitution':
        return 'Remplacement';
      case 'card':
        return detail || 'Carton';
      case 'var':
        return 'VAR';
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      {/* Center Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/10" />

      {/* Events */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const isHome = event.team === 'home';
          
          return (
            <div
              key={index}
              className={`relative flex items-center gap-4 ${
                isHome ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Event Content */}
              <div className={`flex-1 ${isHome ? 'text-right' : 'text-left'}`}>
                <div className="inline-block px-4 py-3 bg-white/5 rounded-xl border border-white/10 max-w-xs">
                  <div className="flex items-center gap-2 mb-1">
                    {isHome && getEventIcon(event.type)}
                    <span className="text-sm font-bold text-white">
                      {event.player}
                    </span>
                    {!isHome && getEventIcon(event.type)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getEventLabel(event.type, event.detail)}
                  </div>
                </div>
              </div>

              {/* Time Badge */}
              <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-primary rounded-full border-4 border-background-dark shadow-lg flex-shrink-0">
                <span className="text-sm font-bold text-black">
                  {event.minute}'
                </span>
              </div>

              {/* Spacer */}
              <div className="flex-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

## 🏟️ Page Complète Match Detail

```typescript
// src/pages/MatchDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, BarChart3, Clock, Trophy } from 'lucide-react';
import { FootballField } from '@/components/match/FootballField';
import { PlayerProfileCard } from '@/components/match/PlayerProfileCard';
import { MatchStatistics } from '@/components/match/MatchStatistics';
import { MatchTimeline } from '@/components/match/MatchTimeline';
import { SafeArea } from '@/components/SafeArea';
import { hapticFeedback } from '@/utils/haptics';
import { getApiUrl } from '@/config/api';

type TabType = 'lineups' | 'stats' | 'timeline' | 'h2h';

export default function MatchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [lineups, setLineups] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('lineups');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchData();
  }, [id]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      
      // Fetch match details
      const matchRes = await fetch(`${getApiUrl()}/matches/${id}`);
      const matchData = await matchRes.json();
      setMatch(matchData);

      // Fetch lineups
      const lineupsRes = await fetch(`${getApiUrl()}/matches/${id}/lineups`);
      const lineupsData = await lineupsRes.json();
      setLineups(lineupsData);
    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    await hapticFeedback.light();
    navigate(-1);
  };

  const handleTabChange = async (tab: TabType) => {
    await hapticFeedback.light();
    setActiveTab(tab);
  };

  const handlePlayerClick = async (player: any) => {
    await hapticFeedback.medium();
    setSelectedPlayer(player);
  };

  if (loading || !match) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const tabs = [
    { id: 'lineups', label: 'Composition', icon: Users },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'h2h', label: 'Historique', icon: Trophy },
  ];

  return (
    <SafeArea className="min-h-screen bg-background-dark pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background-dark/95 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 py-4">
          <button
            onClick={handleBack}
            className="mb-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>

          {/* Match Header */}
          <div className="flex items-center justify-between mb-6">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center">
              <img
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                className="w-16 h-16 object-contain mb-2"
              />
              <span className="text-sm font-bold text-white text-center">
                {match.homeTeam.name}
              </span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center px-6">
              {match.status === 'LIVE' && (
                <div className="px-3 py-1 bg-red-500 rounded-full mb-2 animate-pulse">
                  <span className="text-xs font-bold text-white">LIVE</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-white">
                  {match.score?.fulltime.home ?? 0}
                </span>
                <span className="text-2xl text-gray-500">-</span>
                <span className="text-4xl font-black text-white">
                  {match.score?.fulltime.away ?? 0}
                </span>
              </div>
              {match.status === 'LIVE' && (
                <div className="mt-2 text-sm text-primary font-bold">
                  {match.elapsed}'
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center">
              <img
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                className="w-16 h-16 object-contain mb-2"
              />
              <span className="text-sm font-bold text-white text-center">
                {match.awayTeam.name}
              </span>
            </div>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-4">
            <span>{match.league.name}</span>
            <span>•</span>
            <span>{match.venue?.name}</span>
            <span>•</span>
            <span>{new Date(match.matchDate).toLocaleDateString('fr-FR')}</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as TabType)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'lineups' && lineups && (
          <div className="space-y-8">
            {/* Home Team Lineup */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.name}
                  className="w-8 h-8 object-contain"
                />
                <h2 className="text-xl font-bold text-white">
                  {match.homeTeam.name}
                </h2>
                <span className="text-sm text-gray-400">
                  ({lineups.home.formation})
                </span>
              </div>

              <FootballField
                players={lineups.home.players}
                formation={lineups.home.formation}
                teamColor="#3B82F6"
                onPlayerClick={handlePlayerClick}
              />
            </div>

            {/* Away Team Lineup */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.name}
                  className="w-8 h-8 object-contain"
                />
                <h2 className="text-xl font-bold text-white">
                  {match.awayTeam.name}
                </h2>
                <span className="text-sm text-gray-400">
                  ({lineups.away.formation})
                </span>
              </div>

              <FootballField
                players={lineups.away.players}
                formation={lineups.away.formation}
                teamColor="#EF4444"
                onPlayerClick={handlePlayerClick}
              />
            </div>

            {/* Substitutes */}
            <div className="grid grid-cols-2 gap-6">
              {/* Home Substitutes */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
                  Remplaçants
                </h3>
                <div className="space-y-2">
                  {lineups.home.substitutes.map((player: any) => (
                    <button
                      key={player.id}
                      onClick={() => handlePlayerClick(player)}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {player.number}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-white">
                          {player.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.position}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Away Substitutes */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
                  Remplaçants
                </h3>
                <div className="space-y-2">
                  {lineups.away.substitutes.map((player: any) => (
                    <button
                      key={player.id}
                      onClick={() => handlePlayerClick(player)}
                      className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                        {player.number}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-white">
                          {player.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.position}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && match.statistics && (
          <MatchStatistics
            homeTeam={{
              name: match.homeTeam.name,
              logo: match.homeTeam.logo,
              stats: match.statistics.homeTeam,
            }}
            awayTeam={{
              name: match.awayTeam.name,
              logo: match.awayTeam.logo,
              stats: match.statistics.awayTeam,
            }}
          />
        )}

        {activeTab === 'timeline' && match.goals && (
          <MatchTimeline
            events={match.goals}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
          />
        )}

        {activeTab === 'h2h' && (
          <div className="text-center py-20">
            <Trophy size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Historique à venir...</p>
          </div>
        )}
      </div>

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfileCard
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </SafeArea>
  );
}
```

---

## 🎯 Routes API pour Lineups

```javascript
// server/src/routes/matches.js (ajouter)

// GET /api/matches/:id/lineups - Get match lineups
router.get('/:id/lineups', async (req, res) => {
  try {
    const lineups = await MatchLineup.find({ match: req.params.id })
      .populate({
        path: 'startingEleven.player',
        select: 'firstName lastName photo jerseyNumber position rating stats',
      })
      .populate({
        path: 'substitutes.player',
        select: 'firstName lastName photo jerseyNumber position rating stats',
      });

    const homeLineup = lineups.find((l) => l.team.toString() === match.homeTeam.team.toString());
    const awayLineup = lineups.find((l) => l.team.toString() === match.awayTeam.team.toString());

    res.json({
      home: {
        formation: homeLineup?.formation || '4-3-3',
        players: homeLineup?.startingEleven.map((p) => ({
          id: p.player._id,
          name: `${p.player.firstName} ${p.player.lastName}`,
          number: p.jerseyNumber,
          position: p.position,
          x: p.positionX,
          y: p.positionY,
          photo: p.player.photo,
          rating: p.matchStats.rating,
        })) || [],
        substitutes: homeLineup?.substitutes.map((p) => ({
          id: p.player._id,
          name: `${p.player.firstName} ${p.player.lastName}`,
          number: p.jerseyNumber,
          position: p.position,
        })) || [],
      },
      away: {
        formation: awayLineup?.formation || '4-3-3',
        players: awayLineup?.startingEleven.map((p) => ({
          id: p.player._id,
          name: `${p.player.firstName} ${p.player.lastName}`,
          number: p.jerseyNumber,
          position: p.position,
          x: p.positionX,
          y: p.positionY,
          photo: p.player.photo,
          rating: p.matchStats.rating,
        })) || [],
        substitutes: awayLineup?.substitutes.map((p) => ({
          id: p.player._id,
          name: `${p.player.firstName} ${p.player.lastName}`,
          number: p.jerseyNumber,
          position: p.position,
        })) || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

**Système complet de visualisation de terrain créé ! 🏟️⚽**

Suite dans le prochain fichier avec les formations prédéfinies et l'intégration API-Football ! 🚀
