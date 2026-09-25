import { DEFAULT_INTERVIEW_SETUP } from '../data/interviewConfig'

const delay = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms))

export async function createMockInterview(payload = DEFAULT_INTERVIEW_SETUP) {
  await delay()
  return {
    id: `mock-${Date.now()}`,
    status: 'ready',
    setup: { ...DEFAULT_INTERVIEW_SETUP, ...payload },
  }
}

export async function submitMockAnswer({ questionId, answer }) {
  await delay(180)
  return {
    questionId,
    answer,
    status: 'accepted',
  }
}

export async function getMockInterviewResult() {
  await delay()
  return {
    score: 0,
    communication: 0,
    technical: 0,
    confidence: 0,
    strengths: [],
    improvements: [],
    recommendations: [],
  }
}

export const interviewApi = {
  createMockInterview,
  submitMockAnswer,
  getMockInterviewResult,
}
