<template>
  <div class="sync" v-loading="loading">
    <div class="sync__head">
      <h2>Document Sync</h2>
      <el-radio-group v-model="mode" size="small" @change="onMode">
        <el-radio-button value="push">Push</el-radio-button>
        <el-radio-button value="pull">Pull</el-radio-button>
      </el-radio-group>
    </div>

    <!-- ═══ PUSH ═══ -->
    <div v-show="mode==='push'">
      <div
class="sync__drop" :class="{over:drag}"
        @dragover.prevent="drag=true" @dragleave.prevent="drag=false" @drop.prevent="onDrop">
        <input ref="dirRef" type="file" multiple webkitdirectory hidden @change="onDir">
        <input ref="fileRef" type="file" multiple hidden @change="onFiles">
        <template v-if="!files.length">
          <el-icon :size="36"><UploadFilled /></el-icon>
          <p>Drop files or folder here</p>
          <div class="sync__drop-btns">
            <el-button type="primary" size="small" @click="dirRef?.click()">Select Folder</el-button>
            <el-button size="small" @click="fileRef?.click()">Select Files</el-button>
          </div>
        </template>
        <template v-else>
          <el-icon :size="28" color="var(--el-color-success)"><CircleCheckFilled /></el-icon>
          <p>{{ files.length }} files — {{ fmt(totalBytes) }}</p>
          <div class="sync__drop-btns">
            <el-button size="small" @click="dirRef?.click()">+ Folder</el-button>
            <el-button size="small" @click="fileRef?.click()">+ Files</el-button>
            <el-button size="small" type="danger" plain @click="clear">Clear</el-button>
          </div>
        </template>
      </div>

      <div v-if="files.length" class="sync__cfg">
        <label>Workspace <el-input v-model="ws" size="small" placeholder="project" /></label>
        <label>Prefix <el-input v-model="pfx" size="small" placeholder="optional" /></label>
        <label>Exclude
          <span class="sync__tags">
            <span v-for="(p,i) in exc" :key="p" class="sync__chip" :class="{bi:BI.has(p)}">{{p}}<b @click="exc.splice(i,1)">×</b></span>
            <input v-if="adding" ref="exRef" v-model="exNew" size="6" class="sync__chip sync__chip--inp" @blur="addEx" @keyup.enter="addEx">
            <b v-else class="sync__chip-add" @click="adding=true;nextTick(()=>exRef?.focus())">+</b>
          </span>
        </label>
      </div>

      <ProTable v-if="files.length" :columns="pushCols" :data="files" :pagination="true" :tool-button="false" :border="false" :default-page-size="25" />

      <div v-if="files.length" class="sync__act">
        <el-button type="primary" size="large" :loading="uping" :disabled="uping" @click="push">
          {{ uping ? `Uploading ${prog.d}/${prog.t}` : 'Upload' }}
        </el-button>
        <el-button v-if="failN && !uping" size="small" type="warning" @click="retry">Retry {{ failN }}</el-button>
      </div>
      <el-progress v-if="uping" :percentage="pct" :stroke-width="6" style="margin-top:12px" />
      <el-alert v-if="result && !uping" :title="`${result.c} created · ${result.o} updated${result.f?' · '+result.f+' failed':''}`" :type="result.f?'warning':'success'" show-icon :closable="false" style="margin-top:12px" />
    </div>

    <!-- ═══ PULL ═══ -->
    <div v-show="mode==='pull'">
      <div class="sync__act">
        <el-input v-model="rq" size="small" placeholder="Filter..." clearable style="width:200px" />
        <el-button size="small" type="primary" :loading="qry" @click="scan">Query Sessions</el-button>
      </div>
      <ProTable v-if="remote.length" :columns="pullCols" :data="filtR" :pagination="true" :tool-button="false" :border="false" :default-page-size="20" row-key="_id" @selection-change="(rows:any[])=>rsel=rows" />
      <div v-if="remote.length" class="sync__act">
        <el-button size="small" :disabled="!rsel.length" @click="rsel.forEach(s=>downloadOne(s))">Download {{ rsel.length }}</el-button>
        <el-button size="small" type="danger" :disabled="!rsel.length" @click="deleteSel">Delete {{ rsel.length }}</el-button>
      </div>
      <div v-if="!remote.length && !qry" class="sync__empty">Click "Query Sessions" to load</div>
    </div>
  </div>
</template>

<script setup lang="ts" name="syncPage">
import { computed, nextTick, ref, h } from "vue";
import { UploadFilled, CircleCheckFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElTag, ElTooltip, ElButton } from "element-plus";
import { writeFile, readFile, deleteFile } from "@/api/modules/fileService";
import { queryDocuments, createDocument, callService } from "@/api/modules/dataService";
import ProTable from "@/components/ProTable/index.vue";
import type { ColumnProps } from "@/components/ProTable/interface";

// types
interface F { file:File; path:string; rp:string; size:number; st:'p'|'u'|'ok'|'fail'; err?:string }
interface R { _id?:string; fp?:string; t?:string[]; up?:number; _dl?:boolean }

// shared
const mode = ref<"push"|"pull">("push"); const loading = ref(false);
const SVC = "services.database.data_service";

// push
const dirRef=ref<HTMLInputElement>(), fileRef=ref<HTMLInputElement>(), drag=ref(false);
const files=ref<F[]>([]); const ws=ref(""); const pfx=ref("");
const exc=ref([".git","node_modules",".claude-plugin","dist"]);
const BI=new Set([".git","node_modules",".claude-plugin","dist"]);
const adding=ref(false), exNew=ref(""), exRef=ref<HTMLInputElement>();
const uping=ref(false), prog=ref({d:0,t:0});
const result=ref<{c:number;o:number;f:number}|null>(null);

// pull
const remote=ref<R[]>([]); const qry=ref(false); const rq=ref(""); const rsel=ref<R[]>([]);

// computed
const pfxParts=computed(()=>pfx.value.split(",").map(s=>s.trim()).filter(Boolean));
const totalBytes=computed(()=>files.value.reduce((s,f)=>s+f.size,0));
const failN=computed(()=>files.value.filter(f=>f.st==="fail").length);
const pct=computed(()=>prog.value.t?Math.round(prog.value.d/prog.value.t*100):0);
const filtR=computed(()=>{const q=rq.value.toLowerCase();return q?remote.value.filter(s=>(s.fp||"").toLowerCase().includes(q)):remote.value;});

// helpers
const fmt=(b:number)=>b<1024?`${b}B`:b<1048576?`${(b/1024).toFixed(1)}KB`:`${(b/1048576).toFixed(2)}MB`;
const ic=(p:string)=>{const e=(p.split(".").pop()||"").toLowerCase();const m:Record<string,string>={vue:"🟢",ts:"🔷",tsx:"⚛️",js:"🟨",py:"🐍",json:"📋",yaml:"⚙️",yml:"⚙️",md:"📝",css:"🎨",html:"🌐",svg:"🖼️",png:"🖼️"};return m[e]||"📄";};
function rpath(lp:string):string{let r=lp.replace(/\s/g,"_");r=(ws.value||"untitled")+"/"+r;const s:string[]=[];if(pfxParts.value.length)s.push(...pfxParts.value);s.push(...r.split("/"));return s.join("/");}
function addEx(){const v=exNew.value.trim();if(v&&!exc.value.includes(v))exc.value.push(v);exNew.value="";adding.value=false;}

// ProTable columns — push
const pushCols:ColumnProps<F>[] = [
  { type:"index", width:50 },
  { prop:"path", label:"File", minWidth:200, render:(s:any)=>h('span',[h('span',{class:'sync__fi'},ic(s.row.path)),s.row.path]) },
  { prop:"rp", label:"→ Remote", minWidth:200, render:(s:any)=>h('code',{class:'sync__code'},s.row.rp) },
  { prop:"size", label:"Size", width:90, render:(s:any)=>fmt(s.row.size) },
  { prop:"st", label:"Status", width:100, render:(s:any)=>{const r=s.row;if(r.st==='p')return h(ElTag,{size:'small',type:'info'},()=>'pending');if(r.st==='u')return h(ElTag,{size:'small',type:'warning'},()=>'uploading');if(r.st==='ok')return h(ElTag,{size:'small',type:'success'},()=>'done');return h(ElTooltip,{content:r.err||'Failed',placement:'top'},{default:()=>h(ElTag,{size:'small',type:'danger'},()=>'failed')});}},
];

// ProTable columns — pull
const pullCols:ColumnProps<R>[] = [
  { type:"selection", width:40 },
  { prop:"fp", label:"Path", minWidth:260, render:(s:any)=>h('code',{class:'sync__code'},s.row.fp) },
  { prop:"t", label:"Tags", width:180, render:(s:any)=>(s.row.t||[]).slice(0,3).map((t:string)=>h(ElTag,{size:'small',type:'info',style:{marginRight:'2px'}},()=>t)) },
  { prop:"up", label:"Updated", width:160, render:(s:any)=>s.row.up?new Date(s.row.up).toLocaleString():'—' },
  { prop:"_dl", label:"", width:160, render:(s:any)=>h('span',{style:{display:'flex',gap:'6px'}},[
    h(ElButton,{size:'small',text:true,type:'primary',loading:s.row._dl,onClick:()=>downloadOne(s.row)},()=>'Download'),
    h(ElButton,{size:'small',text:true,type:'danger',onClick:()=>deleteOne(s.row)},()=>'Delete'),
  ])},
];

// file selection
function fromList(fl:FileList):F[]{const o:F[]=[];for(let i=0;i<fl.length;i++){const f=fl[i];const lp=(f as any).webkitRelativePath||f.name;if(!ws.value)ws.value=lp.split("/")[0]||"untitled";o.push({file:f,path:lp,rp:rpath(lp),size:f.size,st:"p"});}return o;}
function onDir(e:Event){const i=e.target as HTMLInputElement;if(i.files?.length){files.value=fromList(i.files);result.value=null;}}
function onFiles(e:Event){const i=e.target as HTMLInputElement;if(i.files?.length){files.value=[...files.value,...fromList(i.files)];if(!ws.value)ws.value="untitled";result.value=null;}}
async function onDrop(e:DragEvent){drag.value=false;if(!e.dataTransfer?.items)return;const q:FileSystemEntry[]=[];for(let i=0;i<e.dataTransfer.items.length;i++){const en=e.dataTransfer.items[i].webkitGetAsEntry();if(en)q.push(en);}
  (async()=>{async function w(en:FileSystemEntry,b=""):Promise<F[]>{const o:F[]=[];if(en.isFile){const f=await new Promise<File>((rs,rj)=>(en as FileSystemFileEntry).file(rs,rj));const lp=b?b+"/"+en.name:en.name;o.push({file:f,path:lp,rp:rpath(lp),size:f.size,st:"p"});}else if(en.isDirectory){const r=(en as FileSystemDirectoryEntry).createReader();const ss=await new Promise<FileSystemEntry[]>(rs=>{r.readEntries(rs);});for(const se of ss)o.push(...await w(se,b?b+"/"+en.name:en.name));}return o;}
    for(const en of q)files.value=[...files.value,...await w(en)];if(!ws.value&&files.value.length)ws.value=files.value[0].path.split("/")[0]||"untitled";result.value=null;})();}
function clear(){files.value=[];ws.value="";result.value=null;}

// push
async function push(){const tu=files.value.filter(f=>f.st!=="ok");if(!tu.length)return;uping.value=true;let c=0,o=0,f=0;prog.value={d:0,t:tu.length};for(const x of tu)x.st="p";
  const q=[...tu];async function w(){while(q.length){const x=q.shift();if(!x)return;x.st="u";try{await writeFile(x.rp,await x.file.text());
    try{await callService(SVC,"update_document",{cname:"sessions",file_path:x.rp,data:{updatedAt:Date.now(),lastAccessTime:Date.now()}});o++;}
    catch{const n=Date.now();const tg=x.rp.split("/");tg.pop();await createDocument("sessions",{url:`aicr-session://${n}-${Math.random().toString(36).slice(2,8)}`,title:x.path.split("/").pop(),file_path:x.rp,messages:[],tags:tg,isFavorite:false,createdAt:n,updatedAt:n,lastAccessTime:n});c++;}
    x.st="ok";}catch(e:any){x.st="fail";x.err=e?.message||"Failed";f++;}prog.value.d++;}}
  await Promise.all(Array.from({length:Math.min(4,tu.length)},w));result.value={c,o,f};uping.value=false;ElMessage[f?"warning":"success"](`${c+o} uploaded${f?`, ${f} failed`:""}`);}
async function retry(){for(const x of files.value)if(x.st==="fail")x.st="p";await push();}

// pull
async function scan(){qry.value=true;try{const r=await queryDocuments<any>({cname:"sessions",pageSize:500});remote.value=(r?.data?.list??[]).filter((s:any)=>s.file_path).map((s:any)=>({_id:s._id||s.key,fp:s.file_path,t:s.tags,up:s.updatedAt}));}catch(e:any){ElMessage.error(e?.message);}qry.value=false;}
function dl(fn:string,ct:string){const b=new Blob([ct]);const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=fn;a.click();URL.revokeObjectURL(u);}
async function downloadOne(s:R){if(!s.fp)return;s._dl=true;try{dl(s.fp.split("/").pop()||"file",await readFile(s.fp));}catch(e:any){ElMessage.error(e?.message);}s._dl=false;}
async function deleteOne(s:R){if(!s.fp)return;try{await ElMessageBox.confirm(`Delete "${s.fp}"?`,"Confirm",{type:"warning",confirmButtonText:"Delete"});}catch{return;}try{await callService(SVC,"delete_document",{cname:"sessions",key:s._id||""});try{await deleteFile(s.fp);}catch{/* */}remote.value=remote.value.filter(x=>x._id!==s._id);ElMessage.success("Deleted");}catch(e:any){ElMessage.error(e?.message);}}
async function deleteSel(){for(const s of[...rsel.value])await deleteOne(s);}
function onMode(v:string|number|boolean|undefined){if(String(v)==="pull"&&!remote.value.length&&!qry.value)scan();}
</script>

<style scoped>
.sync{height:calc(100vh - 95px);padding:24px;overflow:auto;background:var(--el-bg-color-page)}
.sync__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.sync__head h2{margin:0;font-size:20px;font-weight:700}
.sync__drop{display:flex;flex-direction:column;align-items:center;gap:8px;padding:44px 20px;border:2px dashed var(--el-border-color);border-radius:12px;cursor:pointer;transition:.15s;background:var(--el-bg-color)}
.sync__drop:hover,.sync__drop.over{border-color:var(--el-color-primary);background:var(--el-color-primary-light-9)}
.sync__drop p{margin:0;font-size:14px;color:var(--el-text-color-secondary)}
.sync__drop-btns{display:flex;gap:8px}
.sync__cfg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:16px 0;padding:14px 16px;background:var(--el-bg-color);border-radius:8px;border:1px solid var(--el-border-color-lighter)}
.sync__cfg label{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:500;color:var(--el-text-color-secondary)}
.sync__tags{display:flex;align-items:center;gap:4px;flex-wrap:wrap;min-height:26px}
.sync__chip{display:inline-flex;align-items:center;gap:3px;padding:0 7px;border-radius:3px;font-size:11px;background:var(--el-fill-color);border:1px solid var(--el-border-color-lighter)}
.sync__chip.bi{background:var(--el-color-info-light-9);color:var(--el-color-info);border-color:var(--el-color-info-light-7)}
.sync__chip b{cursor:pointer;color:var(--el-text-color-placeholder);font-size:12px}
.sync__chip b:hover{color:var(--el-color-danger)}
.sync__chip-add{cursor:pointer;color:var(--el-color-primary);font-weight:700;font-size:14px}
.sync__chip--inp{border-color:var(--el-color-primary);outline:none;width:60px;background:var(--el-bg-color)}
.sync__fi{margin-right:4px}
.sync__code{font-size:11px;padding:1px 5px;border-radius:3px;background:var(--el-fill-color-lighter);color:var(--el-color-primary);font-family:ui-monospace,monospace}
.sync__act{display:flex;gap:8px;align-items:center;margin-top:16px}
.sync__empty{padding:60px 0;text-align:center;color:var(--el-text-color-placeholder);font-size:14px}
</style>