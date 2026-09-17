import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'tests', timeout:60000, workers:1,
  use:{baseURL:'http://127.0.0.1:8765',viewport:{width:1440,height:1000},launchOptions:{...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
  webServer:{command:'python -m http.server 8765 --bind 127.0.0.1',url:'http://127.0.0.1:8765',reuseExistingServer:true}
});
