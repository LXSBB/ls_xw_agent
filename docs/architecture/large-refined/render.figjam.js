// Build a complete draft, then replace the children of the original root section.
// The original section ID and URL are retained. Backups must already exist.
await Promise.all(['Regular','Medium','Bold','Semi Bold'].map(style=>figma.loadFontAsync({family:'Inter',style})));
const original=await figma.getNodeByIdAsync(spec.rootId);
const backup=await figma.getNodeByIdAsync(spec.backupId);
if(!original||original.type!=='SECTION'||!backup||backup.type!=='SECTION')throw new Error('Original section and backup are required');
const paint=hex=>[{type:'SOLID',color:{r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255}}];
const nodes={},created=[],fitWarnings=[];
const draft=figma.createSection();draft.name=spec.title+' · draft';draft.resize(spec.width,spec.height);draft.x=spec.position.x;draft.y=spec.position.y;draft.fills=paint('#FFFFFF');draft.placeholder=true;
function label(parent,value,x,y,w,size=28,bold=false,color='#505B6C',lineHeight=null){
 const n=figma.createText();n.fontName={family:'Inter',style:bold?'Semi Bold':'Regular'};n.fontSize=size;n.lineHeight={unit:'PIXELS',value:lineHeight||Math.round(size*1.42)};n.fills=paint(color);n.characters=value;n.textAutoResize='HEIGHT';n.resize(w,n.height);parent.appendChild(n);n.x=x;n.y=y;created.push(n.id);return n;
}
function zone(id,parent,x,y,w,h,fill){
 const n=figma.createSection();n.name='';n.resize(w,h);n.fills=paint(fill);parent.appendChild(n);n.x=x;n.y=y;nodes[id]=n;created.push(n.id);return n;
}
label(draft,'AGENT PLATFORM  /  FULL ENGINEERING ARCHITECTURE',80,44,spec.width-160,24,true,'#667085');
label(draft,spec.title,80,100,spec.width-160,72,true,'#1E293B');
label(draft,spec.subtitle,80,208,spec.width-160,32);
for(const g of spec.groups){
 const parent=g.parent?nodes[g.parent]:draft;
 const pg=spec.groups.find(x=>x.id===g.parent);
 const n=zone(g.id,parent,g.x-(pg?.x||0),g.y-(pg?.y||0),g.w,g.h,g.fill);
 if(g.title)label(n,g.title,g.pad||40,26,g.w-2*(g.pad||40),g.size||40,true,'#1E293B');
 if(g.subtitle)label(n,g.subtitle,g.pad||40,88,g.w-2*(g.pad||40),g.subSize||27);
}
for(const c of spec.cards){
 const parent=c.parent?nodes[c.parent]:draft;
 const pg=spec.groups.find(x=>x.id===c.parent);
 const n=zone(c.id,parent,c.x-(pg?.x||0),c.y-(pg?.y||0),c.w,c.h,c.fill||'#FFFFFF');
 if(c.accent)zone(c.id+'-accent',n,0,0,6,c.h,c.accent);
 const title=label(n,c.title,26,22,c.w-52,c.titleSize||32,true,'#1E293B');
 const body=label(n,c.body,26,28+title.height,c.w-52,c.size||28,false,'#505B6C',c.lineHeight);
 const required=body.y+body.height+22;
 if(required>c.h){n.resize(c.w,Math.ceil(required));if(c.accent)nodes[c.id+'-accent'].resize(6,Math.ceil(required));fitWarnings.push({id:c.id,requested:c.h,actual:Math.ceil(required)});}
}
for(const t of spec.texts){
 const parent=t.parent?nodes[t.parent]:draft;
 const pg=spec.groups.find(x=>x.id===t.parent);
 const n=label(parent,t.text,t.x-(pg?.x||0),t.y-(pg?.y||0),t.w,t.size||28,t.bold||false,t.color||'#505B6C',t.lineHeight);
 if(t.url)n.setRangeHyperlink(0,n.characters.length,{type:'URL',value:t.url});
 nodes[t.id]=n;
}
for(const p of spec.paths){
 for(let i=1;i<p.points.length;i++){
  const n=figma.createConnector();draft.appendChild(n);
  const [ax,ay]=p.points[i-1],[bx,by]=p.points[i];
  n.connectorStart={position:{x:spec.position.x+ax,y:spec.position.y+ay}};n.connectorEnd={position:{x:spec.position.x+bx,y:spec.position.y+by}};
  n.connectorLineType='STRAIGHT';n.connectorStartStrokeCap='NONE';n.connectorEndStrokeCap=i===p.points.length-1?'ARROW_LINES':'NONE';n.strokeWeight=2;n.strokes=paint(p.color||'#757575');n.dashPattern=p.dashed?[8,7]:[];n.name=p.id+'-'+i;nodes[p.id+'-'+i]=n;created.push(n.id);
 }
}
label(draft,spec.footer,80,spec.height-102,spec.width-160,28);
const overflow=[];
for(const p of [draft,...Object.values(nodes).filter(n=>n.type==='SECTION')]){
 for(const n of p.children){if(n.type!=='CONNECTOR'&&(n.x<-.5||n.y<-.5||n.x+n.width>p.width+1||n.y+n.height>p.height+1))overflow.push({parent:p.id,node:n.id,name:n.name,x:n.x,y:n.y,w:n.width,h:n.height,parentW:p.width,parentH:p.height});}
}
if(overflow.length){draft.name=spec.title+' · requires layout repair';draft.x=23000;draft.placeholder=false;return {draftId:draft.id,createdNodeIds:created,fitWarnings,overflow,committed:false};}
const removed=[];
function collect(n){removed.push(n.id);for(const c of n.children||[])collect(c);}
for(const n of original.children)collect(n);
for(const n of original.findAll(n=>n.type==='CONNECTOR'))n.remove();
for(const n of [...original.children])n.remove();
original.resize(spec.width,spec.height);original.x=spec.position.x;original.y=spec.position.y;original.fills=paint('#FFFFFF');original.name=spec.title;
for(const n of [...draft.children]){const x=n.x,y=n.y;original.appendChild(n);if(n.type!=='CONNECTOR'){n.x=x;n.y=y;}}
draft.remove();
for(let i=0;i<spec.edges.length;i++){
 const e=spec.edges[i];const n=figma.createConnector();original.appendChild(n);
 n.connectorStart={endpointNodeId:nodes[e.a].id,magnet:e.sides[0]};n.connectorEnd={endpointNodeId:nodes[e.b].id,magnet:e.sides[1]};n.connectorLineType='ELBOWED';
 n.connectorStartStrokeCap=e.both?'ARROW_LINES':'NONE';n.connectorEndStrokeCap='ARROW_LINES';n.strokeWeight=2;n.strokes=paint(e.color||'#757575');n.dashPattern=e.dashed?[8,7]:[];
 if(e.label){n.text.fontName={family:'Inter',style:'Medium'};n.text.fontSize=e.size||25;n.text.characters=e.label;}
 n.name=e.a+' → '+e.b;nodes['edge-'+i]=n;created.push(n.id);
}
return {rootId:original.id,backupId:backup.id,key:spec.key,ids:Object.fromEntries(Object.entries(nodes).map(([k,v])=>[k,v.id])),createdNodeIds:created,mutatedNodeIds:[original.id],removedNodeIds:removed,fitWarnings,overflow,committed:true};
