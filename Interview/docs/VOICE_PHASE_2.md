# Interview Voice Phase 2

## Automatic voice answer flow

1. The AI question is spoken with the browser Speech Synthesis API.
2. After the AI question finishes, voice recognition starts automatically for an unanswered question when voice mode is enabled.
3. Final speech-recognition results are appended to the answer draft.
4. Each final speech result resets the silence window.
5. After 2.2 seconds without another final speech result, the recognition session stops and the current answer is submitted through the existing authenticated Interview API.
6. Manual typing and manual voice start/stop remain available.
7. A manually stopped voice session does not submit an incomplete draft automatically; the candidate can review and save it.
8. Pausing, question navigation, completion, and errors cancel the active automatic voice turn so stale callbacks cannot submit the wrong question.

## Safety boundaries

- Only final SpeechRecognition results trigger the silence timer. Interim text alone cannot auto-submit.
- The current question, answer, session status, pause state, and submission state are read through refs where asynchronous callbacks could otherwise become stale.
- AI speech cancellation invalidates stale speech callbacks.
- Automatic capture is blocked while the AI is speaking.
- The existing server-side answer endpoint remains the source of truth for evaluation and completion.

## Verification

- npm run test:interview covers the conversation reducer and deterministic silence detector.
- CI also builds the Interview app after installing dependencies.
- Browser microphone/speech APIs still require a real browser permission and device smoke test; CI cannot emulate those APIs.
