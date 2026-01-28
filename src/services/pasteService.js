const { v4: uuidv4 } = require('uuid');
const storage = require('./storage');

class PasteService {
    async createPaste({ content, ttl_seconds, max_views }) {
        const id = uuidv4();
        // Use Date.now() for creation. The 'x-test-now-ms' is for validation/access time.
        // However, if we set an Absolute Expiry Time, we rely on the creation time being "correct".
        // If we want to test "Create paste, wait 60s, expire", we need to simulate the wait.
        // We simulate the wait by advancing `x-test-now-ms`.
        // So Creation time = Real Time is fine.

        const now = Date.now();

        let expires_at = null;
        if (ttl_seconds) {
            // Calculate absolute expiry time
            expires_at = new Date(now + ttl_seconds * 1000).toISOString();
        }

        const newPaste = {
            id,
            content,
            created_at: new Date(now).toISOString(),
            expires_at,
            max_views: max_views !== undefined ? max_views : null,
            remaining_views: max_views !== undefined ? max_views : null
        };

        await storage.save(id, newPaste);
        return newPaste;
    }

    /**
     * Retrieves a paste, checking constraints.
     * Side effect: Decrements remaining_views if applicable.
     */
    async getPaste(id, simulatedNowMs = null) {
        // We might want to lock or atomic update here, but for this scope, 
        // we'll fetch-check-update.

        const paste = await storage.get(id);
        if (!paste) return null;

        const now = simulatedNowMs !== null ? simulatedNowMs : Date.now();

        // 1. Check operations that make it unavailable

        // TTL Check
        if (paste.expires_at) {
            const expiryTime = new Date(paste.expires_at).getTime();
            // If now is AFTER expiry time
            if (now > expiryTime) {
                return null; // Expired
            }
        }

        // View Limit Check (Pre-decrement check)
        if (paste.max_views !== null) {
            if (paste.remaining_views <= 0) {
                return null; // Limit reached
            }

            // Decrement logic
            paste.remaining_views -= 1;

            // Update storage
            // Note: If this fails or has race condition, we might serve one extra.
            // Ideally we use storage.update() which could be safer.
            await storage.save(id, paste);
        }

        return paste;
    }
}

module.exports = new PasteService();
