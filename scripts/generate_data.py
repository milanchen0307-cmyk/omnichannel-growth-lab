"""Independent fictional data; no client files, fitted distributions, or private inputs."""
import json, random
from pathlib import Path

def generate(seed=20261023, n=1200):
    rng = random.Random(seed)
    rows=[]
    for i in range(n):
        segment=rng.choice(['loyal','exploring','dormant'])
        recency=rng.randint(1,35) if segment=='loyal' else rng.randint(15,180)
        visits=rng.randint(6,20) if segment=='loyal' else rng.randint(1,8)
        readiness=rng.randint(45,95) if segment=='exploring' else rng.randint(5,80)
        # Transparent illustrative rules, not original client weights or a fitted model.
        score=round(.4*max(0,100-recency/1.8)+.3*min(100,visits*5)+.3*readiness)
        rows.append(dict(id=f'DEMO-{i+1:04d}',segment=segment,region=rng.choice(['north','central','south']),
                         channel=rng.choice(['email','sms','app']),consent=rng.random()<.83,
                         recency=recency,visits=visits,readiness=readiness,score=score,
                         weekday=rng.choices(range(7),weights=[11,13,13,16,20,17,10])[0],
                         period=rng.choices(range(4),weights=[15,28,35,22])[0]))
    return {'kind':'synthetic','seed':seed,'customers':rows}

if __name__=='__main__':
    target=Path(__file__).resolve().parents[1]/'docs/data.json'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(generate(),ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print('Generated 1,200 fictional customer records.')
