import {estimate} from './calculator.js';
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
const form=$('#calculator-form');let current,roofData=null,roofConfirmed=false,announceTimer;
function render(){
 const input=Object.fromEntries(new FormData(form));input.yieldPerKwp=form.elements.yieldPerKwp.value;input.orientation=form.elements.orientation.value;
 const roofConfig=roofConfirmed?roofData?.configs.find(c=>c.panelsCount===Number(input.panels)):null;
 if(roofConfig)input.roofGeneration=roofConfig.annualAcKwh;
 current=estimate(input);
 $('#price').textContent=`${money(current.costLow)}–${money(current.costHigh)}`;
 $('#benefit').textContent=money(current.benefit);$('#self-use').textContent=`${current.selfUsePercent}%`;
 $('#bill-now').textContent=`${money(current.bill)} / month`;$('#bill-after').textContent=`${money(current.monthlyAfter)} / month`;
 $('#after-bar').style.width=`${Math.min(100,current.monthlyAfter/current.bill*100)}%`;
 const selection=`${current.panels} panels · ${current.kwp.toFixed(1)} kWp · ${current.battery?`${current.battery} kWh battery`:'solar only'}`;
 $('#system-summary').textContent=selection;$('#enquiry-summary').textContent=`Your selection · ${selection}`;
 $('#solar-array').replaceChildren(...Array.from({length:current.panels},()=>document.createElement('span')));
 $('#solar-array').style.gridTemplateColumns=`repeat(${current.panels===16?8:current.panels/2},1fr)`;
 $('.battery-art').hidden=!current.battery;
 $('#generation-source').textContent=current.usesRoofData?`Includes data from Google Maps · ${Math.round(current.generation).toLocaleString('en-GB')} kWh/year after an assumed 15% system loss. Price and tariff assumptions remain illustrative.`:'Manual estimate · illustrative generation, prices and tariffs.';
 $('[name=yieldPerKwp]').disabled=!!roofConfig;$('[name=orientation]').disabled=!!roofConfig;
 clearTimeout(announceTimer);announceTimer=setTimeout(()=>{$('#result-announcement').textContent=`Estimate updated: ${selection}. ${money(current.costLow)} to ${money(current.costHigh)}. Estimated annual benefit ${money(current.benefit)}.`},400);
}
form.addEventListener('submit',e=>e.preventDefault());
form.addEventListener('input',e=>{if(e.target.id==='bill-range')$('#bill').value=e.target.value;if(e.target.id==='bill')$('#bill-range').value=e.target.value;if(form.checkValidity())render()});
form.addEventListener('change',()=>{if(form.checkValidity())render()});
$('#bill').addEventListener('blur',()=>{if(!$('#bill').checkValidity()){$('#bill').value=Math.max(40,Math.min(400,Number($('#bill').value)||140));$('#bill-range').value=$('#bill').value;render()}});
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{const night=button.dataset.mode==='night';document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});$('#energy-visual').classList.toggle('night',night);$('#mode-title').textContent=night?'The sun sets. Your energy stays.':'Let your roof do the work.';$('#mode-copy').textContent=night?'Your battery can supply stored solar energy after sunset. The grid tops things up whenever the battery cannot meet your home’s demand.':'Solar powers your home first. With a battery, surplus can be stored for the evening; any remaining energy can be exported.';$('#flow-roof').textContent=night?'Solar resting':'Solar generating';$('#flow-battery').textContent=night?'Battery supplying':'Battery charging';$('#flow-caption').textContent=night?'EVENING · USE THE SUNSHINE YOU SAVED.':'DAYTIME · USE IT. STORE IT. EXPORT IT.'}));
document.querySelectorAll('[data-dialog]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.dialog).showModal()));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}})});
const postcodePattern=/^(GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})$/i;
function showStep(two){$('#survey-step-one').hidden=two;$('#survey-step-two').hidden=!two;$('#survey-step-one').querySelectorAll('input,select').forEach(x=>x.disabled=two);$('#survey-step-two').querySelectorAll('input').forEach(x=>x.disabled=!two);$('#form-error').textContent=''}
showStep(false);
$('#survey-next').addEventListener('click',()=>{const code=$('#postcode');code.value=code.value.trim().toUpperCase();code.setCustomValidity(postcodePattern.test(code.value)?'':'Please enter a full UK postcode, for example L21 3TX.');for(const el of $('#survey-step-one').querySelectorAll('input,select'))if(!el.reportValidity())return;showStep(true);$('#full-name').focus()});
$('#postcode').addEventListener('input',()=>$('#postcode').setCustomValidity(''));
$('#survey-back').addEventListener('click',()=>{showStep(false);$('#postcode').focus()});
$('#survey-form').addEventListener('submit',e=>{e.preventDefault();if(!$('#full-name').value.trim()){$('#form-error').textContent='Please enter a name to try the demo.';$('#full-name').focus();return}if(!e.target.reportValidity())return;$('#success-summary').textContent=`${$('#system-summary').textContent} · Illustrative budget ${money(current.costLow)}–${money(current.costHigh)}.`;e.target.hidden=true;$('#survey-success').hidden=false;$('#survey-success').focus();e.target.reset();showStep(false)});
$('#survey-reset').addEventListener('click',()=>{$('#survey-success').hidden=true;$('#survey-form').hidden=false;showStep(false);$('#postcode').focus()});
if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.target.id==='calculator')$('.mobile-sticky').classList.toggle('is-hidden',e.isIntersecting)},{threshold:.08});io.observe($('#calculator'))}

render();
