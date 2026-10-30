/**
 * Claim Decomposer
 * Parses candidate answers into atomic, independently testable claims
 */

import { Claim, ClaimCategory, VerificationMethod } from '../types/pipeline';

export class ClaimDecomposer {
  /**
   * Decomposes raw candidate text into atomic claims with categories & verification strategies
   */
  public decomposeAnswer(rawAnswer: string, userDocumentProvided = false): Claim[] {
    const rawLines = rawAnswer
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const extractedStatements: string[] = [];

    for (const line of rawLines) {
      // Remove leading numbering like "1.", "1)", "- ", "* "
      const cleanLine = line.replace(/^(\d+[\.\)]|\-|\*)\s*/, '').trim();

      // Skip introductory filler lines that don't contain verifiable assertions
      if (
        cleanLine.toLowerCase().startsWith('to find the') ||
        cleanLine.toLowerCase().startsWith('based on the review') ||
        cleanLine.toLowerCase().startsWith('here is') ||
        cleanLine.toLowerCase().startsWith('candidate answer draft') ||
        cleanLine.length < 15
      ) {
        continue;
      }

      // If line contains multiple punctuation-separated sentences, split into atomic statements
      const sentences = cleanLine
        .split(/(?<=[.?!])\s+(?=[A-Z0-9$])/)
        .map(s => s.trim())
        .filter(s => s.length > 10);

      if (sentences.length > 1) {
        extractedStatements.push(...sentences);
      } else {
        extractedStatements.push(cleanLine);
      }
    }

    // If decomposition yielded very few lines, fall back to sentence splitting
    if (extractedStatements.length === 0) {
      const fallbackSentences = rawAnswer
        .split(/(?<=[.?!])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 15);
      extractedStatements.push(...fallbackSentences);
    }

    return extractedStatements.map((statement, idx) => {
      const claimId = `CLM-${String(idx + 1).padStart(2, '0')}`;
      const category = this.categorizeClaim(statement, userDocumentProvided);
      const verificationMethod = this.determineVerificationMethod(category);
      const importance = this.determineImportance(statement, category);

      return {
        id: claimId,
        text: statement,
        category,
        verificationMethod,
        importance,
        status: 'PENDING',
        releaseDecision: 'RELEASE',
        explanation: 'Pending verification gate assessment.',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        corrections: []
      };
    });
  }

  private categorizeClaim(text: string, userDocProvided: boolean): ClaimCategory {
    const lower = text.toLowerCase();

    // Mathematical pattern (explicit digits with math operators or calculations)
    if (
      /\b(\d+(?:\.\d+)?)\s*%/i.test(text) ||
      /\b(\d+(?:\.\d+)?)\s*percent\b/i.test(text) ||
      /(?:\d\s*[\+\-\*\/×÷=]\s*\d)/.test(text) ||
      /\b(compounded|principal|compound interest|factorial|arithmetic|subtracting|payable total|discount amount)\b/i.test(text) ||
      (/\$\d+/.test(text) && /\b(is|equals|totaling|gives|pays|costs|remains)\s*\$?(\d+)/i.test(text))
    ) {
      return 'MATHEMATICAL';
    }

    // Citation references
    if (
      lower.includes('nature (vol') ||
      lower.includes('paper') ||
      lower.includes('published in') ||
      lower.includes('journal') ||
      lower.includes('doi:') ||
      lower.includes('reported in') ||
      lower.includes('according to arxiv')
    ) {
      return 'CITATION_REFERENCE';
    }

    // Document-based
    if (userDocProvided && (lower.includes('section') || lower.includes('clause') || lower.includes('agreement') || lower.includes('contract'))) {
      return 'DOCUMENT_BASED';
    }

    // Speculative / future predictions
    if (
      lower.includes('scheduled for worldwide commercial release in 202') ||
      lower.includes('insider reports') ||
      lower.includes('supply chain leaks') ||
      lower.includes('will cure') ||
      lower.includes('will win the 203')
    ) {
      return 'SPECULATIVE_PREDICTION';
    }

    // Code logic
    if (lower.includes('function') || lower.includes('algorithm') || lower.includes('o(n') || lower.includes('runtime error') || lower.includes('import ')) {
      return 'CODE_LOGIC';
    }

    return 'FACTUAL';
  }

  private determineVerificationMethod(category: ClaimCategory): VerificationMethod {
    switch (category) {
      case 'MATHEMATICAL':
        return 'DETERMINISTIC_MATH';
      case 'DOCUMENT_BASED':
        return 'DOCUMENT_CROSS_CHECK';
      case 'CODE_LOGIC':
        return 'DETERMINISTIC_CODE';
      case 'SPECULATIVE_PREDICTION':
        return 'ABSTENTION_POLICY';
      case 'CITATION_REFERENCE':
      case 'FACTUAL':
      default:
        return 'EVIDENCE_RETRIEVAL';
    }
  }

  private determineImportance(text: string, category: ClaimCategory): 'CRITICAL' | 'SUPPORTING' | 'INCIDENTAL' {
    if (category === 'MATHEMATICAL' || category === 'SPECULATIVE_PREDICTION' || category === 'DOCUMENT_BASED') {
      return 'CRITICAL';
    }
    if (text.length > 50 || text.includes('primary') || text.includes('launched') || text.includes('founded')) {
      return 'CRITICAL';
    }
    return 'SUPPORTING';
  }
}

export const claimDecomposer = new ClaimDecomposer();
