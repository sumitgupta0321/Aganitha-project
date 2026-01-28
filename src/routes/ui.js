const express = require('express');
const router = express.Router();
const pasteService = require('../services/pasteService');
const { getNow } = require('../utils/time');

// GET /p/:id
router.get('/p/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const now = getNow(req);

        const paste = await pasteService.getPaste(id, now);

        if (!paste) {
            return res.status(404).render('404', { message: 'This paste is unavailable, expired, or does not exist.' });
        }

        res.render('paste', {
            content: paste.content,
            expires_at: paste.expires_at,
            remaining_views: paste.remaining_views
        });

    } catch (err) {
        console.error('View Paste Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
