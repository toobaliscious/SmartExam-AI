import { describe, it, expect } from 'vitest';
import { compareAnswer, calculateScore } from '../lib/grading';

describe('grading utilities', () => {
  it('compareAnswer should ignore punctuation and case', () => {
    expect(compareAnswer('Hello, World!', 'hello world')).toBe(true);
    expect(compareAnswer('Answer-A', 'answer a')).toBe(true);
    expect(compareAnswer('Nope', 'Different')).toBe(false);
  });

  it('calculateScore should sum marks for correct answers', () => {
    const questions = [
      { answerKey: 'A', marks: 2 },
      { answerKey: 'B', marks: 3 },
      { answerKey: 'C', marks: 5 }
    ];

    const answers = {
      '0': 'a',
      '1': 'wrong',
      '2': 'C'
    } as Record<string, string>;

    const score = calculateScore(answers, questions as any);
    expect(score).toBe(7); // 2 + 5
  });
});
