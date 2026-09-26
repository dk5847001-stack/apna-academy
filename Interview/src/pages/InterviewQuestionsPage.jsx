import { ArrowForward, AutoAwesome, SearchRounded } from '@mui/icons-material'
import { ROUTES } from '../routes/routes'
import { useRouter } from '../routes/Router'
import { getInterviewTopicFromPath, getInterviewTopicLabel } from '../seo/urlArchitecture'

export default function InterviewQuestionsPage({ routePath }) {
  const { navigate } = useRouter()
  const topic = getInterviewTopicFromPath(routePath)
  const title = topic ? `${getInterviewTopicLabel(topic)} Interview Questions` : 'Interview Questions & AI Practice'

  return (
    <main className="min-h-[70vh] px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-violet-100 bg-white/90 p-8 text-center shadow-[0_25px_80px_rgba(55,45,150,0.10)] backdrop-blur-xl sm:p-14">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700">
          <AutoAwesome fontSize="small" /> ApnaAcademy Interview AI
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          {topic
            ? `Explore ${getInterviewTopicLabel(topic).toLowerCase()} interview preparation and practice resources.`
            : 'Explore structured interview preparation resources by role, technology and interview type.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="gradient-btn" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>
            Start AI Practice <ArrowForward />
          </button>
          <button className="outline-btn" onClick={() => navigate(ROUTES.HOME)}>
            <SearchRounded /> Explore Interview AI
          </button>
        </div>
      </section>
    </main>
  )
}
