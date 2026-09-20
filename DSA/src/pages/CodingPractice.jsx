import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getDsaProblem, getDsaSubmission, submitDsaSolution } from '../services/dsa.service.js'
import { Code2, Play, RotateCcw, Send, Terminal, CheckCircle2, AlertCircle } from 'lucide-react'

const languages = ['Java', 'C++', 'Python', 'JavaScript']
const starterCode = {
  Java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
  'C++': `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
  Python: `class Solution:\n    def twoSum(self, nums, target):\n        # Write your solution here\n        return []`,
  JavaScript: `class Solution {\n  twoSum(nums, target) {\n    // Write your solution here\n    return [];\n  }\n}`,
}

export default function CodingPractice() {
  const [params] = useSearchParams()
  const slug = params.get('problem') || ''
  const [problem, setProblem] = useState(null)
  const [language, setLanguage] = useState('Java')
  const [code, setCode] = useState(starterCode.Java)
  const [status, setStatus] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [busyAction, setBusyAction] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) { setLoading(false); setError('No problem selected.'); return }
    setLoading(true); setError('')
    getDsaProblem(slug).then((item) => {
      setProblem(item)
      const supported = item?.supportedLanguages?.length ? item.supportedLanguages : languages
      const nextLanguage = supported.includes('Java') ? 'Java' : supported[0]
      setLanguage(nextLanguage)
      setCode(getStarter(item, nextLanguage))
    }).catch((err) => setError(err?.message || 'Unable to load problem.')).finally(() => setLoading(false))
  }, [slug])

  const availableLanguages = useMemo(() => problem?.supportedLanguages?.length ? problem.supportedLanguages : languages, [problem])

  const goToLogin = () => {
    const redirect = window.location.href
    window.location.href = `https://apnaacademy.me/login?redirect=${encodeURIComponent(redirect)}`
  }

  const execute = async (action = 'submit') => {
    if (!problem || busy) return
    if (!code.trim()) { setError('Write some code first.'); return }
    setBusy(true); setBusyAction(action); setError(''); setSubmission(null); setActiveTab('result')
    try {
      const created = await submitDsaSolution({ problemSlug: problem.slug, language, code })
      setSubmission(created)
      for (let attempt = 0; attempt < 30; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 1000))
        const latest = await getDsaSubmission(created._id)
        setSubmission(latest)
        if (latest.status !== 'Pending') break
      }
    } catch (err) {
      if (err?.status === 401) {
        setError('Please login to run or submit code. Redirecting to secure login...')
        window.setTimeout(goToLogin, 700)
      } else if (err?.status === 403) {
        setError(err?.message || 'Premium access is required for this problem.')
      } else if (err?.status === 429) {
        setError('Judge queue is busy. Please wait a moment and try again.')
      } else if (err?.status === 503) {
        setError(err?.message || 'Secure judge is temporarily unavailable.')
      } else {
        setError(err?.message || 'Unable to queue submission.')
      }
    } finally { setBusy(false); setBusyAction('') }
  }
  const [activeTab, setActiveTab] = useState('testcases')

  const changeLanguage = (next) => {
    setLanguage(next)
    setCode(starterCode[next])
    setStatus(null)
  }

  if (loading) return <div className="mx-auto max-w-6xl h-96 animate-pulse rounded-3xl bg-slate-200" />
  if (error && !problem) return <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm font-bold text-rose-700">{error}</div>
  if (!problem) return null

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div><Link to={`/practice/${problem.slug}`} className="text-xs font-black text-slate-500">← Back to problem</Link><p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600">Secure coding practice</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{problem.title}</h1><p className="mt-1 text-sm text-slate-500">{problem.difficulty} · {problem.timeLimitMs || 2000} ms · {problem.memoryLimitMb || 256} MB</p></div>
      <div className="flex flex-wrap gap-2">{availableLanguages.map((item) => <button key={item} type="button" onClick={() => { setLanguage(item); setCode(getStarter(problem, item)); setStatus(null); setSubmission(null) }} className={`rounded-xl px-3 py-2 text-xs font-black ${language === item ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{item}</button>)}</div>
    </div>

    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5"><div className="flex items-center gap-2"><span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">EASY</span><h2 className="text-base font-black text-slate-950">Two Sum</h2></div><p className="mt-3 text-sm leading-6 text-slate-600">Given an array of integers and a target value, return the indices of two numbers whose sum equals the target.</p></div>
        <div className="p-5"><h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Example</h3><div className="mt-3 rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-300">{(problem.examples || []).map((example, index) => <div key={index}><p>Input: {example.input}</p><p>Output: {example.output}</p></div>)}</div><div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-black text-slate-700">Constraints</p><ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-500">{(problem.constraints || []).map((item, index) => <li key={index}>{item}</li>)}</ul></div></div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2 text-sm font-black text-white"><Code2 className="h-4 w-4 text-blue-300" /> {language}</div><button type="button" onClick={() => setCode(starterCode[language])} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-400 hover:bg-white/5 hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Reset</button></div>
        <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" aria-label="Code editor" className="min-h-[390px] w-full resize-y bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-200 outline-none" />
        <div className="flex flex-wrap justify-between gap-2 border-t border-white/10 px-4 py-3"><div className="flex items-center gap-2 text-[11px] font-bold text-slate-500"><Terminal className="h-3.5 w-3.5" /> Secure judge queue</div><div className="flex gap-2"><button type="button" onClick={() => execute('run')} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black text-slate-300 hover:bg-white/5"><Play className="h-3.5 w-3.5" /> {busyAction === 'run' ? 'Running…' : 'Run'}</button><button type="button" onClick={() => execute('submit')} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700"><Send className="h-3.5 w-3.5" /> {busyAction === 'submit' ? 'Submitting…' : 'Submit'}</button></div></div>
      </section>
    </div>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex border-b border-slate-100">{[['testcases','Test Cases'],['result','Result']].map(([id,label]) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`px-5 py-3 text-xs font-black ${activeTab === id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}>{label}</button>)}</div>{activeTab === 'testcases' ? <div className="grid gap-3 p-5 sm:grid-cols-2"><TestCase input="[2,7,11,15], 9" expected="[0,1]" /><TestCase input="[3,2,4], 6" expected="[1,2]" /></div> : <div className="p-5">{submission ? <div className="space-y-3"><div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-xs font-black text-slate-700">{submission.status === 'Accepted' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4" />} {submission.status}</div><p className="text-xs font-bold text-slate-500">{submission.passedTests || 0}/{submission.totalTests || 0} tests{submission.executionTimeMs != null ? ` · ${submission.executionTimeMs} ms` : ''}</p>{submission.judgeMessage && <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs text-slate-600">{submission.judgeMessage}</pre>}</div> : <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-xs font-bold text-slate-500"><AlertCircle className="h-4 w-4" /> Run or submit your code to see the judge result.</div>}</div>}</section>
  </div>
}

function TestCase({ input, expected }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Input</p><p className="mt-1 font-mono text-xs text-slate-700">{input}</p><p className="mt-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Expected</p><p className="mt-1 font-mono text-xs text-slate-700">{expected}</p></div>
}

function getStarter(problem, language) { const starter = problem?.starterCode; if (starter && typeof starter === 'object') return starter[language] || starterCode[language] || ''; if (typeof starter === 'string') return starter; return starterCode[language] || ''; }
