const spec={"key": "06c-deployment-topology", "title": "06C  /  部署拓扑", "subtitle": "建议基线：既有网关 + 双副本应用 + 外置数据库；模型与业务能力复用外部服务。", "position": {"x": 9380, "y": -5650}, "width": 2400, "height": 1350, "footer": "目标拓扑 · 部署平台、数据库高可用、资源规格与 SLO 待确认；恢复任务需原子抢占，避免多副本重复执行。", "groups": [{"id": "app", "x": 970, "y": 310, "w": 650, "h": 620, "fill": "#F5FBFF", "title": "应用私网 · 建议双副本"}], "cards": [{"id": "a", "title": "副本 A · Spring Boot", "body": "Linux VM A / Docker · JRE 21", "x": 1010, "y": 440, "w": 570, "h": 160, "accent": "#3DADFF", "parent": "app", "badge": null, "fill": "#FFFFFF"}, {"id": "b", "title": "副本 B · Spring Boot", "body": "Linux VM B / Docker · JRE 21", "x": 1010, "y": 700, "w": 570, "h": 160, "accent": "#3DADFF", "parent": "app", "badge": null, "fill": "#FFFFFF"}, {"id": "client", "title": "客户端", "body": "Web / App / IM", "x": 80, "y": 500, "w": 260, "h": 150, "accent": "#B3B3B3", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "gateway", "title": "网关 / 托管 LB", "body": "TLS :443 · 路由与限流", "x": 470, "y": 500, "w": 340, "h": 150, "accent": "#3DADFF", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "db", "title": "PostgreSQL", "body": "外置 / 托管 · 备份与恢复", "x": 1810, "y": 310, "w": 510, "h": 160, "accent": "#B3B3B3", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "model", "title": "外部模型 API", "body": "Key · 配额 · 超时与预算", "x": 1810, "y": 560, "w": 510, "h": 160, "accent": "#874FFF", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "iam", "title": "IAM / 业务 API", "body": "身份、权限与权威业务事实", "x": 1810, "y": 810, "w": 510, "h": 160, "accent": "#66D575", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "config", "title": "运行配置与凭证", "body": "平台注入所有副本；密钥不进入镜像\nprod Profile · 0.0.0.0:8080 · 数据源", "x": 80, "y": 1040, "w": 730, "h": 170, "accent": "#B3B3B3", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "monitor", "title": "监控与健康检查", "body": "指标 / 日志 / Trace → 现有监控平台\n就绪与存活探针 · 优雅停机", "x": 970, "y": 1040, "w": 650, "h": 170, "accent": "#5AD8CC", "parent": null, "badge": null, "fill": "#FFFFFF"}], "texts": [{"id": "external-label", "text": "外部依赖 / 受控出口", "x": 1810, "y": 250, "w": 510, "size": 25, "bold": true, "color": "#505B6C"}, {"id": "app-desc", "text": "相同镜像与配置版本；共享持久状态", "x": 1010, "y": 385, "w": 570, "size": 24, "bold": false, "color": "#505B6C"}, {"id": "platform-title", "text": "复用已有部署平台", "x": 80, "y": 790, "w": 730, "size": 30, "bold": true, "color": "#505B6C"}, {"id": "platform-body", "text": "本地 / 测试：Compose\n已有 Kubernetes：Deployment + Service\n入口使用团队现有 Ingress / Gateway", "x": 80, "y": 843, "w": 730, "size": 25, "bold": false, "color": "#505B6C"}, {"id": "state-note-title", "text": "副本替换不丢任务", "x": 1810, "y": 1055, "w": 510, "size": 30, "bold": true, "color": "#505B6C"}, {"id": "state-note", "text": "会话、请求、任务与写操作都存入数据库；\n外部调用和本地事务不承诺原子一致。", "x": 1810, "y": 1106, "w": 510, "size": 24, "bold": false, "color": "#505B6C"}], "edges": [{"a": "client", "b": "gateway", "label": "HTTPS", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "gateway", "b": "app", "label": ":8080", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "app", "b": "db", "label": "JDBC", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "app", "b": "model", "label": "HTTPS", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "app", "b": "iam", "label": "受控调用", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "app", "b": "monitor", "label": "采集 / 探测", "sides": ["BOTTOM", "TOP"], "dashed": true, "both": false, "color": "#757575"}], "paths": []};
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
