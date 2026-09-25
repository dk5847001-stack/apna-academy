export const MOCK_RESULT = {
  overallScore: 82,
  grade: 'Strong',
  percentile: 78,
  duration: '26 min',
  answered: 9,
  total: 10,
  metrics: [
    { key: 'technical', label: 'Technical Knowledge', score: 86, color: 'purple', note: 'Strong fundamentals and relevant examples.' },
    { key: 'communication', label: 'Communication', score: 84, color: 'blue', note: 'Clear structure with good explanations.' },
    { key: 'confidence', label: 'Confidence', score: 78, color: 'green', note: 'Good presence; reduce filler words.' },
    { key: 'problemSolving', label: 'Problem Solving', score: 80, color: 'orange', note: 'Good reasoning; explain trade-offs earlier.' },
  ],
  strengths: [
    'Explains technical decisions with practical context.',
    'Uses structured answers and relevant project examples.',
    'Shows strong fundamentals for the selected role.',
  ],
  improvements: [
    'Make answers more concise before adding details.',
    'Explain trade-offs and edge cases more explicitly.',
    'Practice speaking with fewer filler words.',
  ],
  recommendations: [
    { title: 'System Design Fundamentals', meta: 'Architecture · 35 min', type: 'course' },
    { title: 'Behavioral Interview Practice', meta: 'Communication · 20 min', type: 'practice' },
    { title: 'Arrays & Hashing', meta: 'DSA · 45 min', type: 'dsa' },
  ],
}

export const MOCK_HISTORY = [
  { id: 'hist-1', role: 'Backend Developer', type: 'Technical', score: 82, date: 'Today', duration: '26 min', status: 'Completed' },
  { id: 'hist-2', role: 'Full Stack Developer', type: 'Technical', score: 76, date: 'Yesterday', duration: '29 min', status: 'Completed' },
  { id: 'hist-3', role: 'Software Engineer', type: 'DSA / Coding', score: 71, date: 'Sep 21', duration: '24 min', status: 'Completed' },
  { id: 'hist-4', role: 'Frontend Developer', type: 'HR / Behavioral', score: 88, date: 'Sep 18', duration: '18 min', status: 'Completed' },
]
