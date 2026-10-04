var ve=Object.defineProperty;var be=(e,n,t)=>n in e?ve(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var re=(e,n,t)=>be(e,typeof n!="symbol"?n+"":n,t);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const u of r)if(u.type==="childList")for(const p of u.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&i(p)}).observe(document,{childList:!0,subtree:!0});function t(r){const u={};return r.integrity&&(u.integrity=r.integrity),r.referrerPolicy&&(u.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?u.credentials="include":r.crossOrigin==="anonymous"?u.credentials="omit":u.credentials="same-origin",u}function i(r){if(r.ep)return;r.ep=!0;const u=t(r);fetch(r.href,u)}})();class le extends Error{constructor(t,i){super(i);re(this,"status");this.name="ApiError",this.status=t}}async function de(e){let n=e.statusText||`HTTP ${e.status}`;try{const t=await e.json();typeof t.error=="string"&&t.error&&(n=t.error)}catch{}return new le(e.status,n)}async function ce(e){const n=await fetch(e,{cache:"no-store",headers:{accept:"application/json"}});if(!n.ok)throw await de(n);return await n.json()}async function ue(e,n){const t=await fetch(e,{method:"POST",cache:"no-store",headers:{"content-type":"application/json",accept:"application/json"},body:JSON.stringify(n)});if(!t.ok)throw await de(t);return await t.json()}function ge(e){return ce(`/api/sessions/${encodeURIComponent(e)}`)}function we(e,n){return ue(`/api/sessions/${encodeURIComponent(e)}/diff`,{draft:n})}function $e(e,n){return ue(`/api/sessions/${encodeURIComponent(e)}/save`,{draft:n})}function Ee(e){return ce(`/api/sessions/${encodeURIComponent(e)}/result`)}function c(e){return e.replace(/[&<>"']/g,n=>{switch(n){case"&":return"&amp;";case"<":return"&lt;";case">":return"&gt;";case'"':return"&quot;";default:return"&#39;"}})}const U=/^[a-z0-9_]{1,32}$/;function N(){return{items:[],commands:[],message:"",broadcast:"",money:0,die:0,key:0,coin:0}}function fe(){return{voting:!0,playtime:!0,raffles:!0,die:!0,key:!0,coin:!0}}function pe(){return{revision:0,prefix:"long",vote_reward:N(),playtime_rewards:[],rewards:{},raffles:[],features:fe(),roll_presentation:"chat",die_rewards:[],key_rewards:[],coin_rewards:[]}}let S="",C=pe(),o=pe(),E="vote",_=null,b=null,k=null,y="die",w=0,L=!1,F="both",f="",K=null,P="",J=!1,D=0,A=0,j=!1,g="idle",me="",ye="idle";const he=document.querySelector("#app");if(!he)throw new Error("missing #app");const G=he;function ke(){const e=/^\/s\/([^/]+)\/?$/.exec(window.location.pathname);if(!e)return null;try{return decodeURIComponent(e[1])}catch{return e[1]}}function H(e){if(Array.isArray(e))return e.map(H);if(e!==null&&typeof e=="object"){const n=e,t={};for(const i of Object.keys(n).sort())t[i]=H(n[i]);return t}return e}function _e(){return JSON.stringify(H(o))!==JSON.stringify(H(C))}function Ie(e){e.prefix=e.prefix==="short"||e.prefix==="mid"?e.prefix:"long",e.vote_reward=T(e.vote_reward),e.playtime_rewards=(e.playtime_rewards??[]).map(i=>({id:i.id,seconds:i.seconds,reward:T(i.reward)}));const n={};for(const[i,r]of Object.entries(e.rewards??{}))n[i]=T(r);e.rewards=n,e.raffles=(e.raffles??[]).map(i=>({id:i.id,reward_id:i.reward_id,ends_at_ms:i.ends_at_ms??null,entrants:i.entrants??[]}));const t=e.features??fe();return e.features={voting:t.voting!==!1,playtime:t.playtime!==!1,raffles:t.raffles!==!1,die:t.die!==!1,key:t.key!==!1,coin:t.coin!==!1},e.roll_presentation=e.roll_presentation==="world"?"world":"chat",e.die_rewards=(e.die_rewards??[]).map(W),e.key_rewards=(e.key_rewards??[]).map(W),e.coin_rewards=(e.coin_rewards??[]).map(W),e}function W(e){return{weight:Math.max(1,Math.trunc((e==null?void 0:e.weight)??1)),reward:T(e==null?void 0:e.reward)}}function T(e){return{items:(e==null?void 0:e.items)??[],commands:(e==null?void 0:e.commands)??[],message:(e==null?void 0:e.message)??"",broadcast:(e==null?void 0:e.broadcast)??"",money:(e==null?void 0:e.money)??0,die:(e==null?void 0:e.die)??0,key:(e==null?void 0:e.key)??0,coin:(e==null?void 0:e.coin)??0}}function $(e,n){me=e,ye=n,g=n;const t=document.getElementById("save-status");t&&(t.textContent=e,t.dataset.kind=n)}function I(){const e=_e(),n=document.getElementById("dirty");if(n){let i="No unsaved changes";g==="applied"?i="Applied":g==="conflict"?i="Conflict":g==="pending"?i="Pending apply":e&&(i="Unsaved draft"),n.textContent=i,n.classList.toggle("is-dirty",e&&g!=="applied")}const t=document.getElementById("revert-draft");t&&(t.disabled=!e||j||g==="pending"||g==="applied")}function m(){(g==="applied"||g==="conflict"||g==="error")&&$("","idle"),I()}function M(){return Object.keys(o.rewards).sort()}function Le(e){if(e==null)return 0;const n=e-Date.now();return n<=0?0:Math.min(10080,Math.ceil(n/6e4))}function Re(){return`
    <header class="top">
      <div class="brand"><span class="mark" aria-hidden="true"></span><span>KarandaRewards</span></div>
      <div class="meta">
        <span>session <code id="session-code">${c(S)}</code></span>
        <span>rev <span id="revision">${C.revision}</span></span>
        <span id="dirty">No unsaved changes</span>
      </div>
      <p id="save-status" class="save-status" role="status"></p>
    </header>
    <nav class="tabs" aria-label="Editor">
      <button type="button" data-tab="vote" id="tab-vote">Vote</button>
      <button type="button" data-tab="playtime" id="tab-playtime">Playtime</button>
      <button type="button" data-tab="rewards" id="tab-rewards">Rewards</button>
      <button type="button" data-tab="raffles" id="tab-raffles">Raffles</button>
      <button type="button" data-tab="rolls" id="tab-rolls">Rolls</button>
      <button type="button" data-tab="review" id="tab-review">Review</button>
    </nav>
    <main id="panel"></main>`}function q(e,n){const t=n.items.map((i,r)=>`<div class="item-row">
        <input data-item-id="${e}" data-index="${r}" value="${c(i.item)}" spellcheck="false" autocomplete="off" />
        <input data-item-count="${e}" data-index="${r}" type="number" min="1" max="2304" value="${i.count}" />
        <button type="button" class="danger" data-remove-item="${e}" data-index="${r}">Remove</button>
      </div>`).join("");return`<div class="reward-form" data-reward="${e}">
    <label>Message <input data-field="message" data-reward-id="${e}" value="${c(n.message)}" spellcheck="false" /></label>
    <label>Broadcast <input data-field="broadcast" data-reward-id="${e}" value="${c(n.broadcast)}" spellcheck="false" /></label>
    <label>Money <input data-field="money" data-reward-id="${e}" type="number" min="0" max="2147483647" value="${n.money}" /></label>
    <label>Dice <input data-field="die" data-reward-id="${e}" type="number" min="0" max="1000000" value="${n.die}" /></label>
    <label>Keys <input data-field="key" data-reward-id="${e}" type="number" min="0" max="1000000" value="${n.key}" /></label>
    <label>Coins <input data-field="coin" data-reward-id="${e}" type="number" min="0" max="1000000" value="${n.coin}" /></label>
    <p class="hint">Money is added with KarandaEssentials /eco give when that plugin is installed. If it is not installed, the amount is skipped and items are still given.</p>
    <label>Commands <textarea data-field="commands" data-reward-id="${e}">${c(n.commands.join(`
`))}</textarea></label>
    <h3>Items</h3>
    ${t||'<p class="hint">No items.</p>'}
    <button type="button" data-add-item="${e}">Add item</button>
  </div>`}function x(e){var n,t;if(e==="vote")return o.vote_reward;if(e.startsWith("tier:")){const i=e.slice(5);return((n=o.playtime_rewards.find(r=>r.id===i))==null?void 0:n.reward)??null}if(e.startsWith("reward:"))return o.rewards[e.slice(7)]??null;if(e.startsWith("roll:")){const[,i,r]=e.split(":"),u=Number(r);if(i==="die"||i==="key"||i==="coin")return((t=R(i)[u])==null?void 0:t.reward)??null}return null}function R(e){return e==="die"?o.die_rewards:e==="key"?o.key_rewards:o.coin_rewards}function oe(e,n){e==="die"?o.die_rewards=n:e==="key"?o.key_rewards=n:o.coin_rewards=n}function V(e){return["die","key","coin"].filter(n=>n!==e)}function O(e,n){return e.length===0?'<p class="hint">Nothing here yet.</p>':e.map(t=>`<button type="button" class="row${t.selected?" is-selected":""}" ${n}="${c(t.id)}">
        <span class="row-name">${c(t.id)}</span>
        <span class="row-meta">${c(t.meta)}</span>
      </button>`).join("")}function Se(){if(E==="vote")return`<section class="settings">
      <h2>Vote reward</h2>
      <label>Console prefix
        <select id="prefix">
          <option value="long"${o.prefix==="long"?" selected":""}>long · [KarandaRewards]</option>
          <option value="mid"${o.prefix==="mid"?" selected":""}>mid · [KRewards]</option>
          <option value="short"${o.prefix==="short"?" selected":""}>short · [KR]</option>
        </select>
      </label>
      <p class="hint">The prefix is only on console lines. Player chat stays unprefixed.</p>
      ${q("vote",o.vote_reward)}
      <p class="error">${c(f)}</p>
    </section>`;if(E==="playtime"){const t=o.playtime_rewards.find(r=>r.id===_)??null,i=o.playtime_rewards.map(r=>({id:r.id,meta:`${r.seconds}s`,selected:r.id===_}));return`<div class="workspace">
      <aside class="side">
        <form id="create-tier" class="create">
          <input id="new-tier-id" placeholder="id" autocomplete="off" spellcheck="false" />
          <input id="new-tier-seconds" type="number" min="1" value="60" />
          <button type="submit">Add</button>
        </form>
        <p class="error">${c(f)}</p>
        <div class="list">${O(i,"data-tier")}</div>
      </aside>
      <section class="detail">${t?`<div class="detail-head"><h2>${c(t.id)}</h2><button type="button" class="danger" id="delete-tier">Delete</button></div>
             <label>Seconds <input id="tier-seconds" type="number" min="1" value="${t.seconds}" /></label>
             ${q(`tier:${t.id}`,t.reward)}`:'<p class="hint">Add a playtime reward.</p>'}</section>
    </div>`}if(E==="rewards"){const t=b?o.rewards[b]:void 0,i=M().map(r=>{var u;return{id:r,meta:`${((u=o.rewards[r])==null?void 0:u.items.length)??0} items`,selected:r===b}});return`<div class="workspace">
      <aside class="side">
        <form id="create-reward" class="create">
          <input id="new-reward-id" placeholder="id" autocomplete="off" spellcheck="false" />
          <button type="submit">Add</button>
        </form>
        <p class="error">${c(f)}</p>
        <div class="list">${O(i,"data-reward-row")}</div>
      </aside>
      <section class="detail">${t&&b?`<div class="detail-head"><h2>${c(b)}</h2><button type="button" class="danger" id="delete-reward">Delete</button></div>
             <p class="hint">Raffles draw from this catalog.</p>
             ${q(`reward:${b}`,t)}`:'<p class="hint">Add a named reward.</p>'}</section>
    </div>`}if(E==="raffles"){const t=o.raffles.find(p=>p.id===k)??null,i=o.raffles.map(p=>({id:p.id,meta:p.reward_id,selected:p.id===k})),r=M().map(p=>`<option value="${c(p)}"${(t==null?void 0:t.reward_id)===p?" selected":""}>${c(p)}</option>`).join(""),u=t!=null&&t.entrants.length?t.entrants.map(p=>`<li><code>${c(p.name)}</code> ${c(p.uuid)}</li>`).join(""):'<li class="hint">No entrants yet. Entries made in game stay on this raffle unless you delete it.</li>';return`<div class="workspace">
      <aside class="side">
        <form id="create-raffle" class="create">
          <input id="new-raffle-id" placeholder="id" autocomplete="off" spellcheck="false" />
          <button type="submit">Add</button>
        </form>
        <p class="error">${c(f)}</p>
        <div class="list">${O(i,"data-raffle")}</div>
      </aside>
      <section class="detail">${t?`<div class="detail-head"><h2>${c(t.id)}</h2><button type="button" class="danger" id="delete-raffle">Delete</button></div>
             <label>Reward <select id="raffle-reward">${r}</select></label>
             <label>Minutes <input id="raffle-minutes" type="number" min="0" max="10080" value="${Le(t.ends_at_ms)}" /></label>
             <p class="hint">0 stays open until /raffle draw. Changing minutes sets the end time from this computer's clock. Leaving it alone keeps the server's end time.</p>
             <h3>Entrants</h3>
             <ul class="diff">${u}</ul>`:'<p class="hint">Add a raffle. It uses a named reward.</p>'}</section>
    </div>`}if(E==="rolls")return Be();const e=K??[];return`<div class="review">
    <div class="review-bar">
      <button type="button" id="save-draft">Save</button>
      <button type="button" id="revert-draft">Revert</button>
      <span class="hint">Save writes a pending edit. The plugin applies it. Nothing is written until you press Save.</span>
    </div>
    <h2>Review</h2>
    <div id="diff-body">${J?'<p class="hint">Comparing…</p>':P?`<p class="error">${c(P)}</p>`:e.length===0?'<p class="hint">No changes.</p>':`<ul class="diff">${e.map(t=>`<li class="${c(t.kind)}"><code>${c(t.path)}</code> ${c(t.detail)}</li>`).join("")}</ul>`}</div>
  </div>`}function Be(){const e=R(y),n=e[w]??null,i=V(y).map(h=>`<option value="${h}">${h}</option>`).join(""),r=["voting","playtime","raffles","die","key","coin"].map(h=>`<label class="check"><input type="checkbox" data-feature="${h}"${o.features[h]?" checked":""}/> ${h}</label>`).join(""),u=e.map((h,B)=>({id:String(B),meta:`weight ${h.weight}`,selected:B===w})),p=L?xe(F):"";return`<section class="settings">
    <h2>Features</h2>
    <div class="flags">${r}</div>
    <label>Roll presentation
      <select id="roll-presentation">
        <option value="chat"${o.roll_presentation==="chat"?" selected":""}>chat</option>
        <option value="world"${o.roll_presentation==="world"?" selected":""}>world</option>
      </select>
    </label>
    <p class="hint">chat prints the roll in chat. world shows it above the player for a few seconds, then the prize line is still sent in chat. A missing or bad value stays chat.</p>
    <div class="tabs inner-tabs">
      ${["die","key","coin"].map(h=>`<button type="button" data-roll-kind="${h}" class="${h===y?"is-active":""}">${h}</button>`).join("")}
    </div>
    <div class="copy-bar">
      <span>Copy this list onto</span>
      <select id="copy-target">
        ${i}
        <option value="both">both</option>
      </select>
      <button type="button" id="copy-ask">Copy</button>
    </div>
    ${L?`<div class="confirm"><p>${c(p)}</p><button type="button" id="copy-yes">Replace</button> <button type="button" id="copy-no">Cancel</button></div>`:""}
    <div class="workspace">
      <aside class="side">
        <button type="button" id="add-roll">Add entry</button>
        <p class="error">${c(f)}</p>
        <div class="list">${O(u,"data-roll")}</div>
      </aside>
      <section class="detail">${n?`<div class="detail-head"><h2>${c(y)} ${w+1}</h2><button type="button" class="danger" id="delete-roll">Delete</button></div>
             <label>Weight <input id="roll-weight" type="number" min="1" max="1000000" value="${n.weight}" /></label>
             ${q(`roll:${y}:${w}`,n.reward)}`:'<p class="hint">Add a weighted prize. An empty list refuses the roll and does not spend a count.</p>'}</section>
    </div>
  </section>`}function xe(e){if(e==="both"){const n=V(y);return`Replace the ${n[0]} and ${n[1]} lists with this ${y} list?`}return`Replace the ${e} list with this ${y} list?`}function d(){G.innerHTML=Re();const e=document.getElementById("panel");e&&(e.innerHTML=Se());for(const t of document.querySelectorAll("[data-tab]")){const i=t.dataset.tab===E;t.classList.toggle("is-active",i),t.addEventListener("click",()=>{const r=t.dataset.tab;(r==="vote"||r==="playtime"||r==="rewards"||r==="raffles"||r==="rolls"||r==="review")&&(E=r,f="",d(),E==="review"&&Ce(++D))})}Ae(),I();const n=document.getElementById("save-status");n&&(n.textContent=me,n.dataset.kind=ye)}function Ae(){var e,n,t,i,r,u,p,h,B,Q,X,Y,Z,ee,te,ne,ae,se,ie;(e=document.getElementById("prefix"))==null||e.addEventListener("change",a=>{const s=a.target.value;o.prefix=s==="short"||s==="mid"?s:"long",m()});for(const a of document.querySelectorAll("[data-field]"))a.addEventListener("input",()=>{const s=x(a.dataset.rewardId??"");if(!s)return;const l=a.dataset.field;(l==="message"||l==="broadcast")&&(s[l]=a.value),l==="money"&&(s.money=Math.max(0,Math.trunc(Number(a.value)||0))),(l==="die"||l==="key"||l==="coin")&&(s[l]=Math.max(0,Math.trunc(Number(a.value)||0))),l==="commands"&&(s.commands=a.value.split(`
`).map(v=>v.trim()).filter(v=>v.length>0)),m()});for(const a of document.querySelectorAll("[data-item-id]"))a.addEventListener("input",()=>{const s=x(a.dataset.itemId??""),l=Number(a.dataset.index);s!=null&&s.items[l]&&(s.items[l].item=a.value),m()});for(const a of document.querySelectorAll("[data-item-count]"))a.addEventListener("input",()=>{const s=x(a.dataset.itemCount??""),l=Number(a.dataset.index);s!=null&&s.items[l]&&(s.items[l].count=Math.max(1,Math.trunc(Number(a.value)||1))),m()});for(const a of document.querySelectorAll("[data-add-item]"))a.addEventListener("click",()=>{const s=x(a.dataset.addItem??"");s==null||s.items.push({item:"minecraft:diamond",count:1}),m(),d()});for(const a of document.querySelectorAll("[data-remove-item]"))a.addEventListener("click",()=>{const s=x(a.dataset.removeItem??""),l=Number(a.dataset.index);s==null||s.items.splice(l,1),m(),d()});(n=document.getElementById("create-tier"))==null||n.addEventListener("submit",a=>{a.preventDefault();const s=document.getElementById("new-tier-id").value.trim(),l=Math.trunc(Number(document.getElementById("new-tier-seconds").value));if(!U.test(s)){f="Ids use 1 to 32 lowercase letters, digits, or underscores.",d();return}if(o.playtime_rewards.some(z=>z.id===s)){f=`${s} is already a playtime reward.`,d();return}const v={id:s,seconds:l>0?l:60,reward:N()};o.playtime_rewards.push(v),_=s,f="",m(),d()}),(t=document.getElementById("tier-seconds"))==null||t.addEventListener("input",a=>{const s=o.playtime_rewards.find(l=>l.id===_);s&&(s.seconds=Math.max(1,Math.trunc(Number(a.target.value)||1))),m()}),(i=document.getElementById("delete-tier"))==null||i.addEventListener("click",()=>{var a;o.playtime_rewards=o.playtime_rewards.filter(s=>s.id!==_),_=((a=o.playtime_rewards[0])==null?void 0:a.id)??null,m(),d()});for(const a of document.querySelectorAll("[data-tier]"))a.addEventListener("click",()=>{_=a.dataset.tier??null,f="",d()});(r=document.getElementById("create-reward"))==null||r.addEventListener("submit",a=>{a.preventDefault();const s=document.getElementById("new-reward-id").value.trim();if(!U.test(s)){f="Ids use 1 to 32 lowercase letters, digits, or underscores.",d();return}if(o.rewards[s]){f=`${s} is already a reward.`,d();return}o.rewards[s]=N(),b=s,f="",m(),d()}),(u=document.getElementById("delete-reward"))==null||u.addEventListener("click",()=>{b&&(delete o.rewards[b],b=M()[0]??null,m(),d())});for(const a of document.querySelectorAll("[data-reward-row]"))a.addEventListener("click",()=>{b=a.dataset.rewardRow??null,f="",d()});(p=document.getElementById("create-raffle"))==null||p.addEventListener("submit",a=>{a.preventDefault();const s=document.getElementById("new-raffle-id").value.trim(),l=M()[0];if(!U.test(s)){f="Ids use 1 to 32 lowercase letters, digits, or underscores.",d();return}if(!l){f="Add a named reward before starting a raffle.",d();return}if(o.raffles.some(z=>z.id===s)){f=`${s} is already a raffle.`,d();return}const v={id:s,reward_id:l,ends_at_ms:null,entrants:[]};o.raffles.push(v),k=s,f="",m(),d()}),(h=document.getElementById("raffle-reward"))==null||h.addEventListener("change",a=>{const s=o.raffles.find(l=>l.id===k);s&&(s.reward_id=a.target.value),m()}),(B=document.getElementById("raffle-minutes"))==null||B.addEventListener("input",a=>{const s=o.raffles.find(v=>v.id===k);if(!s)return;const l=Math.max(0,Math.trunc(Number(a.target.value)||0));s.ends_at_ms=l===0?null:Date.now()+l*6e4,m()}),(Q=document.getElementById("delete-raffle"))==null||Q.addEventListener("click",()=>{var a;o.raffles=o.raffles.filter(s=>s.id!==k),k=((a=o.raffles[0])==null?void 0:a.id)??null,m(),d()});for(const a of document.querySelectorAll("[data-raffle]"))a.addEventListener("click",()=>{k=a.dataset.raffle??null,f="",d()});for(const a of document.querySelectorAll("[data-feature]"))a.addEventListener("change",()=>{const s=a.dataset.feature;(s==="voting"||s==="playtime"||s==="raffles"||s==="die"||s==="key"||s==="coin")&&(o.features[s]=a.checked,m())});(X=document.getElementById("roll-presentation"))==null||X.addEventListener("change",a=>{const s=a.target.value;o.roll_presentation=s==="world"?"world":"chat",m()});for(const a of document.querySelectorAll("[data-roll-kind]"))a.addEventListener("click",()=>{const s=a.dataset.rollKind;(s==="die"||s==="key"||s==="coin")&&(y=s,w=0,L=!1,f="",d())});(Y=document.getElementById("copy-ask"))==null||Y.addEventListener("click",()=>{const a=document.getElementById("copy-target");F=(a==null?void 0:a.value)??"both",L=!0,d()}),(Z=document.getElementById("copy-no"))==null||Z.addEventListener("click",()=>{L=!1,d()}),(ee=document.getElementById("copy-yes"))==null||ee.addEventListener("click",()=>{const a=F,s=structuredClone(R(y)),l=a==="both"?V(y):a==="die"||a==="key"||a==="coin"?[a]:[];for(const v of l)v!==y&&oe(v,structuredClone(s));L=!1,m(),d()}),(te=document.getElementById("add-roll"))==null||te.addEventListener("click",()=>{const a=R(y);a.push({weight:1,reward:N()}),w=a.length-1,f="",m(),d()}),(ne=document.getElementById("roll-weight"))==null||ne.addEventListener("input",a=>{const s=R(y)[w];s&&(s.weight=Math.max(1,Math.trunc(Number(a.target.value)||1))),m()}),(ae=document.getElementById("delete-roll"))==null||ae.addEventListener("click",()=>{const a=R(y).filter((s,l)=>l!==w);oe(y,a),w=Math.max(0,Math.min(w,a.length-1)),m(),d()});for(const a of document.querySelectorAll("[data-roll]"))a.addEventListener("click",()=>{w=Number(a.dataset.roll??0),f="",d()});(se=document.getElementById("save-draft"))==null||se.addEventListener("click",()=>{De()}),(ie=document.getElementById("revert-draft"))==null||ie.addEventListener("click",()=>{o=structuredClone(C),K=null,f="",$("","idle"),d()})}async function Ce(e){J=!0;const n=document.getElementById("diff-body");n&&E==="review"&&(n.innerHTML='<p class="hint">Comparing…</p>');try{const t=await we(S,structuredClone(o));if(e!==D)return;K=t.changes,P=""}catch(t){if(e!==D)return;K=null,P=t instanceof Error?t.message:"Diff failed"}finally{e===D&&(J=!1,E==="review"&&d())}}function Me(e){return new Promise(n=>window.setTimeout(n,e))}async function Ne(e){const n=Date.now();for(;e===A&&Date.now()-n<6e4;){try{const t=await Ee(S);if(e!==A)return;if(t.status==="applied"){const i=t.revision!=null?` (revision ${t.revision})`:"";$(`Status: applied${i}. Run /krewards editor again to start a new session.`,"applied"),I();return}if(t.status==="conflict"){$(`Status: conflict. ${t.error??""} The draft was not applied. Run /krewards editor again.`.trim(),"conflict"),I();return}if(t.status==="error"){$(`Status: error. ${t.error??"The plugin reported an error."}`,"error"),I();return}$("Status: pending. Waiting for the plugin to apply this edit.","pending")}catch(t){if(e!==A)return;if(Date.now()-n>5e3&&t instanceof le){$(`Status: error. ${t.message}`,"error"),I();return}}await Me(300)}e===A&&g==="pending"&&$("Status: pending. Still waiting. The plugin applies pending files about once a second, or run /krewards applyedits.","pending")}async function De(){if(j)return;j=!0;const e=document.getElementById("save-draft");e&&(e.disabled=!0),$("Saving…","pending");try{await $e(S,o),g="pending",$("Status: pending. Waiting for the plugin to apply this edit.","pending"),I(),Ne(++A)}catch(n){const t=n instanceof Error?n.message:"Save failed";$(`Status: error. ${t}`,"error"),I()}finally{j=!1,e&&(e.disabled=!1)}}async function je(){var n,t;const e=ke();if(!e){G.innerHTML='<main class="gate"><h1>KarandaRewards</h1><p>Open the link from <code>/krewards editor</code>. It looks like <code>/s/&lt;code&gt;</code>.</p></main>';return}S=e;try{C=Ie(await ge(S)),o=structuredClone(C),_=((n=o.playtime_rewards[0])==null?void 0:n.id)??null,b=M()[0]??null,k=((t=o.raffles[0])==null?void 0:t.id)??null,d()}catch(i){const r=i instanceof Error?i.message:"Could not load the session";G.innerHTML=`<main class="gate"><h1>KarandaRewards</h1><p>${c(r)}</p></main>`}}je();
