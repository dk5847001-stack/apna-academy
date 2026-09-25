export const MOCK_QUESTIONS = {
  technical: [
    { id: 'tech-1', category: 'Introduction', question: 'Tell me about yourself and the technical experience that best prepares you for this role.', hint: 'Keep your answer structured: present, relevant experience, and what you are looking for.' },
    { id: 'tech-2', category: 'Core Skills', question: 'Walk me through a project you built recently. What was your architecture and why did you choose it?', hint: 'Mention your role, key decisions, trade-offs, and measurable outcome.' },
    { id: 'tech-3', category: 'Problem Solving', question: 'How would you investigate an API that suddenly became slow in production?', hint: 'Think about metrics, logs, traces, database queries, and recent changes.' },
    { id: 'tech-4', category: 'Engineering', question: 'How do you keep a backend API secure and reliable as the number of users grows?', hint: 'Cover authentication, authorization, validation, rate limiting, observability, and testing.' },
    { id: 'tech-5', category: 'Collaboration', question: 'Describe a technical disagreement you had and how you reached a decision with your team.', hint: 'Focus on evidence, communication, and the outcome rather than the disagreement itself.' },
  ],
  dsa: [
    { id: 'dsa-1', category: 'Arrays', question: 'How would you find the first duplicate value in an array while keeping the time complexity close to O(n)?', hint: 'Explain the data structure you would use and the trade-off in space.' },
    { id: 'dsa-2', category: 'Strings', question: 'How would you determine whether a string is a palindrome efficiently?', hint: 'Compare a two-pointer approach with any extra-space approach.' },
    { id: 'dsa-3', category: 'Hashing', question: 'Given an array and a target sum, how would you find two values that add up to the target?', hint: 'Explain the invariant maintained while scanning the array.' },
    { id: 'dsa-4', category: 'Trees', question: 'What is the difference between BFS and DFS, and when would you choose one over the other?', hint: 'Discuss traversal order, data structures, and practical use cases.' },
    { id: 'dsa-5', category: 'Complexity', question: 'Explain Big-O complexity using an example from a solution you have written.', hint: 'State time and space complexity and why they scale that way.' },
  ],
  behavioral: [
    { id: 'hr-1', category: 'Introduction', question: 'Tell me about yourself and what motivates you to grow in your career.', hint: 'Connect your motivation to the role without giving a complete life story.' },
    { id: 'hr-2', category: 'Teamwork', question: 'Tell me about a time you worked with someone who had a different approach from yours.', hint: 'Use a clear situation, action, and result structure.' },
    { id: 'hr-3', category: 'Challenge', question: 'Describe a difficult problem or failure and what you learned from it.', hint: 'Own your actions and emphasize the learning and change afterward.' },
    { id: 'hr-4', category: 'Leadership', question: 'Tell me about a time you took ownership without being asked.', hint: 'Show initiative, communication, and the result of your action.' },
    { id: 'hr-5', category: 'Career', question: 'Why are you interested in this role and what would you like to learn next?', hint: 'Tie your answer to the responsibilities and your development goals.' },
  ],
}

export function buildMockQuestions(setup) {
  const pool = MOCK_QUESTIONS[setup?.interviewType] || MOCK_QUESTIONS.technical
  const count = Math.max(1, Number(setup?.questionCount) || 10)
  return Array.from({ length: count }, (_, index) => {
    const source = pool[index % pool.length]
    return { ...source, id: source.id + '-' + (index + 1), number: index + 1 }
  })
}
