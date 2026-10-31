export function adminPageRedirect(path, authenticated) {
  const login=['/admin-login','/admin-portal','/trikonet-admin-access'].includes(path);
  if(path==='/')return authenticated?'/admin':'/admin-login';
  if(login)return authenticated?'/admin':null;
  if(path==='/admin'||path.startsWith('/admin/'))return authenticated?null:'/admin-login';
  return null;
}
