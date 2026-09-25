export const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical Interview' },
  { value: 'dsa', label: 'DSA / Coding Interview' },
  { value: 'behavioral', label: 'HR / Behavioral Interview' },
]

export const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher / Student' },
  { value: 'junior', label: '0–2 Years' },
  { value: 'mid', label: '2–5 Years' },
  { value: 'senior', label: '5+ Years' },
]

export const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export const DEFAULT_INTERVIEW_SETUP = {
  role: '',
  interviewType: 'technical',
  experience: 'fresher',
  difficulty: 'medium',
  durationMinutes: 30,
  questionCount: 10,
}

export const INTERVIEW_PHASES = [
  'setup',
  'preparation',
  'room',
  'complete',
  'result',
]
