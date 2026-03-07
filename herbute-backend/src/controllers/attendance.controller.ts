import { Request, Response } from 'express';
import Attendance from '../models/Attendance.js';
import moment from 'moment';

export const getAttendance = async (req: any, res: Response) => {
  try {
    const { startDate, endDate, workerId, status } = req.query;

    const query: any = {
      domain: req.user.domain,
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    if (workerId) {
      query.worker = workerId;
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('worker', 'firstName lastName position')
      .sort({ date: -1 });

    res.json({
      success: true,
      attendance,
      count: attendance.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkIn = async (req: any, res: Response) => {
  try {
    const { workerId, location } = req.body;

    const today = moment().startOf('day').toDate();

    // Check if already checked in
    const existing = await Attendance.findOne({
      worker: workerId,
      date: today,
    });

    if (existing && existing.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
      });
    }

    const checkInTime = new Date();
    const scheduledStart = moment().hour(8).minute(0); // 08:00
    const isLate = moment(checkInTime).isAfter(scheduledStart);

    const attendance = await Attendance.findOneAndUpdate(
      {
        worker: workerId,
        date: today,
      },
      {
        $set: {
          checkIn: checkInTime,
          status: isLate ? 'late' : 'present',
          'location.checkIn': location,
          domain: req.user.domain,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json({
      success: true,
      attendance,
      message: isLate ? 'Check-in recorded (late)' : 'Check-in successful',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkOut = async (req: any, res: Response) => {
  try {
    const { workerId, location } = req.body;

    const today = moment().startOf('day').toDate();

    const attendance = await Attendance.findOne({
      worker: workerId,
      date: today,
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No check-in found for today',
      });
    }

    const checkOutTime = new Date();
    const checkInTime = attendance.checkIn;

    // Calculate work hours
    const duration = moment.duration(
      moment(checkOutTime).diff(moment(checkInTime))
    );
    const totalMinutes = duration.asMinutes();
    const workHours = (totalMinutes - attendance.breakMinutes) / 60;

    // Calculate overtime (if more than 8 hours)
    const overtime = Math.max(0, workHours - 8);

    attendance.checkOut = checkOutTime;
    attendance.workHours = workHours;
    attendance.overtime = overtime;
    attendance.location = {
      ...attendance.location,
      checkOut: location,
    };

    await attendance.save();

    res.json({
      success: true,
      attendance,
      message: 'Check-out successful',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAttendanceStats = async (req: any, res: Response) => {
  try {
    const { month, year } = req.query;

    const startDate = moment()
      .year(parseInt(year as string || new Date().getFullYear().toString()))
      .month(parseInt(month as string || (new Date().getMonth() + 1).toString()) - 1)
      .startOf('month')
      .toDate();

    const endDate = moment(startDate).endOf('month').toDate();

    const stats = await Attendance.aggregate([
      {
        $match: {
          domain: req.user.domain,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$workHours' },
          totalOvertime: { $sum: '$overtime' },
        },
      },
    ]);

    const workerStats = await Attendance.aggregate([
      {
        $match: {
          domain: req.user.domain,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$worker',
          presentDays: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0],
            },
          },
          totalHours: { $sum: '$workHours' },
          totalOvertime: { $sum: '$overtime' },
        },
      },
      {
        $lookup: {
          from: 'workers',
          localField: '_id',
          foreignField: '_id',
          as: 'worker',
        },
      },
      {
        $unwind: '$worker',
      },
      {
        $project: {
          workerId: '$_id',
          firstName: '$worker.firstName',
          lastName: '$worker.lastName',
          presentDays: 1,
          totalHours: 1,
          totalOvertime: 1,
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        byWorker: workerStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
