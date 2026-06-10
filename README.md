# Cosmic Partners Interview Scorecard

A clean web app for assessing senior sales and GTM candidates across multiple interview stages and reviewers.

The app is designed around a weighted scoring model, critical criteria, red flags, and client-ready candidate reports.

## Features

- Candidate scorecards with role, client, status, LinkedIn/CV link, notes, and recommendation
- Editable interview stages and stage weightings
- Multiple reviewers per stage
- Stage-specific scoring criteria
- Editable criteria with critical-criterion toggles
- Scores from 1 to 5 for each criterion
- Weighted candidate score based on stage averages
- Critical red-flag warnings for critical criteria below 3/5
- Suggested final recommendation with manual override
- Candidate comparison view
- Candidate report view
- Print / Save PDF report option
- Downloadable standalone HTML report
- Role templates for CRO, VP Sales, Head of GTM, Sales Director, and Enterprise AE Leader
- Sample candidate data for immediate testing

## Scoring Model

The final candidate score is based on weighted stage scores, not a flat average of all reviewers.

Each stage score is calculated as:

1. Each reviewer scores that stage's criteria from 1 to 5.
2. Each reviewer receives an average score for that stage.
3. If multiple reviewers assess the same stage, their stage scores are averaged.
4. The candidate's final score applies the editable stage weightings to those stage averages.

Example:

```text
Final candidate score =
Stage 1 average score x Stage 1 weighting
+ Stage 2 average score x Stage 2 weighting
+ Stage 3 average score x Stage 3 weighting
```

The app normalises active stage weights, so unused or empty stages do not unfairly drag down a candidate's score.

## Recommendation Logic

The suggested recommendation is based on the final weighted score and critical red flags:

- 85%+ and no critical red flags: Strong Yes
- 70% to 84% and no critical red flags: Yes
- 55% to 69% or one critical concern: Mixed
- Below 55% or multiple critical concerns: No

Users can manually override the recommendation.

## Critical Criteria

Criteria can be marked as critical. If a candidate scores below 3 out of 5 on any critical criterion, the app shows a warning even if the overall weighted score is high.

## Local Development

This is a dependency-free static app.

Run it locally with:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173
```

## Tests

The scoring logic is separated from the UI in `src/scoring.js`.

Run the scoring tests with:

```bash
npm test
```

## Deployment

The app can be deployed as a static site.

Recommended first deployment option: GitHub Pages.

1. Open the GitHub repository.
2. Go to Settings.
3. Go to Pages.
4. Choose Deploy from a branch.
5. Select the `main` branch and `/root`.
6. Save.

GitHub will provide a public URL once the site is deployed.

## Project Structure

```text
index.html          App entry point
styles.css          Cosmic-branded styling and print styles
src/app.js          UI rendering and app interactions
src/data.js         Sample data, default stages, and role templates
src/scoring.js      Scoring and recommendation logic
tests/              Scoring logic tests
```
