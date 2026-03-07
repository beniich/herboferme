# 🚀 Système Complet - Formations, UEFA Scraping & Fonctionnalités Avancées

## 📐 Formations Prédéfinies Complètes

```typescript
// src/utils/formations.ts

export interface FormationPosition {
  position: string;
  x: number; // 0-100 (percentage of field width)
  y: number; // 0-100 (percentage of field height)
  role: string;
}

export interface Formation {
  name: string;
  system: string;
  positions: FormationPosition[];
  description: string;
  strengths: string[];
  weaknesses: string[];
  famousTeams: string[];
}

export const formations: Record<string, Formation> = {
  '4-3-3': {
    name: '4-3-3 Attaque',
    system: '4-3-3',
    description: 'Formation offensive avec trois attaquants et un milieu équilibré',
    strengths: ['Pression haute', 'Jeu de passes', 'Largeur offensive'],
    weaknesses: ['Milieu exposé', 'Contre-attaques'],
    famousTeams: ['Barcelona (Guardiola)', 'Liverpool (Klopp)', 'Bayern Munich'],
    positions: [
      // Gardien
      { position: 'GK', x: 8, y: 50, role: 'Gardien' },
      
      // Défense
      { position: 'RB', x: 23, y: 18, role: 'Arrière Droit' },
      { position: 'CB', x: 23, y: 38, role: 'Défenseur Central' },
      { position: 'CB', x: 23, y: 62, role: 'Défenseur Central' },
      { position: 'LB', x: 23, y: 82, role: 'Arrière Gauche' },
      
      // Milieu
      { position: 'CDM', x: 42, y: 35, role: 'Milieu Défensif' },
      { position: 'CM', x: 42, y: 50, role: 'Milieu Central' },
      { position: 'CM', x: 42, y: 65, role: 'Milieu Central' },
      
      // Attaque
      { position: 'RW', x: 72, y: 23, role: 'Ailier Droit' },
      { position: 'ST', x: 72, y: 50, role: 'Avant-Centre' },
      { position: 'LW', x: 72, y: 77, role: 'Ailier Gauche' },
    ],
  },

  '4-4-2': {
    name: '4-4-2 Classique',
    system: '4-4-2',
    description: 'Formation équilibrée et solide, idéale pour la transition',
    strengths: ['Équilibre', 'Compacité', 'Duo d\'attaquants'],
    weaknesses: ['Manque de créativité', 'Milieu surchargé'],
    famousTeams: ['Manchester United (Ferguson)', 'Atletico Madrid (Simeone)'],
    positions: [
      { position: 'GK', x: 8, y: 50, role: 'Gardien' },
      
      { position: 'RB', x: 23, y: 18, role: 'Arrière Droit' },
      { position: 'CB', x: 23, y: 38, role: 'Défenseur Central' },
      { position: 'CB', x: 23, y: 62, role: 'Défenseur Central' },
      { position: 'LB', x: 23, y: 82, role: 'Arrière Gauche' },
      
      { position: 'RM', x: 50, y: 18, role: 'Milieu Droit' },
      { position: 'CM', x: 50, y: 38, role: 'Milieu Central' },
      { position: 'CM', x: 50, y: 62, role: 'Milieu Central' },
      { position: 'LM', x: 50, y: 82, role: 'Milieu Gauche' },
      
      { position: 'ST', x: 75, y: 38, role: 'Avant-Centre' },
      { position: 'ST', x: 75, y: 62, role: 'Avant-Centre' },
    ],
  },

  '4-2-3-1': {
    name: '4-2-3-1 Moderne',
    system: '4-2-3-1',
    description: 'Formation très populaire avec double pivot défensif',
    strengths: ['Protection défensive', 'Flexibilité', 'Transitions rapides'],
    weaknesses: ['Isolement de l\'attaquant', 'Largeur limitée'],
    famousTeams: ['Real Madrid', 'Chelsea', 'Juventus'],
    positions: [
      { position: 'GK', x: 8, y: 50, role: 'Gardien' },
      
      { position: 'RB', x: 23, y: 18, role: 'Arrière Droit' },
      { position: 'CB', x: 23, y: 38, role: 'Défenseur Central' },
      { position: 'CB', x: 23, y: 62, role: 'Défenseur Central' },
      { position: 'LB', x: 23, y: 82, role: 'Arrière Gauche' },
      
      { position: 'CDM', x: 40, y: 38, role: 'Milieu Défensif' },
      { position: 'CDM', x: 40, y: 62, role: 'Milieu Défensif' },
      
      { position: 'RW', x: 60, y: 20, role: 'Ailier Droit' },
      { position: 'CAM', x: 60, y: 50, role: 'Meneur de Jeu' },
      { position: 'LW', x: 60, y: 80, role: 'Ailier Gauche' },
      
      { position: 'ST', x: 78, y: 50, role: 'Avant-Centre' },
    ],
  },

  '3-5-2': {
    name: '3-5-2',
    system: '3-5-2',
    description: 'Formation avec trois défenseurs et pistons offensifs',
    strengths: ['Domination milieu', 'Largeur', 'Duo d\'attaquants'],
    weaknesses: ['Vulnérable sur les ailes', 'Pistons doivent beaucoup courir'],
    famousTeams: ['Inter Milan (Conte)', 'Atalanta'],
    positions: [
      { position: 'GK', x: 8, y: 50, role: 'Gardien' },
      
      { position: 'CB', x: 23, y: 27, role: 'Défenseur Central Droit' },
      { position: 'CB', x: 23, y: 50, role: 'Défenseur Central' },
      { position: 'CB', x: 23, y: 73, role: 'Défenseur Central Gauche' },
      
      { position: 'RWB', x: 45, y: 12, role: 'Piston Droit' },
      { position: 'CDM', x: 45, y: 35, role: 'Milieu Défensif' },
      { position: 'CM', x: 45, y: 50, role: 'Milieu Central' },
      { position: 'CDM', x: 45, y: 65, role: 'Milieu Défensif' },
      { position: 'LWB', x: 45, y: 88, role: 'Piston Gauche' },
      
      { position: 'ST', x: 75, y: 38, role: 'Avant-Centre' },
      { position: 'ST', x: 75, y: 62, role: 'Avant-Centre' },
    ],
  },

  '4-1-4-1': {
    name: '4-1-4-1',
    system: '4-1-4-1',
    description: 'Formation défensive avec un seul milieu défensif',
    strengths: ['Bloc défensif compact', 'Contre-attaques', 'Solidité'],
    weaknesses: ['Peu offensif', 'Dépendance au contre'],
    famousTeams: ['Atletico Madrid', 'Leicester (Champion)'],
    positions: [
      { position: 'GK', x: 8, y: 50, role: 'Gardien' },
      
      { position: 'RB', x: 23, y: 18, role: 'Arrière Droit' },
      { position: 'CB', x: 23, y: 38, role: 'Défenseur Central' },
      { position: 'CB', x: 23, y: 62, role: 'Défenseur Central' },
      { position: 'LB', x: 23, y: 82, role: 'Arrière Gauche' },
      
      { position: 'CDM', x: 40, y: 50, role: 'Milieu Défensif' },
      
      { position: 'RM', x: 58, y: 18, role: 'Milieu Droit' },
      { position: 'CM', x: 58, y: 38, role: 'Milieu Centre Droit' },
      { position: 'CM', x: 58, y: 62, role: 'Milieu Centre Gauche' },
      { position: 'LM', x: 58, y: 82, role: 'Milieu Gauche' },
      
      { position: 'ST', x: 78, y: 50, role: 'Avant-Centre' },
    ],
  },

  '3-4-3': {
    name: '3-4-3',
    system: '3-4-3',
    description: 'Formation offensive avec trois attaquants',
    strengths: ['Attaque puissante', 'Largeur', 'Flexibilité'],
    weaknesses: ['Défense exposée', 'Milieu en infériorité'],
    famousTeams: ['Chelsea (Conte)', 'Ajax'],
    positions: [
      { position: 'GK', x: 8, y: 50, role: 'Gardien' },
      
      { position: 'CB', x: 23, y: 27, role: 'Défenseur Central Droit' },
      { position: 'CB', x: 23, y: 50, role: 'Défenseur Central' },
      { position: 'CB', x: 23, y: 73, role: 'Défenseur Central Gauche' },
      
      { position: 'RM', x: 48, y: 20, role: 'Milieu Droit' },
      { position: 'CM', x: 48, y: 40, role: 'Milieu Central' },
      { position: 'CM', x: 48, y: 60, role: 'Milieu Central' },
      { position: 'LM', x: 48, y: 80, role: 'Milieu Gauche' },
      
      { position: 'RW', x: 75, y: 23, role: 'Ailier Droit' },
      { position: 'ST', x: 75, y: 50, role: 'Avant-Centre' },
      { position: 'LW', x: 75, y: 77, role: 'Ailier Gauche' },
    ],
  },

  '5-3-2': {
    name: '5-3-2 Défensif',
    system: '5-3-2',
    description: 'Formation très défensive avec cinq arrières',
    strengths: ['Solidité défensive', 'Contre-attaques', 'Ailes protégées'],
    weaknesses: ['Très défensif', 'Peu de possession', 'Attaquants isolés'],
    famousTeams: ['Italie (Euro 2020)', 'Defensive teams'],
    positions: [
      { position: 'GK', x: 8, y: 50, role: 'Gardien' },
      
      { position: 'RWB', x: 23, y: 12, role: 'Arrière Droit' },
      { position: 'CB', x: 23, y: 30, role: 'Défenseur Central Droit' },
      { position: 'CB', x: 23, y: 50, role: 'Défenseur Central' },
      { position: 'CB', x: 23, y: 70, role: 'Défenseur Central Gauche' },
      { position: 'LWB', x: 23, y: 88, role: 'Arrière Gauche' },
      
      { position: 'CM', x: 50, y: 35, role: 'Milieu Centre Droit' },
      { position: 'CM', x: 50, y: 50, role: 'Milieu Central' },
      { position: 'CM', x: 50, y: 65, role: 'Milieu Centre Gauche' },
      
      { position: 'ST', x: 75, y: 40, role: 'Avant-Centre' },
      { position: 'ST', x: 75, y: 60, role: 'Avant-Centre' },
    ],
  },
};

// Helper function to get formation
export const getFormation = (formationName: string): Formation | undefined => {
  return formations[formationName];
};

// Get all formations list
export const getFormationsList = (): string[] => {
  return Object.keys(formations);
};

// Get formation names and systems
export const getFormationsOptions = () => {
  return Object.entries(formations).map(([key, value]) => ({
    value: key,
    label: value.name,
    system: value.system,
  }));
};
```

---

## 🏆 Scraper UEFA - Intégration Données UEFA

```javascript
// server/src/services/uefaScraper.js

const axios = require('axios');
const cheerio = require('cheerio');
const League = require('../models/League');
const Team = require('../models/Team');
const Match = require('../models/Match');
const Player = require('../models/Player');
const Standing = require('../models/Standing');

class UEFAScraper {
  constructor() {
    this.baseURL = 'https://www.uefa.com';
    this.apiURL = 'https://match.uefa.com/v5/';
    this.client = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
  }

  // ============================================================
  // SCRAPE CHAMPIONS LEAGUE
  // ============================================================

  async scrapeChampionsLeague(season = '2024') {
    try {
      console.log('🏆 Scraping Champions League...');

      const competitionId = 1; // Champions League ID
      
      // Fetch matches
      const matchesURL = `${this.apiURL}matches?competitionId=${competitionId}&seasonYear=${season}`;
      const matchesRes = await this.client.get(matchesURL);
      const matches = matchesRes.data;

      console.log(`Found ${matches.length} Champions League matches`);

      for (const match of matches) {
        await this.processUEFAMatch(match, 'Champions League');
      }

      console.log('✅ Champions League scraping completed');
    } catch (error) {
      console.error('❌ Champions League scraping error:', error.message);
    }
  }

  // ============================================================
  // SCRAPE EUROPA LEAGUE
  // ============================================================

  async scrapeEuropaLeague(season = '2024') {
    try {
      console.log('🏆 Scraping Europa League...');

      const competitionId = 2; // Europa League ID
      
      const matchesURL = `${this.apiURL}matches?competitionId=${competitionId}&seasonYear=${season}`;
      const matchesRes = await this.client.get(matchesURL);
      const matches = matchesRes.data;

      console.log(`Found ${matches.length} Europa League matches`);

      for (const match of matches) {
        await this.processUEFAMatch(match, 'Europa League');
      }

      console.log('✅ Europa League scraping completed');
    } catch (error) {
      console.error('❌ Europa League scraping error:', error.message);
    }
  }

  // ============================================================
  // SCRAPE EURO CHAMPIONSHIP
  // ============================================================

  async scrapeEuroChampionship(season = '2024') {
    try {
      console.log('🏆 Scraping Euro Championship...');

      const competitionId = 3; // Euro ID
      
      const matchesURL = `${this.apiURL}matches?competitionId=${competitionId}&seasonYear=${season}`;
      const matchesRes = await this.client.get(matchesURL);
      const matches = matchesRes.data;

      console.log(`Found ${matches.length} Euro matches`);

      for (const match of matches) {
        await this.processUEFAMatch(match, 'Euro Championship');
      }

      console.log('✅ Euro Championship scraping completed');
    } catch (error) {
      console.error('❌ Euro scraping error:', error.message);
    }
  }

  // ============================================================
  // PROCESS UEFA MATCH
  // ============================================================

  async processUEFAMatch(matchData, leagueName) {
    try {
      // Find or create league
      const league = await League.findOneAndUpdate(
        { name: leagueName },
        {
          name: leagueName,
          type: 'Cup',
          country: {
            name: 'Europe',
            code: 'EU',
          },
          isFeatured: true,
          isActive: true,
          priority: 10,
        },
        { upsert: true, new: true }
      );

      // Process teams
      const homeTeam = await this.processUEFATeam(matchData.homeTeam);
      const awayTeam = await this.processUEFATeam(matchData.awayTeam);

      // Create/update match
      await Match.findOneAndUpdate(
        { apiFootballId: matchData.id },
        {
          apiFootballId: matchData.id,
          league: league._id,
          season: matchData.season?.year || new Date().getFullYear(),
          round: matchData.round?.name || matchData.phase,
          
          homeTeam: {
            team: homeTeam._id,
            name: matchData.homeTeam.name,
            logo: matchData.homeTeam.logoUrl,
          },
          awayTeam: {
            team: awayTeam._id,
            name: matchData.awayTeam.name,
            logo: matchData.awayTeam.logoUrl,
          },
          
          matchDate: new Date(matchData.kickOffTime.dateTime),
          
          venue: {
            name: matchData.stadium?.name,
            city: matchData.stadium?.city,
          },
          
          status: this.mapUEFAStatus(matchData.status),
          elapsed: matchData.minute,
          
          score: {
            halftime: {
              home: matchData.score?.ht?.home,
              away: matchData.score?.ht?.away,
            },
            fulltime: {
              home: matchData.score?.total?.home,
              away: matchData.score?.total?.away,
            },
          },
          
          lastSyncedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Processed: ${matchData.homeTeam.name} vs ${matchData.awayTeam.name}`);
    } catch (error) {
      console.error('Error processing UEFA match:', error.message);
    }
  }

  // ============================================================
  // PROCESS UEFA TEAM
  // ============================================================

  async processUEFATeam(teamData) {
    try {
      const team = await Team.findOneAndUpdate(
        { apiFootballId: teamData.id },
        {
          apiFootballId: teamData.id,
          name: teamData.name,
          code: teamData.code,
          country: teamData.country?.name,
          logo: teamData.logoUrl,
          
          venue: {
            name: teamData.stadium?.name,
            city: teamData.stadium?.city,
          },
          
          lastSyncedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return team;
    } catch (error) {
      console.error('Error processing UEFA team:', error.message);
      throw error;
    }
  }

  // ============================================================
  // SCRAPE UEFA PLAYER STATS
  // ============================================================

  async scrapePlayerStats(playerId) {
    try {
      const playerURL = `${this.apiURL}persons/${playerId}`;
      const response = await this.client.get(playerURL);
      const playerData = response.data;

      const player = await Player.findOneAndUpdate(
        { apiFootballId: playerId },
        {
          apiFootballId: playerId,
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          commonName: playerData.commonName,
          photo: playerData.imageUrl,
          
          dateOfBirth: playerData.dateOfBirth,
          nationality: {
            name: playerData.country?.name,
            code: playerData.country?.code,
            flag: playerData.country?.flagUrl,
          },
          
          height: playerData.height,
          weight: playerData.weight,
          position: playerData.position,
          
          currentTeam: playerData.currentTeam?.id,
          
          stats: {
            appearances: playerData.careerStats?.appearances || 0,
            goals: playerData.careerStats?.goals || 0,
            assists: playerData.careerStats?.assists || 0,
            yellowCards: playerData.careerStats?.yellowCards || 0,
            redCards: playerData.careerStats?.redCards || 0,
          },
          
          lastSyncedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Scraped player: ${playerData.commonName}`);
      return player;
    } catch (error) {
      console.error('Error scraping UEFA player:', error.message);
    }
  }

  // ============================================================
  // SCRAPE TEAM SQUAD
  // ============================================================

  async scrapeTeamSquad(teamId, competitionId, season) {
    try {
      const squadURL = `${this.apiURL}teams/${teamId}/squad?competitionId=${competitionId}&seasonYear=${season}`;
      const response = await this.client.get(squadURL);
      const squad = response.data;

      console.log(`Scraping squad for team ${teamId}...`);

      for (const playerData of squad.players) {
        await this.scrapePlayerStats(playerData.id);
      }

      console.log(`✅ Scraped ${squad.players.length} players`);
    } catch (error) {
      console.error('Error scraping team squad:', error.message);
    }
  }

  // ============================================================
  // SCRAPE STANDINGS
  // ============================================================

  async scrapeStandings(competitionId, season) {
    try {
      const standingsURL = `${this.apiURL}standings?competitionId=${competitionId}&seasonYear=${season}`;
      const response = await this.client.get(standingsURL);
      const standingsData = response.data;

      console.log('Scraping UEFA standings...');

      const league = await League.findOne({ apiFootballId: competitionId });
      if (!league) {
        console.log('League not found');
        return;
      }

      const rankings = [];

      for (const entry of standingsData.groups[0]?.teams || []) {
        const team = await Team.findOne({ apiFootballId: entry.team.id });

        rankings.push({
          rank: entry.rank,
          team: team?._id,
          teamName: entry.team.name,
          teamLogo: entry.team.logoUrl,
          
          played: entry.played,
          win: entry.won,
          draw: entry.drawn,
          lose: entry.lost,
          
          goals: {
            for: entry.goalsFor,
            against: entry.goalsAgainst,
            diff: entry.goalDifference,
          },
          
          points: entry.points,
        });
      }

      await Standing.findOneAndUpdate(
        { league: league._id, season },
        {
          league: league._id,
          season,
          rankings,
          lastSyncedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log('✅ UEFA standings scraped');
    } catch (error) {
      console.error('Error scraping UEFA standings:', error.message);
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  mapUEFAStatus(status) {
    const statusMap = {
      'SCHEDULED': 'SCHEDULED',
      'PLAYING': 'LIVE',
      'FINISHED': 'FINISHED',
      'POSTPONED': 'POSTPONED',
      'CANCELLED': 'CANCELLED',
    };

    return statusMap[status] || 'SCHEDULED';
  }

  // ============================================================
  // FULL UEFA SYNC
  // ============================================================

  async fullUEFASync(season = '2024') {
    console.log('🚀 Starting full UEFA sync...');
    
    try {
      await this.scrapeChampionsLeague(season);
      await this.sleep(5000);
      
      await this.scrapeEuropaLeague(season);
      await this.sleep(5000);
      
      // Scrape standings
      await this.scrapeStandings(1, season); // Champions League
      await this.sleep(5000);
      
      await this.scrapeStandings(2, season); // Europa League
      
      console.log('✅ Full UEFA sync completed');
    } catch (error) {
      console.error('❌ Full UEFA sync error:', error);
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new UEFAScraper();
```

---

## 🔧 Routes Admin pour UEFA Scraping

```javascript
// server/src/routes/admin.js (nouveau fichier)

const express = require('express');
const router = express.Router();
const uefaScraper = require('../services/uefaScraper');

// POST /api/admin/uefa/sync/champions-league
router.post('/uefa/sync/champions-league', async (req, res) => {
  try {
    const { season } = req.body;
    await uefaScraper.scrapeChampionsLeague(season || '2024');
    res.json({ message: 'Champions League sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/uefa/sync/europa-league
router.post('/uefa/sync/europa-league', async (req, res) => {
  try {
    const { season } = req.body;
    await uefaScraper.scrapeEuropaLeague(season || '2024');
    res.json({ message: 'Europa League sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/uefa/sync/euro
router.post('/uefa/sync/euro', async (req, res) => {
  try {
    const { season } = req.body;
    await uefaScraper.scrapeEuroChampionship(season || '2024');
    res.json({ message: 'Euro Championship sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/uefa/sync/full
router.post('/uefa/sync/full', async (req, res) => {
  try {
    const { season } = req.body;
    await uefaScraper.fullUEFASync(season || '2024');
    res.json({ message: 'Full UEFA sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/uefa/sync/team-squad/:teamId
router.post('/uefa/sync/team-squad/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { competitionId, season } = req.body;
    await uefaScraper.scrapeTeamSquad(teamId, competitionId, season);
    res.json({ message: 'Team squad sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/uefa/sync/standings
router.post('/uefa/sync/standings', async (req, res) => {
  try {
    const { competitionId, season } = req.body;
    await uefaScraper.scrapeStandings(competitionId, season);
    res.json({ message: 'Standings sync started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

---

## 📦 Installation Dépendances

```bash
# Backend
cd server
npm install axios cheerio

# Register admin routes dans server/src/index.js
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
```

---

## 🎯 Utilisation UEFA Scraper

```bash
# Sync Champions League
curl -X POST http://localhost:5000/api/admin/uefa/sync/champions-league \
  -H "Content-Type: application/json" \
  -d '{"season":"2024"}'

# Sync Europa League
curl -X POST http://localhost:5000/api/admin/uefa/sync/europa-league \
  -H "Content-Type: application/json" \
  -d '{"season":"2024"}'

# Sync Euro Championship
curl -X POST http://localhost:5000/api/admin/uefa/sync/euro \
  -H "Content-Type: application/json" \
  -d '{"season":"2024"}'

# Full UEFA Sync
curl -X POST http://localhost:5000/api/admin/uefa/sync/full \
  -H "Content-Type: application/json" \
  -d '{"season":"2024"}'

# Sync équipe spécifique
curl -X POST http://localhost:5000/api/admin/uefa/sync/team-squad/50051 \
  -H "Content-Type: application/json" \
  -d '{"competitionId":1,"season":"2024"}'

# Sync classements
curl -X POST http://localhost:5000/api/admin/uefa/sync/standings \
  -H "Content-Type: application/json" \
  -d '{"competitionId":1,"season":"2024"}'
```

---

Suite dans le prochain fichier avec les 8 fonctionnalités avancées restantes ! 🚀
