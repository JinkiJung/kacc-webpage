import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testIgnore:'local.spec.mjs',workers:1,use:{headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || 'chrome'},reporter:'list',timeout:30000});
