// Onda: fail-closed robots.txt guard. This supplements, never substitutes for, site permission.
function groupsFrom(robots) {
  const groups=[]; let agents=[],rules=[],hasRule=false;
  function flush(){if(agents.length)groups.push({agents:[...agents],rules:[...rules]});agents=[];rules=[];hasRule=false;}
  for(const raw of robots.split(/\r?\n/)){
    const line=raw.split('#',1)[0].trim();if(!line)continue;
    const i=line.indexOf(':');if(i<0)continue;
    const key=line.slice(0,i).trim().toLowerCase(),value=line.slice(i+1).trim();
    if(key==='user-agent') {if(hasRule)flush();agents.push(value.toLowerCase());}
    else if((key==='allow'||key==='disallow')&&agents.length){rules.push({type:key,path:value});hasRule=true;}
  }
  flush();return groups;
}
function ruleMatches(pattern,path){
  if(!pattern)return false;
  const escaped=pattern.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\\\*/g,'.*');
  return new RegExp('^'+escaped+(pattern.endsWith('$')?'':'')).test(path);
}
export function mayFetch(robots,absoluteUrl,userAgent='ONDA-Hormiga'){
  if(typeof robots!=='string'||!robots.trim())return {allowed:false,reason:'robots unavailable or empty'};
  let u;try{u=new URL(absoluteUrl)}catch{return {allowed:false,reason:'bad url'}}
  const groups=groupsFrom(robots);const agent=userAgent.toLowerCase();
  const matches=groups.filter(g=>g.agents.some(a=>a!=='*'&&agent.includes(a)));
  const applicable=matches.length?matches:groups.filter(g=>g.agents.includes('*'));
  const rules=applicable.flatMap(g=>g.rules).filter(x=>x.path&&ruleMatches(x.path,u.pathname+u.search));
  rules.sort((a,b)=>b.path.replace(/\*/g,'').length-a.path.replace(/\*/g,'').length||(a.type==='allow'?-1:1));
  const winner=rules[0];return {allowed:!winner||winner.type==='allow',reason:winner?`${winner.type}: ${winner.path}`:'no blocking rule'};
}
