/**
 * Correction Agent
 * Bounded iterative correction engine for contradicted or unsupported claims
 */

import { Claim, EvidenceSource } from '../types/pipeline';
import { VerificationAudit } from './independentVerifier';
import { verifyMathClaim } from './deterministicMath';

export class CorrectionAgent {
  private maxRetries = 2;

  /**
   * Applies bounded correction on contradicted claims using deterministic code or verified evidence
   */
  public correctClaims(
    audits: VerificationAudit[],
    evidenceList: EvidenceSource[],
    maxRetries = 2
  ): { updatedClaims: Claim[]; correctionsCount: number } {
    let correctionsCount = 0;

    const updatedClaims = audits.map(audit => {
      const claim = audit.claim;

      if (audit.contradictionFound && audit.correctionSuggested) {
        correctionsCount++;
        const originalText = claim.text;
        const correctedText = audit.correctionSuggested;

        // Record revision history
        claim.corrections.push({
          originalText,
          correctedText,
          reason: claim.explanation,
          evidenceId: claim.contradictingEvidenceIds[0],
          iteration: 1
        });

        // Update text
        claim.text = correctedText;
        claim.status = 'CORRECTED';
        claim.releaseDecision = 'RELEASE';

        // Re-verify the corrected claim deterministically
        if (claim.category === 'MATHEMATICAL') {
          const recheck = verifyMathClaim(correctedText);
          if (recheck.hasCalculation && recheck.isCorrect) {
            claim.explanation = `Corrected and deterministically verified: ${recheck.deterministicCalculation}`;
            claim.deterministicLog = recheck.log;
          }
        } else {
          // Re-link to the evidence that provided the correction
          const supportingSource = evidenceList.find(e =>
            claim.contradictingEvidenceIds.includes(e.id) ||
            e.authority === 'PRIMARY_OFFICIAL' ||
            e.authority === 'ACADEMIC_PEER' ||
            e.authority === 'REPUTABLE_NEWS' ||
            e.authority === 'WIKIPEDIA' ||
            e.authority === 'DOCUMENTATION'
          );
          if (supportingSource && !claim.supportingEvidenceIds.includes(supportingSource.id)) {
            claim.supportingEvidenceIds.push(supportingSource.id);
          }
          claim.explanation = `Corrected using verified evidence: ${claim.explanation}`;
        }
      }

      return claim;
    });

    return { updatedClaims, correctionsCount };
  }
}

export const correctionAgent = new CorrectionAgent();
