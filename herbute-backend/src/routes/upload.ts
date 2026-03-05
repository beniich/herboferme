import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { authenticate, requireOrganization } from '../middleware/security.js';

const router = Router();

// POST /api/upload
// Secured with authenticate and requireOrganization to prevent unauthorized uploads
router.post('/', authenticate, requireOrganization, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
    });
});

export default router;
