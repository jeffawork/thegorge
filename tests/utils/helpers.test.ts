import { formatLargeNumber, getRelativeTime } from '../../src/utils/helpers';

describe('Helpers', () => {
  describe('formatLargeNumber', () => {
    it('should format large numbers with K suffix', () => {
      expect(formatLargeNumber(1500)).toBe('1.5K');
    });

    it('should format very large numbers with M suffix', () => {
      expect(formatLargeNumber(1500000)).toBe('1.5M');
    });

    it('should return small numbers as is', () => {
      expect(formatLargeNumber(123)).toBe('123');
    });
  });

  describe('getRelativeTime', () => {
    it('should format timestamp correctly', () => {
      const timestamp = new Date('2023-01-01T00:00:00Z');
      const formatted = getRelativeTime(timestamp);
      expect(formatted).toContain('ago');
    });
  });
});
