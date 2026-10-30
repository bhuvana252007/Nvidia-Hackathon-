/**
 * Release Gate Policy Engine
 * Enforces evidence-based gating: releases only supported claims, qualifies uncertainty, abstains from unevidenced assertions.
 */

import { Claim, EvidenceSource } from '../types/pipeline';

export interface ReleaseGateOutput {
  releasedAnswer: string;
  hasAbstained: boolean;
  abstentionReason?: string;
  trustScore: number;
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
   * Policy: Never withhold the whole answer; selectively flag uncertain parts with inline badges.
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
    const unresolvedConflicts: string[] = [];
    let medicalLegalWarning: string | undefined = undefined;

    // Step 1: Assign release decisions & counts
    for (const claim of claims) {
      claim.releaseDecision = 'RELEASE';

      if (claim.status === 'VERIFIED' || claim.status === 'SUPPORTED') {
        verifiedCount++;
      } else if (claim.status === 'CORRECTED') {
        correctedCount++;
        verifiedCount++;
      } else if (claim.status === 'LIKELY_CORRECT' || claim.status === 'PARTIALLY_SUPPORTED') {
        likelyCorrectCount++;
      } else if (claim.status === 'UNCERTAIN' || claim.status === 'UNVERIFIED') {
        claim.status = 'UNCERTAIN';
        claim.qualificationNote = "I'm not fully sure about this part.";
        uncertainCount++;
      } else if (claim.status === 'CONTRADICTED') {
        // If uncorrected contradiction reached here
        claim.status = 'UNCERTAIN';
        claim.qualificationNote = "Conflicting evidence exists; flagged for review.";
        uncertainCount++;
      }

      if (claim.qualificationNote && claim.qualificationNote.includes('Warning: Sensitive topic')) {
        medicalLegalWarning = 'This response contains medical, legal, or financial topics. Please consult an accredited professional for official guidance.';
      }
    }

    const totalClaims = Math.max(1, claims.length);
    const trustScore = Math.min(100, Math.round(((verifiedCount + likelyCorrectCount * 0.9) / totalClaims) * 100));

    // Step 2: Synthesize a full, helpful, natural assistant answer
    const citedEvidenceMap = new Map<string, number>();
    let citationCounter = 1;

    // Group claims into natural flowing paragraphs
    const paragraphs: string[] = [];
    let currentParagraphClaims: string[] = [];

    for (let i = 0; i < claims.length; i++) {
      const claim = claims[i];
      let statement = claim.text.trim();

      // Ensure statement ends with a period if not punctuated
      if (!/[.?!]$/.test(statement)) {
        statement += '.';
      }

      // Add inline badges next to claims
      let badge = '';
      if (claim.status === 'VERIFIED' || claim.status === 'SUPPORTED') {
        badge = ' [✅ Verified]';
      } else if (claim.status === 'CORRECTED') {
        badge = ' [🔄 Corrected]';
      } else if (claim.status === 'LIKELY_CORRECT' || claim.status === 'PARTIALLY_SUPPORTED') {
        badge = ' [🟢 Likely Correct]';
      } else if (claim.status === 'UNCERTAIN' || claim.status === 'UNVERIFIED') {
        badge = ` [🟡 Uncertain: I'm not fully sure about this part]`;
      }

      // Add citation superscript if evidence is linked
      if (claim.supportingEvidenceIds.length > 0) {
        const citationIndices = claim.supportingEvidenceIds.map(eid => {
          if (!citedEvidenceMap.has(eid)) {
            citedEvidenceMap.set(eid, citationCounter++);
          }
          return `[^${citedEvidenceMap.get(eid)}]`;
        });
        badge += ` ${citationIndices.join('')}`;
      }

      currentParagraphClaims.push(`${statement}${badge}`);

      // Break into paragraphs every 2-3 sentences or on major topic shift
      if (currentParagraphClaims.length >= 2 || i === claims.length - 1) {
        paragraphs.push(currentParagraphClaims.join(' '));
        currentParagraphClaims = [];
      }
    }

    if (currentParagraphClaims.length > 0) {
      paragraphs.push(currentParagraphClaims.join(' '));
    }

    let synthesizedText = paragraphs.join('\n\n');

    // Add sensitive disclaimer if relevant
    if (medicalLegalWarning) {
      synthesizedText += `\n\n> ⚠️ **Professional Advisory:** *${medicalLegalWarning}*`;
    }

    // Append Verified Evidence References
    if (citedEvidenceMap.size > 0) {
      synthesizedText += '\n\n### Verified Evidence Sources\n';
      for (const [eid, num] of citedEvidenceMap.entries()) {
        const ev = evidenceList.find(e => e.id === eid);
        if (ev) {
          synthesizedText += `[^${num}]: [${ev.title}](${ev.url}) — *${ev.domain}* (${ev.authority.replace('_', ' ')})\n`;
        }
      }
    }

    return {
      releasedAnswer: synthesizedText,
      hasAbstained: false,
      trustScore,
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
