import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  updatePerformance,
  getTeamStats,
} from '../controllers/teams.controller.js';

const router = express.Router();

router.get('/', authenticate, getTeams);
router.get('/:id', authenticate, getTeamById);
router.post('/', authenticate, createTeam);
router.put('/:id', authenticate, updateTeam);
router.delete('/:id', authenticate, deleteTeam);
router.post('/:id/members', authenticate, addMember);
router.delete('/:id/members/:workerId', authenticate, removeMember);
router.put('/:id/performance', authenticate, updatePerformance);
router.get('/stats/overview', authenticate, getTeamStats);

export default router;
