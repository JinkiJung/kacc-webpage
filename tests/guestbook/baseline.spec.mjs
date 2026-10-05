import { test, expect } from '@playwright/test';
const KEY='A'.repeat(43);
async function mocks(page) {
 await page.route('https://challenges.cloudflare.com/turnstile/**',route=>route.fulfill({contentType:'text/javascript',body:`window.turnstile={render(el,options){window.testTurnstileCallback=options.callback;queueMicrotask(()=>options.callback('mock-token'));return 'mock-widget';},reset(){queueMicrotask(()=>window.testTurnstileCallback('mock-token'));},remove(){}};`}));
 const entry={id:'cb5cdbdb-863b-42f7-859d-592a97535d10',name:'<img src=x onerror=alert(1)>',message:'<script>window.injected=true</script>',createdAt:'2026-10-05T13:00:00.000Z'};
 let created=false,deleted=false;
 await page.route('http://*:8787/api/guestbook**',async route=>{
  const request=route.request(),headers={'Access-Control-Allow-Origin':new URL(page.url()).origin,'Access-Control-Expose-Headers':'Retry-After'};
  if(request.method()==='OPTIONS')return route.fulfill({status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, DELETE','Access-Control-Allow-Headers':'Content-Type'}});
  if(request.method()==='POST'){created=true;return route.fulfill({status:201,headers,json:{entry:{...entry,id:'deaddead-863b-42f7-859d-592a97535d10',name:request.postDataJSON().name,message:request.postDataJSON().message},deletionKey:KEY}});}
  if(request.method()==='DELETE'){expect(request.postDataJSON()).toEqual({deletionKey:KEY});deleted=true;return route.fulfill({status:204,headers});}
  const cursor=new URL(request.url()).searchParams.get('cursor');
  return route.fulfill({headers,json:{items:cursor?[{...entry,id:'af5cdbdb-863b-42f7-859d-592a97535d10',name:'Earlier'}]:deleted?[]:[entry],nextCursor:cursor?null:'opaque-cursor'}});
 });
}
for(const host of ['localhost','127.0.0.1']) {
 test(`${host}: all ten themes render safe text and pagination`,async({page})=>{
  await mocks(page);
  // Production now selects theme01; exercise retained renderers without changing that preference.
  await page.route('**/assets/js/app.js*', async route => {
    const response=await route.fetch();
    const source=(await response.text()).replace("data.themes.find(theme => theme.id === '01')", "data.themes.find(theme => theme.id === (params.get('theme') || '01'))");
    await route.fulfill({response,body:source});
  });
  for(let i=1;i<=10;i++){
   const theme=String(i).padStart(2,'0');
   await page.goto(`http://${host}:5174/?page=guestbook&theme=${theme}`);
   await expect(page.locator('.kacc-guestbook')).toBeVisible();
   await expect(page.locator('body')).toHaveAttribute('data-theme',theme);
   if(i===1)await page.screenshot({path:'/private/tmp/kacc-desktop-'+host+'.png',fullPage:true});
   await expect(page.locator('[data-list] h2')).toHaveText('<img src=x onerror=alert(1)>');
   await expect(page.locator('[data-list] script,[data-list] img')).toHaveCount(0);
   expect(await page.evaluate(()=>window.injected)).toBeUndefined();
   await page.getByRole('button',{name:'더 보기',exact:true}).click();
   await expect(page.locator('[data-list] article')).toHaveCount(2);
  }
 });
 test(`${host}: create, copy/acknowledge key, then delete without persisting credentials`,async({page})=>{
  await mocks(page);await page.goto(`http://${host}:5174/?page=guestbook&theme=01`);
  await page.locator('[data-create] input[name=name]').fill('Tester');await page.locator('[data-create] textarea').fill('Hello canoe');
  await expect(page.locator('[data-submit]')).toBeEnabled();await page.locator('[data-submit]').click();
  await expect(page.locator('[data-created-key]')).toHaveValue(KEY);await expect(page.locator('[data-submit]')).toBeDisabled();
  expect(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).not.toContain(KEY);
  await page.getByRole('button',{name:'키를 보관했습니다'}).click();await expect(page.locator('[data-created-key]')).toHaveValue('');
  const article=page.locator('article[data-entry-id="deaddead-863b-42f7-859d-592a97535d10"]');
  await article.locator('summary').click();await article.locator('input[type=password]').fill(KEY);await article.getByRole('button',{name:'삭제',exact:true}).click();await expect(article).toHaveCount(0);
  expect(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).not.toContain(KEY);
 });
}
test('accessible rate-limit, empty and network states; mobile layout',async({page})=>{
 await page.setViewportSize({width:390,height:844});await mocks(page);
 await page.route('http://*:8787/api/guestbook**',route=>route.fulfill({status:429,headers:{'Access-Control-Allow-Origin':'http://localhost:5174','Access-Control-Expose-Headers':'Retry-After','Retry-After':'42'},json:{error:{code:'RATE_LIMITED'}}}));
 await page.goto('http://localhost:5174/?page=guestbook&theme=10');await expect(page.locator('[data-list-status]')).toContainText('42초');
 await page.unroute('http://*:8787/api/guestbook**');
 await page.route('http://*:8787/api/guestbook**',route=>route.fulfill({headers:{'Access-Control-Allow-Origin':'http://localhost:5174'},json:{items:[],nextCursor:null}}));
 await page.locator('[data-refresh]').click();await expect(page.locator('[data-list-status]')).toContainText('아직 글이 없습니다');
 const box=await page.locator('.kacc-guestbook').boundingBox();expect(box.width).toBeLessThanOrEqual(390);
 await page.screenshot({path:'/private/tmp/kacc-mobile.png',fullPage:true});
 await page.unroute('http://*:8787/api/guestbook**');await page.route('http://*:8787/api/guestbook**',route=>route.abort());
 await page.locator('[data-refresh]').click();await expect(page.locator('[data-list-status]')).toContainText('네트워크');
});
