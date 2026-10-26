const spec={"key": "06b-development-delivery", "title": "06B  /  开发与交付", "subtitle": "先补齐可验证的应用能力，再让同一镜像从测试环境晋级生产。", "position": {"x": 6700, "y": -5650}, "width": 2400, "height": 1350, "footer": "交付目标 · 部署文件与 CI 尚待编写。当前 mvn verify 主要验证构建，不代表已有自动化回归覆盖。", "groups": [], "cards": [{"id": "contract", "title": "01  契约与持久状态", "body": "api / auth / persistence\n身份、请求去重、任务版本与操作记录", "x": 80, "y": 320, "w": 700, "h": 205, "accent": "#3DADFF", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "implement", "title": "02  编排与工具边界", "body": "agent / tools\n范围门控、统一网关与受控执行", "x": 850, "y": 320, "w": 700, "h": 205, "accent": "#66D575", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "verify", "title": "03  交互与联调验证", "body": "api / static / observability\n真实模型、权限、重复提交与超时恢复", "x": 1620, "y": 320, "w": 700, "h": 205, "accent": "#5AD8CC", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "source", "title": "版本输入", "body": "Git · 代码与配置资产", "x": 80, "y": 700, "w": 370, "h": 180, "accent": "#3DADFF", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "ci", "title": "CI 校验", "body": "构建 · 联调评估", "x": 535, "y": 700, "w": 370, "h": 180, "accent": "#3DADFF", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "registry", "title": "镜像仓库", "body": "OCI Tag + Digest", "x": 990, "y": 700, "w": 370, "h": 180, "accent": "#B3B3B3", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "staging", "title": "测试环境", "body": "迁移校验 · 场景回归", "x": 1445, "y": 700, "w": 370, "h": 180, "accent": "#66D575", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "release", "title": "生产发布", "body": "分批替换 · 健康检查", "x": 1900, "y": 700, "w": 370, "h": 180, "accent": "#5AD8CC", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "files", "title": "需要交付的工程文件", "body": "Dockerfile · compose.yaml · application-prod.yml\ndb/migration/ · CI 配置 · 发布与回滚说明", "x": 80, "y": 1040, "w": 1070, "h": 170, "accent": "#B3B3B3", "parent": null, "badge": null, "fill": "#FFFFFF"}, {"id": "gates", "title": "发布边界", "body": "迁移采用向前兼容策略；镜像回滚不撤销数据。\n验收关注越权、重复写入、未知状态、延迟与成本。", "x": 1210, "y": 1040, "w": 1110, "h": 170, "accent": "#FF9E42", "parent": null, "badge": null, "fill": "#FFFFFF"}], "texts": [{"id": "dev-label", "text": "开发顺序  /  在现有入口上逐步拆分职责", "x": 80, "y": 250, "w": 2100, "size": 27, "bold": true, "color": "#505B6C"}, {"id": "pipeline-title", "text": "交付流水线  /  以不可变镜像版本作为发布单元", "x": 80, "y": 600, "w": 2100, "size": 27, "bold": true, "color": "#505B6C"}, {"id": "command", "text": "mvn clean verify", "x": 535, "y": 912, "w": 370, "size": 24, "bold": true, "color": "#505B6C"}, {"id": "same-image", "text": "同一 Digest 晋级", "x": 1445, "y": 912, "w": 370, "size": 24, "bold": true, "color": "#505B6C"}, {"id": "rollback", "text": "异常 → 前版镜像与配置", "x": 1900, "y": 912, "w": 420, "size": 24, "bold": true, "color": "#505B6C"}], "edges": [{"a": "contract", "b": "implement", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "implement", "b": "verify", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "source", "b": "ci", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "ci", "b": "registry", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "registry", "b": "staging", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}, {"a": "staging", "b": "release", "label": "", "sides": ["RIGHT", "LEFT"], "dashed": false, "both": false, "color": "#757575"}], "paths": []};
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
