"""AI-Based Intelligent Search Service for SIH Problem Statements.

Provides semantic keyword expansion, unified searchable text building,
and multi-factor relevance ranking across problem statements.
"""

import math
import re
from typing import Any, Optional

from app.scrapers.cleaner import normalize_text


# ── Domain Ontology / Semantic Expansion Dictionary ────────────────────────

SEMANTIC_ONTOLOGY: dict[str, list[str]] = {
    # Water & Hydrology
    "water": [
        "water", "aqua", "river", "flood", "flooding", "rain", "rainfall", "pipeline",
        "irrigation", "hydrology", "groundwater", "wastewater", "dam", "reservoir",
        "leakage", "waterbody", "sewage", "drinking water", "water conservation",
        "potable", "aquatic", "canal", "watershed", "drought", "drainage", "water supply",
        "moisture", "water level", "hydro", "inundation", "catchment"
    ],
    "river": [
        "river", "water", "basin", "canal", "stream", "flow", "sedimentation", "flood",
        "ganga", "yamuna", "drainage", "waterway"
    ],
    "flood": [
        "flood", "flash flood", "rainfall", "inundation", "drainage", "water level",
        "submersion", "nowcasting", "overflow", "monsoon", "deluge"
    ],
    "pipeline": [
        "pipeline", "pipe", "leakage", "monitoring", "water supply", "gas pipeline",
        "flow", "burst", "distribution network", "corrosion"
    ],
    "irrigation": [
        "irrigation", "crop water", "drip", "sprinkler", "canal", "farming water",
        "soil moisture", "micro-irrigation", "fertigation"
    ],

    # Marine & Oceans
    "ocean": [
        "ocean", "marine", "sea", "maritime", "fishing", "coastal", "aquaculture",
        "coral", "tide", "underwater", "ship", "vessel", "blue economy", "oceanographic",
        "deep sea", "fisherman", "harbor", "port", "seabed", "trawler", "debris", "oil spill"
    ],
    "marine": [
        "marine", "ocean", "sea", "underwater", "coastal", "maritime", "coral reef",
        "aquatic", "blue economy", "ecosystem"
    ],

    # Disaster Management & Warning Systems
    "disaster": [
        "disaster", "flood", "landslide", "earthquake", "cyclone", "tsunami", "emergency",
        "crisis", "rescue", "hazard", "avalanche", "warning system", "evacuation", "relief",
        "catastrophe", "drought", "forest fire", "wildfire", "early warning", "risk monitoring",
        "calamity", "storm", "damage assessment", "first responder", "incident response"
    ],
    "landslide": [
        "landslide", "slope failure", "hill cutting", "rockfall", "earthquake",
        "slope stability", "debris flow", "early warning"
    ],
    "earthquake": [
        "earthquake", "seismic", "tremor", "fault line", "structural damage",
        "vibration", "richter", "early warning"
    ],
    "cyclone": [
        "cyclone", "storm", "hurricane", "typhoon", "wind speed", "meteorological",
        "coastal alert", "severe weather"
    ],

    # Cybersecurity & Cryptography
    "cyber": [
        "cyber", "cybersecurity", "blockchain", "security", "threat", "vulnerability",
        "malware", "phishing", "cryptography", "firewall", "encryption", "intrusion",
        "ransomware", "ddos", "authentication", "zero trust", "forensics", "penetration testing",
        "exploit", "privacy", "attack detection", "network security", "tamper-proof", "quantum-safe"
    ],
    "security": [
        "security", "surveillance", "cybersecurity", "threat", "anomaly detection",
        "protection", "biometric", "access control", "firewall", "intrusion"
    ],
    "blockchain": [
        "blockchain", "smart contract", "crypto", "decentralized", "dapp", "ledger",
        "ethereum", "web3", "hyperledger", "tamper-proof", "token", "consensus",
        "distributed ledger", "provenance", "audit trail"
    ],

    # AI / Machine Learning
    "ai": [
        "ai", "artificial intelligence", "machine learning", "ml", "deep learning",
        "neural network", "computer vision", "nlp", "natural language", "llm", "predictive",
        "algorithm", "intelligent", "model", "yolo", "ocr", "reinforcement learning",
        "automated", "image recognition", "anomaly detection", "generative ai", "chatbot"
    ],
    "ml": [
        "ml", "machine learning", "ai", "deep learning", "neural network", "predictive",
        "classification", "regression", "clustering", "model"
    ],

    # Healthcare & Biotech
    "healthcare": [
        "healthcare", "health", "medical", "hospital", "patient", "disease", "doctor",
        "diagnosis", "clinical", "biomedical", "telemedicine", "pharma", "medicine",
        "pathology", "radiology", "cardiac", "mental health", "disability", "assistive",
        "clinic", "surgery", "vital signs", "rehabilitation", "healthtech", "medtech",
        "cancer", "diabetes", "wellness", "prosthetic", "screening"
    ],
    "health": [
        "health", "healthcare", "medical", "patient", "disease", "hospital", "diagnosis",
        "medtech", "wellness", "vital monitoring"
    ],
    "medical": [
        "medical", "healthcare", "clinical", "hospital", "doctor", "diagnosis", "surgery",
        "pharmacy", "biomedical", "pathology", "treatment"
    ],

    # Agriculture & FoodTech
    "agriculture": [
        "agriculture", "farming", "farmer", "crop", "soil", "harvest", "fertilizer",
        "irrigation", "pest", "pesticide", "agritech", "horticulture", "agri", "seed",
        "plant", "cultivation", "livestock", "farm", "yield", "grain", "agronomy"
    ],
    "farming": [
        "farming", "agriculture", "farmer", "crop", "harvest", "soil health", "livestock",
        "irrigation", "smart farming"
    ],

    # Energy & Sustainability
    "energy": [
        "energy", "solar", "renewable", "power", "grid", "battery", "electricity",
        "wind", "clean energy", "ev", "electric vehicle", "charging", "storage", "biomass",
        "carbon", "hydroelectric", "smart grid", "power outage", "efficiency"
    ],
    "solar": [
        "solar", "photovoltaic", "pv", "solar panel", "renewable energy", "sunlight",
        "clean energy", "solar tracking"
    ],

    # IoT & Embedded Systems
    "iot": [
        "iot", "internet of things", "sensor", "embedded", "microcontroller", "arduino",
        "raspberry", "telemetry", "actuator", "hardware", "firmware", "edge computing",
        "wireless sensor", "rfid", "smart device"
    ],

    # Robotics & Drones
    "robotics": [
        "robot", "robotics", "drone", "uav", "autonomous", "rover", "arm", "actuator",
        "manipulator", "quadcopter", "lidar", "obstacle avoidance", "unmanned", "aerial"
    ],
    "drone": [
        "drone", "uav", "unmanned aerial", "quadcopter", "aerial survey", "autonomous flight",
        "remote sensing", "lidar", "aerial surveillance"
    ],

    # Transportation & Logistics
    "transport": [
        "transport", "traffic", "vehicle", "railway", "train", "road", "highway",
        "logistics", "navigation", "fleet", "transit", "toll", "accident", "congestion",
        "commuter", "metro", "bus", "route optimization", "tracking"
    ],
    "traffic": [
        "traffic", "congestion", "signal", "road safety", "vehicle flow", "pedestrian",
        "intersection", "intelligent traffic"
    ],

    # Education & Learning
    "education": [
        "education", "student", "learning", "teacher", "school", "college", "classroom",
        "curriculum", "pedagogy", "literacy", "academic", "e-learning", "edtech", "skill",
        "training", "examination", "tutor", "virtual lab"
    ],

    # Waste & Environment
    "waste": [
        "waste", "garbage", "sanitation", "recycling", "plastic", "pollution", "landfill",
        "solid waste", "e-waste", "compost", "cleanliness", "swachh", "segregation",
        "circular economy", "biodegradable"
    ],

    # Space & Satellite
    "space": [
        "space", "satellite", "isro", "orbit", "remote sensing", "rocket", "cosmos",
        "astronaut", "geospatial", "gis", "earth observation", "payload"
    ],

    # Sports & Fitness
    "sports": [
        "sports", "fitness", "athlete", "workout", "exercise", "physical activity",
        "heart rate", "wearable", "coaching", "stamina"
    ],

    # Heritage & Culture
    "heritage": [
        "heritage", "culture", "monument", "tourism", "ancient", "archaeology", "artifact",
        "museum", "historical", "preservation", "craft", "temple"
    ],
}


# ── Query Expansion Logic ──────────────────────────────────────────────────

def expand_query_terms(query: str) -> list[str]:
    """Expand user search query with domain synonyms and concepts.
    
    Returns a deduplicated list of lowercase terms starting with the original
    query and individual words, followed by semantic expansions.
    """
    if not query:
        return []

    norm_query = normalize_text(query)
    words = [w for w in re.split(r"[\s,;+]+", norm_query) if w]
    
    terms_set: set[str] = set()
    ordered_terms: list[str] = []

    def add_term(term: str):
        cleaned = normalize_text(term)
        if cleaned and cleaned not in terms_set:
            terms_set.add(cleaned)
            ordered_terms.append(cleaned)

    # 1. Add full original normalized query
    add_term(norm_query)

    # 2. Add individual query tokens
    for w in words:
        add_term(w)

    # 3. Check for exact matches and sub-phrase matches in semantic ontology
    # Check whole query first
    if norm_query in SEMANTIC_ONTOLOGY:
        for exp in SEMANTIC_ONTOLOGY[norm_query]:
            add_term(exp)

    # Check each individual word
    for w in words:
        if w in SEMANTIC_ONTOLOGY:
            for exp in SEMANTIC_ONTOLOGY[w]:
                add_term(exp)
        # Suffix stripping / basic stemming checks (e.g. "waters" -> "water", "floods" -> "flood")
        if len(w) > 4:
            if w.endswith("s") and w[:-1] in SEMANTIC_ONTOLOGY:
                for exp in SEMANTIC_ONTOLOGY[w[:-1]]:
                    add_term(exp)
            if w.endswith("ing") and w[:-3] in SEMANTIC_ONTOLOGY:
                for exp in SEMANTIC_ONTOLOGY[w[:-3]]:
                    add_term(exp)

    return ordered_terms


# ── Searchable Text Construction ───────────────────────────────────────────

def build_searchable_text(problem: dict[str, Any]) -> str:
    """Build a unified, normalized plain-text string containing all searchable fields
    of a problem statement document."""
    parts = [
        str(problem.get("ps_number") or ""),
        str(problem.get("title") or ""),
        str(problem.get("theme") or ""),
        str(problem.get("category") or ""),
        str(problem.get("organization") or ""),
        str(problem.get("department") or ""),
        str(problem.get("description") or ""),
        str(problem.get("expected_solution") or ""),
    ]
    return normalize_text(" ".join(p for p in parts if p))


# ── Relevance Ranking Algorithm ────────────────────────────────────────────

def calculate_relevance_score(
    problem: dict[str, Any],
    query: str,
    expanded_terms: list[str],
) -> float:
    """Calculate an intelligent multi-factor relevance score (0.0 to 100.0+) for a problem.
    
    Weights:
      - PS Number exact match: +100
      - Exact query in Title: +45
      - Exact query in Theme: +30
      - Exact query in Organization / Category: +20
      - Exact query in Description / Expected Solution: +15
      - Expanded keyword in Title (word boundary): +20
      - Expanded keyword in Theme: +15
      - Expanded keyword in Category / Organization: +10
      - Expanded keyword in Description / Solution: +5
      - Distinct matched concept diversity bonus: +5 per unique concept
    """
    if not query:
        return 0.0

    q_norm = normalize_text(query)
    title = normalize_text(problem.get("title", ""))
    ps_number = normalize_text(problem.get("ps_number", ""))
    theme = normalize_text(problem.get("theme", ""))
    category = normalize_text(problem.get("category", ""))
    org = normalize_text(problem.get("organization", ""))
    desc = normalize_text(problem.get("description", ""))
    exp_sol = normalize_text(problem.get("expected_solution", ""))

    score = 0.0

    # 1. Exact PS Number match (e.g. "SIH26001" or "26001")
    if q_norm == ps_number or q_norm in ps_number:
        score += 100.0

    # 2. Exact user query substring matches
    if q_norm in title:
        score += 45.0
    if q_norm in theme:
        score += 30.0
    if q_norm in org:
        score += 20.0
    if q_norm in category:
        score += 20.0
    if q_norm in desc:
        score += 15.0
    if q_norm in exp_sol:
        score += 15.0

    # 3. Term-level matching across fields
    matched_concepts: set[str] = set()

    for term in expanded_terms:
        if not term or len(term) < 2:
            continue

        # Regex for whole-word matching to avoid spurious substring collisions
        pattern = r"\b" + re.escape(term) + r"\b"

        term_matched = False

        if re.search(pattern, title):
            score += 20.0
            term_matched = True

        if re.search(pattern, theme):
            score += 15.0
            term_matched = True

        if re.search(pattern, org) or re.search(pattern, category):
            score += 10.0
            term_matched = True

        if re.search(pattern, desc):
            score += 5.0
            term_matched = True

        if re.search(pattern, exp_sol):
            score += 5.0
            term_matched = True

        if term_matched and term != q_norm:
            matched_concepts.add(term)

    # 4. Diversity bonus: reward problems that match multiple related concepts
    score += len(matched_concepts) * 5.0

    # Return rounded score
    return round(score, 1)
