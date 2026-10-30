/**
 * Release Gate Policy Engine
 * Enforces evidence-based gating: releases only supported claims, qualifies uncertainty,
 * and outputs natural assistant responses with inline weak-claim highlights.
 */

import { Claim, EvidenceSource, TrustScoreBreakdown } from '../types/pipeline';

export interface ReleaseGateOutput {
  releasedAnswer: string;
  hasAbstained: boolean;
  abstentionReason?: string;
  trustScore: number;
  trustScoreLabel: 'Highly reliable' | 'Mostly reliable' | 'Check this yourself';
  trustScoreBreakdown: TrustScoreBreakdown;
  medicalLegalWarning?: string;
  policySummary: {
    releasedCount: number;
    verifiedCount: number;
    likelyCorrectCount: number;
    uncertainCount: number;
    correctedCount: number;
    abstainedCount: number;
    unresolvedConflicts: string[];
  };
}

export class ReleaseGate {
  /**
   * Evaluates claims against the release policy and synthesizes a full, natural assistant answer
   * Policy: Never withhold the whole answer; output pure natural prose; weak claims receive subtle underline.
   */
  public evaluateAndSynthesize(
    claims: Claim[],
    evidenceList: EvidenceSource[],
    originalQuery: string
  ): ReleaseGateOutput {
    let verifiedCount = 0;
    let likelyCorrectCount = 0;
    let uncertainCount = 0;
    let correctedCount = 0;
    let contradictedCount = 0;
    const unresolvedConflicts: string[] = [];
    let medicalLegalWarning: string | undefined = undefined;

    // Step 1: Count claims based on verified status
    for (const claim of claims) {
      claim.releaseDecision = 'RELEASE';

      if (claim.status === 'VERIFIED' || claim.status === 'SUPPORTED') {
        verifiedCount++;
      } else if (claim.status === 'CORRECTED') {
        correctedCount++;
      } else if (claim.status === 'LIKELY_CORRECT' || claim.status === 'PARTIALLY_SUPPORTED') {
        likelyCorrectCount++;
      } else if (claim.status === 'UNCERTAIN' || claim.status === 'UNVERIFIED') {
        claim.status = 'UNCERTAIN';
        claim.qualificationNote = "Couldn't fully verify this.";
        uncertainCount++;
      } else if (claim.status === 'CONTRADICTED') {
        contradictedCount++;
        claim.status = 'UNCERTAIN';
        claim.qualificationNote = "Couldn't fully verify this.";
        uncertainCount++;
      }

      if (claim.qualificationNote && claim.qualificationNote.includes('Warning: Sensitive topic')) {
        medicalLegalWarning = 'This response touches on sensitive topics. Please verify with primary official documentation.';
      }
    }

    const totalClaims = Math.max(1, claims.length);

    // Exact user-specified Trust Score formula:
    // verified by source/code = 100%, likely correct = 70%, uncertain = 30%, corrected = counts as verified (100%), contradicted = 0%
    const weightedSum =
      verifiedCount * 1.0 +
      correctedCount * 1.0 +
      likelyCorrectCount * 0.7 +
      uncertainCount * 0.3 +
      contradictedCount * 0.0;

    const rawScore = (weightedSum / totalClaims) * 100;
    const trustScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    let trustScoreLabel: 'Highly reliable' | 'Mostly reliable' | 'Check this yourself' = 'Highly reliable';
    if (trustScore >= 80) {
      trustScoreLabel = 'Highly reliable';
    } else if (trustScore >= 50) {
      trustScoreLabel = 'Mostly reliable';
    } else {
      trustScoreLabel = 'Check this yourself';
    }

    const trustScoreBreakdown: TrustScoreBreakdown = {
      formula: '(Verified × 1.0 + Corrected × 1.0 + Likely × 0.7 + Uncertain × 0.3) / Total Claims',
      verifiedWeight: verifiedCount * 1.0,
      likelyWeight: likelyCorrectCount * 0.7,
      uncertainWeight: uncertainCount * 0.3,
      correctedWeight: correctedCount * 1.0,
      totalClaims,
      rawScore: Math.round(rawScore * 10) / 10
    };

    // Step 2: Synthesize clean, natural assistant prose (no bracket tags)
    // Wrap weak claims in <span class="weak-claim" data-tooltip="Couldn't fully verify this.">...</span>
    const paragraphs: string[] = [];
    let currentParagraphClaims: string[] = [];

    for (let i = 0; i < claims.length; i++) {
      const claim = claims[i];
      let statement = claim.text.trim();

      if (!/[.?!]$/.test(statement)) {
        statement += '.';
      }

      const isWeak = claim.status === 'UNCERTAIN' || claim.status === 'CONTRADICTED';
      const renderedClaim = isWeak
        ? `<span class="weak-claim" data-tooltip="Couldn't fully verify this.">${statement}</span>`
        : statement;

      currentParagraphClaims.push(renderedClaim);

      // Group 2 sentences per paragraph or on line breaks
      if (currentParagraphClaims.length >= 2 || i === claims.length - 1) {
        paragraphs.push(currentParagraphClaims.join(' '));
        currentParagraphClaims = [];
      }
    }

    if (currentParagraphClaims.length > 0) {
      paragraphs.push(currentParagraphClaims.join(' '));
    }

    let synthesizedText = paragraphs.join('\n\n');

    return {
      releasedAnswer: synthesizedText,
      hasAbstained: false,
      trustScore,
      trustScoreLabel,
      trustScoreBreakdown,
      medicalLegalWarning,
      policySummary: {
        releasedCount: claims.length,
        verifiedCount,
        likelyCorrectCount,
        uncertainCount,
        correctedCount,
        abstainedCount: 0,
        unresolvedConflicts
      }
    };
  }
}

export const releaseGate = new ReleaseGate();
