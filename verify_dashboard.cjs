const fs = require('fs'), vm = require('vm'), assert = require('assert');
const html = fs.readFileSync('dashboard.html', 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(x=>x.trim());
for (const script of scripts) new Function(script);
const Chart = function(){}; Chart.register=()=>{}; Chart.defaults={font:{}};
const context = vm.createContext({console, Chart, window:{}, location:{hash:''}, localStorage:{getItem:()=>null}, document:{documentElement:{},addEventListener:()=>{},querySelector:()=>({innerHTML:'',addEventListener:()=>{}})}, getComputedStyle:()=>({getPropertyValue:()=> '#6656ee'}), MutationObserver:class{observe(){}},matchMedia:()=>({addEventListener:()=>{}}),setTimeout,clearTimeout,crypto:require('crypto').webcrypto,Date});
vm.runInContext(scripts.join('\n').replace(/render\(\);\s*$/, ''), context);
vm.runInContext(`
  function check(ok, message){ if (!ok) throw Error(message); }
  check(!DASH_TABS.some(x=>x[0]==='inprogress'), 'Duplicate status tab');
  check(ongoingStage({Stage:'In progress'}) === 'Ongoing', 'Legacy status merge');
  check(stageGroup({Stage:'On-going'}) === 'ongoing', 'Legacy ongoing merge');
  check(stageGroup({Stage:'Cancelled'}) === 'cancelled', 'Cancelled exclusion');
  check(!vendorIsActive({Status:'Inactive'}), 'Inactive vendor counted');
  check(vendorIsActive({Status:' Active '}), 'Active vendor missing');
  check(vendorIsActive({'Start Date':'2020-01-01','End Date':'2099-12-31'}), 'Date-based active vendor missing');
  const overview = dashOverview();
  check(overview.includes('Y2Y comparison'), 'Year comparison missing');
  check(!overview.includes('<h2>Value realization</h2>'), 'Value realization remains');
  check(!overview.includes('<h2>Investment distribution</h2>'), 'Distribution remains');
  check(overview.includes('Annual running cost'), 'Running cost missing');
  check(overview.includes('Investment by AI type'), 'AI investment view missing');
`,context);
console.log('PASS: syntax, overview render, merged stages, vendor status/date logic and requested sections');
