import { Request, Response } from 'express';
import Task from '../models/Task.js';

export const getTasks = async (req: any, res: Response) => {
  try {
    const { status, priority, type } = req.query;
    const query: any = { domain: req.user.domain };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName')
      .populate('team', 'name')
      .populate('plot', 'name')
      .sort({ dueDate: 1 });

    res.json({ success: true, tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTaskById = async (req: any, res: Response) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, domain: req.user.domain })
      .populate('assignedTo', 'firstName lastName')
      .populate('team')
      .populate('plot')
      .populate('createdBy', 'firstName lastName')
      .populate('quality.reviewedBy', 'firstName lastName');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req: any, res: Response) => {
  try {
    const taskData = { ...req.body, domain: req.user.domain, createdBy: req.user.id };
    const task = await Task.create(taskData);
    res.status(201).json({ success: true, task, message: 'Task created' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, domain: req.user.domain },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task, message: 'Task updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req: any, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, domain: req.user.domain });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
