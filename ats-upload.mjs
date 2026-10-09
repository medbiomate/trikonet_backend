export async function extractResume(file){
 if(!file||typeof file.base64!=='string'||file.base64.length>7_000_000)throw Error('Upload a PDF or DOCX resume up to 5 MB.');
 const buffer=Buffer.from(file.base64,'base64');
 if(!buffer.length||buffer.length>5*1024*1024)throw Error('Upload a PDF or DOCX resume up to 5 MB.');
 const name=String(file.name||'');let text='',pages=null;
 if(/\.pdf$/i.test(name)&&buffer.subarray(0,5).toString()==='%PDF-'){
  const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task=getDocument({data:new Uint8Array(buffer),isEvalSupported:false,useSystemFonts:true});let document;
  try{document=await task.promise;pages=document.numPages;if(pages>20)throw Error('Please upload a resume with no more than 20 pages.');for(let page=1;page<=pages;page++){const content=await (await document.getPage(page)).getTextContent();text+=content.items.map(item=>item.str+(item.hasEOL?'\n':' ')).join('')+'\n';if(text.length>40000)throw Error('This resume is too long. Please upload a shorter version.');}}finally{await task.destroy();}
 }else if(/\.docx$/i.test(name)&&buffer.subarray(0,2).toString()==='PK'){
  const mammoth=await import('mammoth');text=(await mammoth.extractRawText({buffer})).value;
 }else throw Error('Unsupported file. Please choose a PDF or DOCX resume.');
 if(text.trim().length<100)throw Error('We could not read enough resume text. Scanned PDFs need a text-based PDF or DOCX version. No points were charged.');
 return{text,document:{name:name.slice(0,180),pages,bytes:buffer.length}};
}
