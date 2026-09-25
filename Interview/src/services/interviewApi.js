import { DEFAULT_INTERVIEW_SETUP } from '../data/interviewConfig'
import { MOCK_HISTORY, MOCK_RESULT } from '../data/resultData'

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

export async function getMockInterviewHistory() {
  await delay()
  return MOCK_HISTORY
}

export async function getMockInterviewResult() {
  await delay()
  return {
    ...MOCK_RESULT,
  }
}

export const interviewApi = {
  createMockInterview,
  submitMockAnswer,
  getMockInterviewResult,
  getMockInterviewHistory,
}
