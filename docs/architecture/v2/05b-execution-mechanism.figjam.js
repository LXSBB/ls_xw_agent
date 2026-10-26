const spec={"key": "05b-execution-mechanism", "title": "05B  /  执行机制", "subtitle": "只读工具与写入工具分路；确定性流程和模型规划受同一边界约束。", "position": {"x": 9380, "y": -7200}, "width": 2400, "height": 1350, "footer": "目标设计 · 实线表示执行或结果传递；双向线表示决策与观察；虚线表示未知操作的核实分支。", "groups": [{"id": "bounds", "x": 80, "y": 1120, "w": 2240, "h": 120, "fill": "#F9F9F9", "title": null}], "cards": [{"id": "route", "title": "范围与路由", "body": "事件优先 · 文本分类", "x": 80, "y": 320, "w": 330, "h": 160, "accent": "#3DADFF", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "workflow", "title": "Workflow", "body": "确定步骤 · 缺参暂停", "x": 520, "y": 270, "w": 360, "h": 150, "accent": "#66D575", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "react", "title": "有界 ReAct", "body": "模型决策 ↔ 工具观察", "x": 520, "y": 510, "w": 360, "h": 150, "accent": "#874FFF", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "gateway", "title": "统一工具网关", "body": "白名单 · Schema · 权限", "x": 1000, "y": 400, "w": 360, "h": 170, "accent": "#66D575", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "read", "title": "只读适配器", "body": "授权后读取外部事实", "x": 1500, "y": 270, "w": 340, "h": 150, "accent": "#66D575", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "write", "title": "写入协调器", "body": "先保存 operationId\n再提交外部写入", "x": 1500, "y": 570, "w": 340, "h": 170, "accent": "#FF9E42", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "api", "title": "外部 API", "body": "返回事实 / 操作回执", "x": 2000, "y": 400, "w": 320, "h": 170, "accent": "#B3B3B3", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "validate", "title": "统一结果校验", "body": "Schema · 证据 · 操作状态", "x": 1000, "y": 870, "w": 360, "h": 160, "accent": "#5AD8CC", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "persist", "title": "状态提交", "body": "事务保存任务与最终结果", "x": 520, "y": 870, "w": 360, "h": 160, "accent": "#5AD8CC", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "reply", "title": "响应与交互", "body": "回复 / 澄清 / 能力说明", "x": 80, "y": 870, "w": 330, "h": 160, "accent": "#5AD8CC", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "recover", "title": "核实与恢复", "body": "查回执；无依据保留 UNKNOWN", "x": 1500, "y": 870, "w": 340, "h": 160, "accent": "#FF9E42", "parent": null, "badge": null, "fill": "#FFFFFF"}], "texts": [{"id": "entry-label", "text": "识别与分发", "x": 80, "y": 244, "w": 330, "size": 25, "bold": true, "color": "#505B6C"}, {"id": "short-result-label", "text": "范围外 / 未支持 / 待澄清 → 短路结果", "x": 290, "y": 712, "w": 650, "size": 24, "bold": false, "color": "#505B6C"}, {"id": "api-result-label", "text": "事实 /\n操作回执", "x": 2190, "y": 745, "w": 130, "size": 23, "bold": false, "color": "#505B6C"}, {"id": "no-tool-result", "text": "无需工具时，\n执行器结果直达统一校验。", "x": 1000, "y": 700, "w": 450, "size": 24, "bold": false, "color": "#505B6C"}, {"id": "inner", "text": "内循环：限制轮数、工具数、耗时与成本", "x": 110, "y": 1143, "w": 715, "size": 25, "bold": true, "color": "#505B6C"}, {"id": "outer", "text": "重路由：仅无副作用的范围不匹配，限次执行", "x": 850, "y": 1143, "w": 820, "size": 25, "bold": true, "color": "#505B6C"}, {"id": "unknown", "text": "写入未知：禁止盲目重试", "x": 1740, "y": 1143, "w": 540, "size": 25, "bold": true, "color": "#505B6C"}, {"id": "out-of-scope", "text": "领域外统一说明“目前无法回答相关问题”；不调用业务工具。", "x": 110, "y": 1186, "w": 2100, "size": 23, "bold": false, "color": "#505B6C"}], "edges": [{"a": "route", "b": "workflow", "label": "执行", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "route", "b": "react", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "workflow", "b": "gateway", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "react", "b": "gateway", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": true, "color": "#757575"}, {"a": "gateway", "b": "read", "label": "读取", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "gateway", "b": "write", "label": "写入", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "read", "b": "api", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "write", "b": "api", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "validate", "b": "persist", "label": "", "sides": ["LEFT", "RIGHT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "persist", "b": "reply", "label": "", "sides": ["LEFT", "RIGHT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "write", "b": "recover", "label": "UNKNOWN", "sides": ["BOTTOM", "TOP"], "dashed": true, "both": false, "color": "#757575"}, {"a": "recover", "b": "validate", "label": "核实结果", "sides": ["LEFT", "RIGHT"], "dashed": true, "both": false, "color": "#757575"}], "paths": [{"id": "short-result", "points": [[245, 480], [245, 760], [940, 760], [940, 900], [1000, 900]], "color": "#757575", "dashed": false, "arrow": true}, {"id": "api-result", "points": [[2160, 570], [2160, 1080], [1180, 1080], [1180, 1030]], "color": "#757575", "dashed": false, "arrow": true}]};
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
