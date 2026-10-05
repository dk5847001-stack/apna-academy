import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './App.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const STORAGE_KEY = 'apnaAcademyQuiz.studentProfile'
const PARTICIPANT_KEY = 'apnaAcademyQuiz.participantId'
const QUIZ_API_URL = (import.meta.env.VITE_QUIZ_API_URL || (import.meta.env.DEV ? 'http://localhost:5001' : '')).replace(/\/$/, '')

async function apiRequest(path, options = {}) {
  if (!QUIZ_API_URL) throw new Error('Quiz API is not configured for this production build.')
  const response = await fetch(QUIZ_API_URL + path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options })
  let payload = null
  try { payload = await response.json() } catch {}
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || 'Something went wrong. Please try again.')
  return payload
}

function formatDuration(seconds = 0) {
  const total = Math.max(0, Number(seconds) || 0)
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0')
}

const categories = [
  { label: 'Engineering', detail: 'B.Tech & technical subjects', icon: '01' },
  { label: 'Computer Applications', detail: 'BCA, MCA & programming', icon: '02' },
  { label: 'Business & Management', detail: 'BBA, MBA & commerce', icon: '03' },
  { label: 'Aptitude & Placement', detail: 'Reasoning, aptitude & mocks', icon: '04' },
]

const featuredQuizzes = [
  { type: 'Practice Quiz', title: 'Java Fundamentals', meta: '20 questions · 20 min', level: 'Easy → Medium' },
  { type: 'Subject Test', title: 'Data Structures & Algorithms', meta: '30 questions · 30 min', level: 'Mixed' },
  { type: 'Placement Test', title: 'Aptitude & Reasoning', meta: '25 questions · 25 min', level: 'Mixed' },
]

const steps = [
  ['01', 'Choose a quiz', 'Find a test by your course, subject, skill or goal.'],
  ['02', 'Take the test', 'Answer focused questions with a clear timer and progress view.'],
  ['03', 'Understand your result', 'See your score, accuracy and areas to improve after every attempt.'],
]

const degreeOptions = ['B.Tech', 'BCA', 'BBA', 'MBA', 'MCA', 'Diploma', 'Other UG/PG']

const branchOptions = {
  'B.Tech': ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical / EEE', 'Mechanical', 'Civil', 'Chemical', 'Artificial Intelligence & Machine Learning', 'Data Science', 'Other'],
  BCA: ['Computer Applications', 'Software Development', 'Data Analytics', 'Other'],
  BBA: ['General Management', 'Finance', 'Marketing', 'Human Resources', 'Other'],
  MBA: ['Finance', 'Marketing', 'Human Resources', 'Operations', 'Business Analytics', 'Other'],
  MCA: ['Computer Applications', 'Software Engineering', 'Data Science', 'AI & ML', 'Other'],
  Diploma: ['Computer Science', 'IT', 'Electronics', 'Mechanical', 'Civil', 'Other'],
  'Other UG/PG': ['Other'],
}


const quizCatalogue = [
  { id: 'java-fundamentals', type: 'Practice Quiz', title: 'Java Fundamentals', description: 'Build confidence with core Java syntax, operators, conditions, loops and object-oriented basics.', degree: 'B.Tech', branch: 'Computer Science & Engineering', subject: 'Java', difficulty: 'Easy', duration: 20, questions: 20, marks: 20, negativeMarking: 'No', attempts: '3 attempts', level: 'Beginner friendly', tags: ['Java', 'Programming', 'Fundamentals'] },
  { id: 'dsa-java', type: 'Subject Test', title: 'Data Structures & Algorithms with Java', description: 'Test arrays, strings, searching, sorting, stacks, queues and core algorithmic thinking.', degree: 'B.Tech', branch: 'Computer Science & Engineering', subject: 'DSA', difficulty: 'Mixed', duration: 30, questions: 30, marks: 30, negativeMarking: '0.25 per wrong answer', attempts: '2 attempts', level: 'Intermediate', tags: ['DSA', 'Java', 'Placement'] },
  { id: 'dbms-core', type: 'Subject Test', title: 'DBMS Core Concepts', description: 'Check your understanding of databases, keys, normalization, SQL and transactions.', degree: 'B.Tech', branch: 'Computer Science & Engineering', subject: 'DBMS', difficulty: 'Medium', duration: 25, questions: 25, marks: 25, negativeMarking: 'No', attempts: '3 attempts', level: 'Intermediate', tags: ['DBMS', 'SQL', 'Databases'] },
  { id: 'os-fundamentals', type: 'Subject Test', title: 'Operating Systems Fundamentals', description: 'Practice processes, threads, scheduling, memory management, deadlocks and file systems.', degree: 'B.Tech', branch: 'Computer Science & Engineering', subject: 'Operating Systems', difficulty: 'Medium', duration: 25, questions: 25, marks: 25, negativeMarking: '0.25 per wrong answer', attempts: '2 attempts', level: 'Intermediate', tags: ['OS', 'Systems', 'Core CS'] },
  { id: 'web-development', type: 'Practice Quiz', title: 'Web Development Essentials', description: 'Revise HTML, CSS, JavaScript, HTTP and modern web development fundamentals.', degree: 'BCA', branch: 'Software Development', subject: 'Web Development', difficulty: 'Easy', duration: 20, questions: 20, marks: 20, negativeMarking: 'No', attempts: '3 attempts', level: 'Beginner friendly', tags: ['HTML', 'CSS', 'JavaScript'] },
  { id: 'aptitude-placement', type: 'Placement Test', title: 'Aptitude & Reasoning', description: 'Prepare for placement tests with quantitative aptitude, logical reasoning and pattern questions.', degree: 'Other UG/PG', branch: 'Other', subject: 'Aptitude', difficulty: 'Mixed', duration: 25, questions: 25, marks: 25, negativeMarking: '0.25 per wrong answer', attempts: '2 attempts', level: 'Placement focused', tags: ['Aptitude', 'Reasoning', 'Placement'] },
  { id: 'business-management', type: 'Practice Quiz', title: 'Business & Management Basics', description: 'Test fundamentals of management, marketing, finance and organizational concepts.', degree: 'BBA', branch: 'General Management', subject: 'Business', difficulty: 'Easy', duration: 20, questions: 20, marks: 20, negativeMarking: 'No', attempts: '3 attempts', level: 'Beginner friendly', tags: ['Business', 'Management', 'BBA'] },
  { id: 'ai-ml-foundations', type: 'Competitive Quiz', title: 'AI & ML Foundations', description: 'Challenge yourself with machine learning concepts, data preparation and model fundamentals.', degree: 'B.Tech', branch: 'Artificial Intelligence & Machine Learning', subject: 'AI & ML', difficulty: 'Hard', duration: 30, questions: 30, marks: 30, negativeMarking: '0.25 per wrong answer', attempts: '1 attempt', level: 'Advanced', tags: ['AI', 'ML', 'Data Science'] },
]

const catalogueFilters = {
  degree: ['All degrees', ...degreeOptions],
  type: ['All types', 'Practice Quiz', 'Subject Test', 'Placement Test', 'Competitive Quiz'],
  subject: ['All subjects', 'Java', 'DSA', 'DBMS', 'Operating Systems', 'Web Development', 'Aptitude', 'Business', 'AI & ML'],
  difficulty: ['All levels', 'Easy', 'Medium', 'Hard', 'Mixed'],
  duration: ['Any duration', 'Under 20 min', '20–25 min', '26–30 min'],
}


const quizQuestions = {
  'java-fundamentals': [
    { id: 'q1', text: 'Which keyword is used to inherit a class in Java?', options: ['implements', 'extends', 'inherits', 'super'] },
    { id: 'q2', text: 'Which data type stores a single 16-bit Unicode character?', options: ['byte', 'char', 'short', 'String'] },
    { id: 'q3', text: 'Which loop is guaranteed to execute its body at least once?', options: ['for', 'while', 'do-while', 'enhanced for'] },
    { id: 'q4', text: 'Which method is the entry point of a standard Java application?', options: ['start()', 'run()', 'main()', 'execute()'] },
    { id: 'q5', text: 'Which collection does not allow duplicate elements?', options: ['List', 'Set', 'Queue', 'ArrayList'] },
  ],
  'dsa-java': [
    { id: 'q1', text: 'Which data structure follows LIFO order?', options: ['Queue', 'Stack', 'Linked List', 'Heap'] },
    { id: 'q2', text: 'What is the average time complexity of binary search on a sorted array?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'] },
    { id: 'q3', text: 'Which traversal visits a binary search tree in sorted order?', options: ['Preorder', 'Postorder', 'Inorder', 'Level order'] },
    { id: 'q4', text: 'Which sorting algorithm is stable in its standard implementation?', options: ['Selection sort', 'Merge sort', 'Heap sort', 'Quick sort'] },
    { id: 'q5', text: 'Which structure is commonly used for breadth-first search?', options: ['Stack', 'Queue', 'Set only', 'Recursion stack'] },
  ],
  'dbms-core': [
    { id: 'q1', text: 'Which key uniquely identifies a row in a relational table?', options: ['Foreign key', 'Primary key', 'Candidate value', 'Index only'] },
    { id: 'q2', text: 'Which normal form removes partial dependency?', options: ['1NF', '2NF', '3NF', 'BCNF'] },
    { id: 'q3', text: 'Which SQL command is used to retrieve data?', options: ['GET', 'SELECT', 'FETCHROW', 'READ'] },
    { id: 'q4', text: 'A foreign key primarily establishes what?', options: ['Sorting', 'A relationship between tables', 'Encryption', 'Compression'] },
    { id: 'q5', text: 'Which property means a transaction is treated as an indivisible unit?', options: ['Consistency', 'Isolation', 'Atomicity', 'Durability'] },
  ],
}

const initialProfile = {
  name: '',
  rollNumber: '',
  mobile: '',
  email: '',
  college: '',
  degree: '',
  branch: '',
  semesterYear: '',
  city: '',
  state: '',
  bio: '',
}

function readProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...initialProfile, ...JSON.parse(stored) } : null
  } catch {
    return null
  }
}

function getPath() {
  return window.location.pathname.replace(/\/+$/, '') || '/'
}


const ADMIN_TOKEN_KEY = 'apnaAcademyQuiz.adminToken'

async function adminRequest(path, options = {}) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  return apiRequest('/api/v1/admin' + path, {
    ...options,
    headers: { ...(options.headers || {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
  })
}

function AdminLoginPage() {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  async function submit(e){
    e.preventDefault(); setError(''); setLoading(true)
    try{
      const payload=await apiRequest('/api/v1/admin/auth/login',{method:'POST',body:JSON.stringify({email,password})})
      localStorage.setItem(ADMIN_TOKEN_KEY,payload.data.token)
      window.location.href='/admin/dashboard'
    }catch(err){setError(err.message)}finally{setLoading(false)}
  }
  return <div className="admin-app"><div className="admin-login-card"><div className="admin-brand">A<span>Q</span></div><p className="section-label">Secure administration</p><h1>Quiz Admin</h1><p>Manage quizzes, questions and student performance from one protected workspace.</p><form onSubmit={submit} className="admin-form"><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label>{error&&<div className="admin-error" role="alert">{error}</div>}<button className="button button-primary button-large" disabled={loading}>{loading?'Signing in…':'Sign in'}</button></form></div></div>
}

function AdminShell({children,active='dashboard'}){
  function logout(){localStorage.removeItem(ADMIN_TOKEN_KEY);window.location.href='/admin/login'}
  const links=[['dashboard','Dashboard','/admin/dashboard'],['quizzes','Quizzes','/admin/quizzes'],['questions','Question Bank','/admin/questions'],['participants','Participants','/admin/participants'],['attempts','Attempts','/admin/attempts'],['results','Results','/admin/results'],['leaderboard','Leaderboard','/leaderboard']]
  return <div className="admin-app"><aside className="admin-sidebar"><a className="admin-logo" href="/admin/dashboard"><span>A</span> Apna Academy Quiz</a><nav>{links.map(([key,label,href])=><a key={key} className={active===key?'active':''} href={href}>{label}</a>)}</nav><button className="admin-logout" onClick={logout}>Sign out</button></aside><main className="admin-content">{children}</main></div>
}

function useAdminGuard(){
  const [state,setState]=useState({loading:true,ok:false})
  useEffect(()=>{adminRequest('/auth/me').then(()=>setState({loading:false,ok:true})).catch(()=>{localStorage.removeItem(ADMIN_TOKEN_KEY);setState({loading:false,ok:false})})},[])
  return state
}

function AdminPage({active='dashboard',children}){
  const auth=useAdminGuard()
  if(auth.loading) return <div className="admin-loading">Checking admin session…</div>
  if(!auth.ok){window.location.href='/admin/login';return null}
  return <AdminShell active={active}>{children}</AdminShell>
}

function AdminDashboardPage(){
  const [data,setData]=useState(null),[error,setError]=useState('')
  useEffect(()=>{adminRequest('/dashboard').then(r=>setData(r.data)).catch(e=>setError(e.message))},[])
  return <AdminPage><div className="admin-heading"><div><p className="section-label">Overview</p><h1>Quiz operations</h1><p>Monitor content, participants and completed attempts.</p></div><a className="button button-primary" href="/admin/quizzes/new">Create quiz +</a></div>{error&&<div className="admin-error">{error}</div>}{data&&<div className="admin-stat-grid">{Object.entries(data.counts).map(([k,v])=><div className="admin-stat" key={k}><span>{k.replace(/([A-Z])/g,' $1')}</span><strong>{v}</strong></div>)}</div>}<div className="admin-panel"><h2>Phase 11 controls</h2><p>Publishing, question authoring, participant review and result inspection are protected by server-side admin authorization. Active attempts keep their immutable question snapshots.</p></div></AdminPage>
}

const emptyQuizForm={slug:'',title:'',description:'',type:'Practice Quiz',degree:'B.Tech',branch:'Computer Science & Engineering',subject:'',difficulty:'Easy',durationSeconds:1200,marks:20,negativeMarks:0,maxAttempts:1,passingPercentage:40,shuffleQuestions:false,shuffleOptions:false,allowReview:true,showExplanations:true,resultMode:'immediate',tags:[],isPublished:false}
function AdminQuizFormPage({quizId=null}){
  const [form,setForm]=useState(emptyQuizForm),[loading,setLoading]=useState(Boolean(quizId)),[saving,setSaving]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(false)
  useEffect(()=>{if(!quizId)return;adminRequest('/quizzes/'+quizId).then(r=>setForm({...r.data.quiz,tags:r.data.quiz.tags||[]})).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[quizId])
  function change(e){const {name,value,type,checked}=e.target;setForm(f=>({...f,[name]:type==='checkbox'?checked:['durationSeconds','marks','negativeMarks','maxAttempts'].includes(name)?Number(value):value}))}
  async function submit(e){e.preventDefault();setSaving(true);setError('');try{const method=quizId?'PATCH':'POST',path=quizId?'/quizzes/'+quizId:'/quizzes';const r=await adminRequest(path,{method,body:JSON.stringify({...form,tags:typeof form.tags==='string'?form.tags.split(',').map(x=>x.trim()).filter(Boolean):form.tags})});setDone(true);if(!quizId)window.location.href='/admin/quizzes/'+r.data.quiz.id}catch(err){setError(err.message)}finally{setSaving(false)}}
  if(loading)return <AdminPage>Loading quiz…</AdminPage>
  return <AdminPage active="quizzes"><div className="admin-heading"><div><p className="section-label">Quiz authoring</p><h1>{quizId?'Edit quiz':'Create quiz'}</h1><p>Configure the public quiz metadata and publishing state.</p></div><a className="button button-secondary" href="/admin/quizzes">Back</a></div><form className="admin-panel admin-form admin-wide-form" onSubmit={submit}><div className="admin-form-grid">{[['slug','Slug'],['title','Title'],['subject','Subject'],['degree','Degree'],['branch','Branch']].map(([n,l])=><label key={n}>{l}<input name={n} value={form[n]} onChange={change} required/></label>)}<label>Type<select name="type" value={form.type} onChange={change}>{['Practice Quiz','Subject Test','Placement Test','Competitive Quiz','Mock Test','College Test','Certification Test','Live Quiz'].map(x=><option key={x}>{x}</option>)}</select></label><label>Difficulty<select name="difficulty" value={form.difficulty} onChange={change}>{['Easy','Medium','Hard','Mixed'].map(x=><option key={x}>{x}</option>)}</select></label><label>Duration (seconds)<input type="number" name="durationSeconds" min="60" value={form.durationSeconds} onChange={change}/></label><label>Total marks<input type="number" name="marks" min="1" value={form.marks} onChange={change}/></label><label>Negative marks<input type="number" step="0.01" name="negativeMarks" min="0" value={form.negativeMarks} onChange={change}/></label><label>Max attempts<input type="number" name="maxAttempts" min="1" value={form.maxAttempts} onChange={change}/></label><label>Pass percentage<input type="number" name="passingPercentage" min="0" max="100" value={form.passingPercentage} onChange={change}/></label><label className="check-field"><input type="checkbox" name="shuffleQuestions" checked={form.shuffleQuestions} onChange={change}/> Shuffle questions</label><label className="check-field"><input type="checkbox" name="shuffleOptions" checked={form.shuffleOptions} onChange={change}/> Shuffle options</label><label className="check-field"><input type="checkbox" name="allowReview" checked={form.allowReview} onChange={change}/> Allow review</label><label className="check-field"><input type="checkbox" name="showExplanations" checked={form.showExplanations} onChange={change}/> Show answer explanations</label><label>Result mode<select name="resultMode" value={form.resultMode} onChange={change}><option value="immediate">Immediate</option><option value="manual">Manual</option></select></label><label className="check-field"><input type="checkbox" name="isPublished" checked={form.isPublished} onChange={change}/> Published</label></div><label>Description<textarea name="description" value={form.description} onChange={change} rows="5" required/></label><label>Tags<input name="tags" value={Array.isArray(form.tags)?form.tags.join(', '):form.tags} onChange={change} placeholder="Java, Programming, Fundamentals"/></label>{error&&<div className="admin-error">{error}</div>}{done&&<div className="admin-success">Quiz saved successfully.</div>}<div className="admin-actions"><button className="button button-primary" disabled={saving}>{saving?'Saving…':'Save quiz'}</button></div></form></AdminPage>
}

function AdminQuizzesPage(){
  const [quizzes,setQuizzes]=useState([]),[search,setSearch]=useState(''),[error,setError]=useState('')
  const load=()=>adminRequest('/quizzes?search='+encodeURIComponent(search)).then(r=>setQuizzes(r.data.quizzes)).catch(e=>setError(e.message))
  useEffect(()=>{load()},[])
  async function toggle(q){try{await adminRequest('/quizzes/'+q.id,{method:'PATCH',body:JSON.stringify({isPublished:!q.isPublished})});load()}catch(e){setError(e.message)}}
  return <AdminPage active="quizzes"><div className="admin-heading"><div><p className="section-label">Content</p><h1>Quizzes</h1><p>Create, edit, publish or unpublish tests.</p></div><a className="button button-primary" href="/admin/quizzes/new">New quiz</a></div><div className="admin-toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title, slug or subject"/><button className="button button-secondary" onClick={load}>Search</button></div>{error&&<div className="admin-error">{error}</div>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Quiz</th><th>Type</th><th>Questions</th><th>Status</th><th>Actions</th></tr></thead><tbody>{quizzes.map(q=><tr key={q.id}><td><strong>{q.title}</strong><small>{q.slug}</small></td><td>{q.type}</td><td>{q.questionCount}</td><td><span className={q.isPublished?'admin-status live':'admin-status'}>{q.isPublished?'Published':'Draft'}</span></td><td><a className="table-link" href={'/admin/quizzes/'+q.id}>Edit</a><button className="table-link" onClick={()=>toggle(q)}>{q.isPublished?'Unpublish':'Publish'}</button><a className="table-link" href={'/admin/questions?quizId='+q.id}>Questions</a></td></tr>)}</tbody></table></div></AdminPage>
}

function QuestionEditor({quizId}){
  const blank={position:1,topic:'',text:'',options:[{key:'A',text:''},{key:'B',text:''},{key:'C',text:''},{key:'D',text:''}],correctOption:'A',marks:1,explanation:'',isActive:true}
  const [questions,setQuestions]=useState([]),[form,setForm]=useState(blank),[editing,setEditing]=useState(null),[error,setError]=useState(''),[saving,setSaving]=useState(false)
  const load=()=>adminRequest('/quizzes/'+quizId+'/questions').then(r=>setQuestions(r.data.questions)).catch(e=>setError(e.message))
  useEffect(()=>{load()},[quizId])
  function setOption(key,value){setForm(f=>({...f,options:f.options.map(o=>o.key===key?{...o,text:value}:o)}))}
  async function save(e){e.preventDefault();setSaving(true);setError('');try{const path=editing?'/questions/'+editing:'/quizzes/'+quizId+'/questions';const method=editing?'PATCH':'POST';await adminRequest(path,{method,body:JSON.stringify(form)});setForm(blank);setEditing(null);load()}catch(e){setError(e.message)}finally{setSaving(false)}}
  function edit(q){setEditing(q.id);setForm({...q,options:q.options.map(o=>({...o}))})}
  async function deactivate(id){if(!confirm('Deactivate this question? Existing attempts remain unchanged.'))return;try{await adminRequest('/questions/'+id,{method:'DELETE'});load()}catch(e){setError(e.message)}}
  return <div className="admin-question-layout"><form className="admin-panel admin-form" onSubmit={save}><h2>{editing?'Edit question':'Add question'}</h2><label>Position<input type="number" min="1" value={form.position} onChange={e=>setForm({...form,position:Number(e.target.value)})} required/></label><label>Topic<input value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}/></label><label>Question<textarea rows="4" value={form.text} onChange={e=>setForm({...form,text:e.target.value})} required/></label><div className="option-grid">{form.options.map(o=><label key={o.key}>Option {o.key}<input value={o.text} onChange={e=>setOption(o.key,e.target.value)} required={o.key<'C'}/></label>)}</div><label>Correct option<select value={form.correctOption} onChange={e=>setForm({...form,correctOption:e.target.value})}>{form.options.filter(o=>o.text.trim()).map(o=><option key={o.key}>{o.key}</option>)}</select></label><label>Marks<input type="number" min="0" step="0.25" value={form.marks} onChange={e=>setForm({...form,marks:Number(e.target.value)})}/></label><label>Explanation<textarea rows="3" value={form.explanation} onChange={e=>setForm({...form,explanation:e.target.value})}/></label>{error&&<div className="admin-error">{error}</div>}<div className="admin-actions"><button className="button button-primary" disabled={saving}>{saving?'Saving…':editing?'Update question':'Add question'}</button>{editing&&<button type="button" className="button button-secondary" onClick={()=>{setEditing(null);setForm(blank)}}>Cancel</button>}</div></form><div className="admin-panel"><div className="panel-heading"><h2>Question bank</h2><span>{questions.length} total</span></div><div className="question-admin-list">{questions.map(q=><article key={q.id} className={'question-admin-item '+(!q.isActive?'inactive':'')}><div><span>Q{q.position} · {q.topic||'General'}</span><strong>{q.text}</strong><small>Correct: {q.correctOption} · {q.marks} mark{q.marks===1?'':'s'}{q.isActive?'':' · inactive'}</small></div><div><button className="table-link" onClick={()=>edit(q)}>Edit</button>{q.isActive&&<button className="table-link danger-link" onClick={()=>deactivate(q.id)}>Deactivate</button>}</div></article>)}</div></div></div>
}

function AdminQuestionsPage(){
  const [quizzes,setQuizzes]=useState([]),[selected,setSelected]=useState('')
  useEffect(()=>{adminRequest('/quizzes').then(r=>{setQuizzes(r.data.quizzes);if(r.data.quizzes[0])setSelected(r.data.quizzes[0].id)}).catch(()=>{})},[])
  const query=new URLSearchParams(window.location.search).get('quizId')
  useEffect(()=>{if(query)setSelected(query)},[query])
  return <AdminPage active="questions"><div className="admin-heading"><div><p className="section-label">Authoring</p><h1>Question Bank</h1><p>Edit questions without changing completed attempt snapshots.</p></div><select className="admin-select" value={selected} onChange={e=>setSelected(e.target.value)}>{quizzes.map(q=><option key={q.id} value={q.id}>{q.title}</option>)}</select></div>{selected?<QuestionEditor quizId={selected}/>:<div className="admin-panel">Create a quiz first.</div>}</AdminPage>
}

function AdminDataPage({type}){
  const [data,setData]=useState([]),[error,setError]=useState(''),[search,setSearch]=useState('')
  const endpoints={participants:'/participants',attempts:'/attempts',results:'/results'}
  const load=()=>adminRequest(endpoints[type]+(type==='participants'&&search?'?search='+encodeURIComponent(search):'')).then(r=>setData(r.data[type])).catch(e=>setError(e.message))
  useEffect(()=>{load()},[type])
  return <AdminPage active={type}><div className="admin-heading"><div><p className="section-label">Operations</p><h1>{type.charAt(0).toUpperCase()+type.slice(1)}</h1><p>Protected operational data for Quiz administrators.</p></div></div>{type==='participants'&&<div className="admin-toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, roll or college"/><button className="button button-secondary" onClick={load}>Search</button></div>}{error&&<div className="admin-error">{error}</div>}<div className="admin-table-wrap"><table className="admin-table">{type==='participants'?<><thead><tr><th>Name</th><th>Email</th><th>College</th><th>Degree</th><th>Created</th></tr></thead><tbody>{data.map(p=><tr key={p.id}><td>{p.name}<small>{p.rollNumber}</small></td><td>{p.email}<small>{p.mobile}</small></td><td>{p.college}</td><td>{p.degree} · {p.branch}</td><td>{new Date(p.createdAt).toLocaleDateString()}</td></tr>)}</tbody></>:<><thead><tr><th>Student</th><th>Quiz</th><th>Status</th><th>Score</th><th>Percentage</th><th>Submitted</th></tr></thead><tbody>{data.map(x=><tr key={x.id||x.attemptId}><td>{x.participant?.name||'—'}<small>{x.participant?.email||''}</small></td><td>{x.quiz?.title||'—'}</td><td><span className="admin-status">{x.status}</span></td><td>{x.result?.score ?? '—'}</td><td>{x.result?.percentage != null ? x.result.percentage+'%' : '—'}</td><td>{x.submittedAt?new Date(x.submittedAt).toLocaleString():'—'}</td></tr>)}</tbody></>}</table></div></AdminPage>
}
function App() {
  const [path] = useState(getPath)
  const profile = readProfile()
  if (path === '/admin/login') return <AdminLoginPage />
  if (path === '/admin' || path === '/admin/dashboard') return <AdminDashboardPage />
  if (path === '/admin/quizzes') return <AdminQuizzesPage />
  if (path === '/admin/quizzes/new') return <AdminQuizFormPage />
  if (path.startsWith('/admin/quizzes/')) return <AdminQuizFormPage quizId={path.split('/')[3]} />
  if (path === '/admin/questions') return <AdminQuestionsPage />
  if (path === '/admin/participants') return <AdminDataPage type="participants" />
  if (path === '/admin/attempts') return <AdminDataPage type="attempts" />
  if (path === '/admin/results') return <AdminDataPage type="results" />
  if (path === '/register') return <RegistrationPage existingProfile={profile} />
  if (path === '/profile') return <ProfilePage profile={profile} />
  if (path === '/quizzes') return <QuizCataloguePage />
  if (path.startsWith('/quizzes/')) return <QuizDetailsPage quizId={path.split('/')[2]} profile={profile} />
  if (path.startsWith('/quiz/')) return <QuizEnginePage quizSlug={path.split('/')[2]} profile={profile} />
  if (path.startsWith('/result/')) return <ResultPage attemptId={path.split('/')[2]} profile={profile} />
  if (path === '/results') return <ResultsHistoryPage profile={profile} />
  if (path === '/leaderboard') return <LeaderboardPage profile={profile} />
  return <LandingPage />
}

function SiteHeader({ profile }) {
  return (
    <header className="site-header">
      <div className="shell-container nav-inner">
        <a className="brand" href="/" aria-label="Apna Academy Quiz home">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span className="brand-copy"><strong>Apna Academy</strong><span>Quiz</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a className="nav-link" href="/">Home</a>
          <a className="nav-link" href="/quizzes">Quizzes</a>
          <a className="nav-link" href="/results">Results</a>
          <a className="nav-link" href="/leaderboard">Leaderboard</a>
        </nav>
        <div className="nav-actions">
          <a className="button button-ghost nav-profile" href={profile ? '/profile' : '/register'}>
            {profile ? 'Profile' : 'Register'}
          </a>
          <a className="button button-primary" href="/quizzes">Explore quizzes <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell-container footer-inner">
        <div><strong>Apna Academy Quiz</strong><p>Practice with purpose. Measure your progress.</p></div>
        <div className="footer-links"><a href="/about">About</a><a href="/help">Help</a><a href="/privacy">Privacy</a></div>
        <p className="copyright">© 2026 Apna Academy. All rights reserved.</p>
      </div>
    </footer>
  )
}

function LandingPage() {
  const profile = readProfile()
  const motionRoot = useRef(null)

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const mm = gsap.matchMedia()
    mm.add({ isDesktop: '(min-width: 901px)', isMobile: '(max-width: 900px)' }, (context) => {
      const { isDesktop } = context.conditions
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro.from('.site-header .brand, .site-header .desktop-nav .nav-link, .site-header .nav-actions', { y: -18, autoAlpha: 0, duration: 0.65, stagger: 0.05 })
        .from('.hero-copy > *', { y: 28, autoAlpha: 0, duration: 0.72, stagger: 0.08 }, '-=0.35')
        .from('.hero-visual', { x: isDesktop ? 36 : 0, y: isDesktop ? 0 : 24, scale: 0.96, autoAlpha: 0, duration: 0.9 }, '-=0.55')

      gsap.to('.hero-orb-one', { x: 18, y: -16, duration: 4.5, ease: 'sine.inOut', repeat: -1, yoyo: true })
      gsap.to('.hero-orb-two', { x: -14, y: 20, duration: 5.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.4 })
      gsap.to('.score-float', { y: -10, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true })

      gsap.utils.toArray('.section-block, .process-section, .benefits-section, .leaderboard-preview, .final-cta').forEach((section) => {
        gsap.from(section, { y: 42, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 82%', once: true } })
      })
      gsap.utils.toArray('.category-card, .quiz-card, .step, .benefit-points > div').forEach((item, index) => {
        gsap.from(item, { y: 24, autoAlpha: 0, duration: 0.65, delay: (index % 4) * 0.06, ease: 'power2.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } })
      })

      if (isDesktop) {
        const visual = document.querySelector('.hero-visual')
        if (visual) {
          const move = (event) => {
            const rect = visual.getBoundingClientRect()
            const x = (event.clientX - rect.left) / rect.width - 0.5
            const y = (event.clientY - rect.top) / rect.height - 0.5
            gsap.to('.quiz-preview-card', { rotateY: x * 5, rotateX: y * -4, duration: 0.45, overwrite: true, ease: 'power2.out' })
          }
          const reset = () => gsap.to('.quiz-preview-card', { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' })
          visual.addEventListener('pointermove', move)
          visual.addEventListener('pointerleave', reset)
          return () => {
            visual.removeEventListener('pointermove', move)
            visual.removeEventListener('pointerleave', reset)
          }
        }
      }
      return undefined
    })
    return () => mm.revert()
  }, { scope: motionRoot })

  return (
    <div ref={motionRoot} className="quiz-app">
      <SiteHeader profile={profile} />
      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="shell-container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />Built for student learning</div>
              <p className="kicker">Learn · Test · Compete · Improve</p>
              <h1 id="hero-title">Turn every quiz into a <span>better next attempt.</span></h1>
              <p className="hero-intro">Practice your subjects, test your preparation and understand your performance — all in one focused quiz platform.</p>
              <div className="action-row">
                <a className="button button-primary button-large" href="/quizzes">Explore quizzes <span aria-hidden="true">→</span></a>
                <a className="button button-secondary button-large" href={profile ? '/profile' : '/register'}>{profile ? 'View profile' : 'Create student profile'}</a>
              </div>
              <div className="hero-trust" aria-label="Platform benefits">
                <span>✓ Timed tests</span><span>✓ Instant results</span><span>✓ Performance insights</span>
              </div>
            </div>
            <div className="hero-visual" aria-label="Quiz experience preview">
                            <div className="hero-orb hero-orb-one" aria-hidden="true" />
              <div className="hero-orb hero-orb-two" aria-hidden="true" />
              <div className="quiz-preview-card">
                <div className="preview-top"><span>Java Fundamentals</span><span className="preview-live">Practice</span></div>
                <div className="preview-progress"><span style={{ width: '62%' }} /></div>
                <div className="preview-meta"><span>Question 12 of 20</span><strong>08:42</strong></div>
                <p className="preview-question">Which keyword is used to inherit a class in Java?</p>
                <div className="preview-options">
                  <div>A. implements</div>
                  <div className="preview-option-selected">B. extends <span>✓</span></div>
                  <div>C. inherits</div>
                  <div>D. super</div>
                </div>
                <div className="preview-footer"><span>6 answered · 2 marked</span><span>Next →</span></div>
              </div>
              <div className="score-float"><span>Latest result</span><strong>84%</strong><small>+12% improvement</small></div>
            </div>
          </div>
        </section>

        <section className="section-block" aria-labelledby="categories-title">
          <div className="shell-container">
            <div className="section-heading"><div><p className="section-label">Find your path</p><h2 id="categories-title">Quizzes for where you are learning.</h2></div><a className="text-link" href="/quizzes">View all quizzes →</a></div>
            <div className="category-grid">
              {categories.map((category) => (
                <a className="category-card" href="/quizzes" key={category.label}>
                  <span className="category-index">{category.icon}</span>
                  <span><strong>{category.label}</strong><small>{category.detail}</small></span>
                  <span className="card-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block featured-section" aria-labelledby="featured-title">
          <div className="shell-container">
            <div className="section-heading"><div><p className="section-label">Start practicing</p><h2 id="featured-title">Popular quiz formats, ready when you are.</h2></div><a className="text-link" href="/quizzes">Browse catalogue →</a></div>
            <div className="featured-grid">
              {featuredQuizzes.map((quiz) => (
                <article className="quiz-card" key={quiz.title}>
                  <div className="quiz-card-top"><span className="soft-badge">{quiz.type}</span><span className="quiz-level">{quiz.level}</span></div>
                  <h3>{quiz.title}</h3>
                  <p>{quiz.meta}</p>
                  <a href="/quizzes" className="quiz-card-link">View quiz details <span aria-hidden="true">→</span></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <div className="shell-container">
            <div className="process-intro"><p className="section-label">Simple by design</p><h2 id="process-title">Three steps from practice to progress.</h2><p>No complicated setup. Pick a quiz, focus on the questions, then use your result to decide what to do next.</p></div>
            <div className="steps-list">
              {steps.map(([number, title, description]) => (
                <div className="step" key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>
              ))}
            </div>
          </div>
        </section>

        <section className="benefits-section" aria-labelledby="benefits-title">
          <div className="shell-container benefits-grid">
            <div><p className="section-label">Built around improvement</p><h2 id="benefits-title">A quiz should tell you more than a score.</h2><p className="benefits-copy">Every attempt is designed to help you understand accuracy, strengths and gaps so your next study session has a clear direction.</p></div>
            <div className="benefit-points">
              <div><strong>Focused attempts</strong><span>Clear questions, progress and timing without unnecessary distraction.</span></div>
              <div><strong>Useful results</strong><span>See correct, incorrect, skipped and accuracy signals after submission.</span></div>
              <div><strong>Fair competition</strong><span>Compare performance through privacy-conscious leaderboards.</span></div>
            </div>
          </div>
        </section>

        <section className="leaderboard-preview" aria-labelledby="leaderboard-title">
          <div className="shell-container leaderboard-inner">
            <div><p className="section-label">Compete fairly</p><h2 id="leaderboard-title">Ready to see where you stand?</h2><p>Track your performance and compare results without exposing private contact details.</p></div>
            <a className="button button-light" href="/leaderboard">Open leaderboard <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <section className="final-cta" aria-labelledby="cta-title">
          <div className="shell-container cta-card">
            <p className="section-label">Your next attempt starts here</p>
            <h2 id="cta-title">Choose a quiz. Test yourself. Improve.</h2>
            <p>Start with a subject you know, or challenge yourself with something new.</p>
            <a className="button button-primary button-large" href="/quizzes">Explore all quizzes <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}


function QuizCataloguePage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ degree: 'All degrees', type: 'All types', subject: 'All subjects', difficulty: 'All levels', duration: 'Any duration' })

  const filteredQuizzes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return quizCatalogue.filter((quiz) => {
      const matchesQuery = !normalizedQuery || [quiz.title, quiz.description, quiz.subject, quiz.type, ...quiz.tags].join(' ').toLowerCase().includes(normalizedQuery)
      const matchesDegree = filters.degree === 'All degrees' || quiz.degree === filters.degree
      const matchesType = filters.type === 'All types' || quiz.type === filters.type
      const matchesSubject = filters.subject === 'All subjects' || quiz.subject === filters.subject
      const matchesDifficulty = filters.difficulty === 'All levels' || quiz.difficulty === filters.difficulty
      const matchesDuration = filters.duration === 'Any duration'
        || (filters.duration === 'Under 20 min' && quiz.duration < 20)
        || (filters.duration === '20–25 min' && quiz.duration >= 20 && quiz.duration <= 25)
        || (filters.duration === '26–30 min' && quiz.duration >= 26 && quiz.duration <= 30)
      return matchesQuery && matchesDegree && matchesType && matchesSubject && matchesDifficulty && matchesDuration
    })
  }, [filters, query])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function resetFilters() {
    setQuery('')
    setFilters({ degree: 'All degrees', type: 'All types', subject: 'All subjects', difficulty: 'All levels', duration: 'Any duration' })
  }

  return (
    <div className="quiz-app">
      <SiteHeader profile={readProfile()} />
      <main className="catalogue-main">
        <section className="catalogue-hero">
          <div className="shell-container">
            <p className="section-label">Quiz catalogue</p>
            <h1>Find the right quiz for your next goal.</h1>
            <p>Search by subject, filter by your academic path and choose a focused test that matches your preparation level.</p>
            <label className="catalogue-search">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Java, DSA, aptitude, DBMS..." aria-label="Search quizzes" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
            </label>
          </div>
        </section>

        <section className="catalogue-content" aria-labelledby="catalogue-results-title">
          <div className="shell-container catalogue-layout">
            <aside className="filter-panel" aria-label="Quiz filters">
              <div className="filter-heading"><div><strong>Filter quizzes</strong><span>Refine your search</span></div><button type="button" onClick={resetFilters}>Reset</button></div>
              {Object.entries(catalogueFilters).map(([name, options]) => (
                <label className="filter-field" key={name}>
                  <span>{name === 'degree' ? 'Degree' : name === 'type' ? 'Quiz type' : name === 'subject' ? 'Subject' : name === 'difficulty' ? 'Difficulty' : 'Duration'}</span>
                  <select value={filters[name]} onChange={(event) => updateFilter(name, event.target.value)}>
                    {options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </aside>

            <div className="catalogue-results">
              <div className="results-heading">
                <div><p className="section-label">Explore</p><h2 id="catalogue-results-title">{filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'} available</h2></div>
                <span>{query ? 'Search results' : 'Curated for students'}</span>
              </div>
              {filteredQuizzes.length > 0 ? (
                <div className="catalogue-grid">
                  {filteredQuizzes.map((quiz) => <QuizCard quiz={quiz} key={quiz.id} />)}
                </div>
              ) : (
                <div className="catalogue-empty">
                  <span>⌕</span><h3>No quizzes match these filters.</h3><p>Try a different subject, degree or difficulty, or reset the filters.</p><button className="button button-secondary" type="button" onClick={resetFilters}>Clear filters</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function QuizCard({ quiz }) {
  return (
    <article className="catalogue-card">
      <div className="catalogue-card-top"><span className="soft-badge">{quiz.type}</span><span className="quiz-level">{quiz.difficulty}</span></div>
      <h3>{quiz.title}</h3>
      <p className="catalogue-description">{quiz.description}</p>
      <div className="quiz-meta-grid">
        <span><b>{quiz.questions}</b> Questions</span><span><b>{quiz.duration}</b> Minutes</span><span><b>{quiz.marks}</b> Marks</span>
      </div>
      <div className="catalogue-tags">{quiz.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
      <a className="button button-primary catalogue-card-button" href={`/quizzes/${quiz.id}`}>View details <span aria-hidden="true">→</span></a>
    </article>
  )
}

function QuizDetailsPage({ quizId, profile }) {
  const quiz = quizCatalogue.find((item) => item.id === quizId)

  if (!quiz) {
    return (
      <div className="quiz-app">
        <SiteHeader profile={profile} />
        <main className="account-main"><section className="account-shell"><div className="empty-account"><p className="section-label">Quiz not found</p><h1>This quiz is no longer available.</h1><p>Return to the catalogue to explore the currently available tests.</p><a className="button button-primary button-large" href="/quizzes">Browse quizzes <span aria-hidden="true">→</span></a></div></section></main>
        <SiteFooter />
      </div>
    )
  }

  const startHref = profile ? `/quiz/${quiz.id}` : '/register'

  return (
    <div className="quiz-app">
      <SiteHeader profile={profile} />
      <main className="quiz-details-main">
        <section className="details-hero">
          <div className="shell-container details-hero-grid">
            <div>
              <a className="back-link" href="/quizzes">← Back to quizzes</a>
              <div className="details-badges"><span className="soft-badge">{quiz.type}</span><span>{quiz.difficulty}</span></div>
              <h1>{quiz.title}</h1>
              <p>{quiz.description}</p>
              <div className="details-tags">{quiz.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
            <div className="details-start-card">
              <div className="start-stat"><span>Questions</span><strong>{quiz.questions}</strong></div>
              <div className="start-stat"><span>Duration</span><strong>{quiz.duration} min</strong></div>
              <div className="start-stat"><span>Total marks</span><strong>{quiz.marks}</strong></div>
              <a className="button button-primary button-large" href={startHref}>{profile ? 'Continue to quiz' : 'Register to continue'} <span aria-hidden="true">→</span></a>
              {!profile && <small>Create your student profile before starting your first attempt.</small>}
            </div>
          </div>
        </section>

        <section className="details-body">
          <div className="shell-container details-body-grid">
            <article className="details-main-card">
              <p className="section-label">About this quiz</p>
              <h2>Know what to expect before you start.</h2>
              <p>This {quiz.type.toLowerCase()} is designed around focused questions and a clear time limit. Your final score will be calculated by the quiz system after submission in a later phase.</p>
              <div className="details-rule-grid">
                <div><span>Difficulty</span><strong>{quiz.difficulty}</strong></div>
                <div><span>Negative marking</span><strong>{quiz.negativeMarking}</strong></div>
                <div><span>Attempts</span><strong>{quiz.attempts}</strong></div>
                <div><span>Level</span><strong>{quiz.level}</strong></div>
              </div>
            </article>
            <aside className="details-side-card">
              <p className="section-label">Best for</p>
              <h3>{quiz.degree}</h3>
              <p>{quiz.branch}</p>
              <div><span>Subject</span><strong>{quiz.subject}</strong></div>
              <div><span>Result</span><strong>Shown after submission</strong></div>
              <a className="text-link" href="/quizzes">Explore similar quizzes →</a>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function QuizEnginePage({ quizSlug, profile }) {
  const [attempt, setAttempt] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [marked, setMarked] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [error, setError] = useState('')
  const storageKey = 'apnaAcademyQuiz.ui.' + quizSlug

  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (!profile) { setLoading(false); return }
      setLoading(true)
      setError('')
      try {
        const participantResponse = await apiRequest('/api/v1/participants', { method: 'POST', body: JSON.stringify(profile) })
        const participantId = participantResponse.data.participantId
        localStorage.setItem(PARTICIPANT_KEY, participantId)
        const quizResponse = await apiRequest('/api/v1/quizzes/' + encodeURIComponent(quizSlug))
        const quiz = quizResponse.data.quiz
        const startResponse = await apiRequest('/api/v1/attempts/start', { method: 'POST', body: JSON.stringify({ participantId, quizId: quiz.id }) })
        if (cancelled) return
        const nextAttempt = startResponse.data.attempt
        setAttempt(nextAttempt)
        try {
          const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null')
          if (saved) {
            setCurrentIndex(Math.min(saved.currentIndex || 0, Math.max(0, nextAttempt.questions.length - 1)))
            setMarked(saved.marked || {})
          }
        } catch {}
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    boot()
    return () => { cancelled = true }
  }, [profile?.email, quizSlug])

  useEffect(() => {
    if (!attempt?.expiresAt || ['SUBMITTED', 'EXPIRED'].includes(attempt.status)) return undefined
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000)))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [attempt?.expiresAt, attempt?.status])

  useEffect(() => {
    if (!attempt || submitting || ['SUBMITTED', 'EXPIRED'].includes(attempt.status)) return
    if (secondsLeft <= 0) setShowSubmit(true)
  }, [attempt, secondsLeft, submitting])

  useEffect(() => {
    if (!attempt) return
    sessionStorage.setItem(storageKey, JSON.stringify({ currentIndex, marked }))
  }, [attempt, currentIndex, marked, storageKey])

  if (!profile) {
    return <div className="quiz-app"><SiteHeader profile={null} /><main className="account-main"><section className="account-shell"><div className="empty-account"><p className="section-label">Registration required</p><h1>Create your student profile first.</h1><p>Your student profile is required before a secure server-backed attempt can start.</p><a className="button button-primary button-large" href="/register">Create profile <span aria-hidden="true">→</span></a></div></section></main><SiteFooter /></div>
  }

  if (loading) {
    return <div className="quiz-app"><SiteHeader profile={profile} /><main className="account-main"><section className="account-shell"><div className="empty-account"><p className="section-label">Preparing your attempt</p><h1>Loading your secure quiz room…</h1><p>The server is preparing your question snapshot and timer.</p></div></section></main><SiteFooter /></div>
  }

  if (error || !attempt || !attempt.questions?.length) {
    return <div className="quiz-app"><SiteHeader profile={profile} /><main className="account-main"><section className="account-shell"><div className="empty-account"><p className="section-label">Unable to start</p><h1>{error || 'No active questions are available.'}</h1><p>Please return to the quiz catalogue and try again.</p><a className="button button-primary button-large" href="/quizzes">Back to quizzes</a></div></section></main><SiteFooter /></div>
  }

  if (['SUBMITTED', 'EXPIRED'].includes(attempt.status)) {
    window.location.replace('/result/' + attempt.id)
    return null
  }

  const questions = attempt.questions
  const currentQuestion = questions[currentIndex]
  const currentAnswer = attempt.answers?.find((answer) => answer.questionId === currentQuestion.questionId)?.selectedOption
  const answeredCount = (attempt.answers || []).filter((answer) => answer.selectedOption).length
  const markedCount = Object.values(marked).filter(Boolean).length

  async function chooseAnswer(optionKey) {
    setError('')
    setAttempt((current) => ({ ...current, answers: [...(current.answers || []).filter((answer) => answer.questionId !== currentQuestion.questionId), { questionId: currentQuestion.questionId, selectedOption: optionKey }] }))
    try {
      await apiRequest('/api/v1/attempts/' + attempt.id + '/questions/' + currentQuestion.questionId, { method: 'PATCH', body: JSON.stringify({ selectedOption: optionKey }) })
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function goNext() { setCurrentIndex((current) => Math.min(current + 1, questions.length - 1)) }
  function goPrevious() { setCurrentIndex((current) => Math.max(current - 1, 0)) }
  function toggleMarked() { if (attempt.allowReview === false) return; setMarked((current) => ({ ...current, [currentQuestion.questionId]: !current[currentQuestion.questionId] })) }

  async function submitAttempt() {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const response = await apiRequest('/api/v1/attempts/' + attempt.id + '/submit', { method: 'POST', body: JSON.stringify({}) })
      sessionStorage.removeItem(storageKey)
      window.location.replace('/result/' + response.data.result.attemptId)
    } catch (requestError) {
      setError(requestError.message)
      setSubmitting(false)
      setShowSubmit(false)
    }
  }

  return (
    <div className="quiz-app quiz-room-app">
      <SiteHeader profile={profile} />
      <main className="quiz-room-main">
        <section className="quiz-room-header"><div className="shell-container"><div className="quiz-room-title"><div><p className="section-label">Secure server attempt</p><h1>Quiz in progress</h1></div><div className={secondsLeft <= 60 ? 'timer timer-warning' : 'timer'} aria-label={'Time remaining ' + formatDuration(secondsLeft)}><span>Time left</span><strong>{formatDuration(secondsLeft)}</strong></div></div><div className="quiz-room-progress"><span style={{ width: ((currentIndex + 1) / questions.length) * 100 + '%' }} /></div><div className="quiz-room-progress-meta"><span>Question {currentIndex + 1} of {questions.length}</span><span>{answeredCount} answered · {markedCount} marked</span></div></div></section>
        <section className="quiz-room-content"><div className="shell-container quiz-room-grid">
          <aside className="question-palette" aria-label="Question navigation"><div className="palette-heading"><strong>Questions</strong><span>{answeredCount}/{questions.length}</span></div><div className="palette-grid">{questions.map((question, index) => { const answered = Boolean(attempt.answers?.find((answer) => answer.questionId === question.questionId)?.selectedOption); const isMarked = Boolean(marked[question.questionId]); const active = index === currentIndex; return <button key={question.questionId} type="button" className={'palette-button' + (active ? ' is-active' : '') + (answered ? ' is-answered' : '') + (isMarked ? ' is-marked' : '')} onClick={() => setCurrentIndex(index)} aria-label={'Question ' + (index + 1) + (answered ? ', answered' : '') + (isMarked ? ', marked for review' : '')}>{index + 1}</button> })}</div><div className="palette-legend"><span><i className="legend-current" />Current</span><span><i className="legend-answered" />Answered</span><span><i className="legend-marked" />Review</span></div></aside>
          <article className="question-card" aria-labelledby={'question-' + currentQuestion.questionId}><div className="question-card-top"><span>Question {currentIndex + 1}</span>{marked[currentQuestion.questionId] && <span className="review-badge">Marked for review</span>}</div><h2 id={'question-' + currentQuestion.questionId}>{currentQuestion.text}</h2><div className="answer-list">{currentQuestion.options.map((option) => { const selected = currentAnswer === option.key; return <button key={option.key} type="button" className={'answer-option' + (selected ? ' is-selected' : '')} onClick={() => chooseAnswer(option.key)} aria-pressed={selected}><span className="option-key">{option.key}</span><span>{option.text}</span>{selected && <span className="answer-check" aria-hidden="true">✓</span>}</button> })}</div>{error && <p className="quiz-inline-error" role="alert">{error}</p>}<div className="question-actions"><button type="button" className="button button-secondary" onClick={toggleMarked}>{marked[currentQuestion.questionId] ? 'Remove review mark' : 'Mark for review'}</button><div><button type="button" className="button button-secondary" onClick={goPrevious} disabled={currentIndex === 0}>Previous</button>{currentIndex < questions.length - 1 ? <button type="button" className="button button-primary" onClick={goNext}>Save & next <span aria-hidden="true">→</span></button> : <button type="button" className="button button-primary" onClick={() => setShowSubmit(true)} disabled={submitting}>Submit quiz</button>}</div></div></article>
        </div></section>
      </main>
      {showSubmit && <div className="submit-overlay" role="dialog" aria-modal="true" aria-labelledby="submit-title"><div className="submit-dialog"><p className="section-label">Finish attempt</p><h2 id="submit-title">Submit this quiz?</h2><p>You have answered {answeredCount} of {questions.length} questions. The server will calculate your final score.</p><div className="action-row"><button className="button button-secondary" type="button" onClick={() => setShowSubmit(false)}>Continue quiz</button><button className="button button-primary" type="button" onClick={submitAttempt} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit attempt'}</button></div></div></div>}
      <SiteFooter />
    </div>
  )
}

function ResultPage({ attemptId, profile }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const participantId = localStorage.getItem(PARTICIPANT_KEY)
      if (!participantId) { setError('Your quiz identity is not available on this device.'); setLoading(false); return }
      try {
        const response = await apiRequest('/api/v1/results/' + encodeURIComponent(attemptId) + '?participantId=' + encodeURIComponent(participantId))
        if (!cancelled) setResult(response.data.result)
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [attemptId])

  return <div className="quiz-app"><SiteHeader profile={profile} /><main className="results-main"><section className="results-hero"><div className="shell-container"><p className="section-label">Your result</p><h1>{result?.quiz?.title || 'Quiz result'}</h1><p>{result ? 'A server-calculated view of your latest performance, built to help you decide what to practice next.' : 'Loading your secure result…'}</p></div></section><section className="results-content"><div className="shell-container">{loading && <div className="result-state"><strong>Calculating result…</strong><span>Fetching your verified analytics from the quiz server.</span></div>}{!loading && error && <div className="result-state"><strong>Result unavailable</strong><span>{error}</span><a className="button button-primary" href="/results">Open result history</a></div>}{!loading && result && <ResultAnalytics result={result} />}</div></section></main><SiteFooter /></div>
}

function ResultAnalytics({ result }) {
  const statusLabel = result.status === 'EXPIRED' ? 'Time expired' : 'Submitted'
  return <div className="result-analytics"><div className="result-overview-card"><div className="result-score"><span>Score</span><strong>{result.score}<small> / {result.maxMarks}</small></strong><b>{result.percentage}%</b></div><div className="result-status"><span className="soft-badge">{statusLabel}</span><span className="soft-badge">{result.passed ? 'Passed' : 'Needs practice'}</span><p>{result.correct} correct · {result.incorrect} incorrect · {result.skipped} skipped</p><span>Accuracy {result.accuracy}% · Time {formatDuration(result.timeUsedSeconds)}</span></div></div><div className="analytics-grid"><div className="analytics-card"><span>Attempted</span><strong>{result.attempted}</strong><small>of {result.questionCount}</small></div><div className="analytics-card"><span>Correct</span><strong>{result.correct}</strong><small>{result.accuracy}% accuracy</small></div><div className="analytics-card"><span>Incorrect</span><strong>{result.incorrect}</strong><small>Review these topics</small></div><div className="analytics-card"><span>Skipped</span><strong>{result.skipped}</strong><small>{formatDuration(result.timeRemainingSeconds)} remaining</small></div></div><div className="analytics-columns"><section className="analytics-panel"><p className="section-label">Topic performance</p><h2>Where you performed best.</h2>{result.topicPerformance?.map((topic) => <div className="topic-row" key={topic.topic}><div><strong>{topic.topic}</strong><span>{topic.correct}/{topic.total} correct · {topic.skipped} skipped</span></div><b>{topic.accuracy}%</b><div className="topic-bar"><span style={{ width: topic.accuracy + '%' }} /></div></div>)}</section><section className="analytics-panel"><p className="section-label">Next steps</p><h2>Use this result to improve.</h2><ul className="suggestion-list">{result.suggestions?.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul><a className="button button-primary" href="/quizzes">Take another quiz <span aria-hidden="true">→</span></a></section>{result.questionReview?.length>0&&<section className="analytics-panel result-review-panel"><p className="section-label">Answer review</p><h2>Learn from every question.</h2><div className="result-review-list">{result.questionReview.map((q)=><article className="result-review-item" key={q.questionId}><div><span>Q{q.position}</span><strong>{q.text}</strong><small>Your answer: {q.selectedOption||'Skipped'} · {q.correct ? 'Answer was correct' : 'Review this question'}</small>{q.explanation&&<p>{q.explanation}</p>}</div><b>{q.correct?'Correct':'Review'}</b></article>)}</div></section>}</div><div className="result-actions"><a className="button button-secondary" href="/results">View result history</a><a className="button button-secondary" href="/quizzes">Explore quizzes</a></div></div>
}

function ResultsHistoryPage({ profile }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    async function load() {
      const participantId = localStorage.getItem(PARTICIPANT_KEY)
      if (!participantId) { setError('Complete a quiz once to create your server-linked result history.'); setLoading(false); return }
      try {
        const response = await apiRequest('/api/v1/results?participantId=' + encodeURIComponent(participantId))
        if (!cancelled) setResults(response.data.results || [])
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])
  return <div className="quiz-app"><SiteHeader profile={profile} /><main className="results-main"><section className="results-hero"><div className="shell-container"><p className="section-label">Performance history</p><h1>Your quiz results, in one place.</h1><p>Review previous attempts, compare your accuracy and choose what to practice next.</p></div></section><section className="results-content"><div className="shell-container">{loading && <div className="result-state"><strong>Loading result history…</strong><span>Fetching your completed attempts.</span></div>}{!loading && error && <div className="result-state"><strong>No result history yet.</strong><span>{error}</span><a className="button button-primary" href="/quizzes">Explore quizzes</a></div>}{!loading && !error && results.length === 0 && <div className="result-state"><strong>Your result history is empty.</strong><span>Complete your first quiz and your verified performance will appear here.</span><a className="button button-primary" href="/quizzes">Explore quizzes</a></div>}{!loading && !error && results.length > 0 && <div className="history-list">{results.map((result) => <article className="history-card" key={result.attemptId}><div><span className="soft-badge">{result.quiz?.type || 'Quiz'}</span><h2>{result.quiz?.title || 'Quiz'}</h2><p>{result.submittedAt ? new Date(result.submittedAt).toLocaleString() : 'Completed'} · {result.correct} correct · {result.incorrect} incorrect · {result.skipped} skipped</p></div><div className="history-score"><strong>{result.percentage}%</strong><span>{result.score}/{result.maxMarks} · {formatDuration(result.timeUsedSeconds)}</span><a className="text-link" href={'/result/' + result.attemptId}>View result →</a></div></article>)}</div>}</div></section></main><SiteFooter /></div>
}


function LeaderboardPage({ profile }) {
  const [scope, setScope] = useState('overall')
  const [quizSlug, setQuizSlug] = useState('')
  const [subject, setSubject] = useState('')
  const [degree, setDegree] = useState('')
  const [branch, setBranch] = useState('')
  const [college, setCollege] = useState('')
  const [quizzes, setQuizzes] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    apiRequest('/api/v1/quizzes')
      .then((response) => { if (!cancelled) setQuizzes(response.data.quizzes || []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      const params = new URLSearchParams({ scope, limit: '50' })
      if (quizSlug) params.set('quizSlug', quizSlug)
      if (subject) params.set('subject', subject)
      if (degree) params.set('degree', degree)
      if (branch) params.set('branch', branch)
      if (college) params.set('college', college)
      const participantId = localStorage.getItem(PARTICIPANT_KEY)
      if (participantId) params.set('participantId', participantId)
      try {
        const response = await apiRequest('/api/v1/leaderboard?' + params.toString())
        if (!cancelled) setData(response.data)
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [scope, quizSlug, subject, degree, branch, college])

  const scopeLabel = scope === 'quiz' ? 'Quiz' : scope === 'subject' ? 'Subject' : scope === 'degree' ? 'Program' : scope === 'branch' ? 'Branch' : scope === 'college' ? 'College' : 'Overall'
  const hasActiveFilter = Boolean(quizSlug || subject || degree || branch || college)

  return (
    <div className="quiz-app">
      <SiteHeader profile={profile} />
      <main className="leaderboard-main">
        <section className="leaderboard-hero"><div className="shell-container"><p className="section-label">Compete fairly</p><h1>See where your performance stands.</h1><p>Rankings are calculated on the server from completed attempts. Contact details are never shown.</p></div></section>
        <section className="leaderboard-content"><div className="shell-container">
          <div className="leaderboard-controls">
            <label><span>Leaderboard</span><select value={scope} onChange={(event) => setScope(event.target.value)}><option value="overall">Overall</option><option value="quiz">Quiz</option><option value="subject">Subject</option><option value="degree">Program</option><option value="branch">Branch</option><option value="college">College</option></select></label>
            <label><span>Quiz</span><select value={quizSlug} onChange={(event) => setQuizSlug(event.target.value)}><option value="">All quizzes</option>{quizzes.map((quiz) => <option key={quiz.slug} value={quiz.slug}>{quiz.title}</option>)}</select></label>
            <label><span>Subject</span><select value={subject} onChange={(event) => setSubject(event.target.value)}><option value="">All subjects</option>{[...new Set(quizzes.map((quiz) => quiz.subject).filter(Boolean))].sort().map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label><span>Degree</span><select value={degree} onChange={(event) => setDegree(event.target.value)}><option value="">All programs</option>{degreeOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label><span>College</span><input value={college} onChange={(event) => setCollege(event.target.value)} placeholder="Optional college filter" /></label>
          </div>
          {loading && <div className="result-state"><strong>Loading leaderboard…</strong><span>Calculating rankings from verified completed attempts.</span></div>}
          {!loading && error && <div className="result-state"><strong>Leaderboard unavailable</strong><span>{error}</span></div>}
          {!loading && data && <div className="leaderboard-shell">
            <div className="leaderboard-summary"><div><p className="section-label">{scopeLabel} leaderboard</p><h2>{hasActiveFilter ? 'Filtered performance rankings' : 'Top performers'}</h2><p>Primary metric: average percentage. More completed quizzes and stronger accuracy break ties.</p></div>{data.me && <div className="my-rank-card"><span>Your rank</span><strong>#{data.me.rank}</strong><small>{data.me.averagePercentage}% average · {data.me.quizzesCompleted} quiz{data.me.quizzesCompleted === 1 ? '' : 'zes'}</small></div>}</div>
            <div className="leaderboard-table-wrap"><table className="leaderboard-table"><thead><tr><th>Rank</th><th>Student</th><th>College</th><th>Average</th><th>Accuracy</th><th>Quizzes</th><th>Time</th></tr></thead><tbody>{data.entries.map((entry) => <tr key={entry.participantId} className={data.me?.rank === entry.rank && profile ? 'is-you' : ''}><td><strong>#{entry.rank}</strong></td><td><strong>{entry.displayName}</strong>{data.me?.participantId === entry.participantId && <span className="you-badge">You</span>}</td><td>{entry.college || '—'}</td><td><strong>{entry.averagePercentage}%</strong></td><td>{entry.averageAccuracy}%</td><td>{entry.quizzesCompleted}</td><td>{formatDuration(entry.averageTimeUsedSeconds)}</td></tr>)}</tbody></table>{data.entries.length === 0 && <div className="empty-leaderboard"><strong>No completed attempts match these filters.</strong><span>Complete a quiz or adjust the filters to see rankings.</span></div>}</div>
          </div>}
        </div></section>
      </main>
      <SiteFooter />
    </div>
  )
}

function RegistrationPage({ existingProfile }) {
  const [form, setForm] = useState(existingProfile || initialProfile)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const branches = useMemo(() => branchOptions[form.degree] || [], [form.degree])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value, ...(name === 'degree' ? { branch: '' } : {}) }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validate() {
    const next = {}
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
    const mobilePattern = /^[6-9]\\d{9}$/

    if (!form.name.trim()) next.name = 'Enter your full name.'
    if (!form.rollNumber.trim()) next.rollNumber = 'Enter your PRN or roll number.'
    if (!mobilePattern.test(form.mobile.trim())) next.mobile = 'Enter a valid 10-digit mobile number.'
    if (!emailPattern.test(form.email.trim())) next.email = 'Enter a valid email address.'
    if (!form.college.trim()) next.college = 'Enter your college or university.'
    if (!form.degree) next.degree = 'Select your degree.'
    if (!form.branch) next.branch = 'Select your branch or specialization.'
    if (!form.semesterYear) next.semesterYear = 'Select your semester or year.'
    if (!form.city.trim()) next.city = 'Enter your city.'
    if (!form.state.trim()) next.state = 'Enter your state.'
    return next
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setSubmitted(false)
      return
    }

    const cleanProfile = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanProfile))
    setForm(cleanProfile)
    setErrors({})
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (submitted) {
    return (
      <div className="quiz-app">
        <SiteHeader profile={form} />
        <main className="account-main">
          <section className="account-shell">
            <div className="success-card" aria-labelledby="registration-success-title">
              <span className="success-icon" aria-hidden="true">✓</span>
              <p className="section-label">Profile ready</p>
              <h1 id="registration-success-title">You’re ready for your first quiz.</h1>
              <p>Your student profile has been saved on this device. You can review or edit it anytime before the quiz engine is connected.</p>
              <div className="profile-mini">
                <strong>{form.name}</strong>
                <span>{form.degree} · {form.branch}</span>
                <span>{form.college}</span>
              </div>
              <div className="action-row center-actions">
                <a className="button button-primary button-large" href="/quizzes">Continue to quizzes <span aria-hidden="true">→</span></a>
                <a className="button button-secondary button-large" href="/profile">View profile</a>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="quiz-app">
      <SiteHeader profile={existingProfile} />
      <main className="account-main">
        <section className="account-shell" aria-labelledby="registration-title">
          <div className="account-heading">
            <p className="section-label">Student registration</p>
            <h1 id="registration-title">{existingProfile ? 'Update your student profile.' : 'Create your student profile.'}</h1>
            <p>Tell us enough about your academic background to make future quiz discovery and results more relevant.</p>
          </div>
          <form className="profile-form" onSubmit={handleSubmit} noValidate>
            <fieldset>
              <legend>Personal details</legend>
              <div className="form-grid">
                <FormField label="Full name" name="name" value={form.name} onChange={updateField} error={errors.name} placeholder="e.g. Rahul Kumar" required />
                <FormField label="PRN / Roll number" name="rollNumber" value={form.rollNumber} onChange={updateField} error={errors.rollNumber} placeholder="e.g. 23CSE1042" required />
                <FormField label="Mobile number" name="mobile" type="tel" inputMode="numeric" maxLength="10" value={form.mobile} onChange={updateField} error={errors.mobile} placeholder="10-digit mobile number" required />
                <FormField label="Email address" name="email" type="email" value={form.email} onChange={updateField} error={errors.email} placeholder="you@example.com" required />
              </div>
            </fieldset>

            <fieldset>
              <legend>Academic details</legend>
              <div className="form-grid">
                <FormField label="College / University" name="college" value={form.college} onChange={updateField} error={errors.college} placeholder="e.g. Apna University" required />
                <SelectField label="Degree / program" name="degree" value={form.degree} onChange={updateField} error={errors.degree} options={degreeOptions} placeholder="Select degree" required />
                <SelectField label="Branch / specialization" name="branch" value={form.branch} onChange={updateField} error={errors.branch} options={branches} placeholder={form.degree ? 'Select branch' : 'Select degree first'} disabled={!form.degree} required />
                <SelectField label="Semester / year" name="semesterYear" value={form.semesterYear} onChange={updateField} error={errors.semesterYear} options={['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Passed Out']} placeholder="Select current level" required />
              </div>
            </fieldset>

            <fieldset>
              <legend>Location</legend>
              <div className="form-grid">
                <FormField label="City" name="city" value={form.city} onChange={updateField} error={errors.city} placeholder="e.g. Delhi" required />
                <FormField label="State" name="state" value={form.state} onChange={updateField} error={errors.state} placeholder="e.g. Bihar" required />
              </div>
            </fieldset>

            <fieldset>
              <legend>Optional profile</legend>
              <label className="field full-field">
                <span>Short bio <em>Optional</em></span>
                <textarea name="bio" value={form.bio} onChange={updateField} maxLength="240" placeholder="Tell us a little about your learning or career goal." />
                <small>{form.bio.length}/240</small>
              </label>
            </fieldset>

            <div className="form-actions">
              <div><strong>Private by design.</strong><span>Your contact details are not shown on public leaderboards.</span></div>
              <button className="button button-primary button-large" type="submit">{existingProfile ? 'Save changes' : 'Create profile'} <span aria-hidden="true">→</span></button>
            </div>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function FormField({ label, name, value, onChange, error, type = 'text', placeholder, required, inputMode, maxLength }) {
  return (
    <label className="field">
      <span>{label} {required && <b aria-hidden="true">*</b>}</span>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} inputMode={inputMode} maxLength={maxLength} aria-invalid={Boolean(error)} aria-describedby={error ? name + '-error' : undefined} autoComplete={name === 'email' ? 'email' : name === 'mobile' ? 'tel' : 'off'} />
      {error && <small id={name + '-error'} className="field-error">{error}</small>}
    </label>
  )
}

function SelectField({ label, name, value, onChange, error, options, placeholder, disabled, required }) {
  return (
    <label className="field">
      <span>{label} {required && <b aria-hidden="true">*</b>}</span>
      <select name={name} value={value} onChange={onChange} disabled={disabled} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? name + '-error' : undefined}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error && <small id={name + '-error'} className="field-error">{error}</small>}
    </label>
  )
}

function ProfilePage({ profile }) {
  if (!profile) {
    return (
      <div className="quiz-app">
        <SiteHeader profile={null} />
        <main className="account-main">
          <section className="account-shell">
            <div className="empty-account">
              <p className="section-label">Student profile</p>
              <h1>Your profile is not set up yet.</h1>
              <p>Create your profile once and use it as your identity for future quiz attempts.</p>
              <a className="button button-primary button-large" href="/register">Create student profile <span aria-hidden="true">→</span></a>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="quiz-app">
      <SiteHeader profile={profile} />
      <main className="account-main">
        <section className="account-shell" aria-labelledby="profile-title">
          <div className="profile-header-card">
            <div className="profile-avatar" aria-hidden="true">{profile.name.charAt(0).toUpperCase()}</div>
            <div><p className="section-label">Student profile</p><h1 id="profile-title">{profile.name}</h1><p>{profile.degree} · {profile.branch}</p></div>
            <a className="button button-secondary" href="/register">Edit profile</a>
          </div>
          <div className="profile-detail-grid">
            <ProfileDetail label="PRN / Roll number" value={profile.rollNumber} />
            <ProfileDetail label="Email" value={profile.email} />
            <ProfileDetail label="Mobile" value={profile.mobile} />
            <ProfileDetail label="College / University" value={profile.college} />
            <ProfileDetail label="Semester / year" value={profile.semesterYear} />
            <ProfileDetail label="City / State" value={profile.city + ', ' + profile.state} />
            {profile.bio && <ProfileDetail label="About" value={profile.bio} wide />}
          </div>
          <div className="profile-next-card">
            <div><p className="section-label">Next step</p><h2>Ready to find a quiz?</h2><p>Your profile is prepared for quiz discovery, secure attempts and performance history.</p></div>
            <a className="button button-primary" href="/quizzes">Explore quizzes <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function ProfileDetail({ label, value, wide = false }) {
  return <div className={wide ? 'profile-detail wide' : 'profile-detail'}><span>{label}</span><strong>{value}</strong></div>
}

export default App
