(function(root){
  const costs={email:.2,sms:.5,app:.1};
  function select(rows, f={}){return rows.filter(r=>(!f.segment||r.segment===f.segment)&&(!f.region||r.region===f.region)&&(!f.channel||r.channel===f.channel)&&r.score>=Number(f.min||0));}
  function plan(rows,budget,capacity){
    let spent=0;const selected=[];
    for(const r of [...rows].filter(r=>r.consent).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id))){
      if(selected.length>=capacity)break;
      if(spent+costs[r.channel]<=budget+1e-9){selected.push(r);spent+=costs[r.channel];}
    }
    return {selected,spent:Math.round(spent*100)/100};
  }
  const api={select,plan,costs};if(typeof module!=='undefined')module.exports=api;root.Growth=api;
})(typeof globalThis!=='undefined'?globalThis:this);
