export const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical Interview', description: 'Core technical concepts, projects and role-specific questions.', icon: 'code' },
  { value: 'dsa', label: 'DSA / Coding', description: 'Algorithms, data structures and problem-solving questions.', icon: 'terminal' },
  { value: 'behavioral', label: 'HR / Behavioral', description: 'Communication, teamwork, leadership and situational questions.', icon: 'people' },
]

export const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher / Student', shortLabel: 'Fresher', description: 'Starting your career' },
  { value: 'junior', label: '0–2 Years', shortLabel: 'Junior', description: 'Early-career professional' },
  { value: 'mid', label: '2–5 Years', shortLabel: 'Mid-level', description: 'Growing professional' },
  { value: 'senior', label: '5+ Years', shortLabel: 'Senior', description: 'Experienced professional' },
]

export const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', description: 'Build confidence with fundamentals.' },
  { value: 'medium', label: 'Medium', description: 'Balanced real-world interview difficulty.' },
  { value: 'hard', label: 'Hard', description: 'Challenging questions and deeper follow-ups.' },
]

export const INTERVIEW_DURATIONS = [
  { value: 15, label: '15 min', description: 'Quick practice' },
  { value: 30, label: '30 min', description: 'Recommended' },
  { value: 45, label: '45 min', description: 'Deep practice' },
  { value: 60, label: '60 min', description: 'Full simulation' },
]

export const QUESTION_COUNTS = [5, 10, 15, 20]

export const POPULAR_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Software Engineer',
  'Data Analyst',
  'Data Scientist',
  'AI / ML Engineer',
  'Product Manager',
]

export const DEFAULT_INTERVIEW_SETUP = {
  role: '',
  interviewType: 'technical',
  experience: 'fresher',
  difficulty: 'medium',
  durationMinutes: 30,
  questionCount: 10,
}

export const INTERVIEW_PHASES = ['setup', 'preparation', 'room', 'complete', 'result']

export function validateInterviewSetup(setup) {
  const errors = {}
  if (!setup.role?.trim()) errors.role = 'Please enter a target role.'
  if (!INTERVIEW_TYPES.some((item) => item.value === setup.interviewType)) errors.interviewType = 'Choose an interview type.'
  if (!EXPERIENCE_LEVELS.some((item) => item.value === setup.experience)) errors.experience = 'Choose your experience level.'
  if (!DIFFICULTIES.some((item) => item.value === setup.difficulty)) errors.difficulty = 'Choose a difficulty.'
  if (!INTERVIEW_DURATIONS.some((item) => item.value === Number(setup.durationMinutes))) errors.durationMinutes = 'Choose an interview duration.'
  if (!QUESTION_COUNTS.includes(Number(setup.questionCount))) errors.questionCount = 'Choose the number of questions.'
  return errors
}
