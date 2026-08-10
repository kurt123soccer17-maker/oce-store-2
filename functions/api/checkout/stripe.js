import {json,parseBody,validPlayer,orderId,now} from "../../_lib.js";
export async function onRequestPost({request,env}){
 const b=await parseBody(request), username=String(b.minecraftUsername||""), productId=String(b.productId||"");
 if(!validPlayer(username))return json({error:"Enter a valid Minecraft username."},{status:400});
 const p=await env.DB.prepare("SELECT * FROM products WHERE id=? AND enabled=1").bind(productId).first(); if(!p)return json({error:"Product unavailable"},{status:404});
 if(!env.STRIPE_SECRET_KEY)return json({error:"Stripe is not configured yet."},{status:503});
 const id=orderId(), t=now();
 await env.DB.prepare("INSERT INTO orders (id,product_id,minecraft_username,amount_cents,currency,payment_provider,payment_status,delivery_status,created_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(id,p.id,username,p.price_cents,"aud","stripe","pending","pending",t).run();
 const params=new URLSearchParams(); params.set("mode",p.billing==="monthly"?"subscription":"payment"); params.set("success_url",`${env.PUBLIC_BASE_URL||new URL(request.url).origin}/success.html?order=${id}`); params.set("cancel_url",`${env.PUBLIC_BASE_URL||new URL(request.url).origin}/?cancelled=1`); params.set("customer_creation","always"); params.set("line_items[0][quantity]","1"); params.set("line_items[0][price_data][currency]","aud"); params.set("line_items[0][price_data][unit_amount]",String(p.price_cents)); params.set("line_items[0][price_data][product_data][name]",`${p.name} — Unstable FFA OCE`); params.set("metadata[order_id]",id); params.set("metadata[minecraft_username]",username); params.set("metadata[product_id]",p.id);
 const r=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,"content-type":"application/x-www-form-urlencoded"},body:params}); const d=await r.json(); if(!r.ok){await env.DB.prepare("UPDATE orders SET payment_status='failed',delivery_error=? WHERE id=?").bind(d.error?.message||"Stripe error",id).run(); return json({error:"Could not start checkout."},{status:502});}
 await env.DB.prepare("UPDATE orders SET payment_id=? WHERE id=?").bind(d.id,id).run(); return json({url:d.url,orderId:id});
}
