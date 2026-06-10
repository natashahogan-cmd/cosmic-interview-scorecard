import assert from "node:assert/strict";
import {
  candidateSummary,
  findCriticalFlags,
  stageAverage,
  weightedCandidateScore,
} from "../src/scoring.js";

const makeCandidate = ({ stage1Score, stage2Score, criticalScore = 5 }) => ({
  recommendationOverride: "",
  stages: [
    {
      id: "s1",
      name: "Stage 1",
      weight: 25,
      criteria: [{ id: "fit", name: "Stage fit", critical: true }],
      reviewers: [
        {
          scores: { fit: criticalScore },
        },
      ],
    },
    {
      id: "s2",
      name: "Stage 2",
      weight: 75,
      criteria: [{ id: "commercial", name: "Commercial judgement", critical: true }],
      reviewers: [
        {
          scores: { commercial: stage2Score },
        },
      ],
    },
  ],
});

assert.equal(stageAverage(makeCandidate({ stage2Score: 4, criticalScore: 4 }).stages[0]), 4);

const weighted = weightedCandidateScore(makeCandidate({ stage2Score: 5, criticalScore: 3 }));
assert.equal(Math.round(weighted), 90);

const flagged = makeCandidate({ stage2Score: 5, criticalScore: 2 });
assert.equal(findCriticalFlags(flagged).length, 1);
assert.equal(candidateSummary(flagged).recommendation, "Mixed");

const multipleFlags = makeCandidate({ stage2Score: 2, criticalScore: 2 });
assert.equal(candidateSummary(multipleFlags).recommendation, "No");

console.log("Scoring tests passed");
