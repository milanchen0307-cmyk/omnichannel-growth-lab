import importlib.util,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('gen',Path(__file__).resolve().parents[1]/'scripts/generate_data.py')
gen=importlib.util.module_from_spec(spec);spec.loader.exec_module(gen)

class SyntheticDataTests(unittest.TestCase):
    def test_reproducible_and_seed_changes(self):
        self.assertEqual(gen.generate(),gen.generate())
        self.assertNotEqual(gen.generate(1),gen.generate(2))
    def test_valid_records(self):
        rows=gen.generate()['customers']
        self.assertEqual(len({r['id'] for r in rows}),1200)
        for r in rows:
            self.assertTrue(r['id'].startswith('DEMO-'))
            self.assertTrue(0<=r['score']<=100)
            self.assertTrue(0<=r['weekday']<7 and 0<=r['period']<4)
            self.assertEqual(set(r),{'id','segment','region','channel','consent','recency','visits','readiness','score','weekday','period'})
if __name__=='__main__':unittest.main()
