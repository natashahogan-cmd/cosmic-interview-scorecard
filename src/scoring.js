export const CRITICAL_THRESHOLD = 3;

export function clampScore(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 1;
  return Math.min(5, Math.max(1, numeric));
}

export function reviewerAverage(reviewer, criteria) {
  if (!criteria.length) return null;
  const total = criteria.reduce((sum, criterion) => {
    return sum + clampScore(reviewer.scores?.[criterion.id] ?? 1);
  }, 0);
  return total / criteria.length;
}

export function stageAverage(stage) {
  if (!stage.reviewers.length || !stage.criteria.length) return null;
  const reviewerScores = stage.reviewers
    .map((reviewer) => reviewerAverage(reviewer, stage.criteria))
    .filter((score) => score !== null);

  if (!reviewerScores.length) return null;
  return reviewerScores.reduce((sum, score) => sum + score, 0) / reviewerScores.length;
}

export function criterionAverage(stage, criterionId) {
  if (!stage.reviewers.length) return null;
  const scores = stage.reviewers.map((reviewer) => clampScore(reviewer.scores?.[criterionId] ?? 1));
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function scoreToPercent(scoreOutOfFive) {
  if (scoreOutOfFive === null) return null;
  return (scoreOutOfFive / 5) * 100;
}

export function findCriticalFlags(candidate) {
  return candidate.stages.flatMap((stage) => {
    return stage.criteria
      .filter((criterion) => criterion.critical)
      .map((criterion) => ({
        stageId: stage.id,
        stageName: stage.name,
        criterionId: criterion.id,
        criterionName: criterion.name,
        average: criterionAverage(stage, criterion.id),
      }))
      .filter((flag) => flag.average !== null && flag.average < CRITICAL_THRESHOLD);
  });
}

export function weightedCandidateScore(candidate) {
  const scoredStages = candidate.stages
    .map((stage) => ({
      stage,
      average: stageAverage(stage),
      weight: Number(stage.weight) || 0,
    }))
    .filter((item) => item.average !== null && item.weight > 0);

  if (!scoredStages.length) return null;

  const totalWeight = scoredStages.reduce((sum, item) => sum + item.weight, 0);

  // The candidate score is intentionally weighted by stage average, not by
  // reviewer count. This prevents a stage with many reviewers from overpowering
  // another stage that carries more hiring importance.
  const weightedTotal = scoredStages.reduce((sum, item) => {
    return sum + scoreToPercent(item.average) * (item.weight / totalWeight);
  }, 0);

  return weightedTotal;
}

export function suggestedRecommendation(score, redFlags) {
  const flagCount = redFlags.length;
  if (score === null) return "Needs Review";
  if (score >= 85 && flagCount === 0) return "Strong Yes";
  if (score >= 70 && flagCount === 0) return "Yes";
  if (score < 55 || flagCount >= 2) return "No";
  return "Mixed";
}

export function candidateSummary(candidate) {
  const stageSummaries = candidate.stages.map((stage) => {
    const average = stageAverage(stage);
    return {
      id: stage.id,
      name: stage.name,
      weight: Number(stage.weight) || 0,
      average,
      percent: scoreToPercent(average),
      reviewerCount: stage.reviewers.length,
    };
  });
  const redFlags = findCriticalFlags(candidate);
  const score = weightedCandidateScore(candidate);
  const recommendation =
    candidate.recommendationOverride || suggestedRecommendation(score, redFlags);

  return {
    score,
    stageSummaries,
    redFlags,
    recommendation,
  };
}
