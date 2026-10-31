const form=document.querySelector('#booking-form');
const bangkokDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const bangkokTime=()=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
if(form){
 const date=form.elements.date;date.min=bangkokDate();
 for(const field of [date,form.elements.time])field.addEventListener('change',()=>{date.setCustomValidity('');form.elements.time.setCustomValidity('')});
 form.addEventListener('submit',e=>{e.preventDefault();date.min=bangkokDate();if(date.value<date.min){date.setCustomValidity('Please choose today or a future date in Thailand.');date.reportValidity();return}if(date.value===bangkokDate()&&form.elements.time.value<=bangkokTime()){form.elements.time.setCustomValidity('Please choose a future time in Thailand.');form.elements.time.reportValidity();return}
 const data=new FormData(form);const val=k=>String(data.get(k)||'').trim();if(!val('name')||!val('contact')){alert('Please enter your name and an email or phone number.');return}
 const dateLabel=new Date(val('date')+'T12:00:00+07:00').toLocaleDateString('en-GB',{timeZone:'Asia/Bangkok',weekday:'short',day:'numeric',month:'long',year:'numeric'});
 const message=`Hello 79 Beach Bar & Restaurant,\n\nI would like to request a table.\n\nName: ${val('name')}\nReply to: ${val('contact')}\nDate: ${dateLabel}\nTime: ${val('time')} (Thailand time)\nParty: ${val('guests')}\nSeating: ${val('seating')}${val('notes')?'\nNotes: '+val('notes'):''}\n\nPlease let me know whether you can confirm this reservation. Thank you!`;
 document.querySelector('#booking-summary').textContent=message;
 document.querySelector('#email-request').href='mailto:theerakan30398@hotmail.com?subject='+encodeURIComponent('Table request — '+val('date')+' at '+val('time'))+'&body='+encodeURIComponent(message);
 document.querySelector('#copy-status').textContent='';document.querySelector('#booking-dialog').showModal();
 });
 document.querySelector('#copy-request').addEventListener('click',async()=>{const text=document.querySelector('#booking-summary').textContent;try{await navigator.clipboard.writeText(text);document.querySelector('#copy-status').textContent='Copied. Open Facebook, choose Message, paste and send your request.'}catch{const range=document.createRange();range.selectNodeContents(document.querySelector('#booking-summary'));window.getSelection().removeAllRanges();window.getSelection().addRange(range);document.querySelector('#copy-status').textContent='Select and copy the highlighted request, then paste it into a message on Facebook.'}});
 const mobile=document.querySelector('.mobile-book');const booking=document.querySelector('#book');new IntersectionObserver(entries=>{mobile.classList.toggle('hidden',entries[0].isIntersecting)},{threshold:.1}).observe(booking);
}
document.querySelectorAll('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
document.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>{const im=document.querySelector('#enlarged-image');im.src=b.dataset.image;im.alt=b.dataset.caption;document.querySelector('#image-caption').textContent=b.dataset.caption;document.querySelector('#image-dialog').showModal()}));
document.querySelectorAll('.fb-tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.fb-tab').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-selected',String(t===b))});document.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.tab)}));
