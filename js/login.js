import {supabase,$,setStatus,hideStatus} from './api.js';
const form=$('#login-form'),status=$('#login-status');
(async()=>{const {data:{session}}=await supabase.auth.getSession();if(session){const {data:{user}}=await supabase.auth.getUser();if(user?.app_metadata?.role==='admin')location.replace('/admin/dashboard');}})();
form.addEventListener('submit',async e=>{
 e.preventDefault();hideStatus(status);$('#login-submit').disabled=true;
 try{
  const {data,error}=await supabase.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#password').value});
  if(error)throw error;
  const {data:auth,error:userError}=await supabase.auth.getUser();if(userError)throw userError;
  if(auth.user?.app_metadata?.role!=='admin'){await supabase.auth.signOut();throw new Error('Akun ini tidak memiliki akses admin.');}
  location.replace('/admin/dashboard');
 }catch(err){setStatus(status,err.message||'Login gagal.','error');}
 finally{$('#login-submit').disabled=false;}
});
