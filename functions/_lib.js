const enc = new TextEncoder();
const dec = new TextDecoder();
export function json(data, init={}) { return new Response(JSON.stringify(data), { ...init, headers:{"content-type":"application/json; charset=utf-8", ...(init.headers||{})} }); }
export function now(){ return new Date().toISOString(); }
export function validPlayer(n){ return typeof n === "string" && /^[A-Za-z0-9_]{3,16}$/.test(n); }
export function orderId(){ return "OCE-" + crypto.randomUUID().replaceAll("-","").slice(0,10).toUpperCase(); }
export function cookie(req,name){ const s=req.headers.get("cookie")||""; const m=s.split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"=")); return m ? decodeURIComponent(m.slice(name.length+1)) : null; }
function b64u(bytes){ let s=""; const a=new Uint8Array(bytes); for(const b of a)s+=String.fromCharCode(b); return btoa(s).replaceAll("+","-").replaceAll("/","_").replaceAll("=",""); }
function ub64u(s){ s=s.replaceAll("-","+").replaceAll("_","/"); while(s.length%4)s+="="; const bin=atob(s); return Uint8Array.from(bin,c=>c.charCodeAt(0)); }
async function hmac(secret,data){ const k=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]); return new Uint8Array(await crypto.subtle.sign("HMAC",k,enc.encode(data))); }
export async function signSession(secret,payload){ const body=b64u(enc.encode(JSON.stringify(payload))); return body+"."+b64u(await hmac(secret,body)); }
export async function verifySession(secret,token){ try{ const [body,sig]=token.split("."); if(!body||!sig)return null; const a=await hmac(secret,body), b=ub64u(sig); if(a.length!==b.length || !crypto.subtle)return null; let ok=true; for(let i=0;i<a.length;i++) ok = ok && a[i]===b[i]; if(!ok)return null; const p=JSON.parse(dec.decode(ub64u(body))); return p.exp>Date.now()?p:null; }catch{return null;} }
export async function adminSession(req,env){ const t=cookie(req,"oce_admin"); return t?verifySession(env.ADMIN_SESSION_SECRET,t):null; }
export function setCookie(name,value,maxAge){ return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`; }
export function clearCookie(name){ return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`; }
export function csrfOk(req,s){ return req.headers.get("x-csrf-token")===s.csrf; }
export async function parseBody(req){ try{return await req.json()}catch{return {};}}
export function escapeHtml(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");}
