import express from 'express';
import { authorize } from '../middleware/authorize';
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
} from '../controllers/teams.controller';

const router = express.Router();

router.get('/', authorize, getTeams);
router.get('/:id', authorize, getTeamById);
router.post('/', authorize, createTeam);
router.put('/:id', authorize, updateTeam);
router.delete('/:id', authorize, deleteTeam);
router.post('/:id/members', authorize, addMember);
router.delete('/:id/members/:workerId', authorize, removeMember);
router.put('/:id/performance', authorize, updatePerformance);
router.get('/stats/overview', authorize, getTeamStats);

export default router;
