export function candidateFile(body,now=Date.now()){
 const name=String(body.name||'').slice(0,200),type=String(body.type||''),base64=String(body.base64||'');
 if(!name||!['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain'].includes(type))throw new Error('Upload a PDF, Word or text resume.');
 if(!base64||base64.length>14_000_000||!/^[A-Za-z0-9+/]*={0,2}$/.test(base64))throw new Error('Invalid resume file.');
 const size=Buffer.from(base64,'base64').length;if(!size||size>10_000_000)throw new Error('Resume must be smaller than 10 MB.');
 return{name,type,size,base64,updatedAt:now};
}
