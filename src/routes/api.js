const express = require('express');
const router = express.Router();
const pasteService = require('../services/pasteService');
const { getNow } = require('../utils/time');

// POST /api/pastes
router.post('/pastes', async (req, res) => {
    try {
        const { content, ttl_seconds, max_views } = req.body;

        // Validation
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ error: 'Content is required and must be a non-empty string.' });
        }

        if (ttl_seconds !== undefined) {
            if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
                return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1.' });
            }
        }

        if (max_views !== undefined) {
            if (!Number.isInteger(max_views) || max_views < 1) {
                return res.status(400).json({ error: 'max_views must be an integer >= 1.' });
            }
        }

        const paste = await pasteService.createPaste({
            content,
            ttl_seconds,
            max_views
        });

        // Construct full URL
        const protocol = req.protocol;
        const host = req.get('host');
        const url = `${protocol}://${host}/p/${paste.id}`;

        res.status(201).json({
            id: paste.id,
            url
        });

    } catch (err) {
        console.error('Create Paste Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/pastes/:id
router.get('/pastes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const now = getNow(req); // Support x-test-now-ms

        const paste = await pasteService.getPaste(id, now);

        if (!paste) {
            return res.status(404).json({ error: 'Paste not found or unavailable' });
        }

        res.json({
            content: paste.content,
            remaining_views: paste.remaining_views, // may be null
            expires_at: paste.expires_at // may be null
        });

    } catch (err) {
        console.error('Get Paste Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
