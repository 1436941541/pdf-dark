import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanBackground} from '../lib/background.ts';
const options={strength:65,preserveColors:true};
function fixture(paper=[220,220,220]) {const w=160,h=120,data=new Uint8ClampedArray(w*h*4);for(let i=0;i<data.length;i+=4)data.set([...paper,255],i);return {data,w,h};}
const at=(data,w,x,y)=>Array.from(data.subarray((y*w+x)*4,(y*w+x)*4+3));
function patch(f,x,y,w,h,color){for(let dy=0;dy<h;dy++)for(let dx=0;dx<w;dx++)f.data.set([...color,255],((y+dy)*f.w+x+dx)*4);}
test('whitens gray paper and keeps dark text',()=>{const f=fixture();patch(f,30,30,60,5,[30,30,30]);cleanBackground(f.data,f.w,f.h,options);assert(at(f.data,f.w,10,10)[0]>240);assert.deepEqual(at(f.data,f.w,50,32),[30,30,30]);});
test('neutralizes yellow paper instead of merely removing all color',()=>{const f=fixture([235,220,175]);cleanBackground(f.data,f.w,f.h,{...options,strength:100});const p=at(f.data,f.w,20,20);assert(p.every(v=>v>=253),String(p));});
test('faint strokes retain and gain contrast',()=>{const f=fixture();patch(f,30,30,60,3,[200,200,200]);cleanBackground(f.data,f.w,f.h,options);assert(at(f.data,f.w,20,20)[0]-at(f.data,f.w,50,31)[0]>25);});
test('color protection keeps a blue stamp and yellow highlight',()=>{const f=fixture();patch(f,20,20,35,30,[35,65,185]);patch(f,85,20,45,30,[250,230,70]);cleanBackground(f.data,f.w,f.h,options);assert.deepEqual(at(f.data,f.w,30,30),[35,65,185]);assert.deepEqual(at(f.data,f.w,100,30),[250,230,70]);});
test('zero strength preserves every pixel and opaque white remains white',()=>{const f=fixture();const before=f.data.slice();cleanBackground(f.data,f.w,f.h,{...options,strength:0});assert.deepEqual(f.data,before);const white=fixture([255,255,255]);cleanBackground(white.data,white.w,white.h,options);assert.deepEqual(at(white.data,white.w,10,10),[255,255,255]);});
test('mild uneven illumination improves without making binary pixels',()=>{const f=fixture();for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){const v=160+Math.round(x/f.w*60);f.data.set([v,v,v,255],(y*f.w+x)*4);}cleanBackground(f.data,f.w,f.h,{...options,strength:100});assert(at(f.data,f.w,20,20)[0]>210);assert(new Set(f.data.filter((_,i)=>i%4===0)).size>2);});
test('dark pages stay unchanged and invalid sizes are rejected',()=>{const f=fixture([40,40,40]);const before=f.data.slice();cleanBackground(f.data,f.w,f.h,options);assert.deepEqual(f.data,before);assert.throws(()=>cleanBackground(f.data,0,1,options));});
