import sys
import os
sys.path.insert(0, os.path.abspath('.'))

import asyncio
from app.mongodb import client, db
from app.services.problem_services import problem_service
from app.services.theme_service import theme_service

async def run_verification():
    print("=== 1. Testing Data Normalization ===")
    norm_res = await problem_service.ensure_normalized_data()
    print(f"Data normalization result: {norm_res}")

    print("\n=== 2. Testing Theme Filtering Consistency ===")
    t1 = await problem_service.get_problems_filtered(theme="Smart Automation")
    t2 = await problem_service.get_problems_filtered(theme="smart automation")
    t3 = await problem_service.get_problems_filtered(theme="  SMART AUTOMATION  ")
    t4 = await problem_service.get_problems_filtered(theme="MEDTECH/BIOTECH/ HEALTHTECH")
    t5 = await problem_service.get_problems_filtered(theme="MedTech / BioTech / HealthTech")

    print(f"'Smart Automation': {len(t1)} results")
    print(f"'smart automation': {len(t2)} results")
    print(f"'  SMART AUTOMATION  ': {len(t3)} results")
    assert len(t1) == len(t2) == len(t3) > 0, "Theme variation counts do not match!"
    print(f"MEDTECH uppercase: {len(t4)} results, standard: {len(t5)} results")
    assert len(t4) == len(t5) > 0, "MedTech variation counts do not match!"
    print("[PASS] All theme variations matched identically!")

    print("\n=== 3. Testing Unique Theme Aggregation ===")
    themes = await theme_service.get_all_themes()
    print(f"Total deduplicated themes: {len(themes)}")
    theme_names = [t['name'] for t in themes]
    print("Sample unique theme names:", theme_names[:8])
    assert len(theme_names) == len(set(t.lower() for t in theme_names)), "Duplicate themes detected in theme list!"
    print("[PASS] Unique themes list verified (no duplicates)!")

    print("\n=== 4. Testing AI Semantic Search ===")
    queries = ["water", "ocean", "disaster", "cyber", "ai", "healthcare", "pipeline", "flood"]
    for q in queries:
        results = await problem_service.get_problems_filtered(search=q)
        print(f"Search: '{q}' -> Found {len(results)} results (Top score: {results[0].get('relevance_score') if results else 0})")
        assert len(results) > 0, f"Search '{q}' returned 0 results!"
        top = results[0]
        title_ascii = top.get('title', '').encode('ascii', 'replace').decode('ascii')
        print(f"   Top result: [{top.get('ps_number')}] {title_ascii[:60]}... (Score: {top.get('relevance_score')})")

    print("\n[SUCCESS] All Backend Tests Passed Successfully!")

if __name__ == '__main__':
    asyncio.run(run_verification())
    client.close()
