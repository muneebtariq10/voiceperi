/**
 * IKnowledgeProvider — Interface for company policy, FAQ, and technical printing knowledge retrieval.
 *
 * Enables dynamic querying of store policies, shipping timetables, MICR ink compatibility,
 * and return guarantees without overloading LLM context windows or hardcoding static text.
 */

export interface KnowledgeQueryResult {
  found: boolean;
  topic: string;
  answer: string;
  category?: string;
  referenceUrl?: string;
}

export interface IKnowledgeProvider {
  /**
   * Search the knowledge base for policies or technical FAQs matching the caller's question or topic.
   */
  queryKnowledge(
    topic: string,
    question?: string,
  ): Promise<KnowledgeQueryResult>;

  /**
   * Check if the knowledge provider engine is accessible.
   */
  isAvailable(): Promise<boolean>;
}
