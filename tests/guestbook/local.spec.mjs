import {test,expect} from '@playwright/test';
for(const host of ['localhost','127.0.0.1']) test(`${host}: actual gateway, D1 and official test Turnstile round trip`,async({page})=>{
 const name=`로컬 임시 확인 ${Date.now()}`;
 let deletionKey='',id='';
 await page.goto(`http://${host}:5174/?page=guestbook`);
 await expect(page.locator('[data-widget-status]')).toContainText('보안 확인 완료',{timeout:30000});
 await expect(page.locator('[data-list-status]')).not.toContainText('불러오는 중');
 await page.getByLabel('이름',{exact:true}).fill(name);await page.getByLabel('메시지',{exact:true}).fill('실제 로컬 API · 공식 테스트 보안 확인 · 확인 후 삭제');
 const created=page.waitForResponse(r=>r.url().endsWith('/api/guestbook')&&r.request().method()==='POST');
 await page.locator('[data-submit]').click();const response=await created;expect(response.status()).toBe(201);
 const result=await response.json();deletionKey=result.deletionKey;id=result.entry.id;
 try {
  await expect(page.locator('[data-key-panel]')).toBeVisible();
  expect((await page.locator('[data-created-key]').inputValue()).length).toBe(43);
  expect(await page.evaluate(k=>JSON.stringify({...localStorage,...sessionStorage}).includes(k),deletionKey)).toBe(false);
  await expect(page.locator(`[data-entry-id="${id}"] h2`)).toHaveText(name);
  await page.locator('[data-ack]').click();await page.locator('[data-refresh]').click();
  const article=page.locator(`[data-entry-id="${id}"]`);await expect(article).toBeVisible();await article.locator('summary').click();await article.locator('input').fill(deletionKey);
  const removed=page.waitForResponse(r=>r.request().method()==='DELETE');await article.locator('button').click();expect((await removed).status()).toBe(204);await expect(article).toHaveCount(0);
  deletionKey='';
 } finally {
  if (await page.locator('[data-key-panel]').isVisible()) await page.locator('[data-ack]').click();
  if(deletionKey&&id){const cleanup=await page.request.delete(`http://${host}:8787/api/guestbook/${encodeURIComponent(id)}`,{headers:{Origin:`http://${host}:5174`},data:{deletionKey}});expect(cleanup.status()).toBe(204);deletionKey='';}
 }
});
