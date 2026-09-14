import { useEffect } from "react";
import { API_BASE_URL } from "../constants/config";

const LINK_STYLE="display:inline-flex;align-items:center;border-radius:8px;padding:8px 10px;font-size:14px;font-weight:700;text-decoration:none;color:#475569;transition:all .2s";

function addBlogNavigation(){
 const navs=document.querySelectorAll("nav");
 navs.forEach(nav=>{
  if(nav.querySelector('[data-apna-blog-link="true"]')) return;
  const links=[...nav.querySelectorAll("a")];
  const courses=links.find(a=>a.textContent?.trim()==="Courses");
  if(!courses) return;
  const blog=document.createElement("a"); blog.href="/blog"; blog.dataset.apnaBlogLink="true"; blog.textContent="Blog";
  blog.className=courses.className; blog.style.textDecoration="none";
  courses.after(blog);
 });
}

function addFooter(){
 const footer=document.querySelector("footer");
 if(!footer||footer.querySelector('[data-apna-footer-enhancement="true"]')) return;
 const section=document.createElement("section"); section.dataset.apnaFooterEnhancement="true"; section.className="border-b border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8";
 section.innerHTML=`<div class="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1.2fr]"><div><p class="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-600">Stay in the loop</p><h2 class="mt-2 text-xl font-black text-slate-950">Get learning updates in your inbox.</h2><p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">Subscribe for useful learning resources, new course announcements and platform updates. One unique email per subscriber.</p></div><form data-apna-subscribe-form="true" class="flex flex-col gap-2 sm:flex-row sm:items-start"><div class="min-w-0 flex-1"><input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="Enter your email address" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/><p data-apna-subscribe-status="true" class="mt-2 min-h-5 text-xs font-bold"></p></div><button type="submit" class="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">Subscribe</button></form></div>`;
 footer.prepend(section);
 const form=section.querySelector("form"); const input=section.querySelector("input"); const status=section.querySelector('[data-apna-subscribe-status="true"]'); const button=section.querySelector("button");
 form.addEventListener("submit",async e=>{e.preventDefault();const email=input.value.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status.textContent="Please enter a valid email address.";status.style.color="#dc2626";return;}button.disabled=true;button.textContent="Subscribing...";status.textContent="";try{const response=await fetch(`${API_BASE_URL}/subscribers`,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({email})});const data=await response.json();if(!response.ok)throw new Error(data?.message||"Subscription failed.");status.textContent=data?.message||"Subscribed successfully.";status.style.color="#059669";input.value="";}catch(err){status.textContent=err.message||"Unable to subscribe right now.";status.style.color="#dc2626";}finally{button.disabled=false;button.textContent="Subscribe";}});
}

function addFooterPolicyLinks(){
 const footer=document.querySelector("footer");
 if(!footer||footer.querySelector('[data-apna-policy-links="true"]')) return;
 const links=document.createElement("div"); links.dataset.apnaPolicyLinks="true"; links.className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 border-t border-slate-200 px-4 py-5 sm:px-6 lg:px-8";
 links.innerHTML=`<span class="mr-1 text-xs font-bold text-slate-400">Legal</span><a href="/privacy-policy" style="${LINK_STYLE}">Privacy Policy</a><a href="/refund-policy" style="${LINK_STYLE}">Refund Policy</a><a href="/blog" style="${LINK_STYLE}">Blog</a>`;
 footer.append(links);
}

export default function PublicSiteEnhancements(){
 useEffect(()=>{addBlogNavigation();addFooter();addFooterPolicyLinks();const observer=new MutationObserver(()=>{addBlogNavigation();addFooter();addFooterPolicyLinks();});observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect();},[]);
 return null;
}
