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
    <main className="min-h-[70vh] bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] border border-violet-100 bg-white/95 p-8 shadow-[0_25px_80px_rgba(55,45,150,0.10)] backdrop-blur-xl sm:p-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700"><AutoAwesome fontSize="small" /> ApnaAcademy Interview AI</span>
          <h1 className="mt-5 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{pageTitle}</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{content ? content.intro : description}</p>
          {content ? <div className="mt-6 flex flex-wrap gap-2">{content.skills.map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{skill}</span>)}</div> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="gradient-btn" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>Start AI Practice <ArrowForward /></button>
            {content ? <button className="outline-btn" onClick={() => navigate(ROUTES.INTERVIEW_QUESTIONS)}><SearchRounded /> All Interview Topics</button> : null}
          </div>
        </header>

        <section className="mt-8" aria-labelledby="questions-heading">
          <div className="mb-5"><h2 id="questions-heading" className="text-2xl font-extrabold text-slate-950">{content ? content.shortTitle + ' Interview Questions' : 'Explore Interview Question Topics'}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{content ? questions.length + ' structured questions across core preparation areas.' : 'Choose a role, technology or interview type to explore a focused preparation guide.'}</p></div>
          {content ? <div className="grid gap-4 lg:grid-cols-2">{questions.map(([category, question], index) => <article key={question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xs font-extrabold text-violet-700">{String(index + 1).padStart(2, '0')}</span><div><span className="text-xs font-bold uppercase tracking-wider text-violet-600">{category}</span><h3 className="mt-2 text-base font-bold leading-7 text-slate-900">{question}</h3></div></div></article>)}</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{topics.map((item) => { const topicContent = getInterviewSeoContent(item); return <button key={item} type="button" onClick={() => navigate(getInterviewQuestionsUrl(item))} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><span className="text-xs font-bold uppercase tracking-wider text-violet-600">{topicContent.shortTitle}</span><h3 className="mt-2 text-lg font-extrabold text-slate-900">{topicContent.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{topicContent.description}</p></button> })}</div>}
        </section>

        {content ? <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 sm:p-10" aria-labelledby="faq-heading"><h2 id="faq-heading" className="text-2xl font-extrabold text-slate-950">Frequently Asked Questions</h2><div className="mt-6 divide-y divide-slate-100">{content.faqs.map(([question, answer]) => <details key={question} className="py-5"><summary className="cursor-pointer text-sm font-bold text-slate-900">{question}</summary><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></section> : null}
      </section>
    </main>
  )
}