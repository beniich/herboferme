import { Request, Response } from 'express';
import Team from '../models/AgriTeam.js';

export const getTeams = async (req: any, res: Response) => {
  try {
    const { type, status } = req.query;

    const query: any = {
      domain: req.user.domain,
    };

    if (type) query.type = type;
    if (status) query.status = status;

    const teams = await Team.find(query)
      .populate('leader', 'firstName lastName email phone')
      .populate('members.worker', 'firstName lastName specialization')
      .populate('assignedPlots', 'name surface')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      teams,
      count: teams.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeamById = async (req: any, res: Response) => {
  try {
    const team = await Team.findOne({ _id: req.params.id, domain: req.user.domain })
      .populate('leader', 'firstName lastName email phone')
      .populate('members.worker', 'firstName lastName specialization')
      .populate('assignedPlots', 'name surface');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.json({ success: true, team });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTeam = async (req: any, res: Response) => {
  try {
    const teamData = {
      ...req.body,
      domain: req.user.domain,
      createdBy: req.user.id,
      currentSize: req.body.members?.length || 0,
    };

    const team = await Team.create(teamData);

    res.status(201).json({
      success: true,
      team,
      message: 'Team created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTeam = async (req: any, res: Response) => {
  try {
    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, domain: req.user.domain },
      req.body,
      { new: true, runValidators: true }
    );

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.json({ success: true, team, message: 'Team updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeam = async (req: any, res: Response) => {
  try {
    const team = await Team.findOneAndDelete({ _id: req.params.id, domain: req.user.domain });
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const addMember = async (req: any, res: Response) => {
  try {
    const { workerId, role } = req.body;

    const team = await Team.findOneAndUpdate(
      {
        _id: req.params.id,
        domain: req.user.domain,
      },
      {
        $push: {
          members: {
            worker: workerId,
            role: role || 'operator',
            joinedAt: new Date(),
          },
        },
        $inc: { currentSize: 1 },
      },
      { new: true }
    ).populate('members.worker', 'firstName lastName');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    res.json({
      success: true,
      team,
      message: 'Member added successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeMember = async (req: any, res: Response) => {
  try {
    const { workerId } = req.params;
    
    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, domain: req.user.domain },
      {
        $pull: { members: { worker: workerId } },
        $inc: { currentSize: -1 },
      },
      { new: true }
    );

    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    res.json({ success: true, team, message: 'Member removed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePerformance = async (req: any, res: Response) => {
  try {
    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, domain: req.user.domain },
      { $set: { performance: req.body, 'performance.lastUpdated': new Date() } },
      { new: true }
    );

    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    res.json({ success: true, team, message: 'Performance updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeamStats = async (req: any, res: Response) => {
  try {
    const stats = await Team.aggregate([
      {
        $match: { domain: req.user.domain },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalMembers: { $sum: '$currentSize' },
          avgSize: { $avg: '$currentSize' },
        },
      },
    ]);

    const typeStats = await Team.aggregate([
      {
        $match: { domain: req.user.domain },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalMembers: { $sum: '$currentSize' },
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        byType: typeStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
