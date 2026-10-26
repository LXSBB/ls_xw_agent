const spec={"key": "05a-component-map", "title": "05A  /  组件关系", "subtitle": "一个应用进程中的职责边界，以及它依赖的外部系统。", "position": {"x": 6700, "y": -7200}, "width": 2400, "height": 1350, "footer": "目标设计 · 实线表示调用，虚线表示状态或配置依赖；响应沿调用关系返回。部署位置见 06C。", "groups": [{"id": "app", "x": 400, "y": 260, "w": 1430, "h": 680, "fill": "#F5FBFF", "title": "Agent 应用 · 模块化单体"}], "cards": [{"id": "client", "title": "访问渠道", "body": "Web / App / API", "x": 80, "y": 370, "w": 250, "h": 150, "accent": "#B3B3B3", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "runner", "title": "请求 Runner", "body": "认证上下文 · 请求去重", "x": 440, "y": 370, "w": 300, "h": 150, "accent": "#3DADFF", "parent": "app", "badge": null, "fill": "#FFFFFF"}, {"id": "router", "title": "根编排器", "body": "范围门控 · 路由 · 预算", "x": 850, "y": 370, "w": 430, "h": 150, "accent": "#3DADFF", "parent": "app", "badge": null, "fill": "#FFFFFF"}, {"id": "model", "title": "模型网关", "body": "分类 / 规划 / 回复接口", "x": 1440, "y": 370, "w": 350, "h": 150, "accent": "#874FFF", "parent": "app", "badge": null, "fill": "#FFFFFF"}, {"id": "provider", "title": "模型服务", "body": "外部 API · 版本与配额", "x": 1960, "y": 370, "w": 360, "h": 150, "accent": "#874FFF", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "result", "title": "结果与交互", "body": "证据校验 · 保存后响应", "x": 440, "y": 660, "w": 300, "h": 150, "accent": "#5AD8CC", "parent": "app", "badge": null, "fill": "#FFFFFF"}, {"id": "runtime", "title": "Skill Runtime", "body": "Workflow / ReAct · 任务状态", "x": 850, "y": 660, "w": 430, "h": 150, "accent": "#66D575", "parent": "app", "badge": null, "fill": "#FFFFFF"}, {"id": "tools", "title": "工具网关", "body": "鉴权 · 读写分流 · 适配器", "x": 1440, "y": 660, "w": 350, "h": 150, "accent": "#66D575", "parent": "app", "badge": null, "fill": "#FFFFFF"}, {"id": "external", "title": "外部业务系统", "body": "业务规则与权威事实", "x": 1960, "y": 660, "w": 360, "h": 150, "accent": "#B3B3B3", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "state", "title": "运行状态库", "body": "Runner 管请求 · Runtime 管任务 · 写入协调器管操作", "x": 440, "y": 1040, "w": 840, "h": 150, "accent": "#B3B3B3", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "assets", "title": "版本化配置与资产", "body": "Skill / Prompt / Tool Schema · 每个任务绑定版本", "x": 1440, "y": 1040, "w": 880, "h": 150, "accent": "#B3B3B3", "parent": null, "badge": null, "fill": "#FFFFFF"}], "texts": [{"id": "app-caption", "text": "同一 Spring Boot 进程；模块可以独立演进，无需先拆微服务。", "x": 440, "y": 327, "w": 1300, "size": 24, "bold": false, "color": "#505B6C"}, {"id": "shared-model", "text": "Runtime 与结果模块按需复用模型网关；模型仅提出决策，由代码执行。", "x": 850, "y": 866, "w": 920, "size": 24, "bold": false, "color": "#505B6C"}, {"id": "asset-scope", "text": "发布配置供编排器与 Runtime 加载", "x": 1470, "y": 985, "w": 790, "size": 24, "bold": false, "color": "#505B6C"}], "edges": [{"a": "client", "b": "runner", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "runner", "b": "router", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "router", "b": "model", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "model", "b": "provider", "label": "模型 API", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "router", "b": "runtime", "label": "分发", "sides": ["BOTTOM", "TOP"], "dashed": false, "both": false, "color": "#757575"}, {"a": "runtime", "b": "tools", "label": "工具调用", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "tools", "b": "external", "label": "HTTP / RPC", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "runtime", "b": "result", "label": "结果", "sides": ["LEFT", "RIGHT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "result", "b": "runner", "label": "最终结果", "sides": ["TOP", "BOTTOM"], "dashed": false, "both": false, "color": "#757575"}, {"a": "app", "b": "state", "label": "持久化状态", "sides": ["BOTTOM", "TOP"], "dashed": true, "both": false, "color": "#757575"}], "paths": []};
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
