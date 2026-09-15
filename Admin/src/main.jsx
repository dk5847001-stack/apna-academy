import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AppBar, Avatar, Box, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { AssessmentOutlined, AutoGraphOutlined, CodeOutlined, DashboardOutlined, EmailOutlined, HomeOutlined, Menu, NotificationsNoneOutlined, PeopleAltOutlined, PeopleOutline, QuizOutlined, SchoolOutlined, ShoppingBagOutlined, SupportAgentOutlined, WorkspacePremiumOutlined } from "@mui/icons-material";
import "./index.css";
import App from "./App.jsx";
import Analytics from "./pages/Analytics.jsx";
import Users from "./pages/Users.jsx";
import Notifications from "./pages/Notifications.jsx";
import Purchases from "./pages/Purchases.jsx";
import Progress from "./pages/Progress.jsx";
import Certificates from "./pages/Certificates.jsx";
import Support from "./pages/Support.jsx";
import Assessments from "./pages/Assessments.jsx";
import Messages from "./pages/Messages.jsx";
import Subscribers from "./pages/Subscribers.jsx";
import DsaProblems from "./pages/DsaProblems.jsx";
import { getCurrentAdmin } from "./services/adminCourse.service";
import { DASHBOARD_URL, FRONTEND_URL } from "./constants/config";

const routes={"#analytics":Analytics,"#users":Users,"#notifications":Notifications,"#purchases":Purchases,"#progress":Progress,"#certificates":Certificates,"#support":Support,"#assessments":Assessments,"#messages":Messages,"#subscribers":Subscribers,"#dsa":DsaProblems};
const navItems=[
 {href:"",label:"Courses",icon:SchoolOutlined},
 {href:"#dsa",label:"DSA Problems",icon:CodeOutlined},
 {href:"#analytics",label:"Analytics",icon:AutoGraphOutlined},
 {href:"#users",label:"Users",icon:PeopleOutline},
 {href:"#notifications",label:"Notifications",icon:NotificationsNoneOutlined},
 {href:"#purchases",label:"Purchases",icon:ShoppingBagOutlined},
 {href:"#progress",label:"Progress",icon:AssessmentOutlined},
 {href:"#certificates",label:"Certificates",icon:WorkspacePremiumOutlined},
 {href:"#assessments",label:"Assessments",icon:QuizOutlined},
 {href:"#messages",label:"Messages",icon:EmailOutlined},
 {href:"#subscribers",label:"Subscribers",icon:PeopleAltOutlined},
 {href:"#support",label:"Support",icon:SupportAgentOutlined},
];
const externalNavItems=[{href:DASHBOARD_URL,label:"Dashboard",icon:DashboardOutlined},{href:FRONTEND_URL,label:"Home",icon:HomeOutlined}];
function ManagementSidebar({hash}){const go=href=>{window.location.hash=href};return <aside className="fixed inset-y-0 left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-white lg:block"><div className="flex h-full min-h-0 flex-col"><div className="shrink-0 p-4 pb-2"><div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm"><SchoolOutlined fontSize="small"/></div><div><div className="font-extrabold text-blue-950">Management</div><div className="text-xs font-medium text-blue-700">Platform administration</div></div></div></div></div><nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 pb-4 pr-2 scrollbar-thin" aria-label="Admin management navigation">{externalNavItems.map(({href,label,icon:Icon})=><a key={label} href={href} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"><Icon fontSize="small"/><span>{label}</span></a>)}<div className="my-3 border-t border-slate-200"/>{navItems.map(({href,label,icon:Icon})=>{const active=href?hash===href:!hash;return <button key={label} type="button" onClick={()=>go(href)} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-bold transition ${active?"bg-blue-600 text-white shadow-sm":"text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><Icon fontSize="small"/><span>{label}</span></button>})}</nav><div className="shrink-0 border-t border-slate-200 bg-white p-4"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ApnaAcademy</p><p className="mt-1 text-sm font-semibold text-slate-700">Admin Console</p></div></div></div></aside>}
function MobileManagementNav({hash}){return <div className="sticky top-16 z-40 border-b border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur lg:hidden"><div className="flex gap-2 overflow-x-auto pb-0.5">{externalNavItems.map(({href,label,icon:Icon})=><a key={label} href={href} className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100"><Icon fontSize="small"/>{label}</a>)}{navItems.map(({href,label,icon:Icon})=>{const active=href?hash===href:!hash;return <a key={label} href={href||"#"} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${active?"bg-blue-600 text-white":"text-slate-600 hover:bg-slate-100"}`}><Icon fontSize="small"/>{label}</a>})}</div></div>}
function ManagementHeader(){const[admin,setAdmin]=useState(null);useEffect(()=>{let mounted=true;(async()=>{try{const current=await getCurrentAdmin();if(mounted&&current?.role==="admin")setAdmin(current)}catch{}})();return()=>{mounted=false}},[]);return <AppBar position="sticky" elevation={0} color="inherit" className="border-b border-slate-200 bg-white/95 backdrop-blur"><Toolbar className="min-h-16 px-3 sm:px-6"><IconButton className="mr-2 lg:hidden" aria-label="Open navigation"><Menu/></IconButton><div className="flex min-w-0 items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm"><SchoolOutlined/></div><div className="min-w-0"><Typography className="truncate font-extrabold leading-tight">ApnaAcademy</Typography><Typography variant="caption" className="text-slate-500">Admin Console</Typography></div></div><Box className="flex-1"/><Stack direction="row" alignItems="center" spacing={1.5}><Avatar src={admin?.avatar} className="h-9 w-9 bg-blue-100 text-blue-700">{admin?.name?.[0]||"A"}</Avatar><Box className="hidden sm:block"><Typography variant="body2" className="font-semibold leading-tight">{admin?.name||"Administrator"}</Typography><Typography variant="caption" className="text-slate-500">Administrator</Typography></Box></Stack></Toolbar></AppBar>}
const Root=()=>{const[hash,setHash]=useState(window.location.hash);useEffect(()=>{const f=()=>setHash(window.location.hash);window.addEventListener("hashchange",f);return()=>window.removeEventListener("hashchange",f)},[]);const Page=routes[hash];const managementPage=Boolean(Page);return <><ManagementSidebar hash={hash}/>{managementPage&&<MobileManagementNav hash={hash}/>} {managementPage?<><ManagementHeader/><div className="min-h-screen bg-slate-50 lg:pl-64"><Page/></div></>:<App/>}</>};
createRoot(document.getElementById("root")).render(<StrictMode><Root/></StrictMode>);
