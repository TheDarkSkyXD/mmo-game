const {
  MAX_MESSAGE_LENGTH,
  sanitizeChatMessage,
  createRateLimiter,
} = require('../chatSecurity.js');

describe('sanitizeChatMessage', () => {
  it('escapes HTML characters', () => {
    expect(sanitizeChatMessage('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
  });

  it('rejects non-string and empty input', () => {
    expect(sanitizeChatMessage(null)).toBeNull();
    expect(sanitizeChatMessage({ a: 1 })).toBeNull();
    expect(sanitizeChatMessage('   ')).toBeNull();
  });

  it('strips control characters', () => {
    expect(sanitizeChatMessage('hi\u0000 there\u0007')).toBe('hi there');
  });

  it('caps message length', () => {
    const result = sanitizeChatMessage('a'.repeat(MAX_MESSAGE_LENGTH + 100));
    expect(result).toHaveLength(MAX_MESSAGE_LENGTH);
  });
});

describe('createRateLimiter', () => {
  it('blocks messages over the limit within the window', () => {
    const limiter = createRateLimiter(3, 1000);
    expect(limiter.allow('a', 0)).toBe(true);
    expect(limiter.allow('a', 100)).toBe(true);
    expect(limiter.allow('a', 200)).toBe(true);
    expect(limiter.allow('a', 300)).toBe(false);
  });

  it('allows messages again after the window passes', () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.allow('a', 0)).toBe(true);
    expect(limiter.allow('a', 500)).toBe(false);
    expect(limiter.allow('a', 1500)).toBe(true);
  });

  it('tracks connections independently and can clear them', () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.allow('a', 0)).toBe(true);
    expect(limiter.allow('b', 0)).toBe(true);
    limiter.clear('a');
    expect(limiter.allow('a', 10)).toBe(true);
  });
});
