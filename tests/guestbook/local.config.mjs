import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'.',testMatch:'local.spec.mjs',workers:1,use:{headless:true,channel:process.env.PLAYWRIGHT_CHANNEL || 'chrome',trace:'off',screenshot:'off',video:'off'},reporter:'list',timeout:45000});
