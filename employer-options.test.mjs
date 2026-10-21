import test from 'node:test';import assert from 'node:assert/strict';import {employerOptions} from './employer-options.mjs';
test('newly saved company remains selectable in the next job with its logo and identity',()=>{
 const saved={id:'school-id',slug:'the-millennium-school',title:' THE MILLENNIUM SCHOOL ',logo:'https://media.trikonet.com/school.png',status:'publish'};
 const options=employerOptions([{slug:'existing',title:{rendered:'Existing'}}],[saved]);
 assert.deepEqual(options.find(o=>o.slug===saved.slug),{id:saved.id,slug:saved.slug,title:{rendered:'THE MILLENNIUM SCHOOL'},status:'publish',metas:{_employer_logo:saved.logo,_employer_featured_image:''}});
});
test('saved changes override imports, deleted companies stay hidden, recovery drafts are excluded',()=>{
 const result=employerOptions([{slug:'edited',title:{rendered:'Old'}},{slug:'deleted',title:{rendered:'Deleted'}}],[{slug:'edited',title:'New',logo:'/new.png'},{slug:'deleted',title:'Deleted',status:'trash'},{slug:'autosave-1',title:'Unfinished'},{slug:'draft',title:'Unfinished',autosaved:true}]);
 assert.equal(result.length,1);assert.equal(result[0].title.rendered,'New');assert.equal(result[0].metas._employer_logo,'/new.png');
});
