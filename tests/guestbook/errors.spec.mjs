import {test,expect} from '@playwright/test';
const key='B'.repeat(43);
const entry={id:'test-entry',name:'새 글',message:'첫 줄\n둘째 줄',createdAt:'2026-10-05T13:00:00Z'};
async function setup(page,handler,widget=true) {
 await page.route('https://challenges.cloudflare.com/turnstile/**',r=>widget?r.fulfill({contentType:'text/javascript',body:`window.turnstile={render(el,o){window.widgetOptions=o;queueMicrotask(()=>o.callback('test-token'));return 1},reset(){window.resets=(window.resets||0)+1;queueMicrotask(()=>window.widgetOptions.callback('test-token'))},remove(){}};`}):r.abort());
 await page.route('http://*:8787/api/guestbook**',async r=>{
  const headers={'Access-Control-Allow-Origin':new URL(page.url()).origin,'Access-Control-Expose-Headers':'Retry-After'};
  if(r.request().method()==='OPTIONS') return r.fulfill({status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET,POST,DELETE','Access-Control-Allow-Headers':'Content-Type'}});
  await handler(r,headers);
 });
 await page.goto('http://localhost:5174/?page=guestbook');
 await expect(page.locator('[data-list-status]')).not.toContainText('불러오는 중');
}
async function fill(page,name='방문자',message='안녕하세요') {
 await page.getByLabel('이름',{exact:true}).fill(name);
 await page.getByLabel('메시지',{exact:true}).fill(message);
}
const empty=(r,h)=>r.fulfill({headers:h,json:{items:[],nextCursor:null}});
test('pagination keeps order, encodes opaque cursor and deduplicates',async({page})=>{
 let cursor;
 await setup(page,(r,h)=>{cursor=new URL(r.request().url()).searchParams.get('cursor');return r.fulfill({headers:h,json:cursor?{items:[entry,{...entry,id:'older',name:'이전 글'}],nextCursor:null}:{items:[entry],nextCursor:'a+/=&?'}})});
 await page.locator('[data-more]').click();
 await expect(page.locator('[data-list] h2')).toHaveText(['새 글','이전 글']);expect(cursor).toBe('a+/=&?');
});
test('Unicode NFC and limits, oversized JSON, exact body and credentials omitted',async({page})=>{
 let posts=0;
 await setup(page,(r,h)=>{if(r.request().method()!=='POST')return empty(r,h);posts++;expect(r.request().postDataJSON()).toEqual({name:'é',message:'🚣'.repeat(1000),turnstileToken:'test-token'});expect(r.request().headers().cookie).toBeUndefined();return r.fulfill({status:201,headers:h,json:{entry,deletionKey:key}})});
 await fill(page,'가'.repeat(41));await page.locator('[data-submit]').click();await expect(page.locator('[data-create-status]')).toContainText('1~40');expect(posts).toBe(0);
 await fill(page,'별명','가'.repeat(1001));await page.locator('[data-submit]').click();expect(posts).toBe(0);
 await page.evaluate(()=>window.widgetOptions.callback('x'.repeat(8192)));await fill(page);await page.locator('[data-submit]').click();await expect(page.locator('[data-create-status]')).toContainText('너무 큽니다');expect(posts).toBe(0);
 await page.evaluate(()=>window.widgetOptions.callback('test-token'));await fill(page,' e\u0301 ','🚣'.repeat(1000));await page.locator('[data-submit]').click();await expect(page.locator('[data-created-key]')).toHaveValue(key);expect(posts).toBe(1);
});
test('copy, acknowledgement, keyboard focus, storage and leaving protections',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await setup(page,(r,h)=>r.request().method()==='POST'?r.fulfill({status:201,headers:h,json:{entry,deletionKey:key}}):empty(r,h));
 await fill(page);await page.locator('[data-submit]').click();await expect(page.locator('[data-created-key]')).toBeFocused();
 await page.locator('[data-copy]').click();expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(key);
 expect(await page.evaluate(()=>JSON.stringify({local:{...localStorage},session:{...sessionStorage},cookie:document.cookie}))).not.toContain(key);
 expect(await page.evaluate(async()=>await indexedDB.databases())).toEqual([]);
 expect(await page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})).toBe(true);
 await expect(page.locator('[data-submit]')).toBeDisabled();
 await page.locator('[data-ack]').press('Tab');await page.locator('[data-ack]').click();await expect(page.locator('[data-created-key]')).toHaveValue('');await expect(page.locator('[data-submit]')).toBeFocused();
 expect(await page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})).toBe(false);
});
for(const failure of ['network','non-json','503','403','413','400','429']) test(`POST ${failure}: useful status, no retry and reset`,async({page})=>{
 let posts=0;
 await setup(page,(r,h)=>{
  if(r.request().method()!=='POST')return empty(r,h);posts++;
  if(failure==='network')return r.abort();
  if(failure==='non-json')return r.fulfill({headers:h,body:'<html>unavailable</html>'});
  const status=Number(failure);return r.fulfill({status,headers:{...h,'Retry-After':'42'},json:{error:{code:status===403?'TURNSTILE_FAILED':'UNKNOWN'}}});
 });
 await fill(page);await page.locator('[data-submit]').click();
 const expected={network:'복구할 수 없습니다','non-json':'복구할 수 없습니다','503':'복구할 수 없습니다','403':'보안 확인','413':'너무 큽니다','400':'올바르지','429':'42초'};
 await expect(page.locator('[data-create-status]')).toContainText(expected[failure]);expect(posts).toBe(1);expect(await page.evaluate(()=>window.resets)).toBe(1);
});
test('Turnstile expiry, error and action configuration',async({page})=>{
 await setup(page,empty);expect(await page.evaluate(()=>({action:window.widgetOptions.action,sitekey:window.widgetOptions.sitekey}))).toEqual({action:'guestbook-create',sitekey:'1x00000000000000000000AA'});
 await page.evaluate(()=>window.widgetOptions['expired-callback']());await expect(page.locator('[data-submit]')).toBeDisabled();await expect(page.locator('[data-widget-status]')).toContainText('만료');
 await page.evaluate(()=>window.widgetOptions['error-callback']());await expect(page.locator('[data-widget-status]')).toContainText('실패');
});
test('unavailable widget leaves list readable and submission disabled',async({page})=>{
 await setup(page,empty,false);await expect(page.locator('[data-widget-status]')).toContainText('불러오지 못했습니다');await expect(page.locator('[data-submit]')).toBeDisabled();
});
test('malformed refresh preserves existing list; non-JSON and date Retry-After',async({page})=>{
 let gets=0;
 await setup(page,(r,h)=>{gets++;if(gets===1)return r.fulfill({headers:h,json:{items:[entry],nextCursor:null}});if(gets===2)return r.fulfill({headers:h,json:{items:[{...entry,createdAt:'bad'}],nextCursor:null}});if(gets===3)return r.fulfill({headers:h,body:'not json'});return r.fulfill({status:429,headers:{...h,'Retry-After':new Date(Date.now()+120000).toUTCString()},json:{error:{code:'RATE_LIMITED'}}})});
 for(let i=0;i<2;i++){await page.locator('[data-refresh]').click();await expect(page.locator('[data-list-status]')).toContainText('다시 시도');await expect(page.locator('[data-list] article')).toHaveCount(1)}
 await page.locator('[data-refresh]').click();await expect(page.locator('[data-list-status]')).toContainText('초 후');
});
test('wrong deletion key and concurrent deletion/list/creation prevention',async({page})=>{
 let deletes=0,release;
 await setup(page,async(r,h)=>{
  if(r.request().method()!=='DELETE')return r.fulfill({headers:h,json:{items:[entry],nextCursor:null}});
  deletes++;if(deletes===1)return r.fulfill({status:403,headers:h,json:{error:{code:'DELETE_DENIED'}}});
  await new Promise(resolve=>release=resolve);return r.fulfill({status:204,headers:h});
 });
 await page.locator('article summary').click();await page.locator('article input').fill('A'.repeat(43));await page.locator('article button').click();await expect(page.locator('article [role=status]')).toContainText('맞지 않거나');
 await page.locator('article input').fill(key);await page.locator('article button').click();await expect(page.locator('[data-refresh]')).toBeDisabled();await expect(page.locator('[data-submit]')).toBeDisabled();release();await expect(page.locator('article')).toHaveCount(0);
});
test('pending POST warns before leaving and blocks duplicate/conflicting actions',async({page})=>{
 let release,posts=0;
 await setup(page,async(r,h)=>{if(r.request().method()!=='POST')return empty(r,h);posts++;await new Promise(resolve=>release=resolve);return r.fulfill({status:201,headers:h,json:{entry,deletionKey:key}})});
 await fill(page);await page.locator('[data-submit]').click();await expect(page.locator('[data-refresh]')).toBeDisabled();await expect(page.locator('[data-submit]')).toBeDisabled();
 expect(await page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})).toBe(true);expect(posts).toBe(1);release();await expect(page.locator('[data-created-key]')).toHaveValue(key);
});
test('public production config has real key and API',async({page})=>{
 // Source evaluated in an isolated production hostname fixture; no POST to production.
 await page.goto('http://localhost:5174');const source=await (await page.request.get('http://localhost:5174/assets/js/guestbook-config.js')).text();
 const config=await page.evaluate(source=>{const fixture={};new Function('window','location',source)(fixture,{hostname:'jinkijung.github.io'});return fixture.KACC_GUESTBOOK_CONFIG},source);
 expect(config).toEqual({apiBase:'https://jinki-game-leaderboard.jinki-game-leaderboard.workers.dev',turnstileSiteKey:'0x4AAAAAAFOYvQaWF9liIg6O'});
});

test('stalled widget reports loading timeout',async({page})=>{
 await page.clock.install();
 await page.route('https://challenges.cloudflare.com/turnstile/**',()=>{});
 await page.route('http://*:8787/api/guestbook**',r=>r.fulfill({headers:{'Access-Control-Allow-Origin':'http://localhost:5174'},json:{items:[],nextCursor:null}}));
 await page.goto('http://localhost:5174/?page=guestbook');
 await expect(page.locator('[data-list-status]')).toContainText('아직 글이 없습니다');
 await page.clock.fastForward(15001);
 await expect(page.locator('[data-widget-status]')).toContainText('로딩이 지연');
 await expect(page.locator('[data-submit]')).toBeDisabled();
});
