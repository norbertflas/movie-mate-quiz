export function calculateTimeBasedScore(releaseYear: number | null) {
  const currentYear = new Date().getFullYear();
  
  if (!releaseYear) return { score: 0, explanation: '', weight: 0 };

  if (releaseYear === currentYear) {
    return {
      score: 1,
      explanation: 'New release',
      weight: 0.15 // 15% weight for new releases
    };
  }

  if (releaseYear <= currentYear - 25) {
    return {
      score: 1,
      explanation: 'Classic movie',
      weight: 0.1 // 10% weight for classics
    };
  }

  return { score: 0, explanation: '', weight: 0 };
}