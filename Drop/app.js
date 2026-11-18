const form=document.querySelector('form');
fetch('/api/contact', {cache:'no-store'}).then(response => {
  if(response.status === 204) form.hidden = false;
}).catch(() => {});
form.addEventListener('submit',async event=>{
  event.preventDefault();
  const button=form.querySelector('button'),status=form.querySelector('[role=status]');
  button.disabled=true;status.textContent='Sending…';
  try {
    const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});
    if(response.status !== 201) throw new Error();
    form.reset();status.textContent='Thanks! Your message has been received.';
  } catch {status.textContent='Delivery could not be confirmed. Please email me directly.';}
  finally {button.disabled=false;}
});
