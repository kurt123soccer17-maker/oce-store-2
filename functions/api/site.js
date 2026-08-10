import {json} from "../_lib.js";
export async function onRequestGet({env}){ const r=await env.DB.prepare("SELECT key,value FROM settings").all(); const s={}; for(const x of r.results||[])s[x.key]=x.value; return json({server_ip:s.server_ip||"ocenetwork.org",discord_url:s.discord_url||"#"}); }
