import { useState } from 'react'
import { Code2, Play, RotateCcw, Send, Terminal, CheckCircle2, AlertCircle } from 'lucide-react'

const languages = ['Java', 'C++', 'Python', 'JavaScript']
const starterCode = {
  Java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`,
  'C++': `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
  Python: `class Solution:\n    def twoSum(self, nums, target):\n        # Write your solution here\n        return []`,
  JavaScript: `class Solution {\n  twoSum(nums, target) {\n    // Write your solution here\n    return [];\n  }\n}`,
}

export default function CodingPractice() {
  const [language, setLanguage] = useState('Java')
  const [code, setCode] = useState(starterCode.Java)
  const [status, setStatus] = useState(null)
  const [activeTab, setActiveTab] = useState('testcases')

  const changeLanguage = (next) => {
    setLanguage(next)
    setCode(starterCode[next])
    setStatus(null)
  }

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Coding practice</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Online coding workspace</h1><p className="mt-1 text-sm text-slate-500">Run sample tests first, then submit your solution to the secure judge.</p></div>
      <div className="flex flex-wrap gap-2">{languages.map((item) => <button key={item} type="button" onClick={() => changeLanguage(item)} className={`rounded-xl px-3 py-2 text-xs font-black ${language === item ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{item}</button>)}</div>
    </div>

    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5"><div className="flex items-center gap-2"><span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">EASY</span><h2 className="text-base font-black text-slate-950">Two Sum</h2></div><p className="mt-3 text-sm leading-6 text-slate-600">Given an array of integers and a target value, return the indices of two numbers whose sum equals the target.</p></div>
        <div className="p-5"><h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Example</h3><div className="mt-3 rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-300"><p>Input: nums = [2,7,11,15], target = 9</p><p>Output: [0,1]</p></div><div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs font-black text-slate-700">Constraints</p><ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-500"><li>2 ≤ nums.length ≤ 10⁴</li><li>-10⁹ ≤ nums[i] ≤ 10⁹</li><li>Exactly one valid answer exists.</li></ul></div></div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2 text-sm font-black text-white"><Code2 className="h-4 w-4 text-blue-300" /> {language}</div><button type="button" onClick={() => setCode(starterCode[language])} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-400 hover:bg-white/5 hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Reset</button></div>
        <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" aria-label="Code editor" className="min-h-[390px] w-full resize-y bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-200 outline-none" />
        <div className="flex flex-wrap justify-between gap-2 border-t border-white/10 px-4 py-3"><div className="flex items-center gap-2 text-[11px] font-bold text-slate-500"><Terminal className="h-3.5 w-3.5" /> Secure judge queue</div><div className="flex gap-2"><button type="button" onClick={() => setStatus('Sample tests passed')} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black text-slate-300 hover:bg-white/5"><Play className="h-3.5 w-3.5" /> Run</button><button type="button" onClick={() => setStatus('Submission queued')} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700"><Send className="h-3.5 w-3.5" /> Submit</button></div></div>
      </section>
    </div>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex border-b border-slate-100">{[['testcases','Test Cases'],['result','Result']].map(([id,label]) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`px-5 py-3 text-xs font-black ${activeTab === id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}>{label}</button>)}</div>{activeTab === 'testcases' ? <div className="grid gap-3 p-5 sm:grid-cols-2"><TestCase input="[2,7,11,15], 9" expected="[0,1]" /><TestCase input="[3,2,4], 6" expected="[1,2]" /></div> : <div className="p-5">{status ? <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-xs font-black text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {status}</div> : <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-xs font-bold text-slate-500"><AlertCircle className="h-4 w-4" /> Run or submit your code to see the judge result.</div>}</div>}</section>
  </div>
}

function TestCase({ input, expected }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Input</p><p className="mt-1 font-mono text-xs text-slate-700">{input}</p><p className="mt-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Expected</p><p className="mt-1 font-mono text-xs text-slate-700">{expected}</p></div>
}
