// Executed by Figma's use_figma runtime with a preceding `const spec = ...`.
const same = figma.currentPage.children.find(n=>n.type==='SECTION' && n.name===spec.title);
if(same) return {existing:same.id,key:spec.key};
await Promise.all(['Regular','Medium','Bold','Semi Bold'].map(style=>figma.loadFontAsync({family:'Inter',style})));
const paint=hex=>[{type:'SOLID',color:{r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255}}];
const nodes={},created=[],fitWarnings=[];
const board=figma.createSection();board.name=spec.title;board.resize(spec.width,spec.height);board.x=spec.position.x;board.y=spec.position.y;board.fills=paint('#FFFFFF');board.placeholder=true;
created.push(board.id);
function label(parent,value,x,y,w,size=26,bold=false,color='#505B6C'){
 const n=figma.createText();n.fontName={family:'Inter',style:bold?'Semi Bold':'Regular'};n.fontSize=size;n.lineHeight={unit:'PIXELS',value:Math.round(size*1.42)};n.fills=paint(color);n.characters=value;n.textAutoResize='HEIGHT';n.resize(w,n.height);parent.appendChild(n);n.x=x;n.y=y;created.push(n.id);return n;
}
function zone(id,parent,x,y,w,h,fill,name=''){
 const n=figma.createSection();n.name=name;n.resize(w,h);n.fills=paint(fill);parent.appendChild(n);n.x=x;n.y=y;nodes[id]=n;created.push(n.id);return n;
}
label(board,'AGENT PLATFORM  /  ENGINEERING VIEWS',80,42,2000,21,true,'#667085');
label(board,spec.title,80,92,2240,62,true,'#1E293B');
label(board,spec.subtitle,80,192,2240,28,false);
for(const g of spec.groups){
 const n=zone(g.id,board,g.x,g.y,g.w,g.h,g.fill);
 if(g.title)label(n,g.title,40,22,g.w-80,29,true,'#1E293B');
}
for(const c of spec.cards){
 const parent=c.parent?nodes[c.parent]:board;
 const ox=c.parent?spec.groups.find(g=>g.id===c.parent).x:0;
 const oy=c.parent?spec.groups.find(g=>g.id===c.parent).y:0;
 const n=zone(c.id,parent,c.x-ox,c.y-oy,c.w,c.h,c.fill);
 zone(c.id+'-accent',n,0,0,6,c.h,c.accent);
 const title=label(n,c.title,26,24,c.w-52,30,true,'#1E293B');
 const body=label(n,c.body,26,28+title.height,c.w-52,25,false);
 const required=body.y+body.height+20;
 if(required>c.h){n.resize(c.w,Math.ceil(required));nodes[c.id+'-accent'].resize(6,Math.ceil(required));fitWarnings.push({id:c.id,requested:c.h,actual:Math.ceil(required)});}
 if(c.badge)label(n,c.badge,c.w-170,12,150,20,true);
}
for(const t of spec.texts)nodes[t.id]=label(board,t.text,t.x,t.y,t.w,t.size,t.bold,t.color);
for(let i=0;i<spec.edges.length;i++){
 const e=spec.edges[i];const n=figma.createConnector();board.appendChild(n);
 n.connectorStart={endpointNodeId:nodes[e.a].id,magnet:e.sides[0]};n.connectorEnd={endpointNodeId:nodes[e.b].id,magnet:e.sides[1]};n.connectorLineType='ELBOWED';
 n.connectorStartStrokeCap=e.both?'ARROW_LINES':'NONE';n.connectorEndStrokeCap='ARROW_LINES';n.strokeWeight=2;n.strokes=paint(e.color);n.dashPattern=e.dashed?[8,7]:[];
 if(e.label){n.text.fontName={family:'Inter',style:'Medium'};n.text.fontSize=23;n.text.characters=e.label;}
 n.name=e.a+' → '+e.b;nodes['edge-'+i]=n;created.push(n.id);
}
for(const p of spec.paths){
 for(let i=1;i<p.points.length;i++){
  const n=figma.createConnector();board.appendChild(n);
  const [ax,ay]=p.points[i-1],[bx,by]=p.points[i];
  n.connectorStart={position:{x:spec.position.x+ax,y:spec.position.y+ay}};
  n.connectorEnd={position:{x:spec.position.x+bx,y:spec.position.y+by}};
  n.connectorLineType='STRAIGHT';n.connectorStartStrokeCap='NONE';n.connectorEndStrokeCap=p.arrow&&i===p.points.length-1?'ARROW_LINES':'NONE';n.strokeWeight=2;n.strokes=paint(p.color);n.dashPattern=p.dashed?[8,7]:[];n.name=p.id+'-'+i;nodes[p.id+'-'+i]=n;created.push(n.id);
 }
}
label(board,spec.footer,80,1270,2240,24,false);
board.placeholder=false;
const overflow=[];
for(const p of [board,...Object.values(nodes).filter(n=>n.type==='SECTION')]){
 for(const n of p.children){if(n.type!=='CONNECTOR'&&(n.x<-.5||n.y<-.5||n.x+n.width>p.width+1||n.y+n.height>p.height+1))overflow.push({parent:p.id,node:n.id,name:n.name,x:n.x,y:n.y,w:n.width,h:n.height,parentW:p.width,parentH:p.height});}
}
return {key:spec.key,rootId:board.id,ids:Object.fromEntries(Object.entries(nodes).map(([k,v])=>[k,v.id])),created,fitWarnings,overflow};
