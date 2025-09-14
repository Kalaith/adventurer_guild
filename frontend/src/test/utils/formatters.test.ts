import { describe, it, expect } from 'vitest';
import { formatNumber } from '../../utils/formatters';

describe('formatters', () => {
  describe('formatNumber', () => {
    it('should format small numbers as is', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1)).toBe('1');
      expect(formatNumber(42)).toBe('42');
      expect(formatNumber(999)).toBe('999');
    });

    it('should format thousands with K suffix', () => {
      expect(formatNumber(1000)).toBe('1K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(15000)).toBe('15K');
      expect(formatNumber(999999)).toBe('999.9K');
    });

    it('should format millions with M suffix', () => {
      expect(formatNumber(1000000)).toBe('1M');
      expect(formatNumber(2500000)).toBe('2.5M');
      expect(formatNumber(15000000)).toBe('15M');
      expect(formatNumber(999999999)).toBe('999.9M');
    });

    it('should format billions with B suffix', () => {
      expect(formatNumber(1000000000)).toBe('1B');
      expect(formatNumber(2500000000)).toBe('2.5B');
      expect(formatNumber(15000000000)).toBe('15B');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-500)).toBe('-500');
      expect(formatNumber(-1500)).toBe('-1.5K');
      expect(formatNumber(-2500000)).toBe('-2.5M');
    });

    it('should handle decimal inputs', () => {
      expect(formatNumber(1234.56)).toBe('1.2K');
      expect(formatNumber(1500000.789)).toBe('1.5M');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(0.5)).toBe('0.5');
      expect(formatNumber(999.9)).toBe('999.9');
      expect(formatNumber(1000.1)).toBe('1K');
    });
  });
});