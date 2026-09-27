import { ArrowForward, AutoAwesome, SearchRounded } from '@mui/icons-material'
import { ROUTES } from '../routes/routes'
import { useRouter } from '../routes/Router'
import { getInterviewTopicFromPath, getInterviewQuestionsUrl } from '../seo/urlArchitecture'
import { getInterviewSeoContent, getInterviewSeoTopics } from '../data/interviewSeoContent'

export default function InterviewQuestionsPage({ routePath }) {
  const { navigate } = useRouter()
  const topic = getInterviewTopicFromPath(routePath)
  const content = topic ? getInterviewSeoContent(topic) : null

  if (topic && !content) {
    navigate(ROUTES.INTERVIEW_QUESTIONS, { replace: true })
    return null
  }

  const topics = getInterviewSeoTopics()
  const pageTitle = content ? content.title : 'Interview Questions & AI Practice'
  const description = content ? content.description : 'Explore structured interview questions by role, technology and interview type, then continue into AI-powered practice.'
  const questions = content ? content.questions : []

  return (
    <main className="interview-questions-page interview-questions-page-ref min-h-[70vh] px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] iq-hero rounded-[2rem] border p-8 sm:p-12">
          <span className="inline-flex items-center gap-2 rounded-full border iq-pill border px-4 py-2 text-xs font-bold"><AutoAwesome fontSize="small" /> ApnaAcademy Interview AI</span>
          <h1 className="mt-5 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{pageTitle}</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{content ? content.intro : description}</p>
          {content ? <div className="mt-6 flex flex-wrap gap-2">{content.skills.map((skill) => <span key={skill} className="iq-skill rounded-full border px-3 py-1.5 text-xs font-semibold">{skill}</span>)}</div> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="gradient-btn iq-primary" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>Start AI Practice <ArrowForward /></button>
            {content ? <button className="outline-btn iq-secondary" onClick={() => navigate(ROUTES.INTERVIEW_QUESTIONS)}><SearchRounded /> All Interview Topics</button> : null}
          </div>
        </header>

        <section className="mt-8" aria-labelledby="questions-heading">
          <div className="mb-5 iq-section-head"><h2 id="questions-heading" className="text-2xl font-extrabold text-slate-950">{content ? content.shortTitle + ' Interview Questions' : 'Explore Interview Question Topics'}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{content ? questions.length + ' structured questions across core preparation areas.' : 'Choose a role, technology or interview type to explore a focused preparation guide.'}</p></div>
          {content ? <div className="grid gap-4 lg:grid-cols-2">{questions.map(([category, question], index) => <article key={question} className="iq-question-card rounded-2xl border p-6"><div className="flex items-start gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl iq-number text-xs font-extrabold">{String(index + 1).padStart(2, '0')}</span><div><span className="iq-category text-xs font-bold uppercase tracking-wider">{category}</span><h3 className="mt-2 text-base font-bold leading-7 text-slate-900">{question}</h3></div></div></article>)}</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{topics.map((item) => { const topicContent = getInterviewSeoContent(item); return <button key={item} type="button" onClick={() => navigate(getInterviewQuestionsUrl(item))} className="iq-topic-card rounded-2xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><span className="text-xs font-bold uppercase tracking-wider text-violet-600">{topicContent.shortTitle}</span><h3 className="mt-2 text-lg font-extrabold text-slate-900">{topicContent.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{topicContent.description}</p></button> })}</div>}
        </section>

        {content ? <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 sm:p-10" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-2xl font-extrabold text-slate-950">Frequently Asked Questions</h2><div className="mt-6 divide-y iq-divider">{content.faqs.map(([question, answer]) => <details key={question} className="py-5"><summary className="cursor-pointer text-sm font-bold text-slate-900">{question}</summary><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></section> : null}
      </section>
    </main>
  )
}