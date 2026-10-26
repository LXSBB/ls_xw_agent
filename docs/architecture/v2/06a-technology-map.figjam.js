const spec={"key": "06a-technology-map", "title": "06A  /  技术栈映射", "subtitle": "沿用当前 Java 项目补齐上线能力；颜色标职责，标签标实现状态。", "position": {"x": 12060, "y": -7200}, "width": 2400, "height": 1350, "footer": "依据：pom.xml / application.yml / 源码入口。版本沿用当前项目；数据库规范与 IAM 协议待确认。", "groups": [{"id": "row0", "x": 80, "y": 332, "w": 2240, "h": 100, "fill": "#F9F9F9", "title": null}, {"id": "accent0", "x": 80, "y": 332, "w": 7, "h": 100, "fill": "#3DADFF", "title": null}, {"id": "badge0", "x": 1950, "y": 357, "w": 270, "h": 49, "fill": "#FFFFFF", "title": null}, {"id": "row1", "x": 80, "y": 440, "w": 2240, "h": 100, "fill": "#FFFFFF", "title": null}, {"id": "accent1", "x": 80, "y": 440, "w": 7, "h": 100, "fill": "#3DADFF", "title": null}, {"id": "badge1", "x": 1950, "y": 465, "w": 270, "h": 49, "fill": "#FFFFFF", "title": null}, {"id": "row2", "x": 80, "y": 548, "w": 2240, "h": 100, "fill": "#F9F9F9", "title": null}, {"id": "accent2", "x": 80, "y": 548, "w": 7, "h": 100, "fill": "#874FFF", "title": null}, {"id": "badge2", "x": 1950, "y": 573, "w": 270, "h": 49, "fill": "#FFFFFF", "title": null}, {"id": "row3", "x": 80, "y": 656, "w": 2240, "h": 100, "fill": "#FFFFFF", "title": null}, {"id": "accent3", "x": 80, "y": 656, "w": 7, "h": 100, "fill": "#B3B3B3", "title": null}, {"id": "badge3", "x": 1950, "y": 681, "w": 270, "h": 49, "fill": "#FFFFFF", "title": null}, {"id": "row4", "x": 80, "y": 764, "w": 2240, "h": 100, "fill": "#F9F9F9", "title": null}, {"id": "accent4", "x": 80, "y": 764, "w": 7, "h": 100, "fill": "#66D575", "title": null}, {"id": "badge4", "x": 1950, "y": 789, "w": 270, "h": 49, "fill": "#FFFFFF", "title": null}, {"id": "row5", "x": 80, "y": 872, "w": 2240, "h": 100, "fill": "#FFFFFF", "title": null}, {"id": "accent5", "x": 80, "y": 872, "w": 7, "h": 100, "fill": "#5AD8CC", "title": null}, {"id": "badge5", "x": 1950, "y": 897, "w": 270, "h": 49, "fill": "#FFFFFF", "title": null}, {"id": "optional", "x": 80, "y": 1040, "w": 2240, "h": 160, "fill": "#FFFBF0", "title": null}], "cards": [], "texts": [{"id": "col1", "text": "架构职责", "x": 110, "y": 270, "w": 390, "size": 26, "bold": true, "color": "#505B6C"}, {"id": "col2", "text": "采用的技术与落点", "x": 570, "y": 270, "w": 1210, "size": 26, "bold": true, "color": "#505B6C"}, {"id": "col3", "text": "当前状态", "x": 1950, "y": 270, "w": 320, "size": 26, "bold": true, "color": "#505B6C"}, {"id": "role0", "text": "交互入口", "x": 110, "y": 357, "w": 390, "size": 30, "bold": true, "color": "#505B6C"}, {"id": "tech0", "text": "HTML / CSS / JavaScript · REST", "x": 570, "y": 342, "w": 1300, "size": 28, "bold": true, "color": "#1E293B"}, {"id": "body0", "text": "static/ 与 AgentController；SSE 根据交互需要扩展", "x": 570, "y": 385, "w": 1300, "size": 23, "bold": false, "color": "#505B6C"}, {"id": "status0", "text": "已有", "x": 1980, "y": 366, "w": 220, "size": 23, "bold": true, "color": "#505B6C"}, {"id": "role1", "text": "应用服务", "x": 110, "y": 465, "w": 390, "size": 30, "bold": true, "color": "#505B6C"}, {"id": "tech1", "text": "Java 21 · Spring Boot 4.1.1 · Maven", "x": 570, "y": 450, "w": 1300, "size": 28, "bold": true, "color": "#1E293B"}, {"id": "body1", "text": "Web MVC / Validation；继续使用模块化单体与可执行 JAR", "x": 570, "y": 493, "w": 1300, "size": 23, "bold": false, "color": "#505B6C"}, {"id": "status1", "text": "已有", "x": 1980, "y": 474, "w": 220, "size": 23, "bold": true, "color": "#505B6C"}, {"id": "role2", "text": "模型与工具", "x": 110, "y": 573, "w": 390, "size": 30, "bold": true, "color": "#505B6C"}, {"id": "tech2", "text": "Spring AI 2.0.1 · ChatModel · ToolCallingManager", "x": 570, "y": 558, "w": 1300, "size": 28, "bold": true, "color": "#1E293B"}, {"id": "body2", "text": "@Tool / ToolCallback + API 适配器；网关治理仍需补齐", "x": 570, "y": 601, "w": 1300, "size": 23, "bold": false, "color": "#505B6C"}, {"id": "status2", "text": "基础已有", "x": 1980, "y": 582, "w": 220, "size": 23, "bold": true, "color": "#505B6C"}, {"id": "role3", "text": "持久状态", "x": 110, "y": 681, "w": 390, "size": 30, "bold": true, "color": "#505B6C"}, {"id": "tech3", "text": "PostgreSQL + Spring JDBC + Flyway", "x": 570, "y": 666, "w": 1300, "size": 28, "bold": true, "color": "#1E293B"}, {"id": "body3", "text": "建议基线；保存请求、会话、任务、操作与可重放结果", "x": 570, "y": 709, "w": 1300, "size": 23, "bold": false, "color": "#505B6C"}, {"id": "status3", "text": "待新增", "x": 1980, "y": 690, "w": 220, "size": 23, "bold": true, "color": "#505B6C"}, {"id": "role4", "text": "身份与权限", "x": 110, "y": 789, "w": 390, "size": 30, "bold": true, "color": "#505B6C"}, {"id": "tech4", "text": "Spring Security + IAM 适配器", "x": 570, "y": 774, "w": 1300, "size": 28, "bold": true, "color": "#1E293B"}, {"id": "body4", "text": "接入用户 / 租户 / 权限；IAM 支持 JWT 时再用 Resource Server", "x": 570, "y": 817, "w": 1300, "size": 23, "bold": false, "color": "#505B6C"}, {"id": "status4", "text": "待新增", "x": 1980, "y": 798, "w": 220, "size": 23, "bold": true, "color": "#505B6C"}, {"id": "role5", "text": "观测与运维", "x": 110, "y": 897, "w": 390, "size": 30, "bold": true, "color": "#505B6C"}, {"id": "tech5", "text": "Actuator → Micrometer / OpenTelemetry → 监控平台", "x": 570, "y": 882, "w": 1300, "size": 28, "bold": true, "color": "#1E293B"}, {"id": "body5", "text": "已有 health 与基础日志；指标、链路和告警待接入", "x": 570, "y": 925, "w": 1300, "size": 23, "bold": false, "color": "#505B6C"}, {"id": "status5", "text": "部分已有", "x": 1980, "y": 906, "w": 220, "size": 23, "bold": true, "color": "#505B6C"}, {"id": "optional-title", "text": "按需启用", "x": 110, "y": 1064, "w": 340, "size": 30, "bold": true, "color": "#505B6C"}, {"id": "optional-items", "text": "RAG / pgvector         Redis         Outbox / MQ         MCP", "x": 570, "y": 1064, "w": 1660, "size": 29, "bold": true, "color": "#505B6C"}, {"id": "optional-use", "text": "知识检索                         缓存 / 限流      异步投递                  工具协议", "x": 570, "y": 1112, "w": 1660, "size": 24, "bold": false, "color": "#505B6C"}, {"id": "optional-note", "text": "有明确场景再引入；首版不以向量库、消息队列或多 Agent 框架为前提。", "x": 570, "y": 1154, "w": 1660, "size": 23, "bold": false, "color": "#505B6C"}], "edges": [], "paths": []};
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
