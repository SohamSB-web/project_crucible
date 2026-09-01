const prisma = require('./prisma');

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no O, 0, I, 1 to avoid confusion
const CODE_PREFIX = 'HACK';
const RANDOM_LEN = 4;

/**
 * Generate a random segment of RANDOM_LEN characters.
 */
function randomSegment() {
  let result = '';
  for (let i = 0; i < RANDOM_LEN; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

/**
 * Generate a unique Team Join Code like "HACK-7XQ2".
 * Retries up to 10 times if a collision occurs (astronomically unlikely).
 */
async function generateJoinCode(maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = `${CODE_PREFIX}-${randomSegment()}`;
    const existing = await prisma.team.findUnique({ where: { join_code: code } });
    if (!existing) return code;
  }
  throw new Error('Failed to generate a unique join code after multiple attempts.');
}

module.exports = { generateJoinCode };
