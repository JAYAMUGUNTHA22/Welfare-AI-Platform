# Farmer support records

## Database and seeding

Farmer programmes use the existing MongoDB `schemes` collection and `Scheme` model. `backend/seedFarmerSupport.js` adds or enriches only these farmer-support records. It does not delete or replace records. Stable `schemeId` values, existing-name aliases, and the model's unique scheme ID index protect against duplicate inserts. If a matching scheme already exists, the seeder adds only its `supportMetadata`; it leaves the existing scheme name, benefit text, and other fields intact. The general `backend/seed.js` importer now uses insert-only upserts and checks names as well as IDs, so a later catalogue import does not overwrite existing scheme records.

Run from `backend` with `npm run seed:farmer-support`. The operation is safe to repeat. It requires the configured `MONGODB_URI`.

## Recommendation flow

`GET /api/schemes/recommend/farmer` requires the existing bearer-token authentication. It reads farmer programme records from MongoDB, checks the signed-in citizen's occupation, state, district, age, crops, and landholding where relevant, and returns only potential matches. A confirmed state, crop, district, or age mismatch excludes a record; missing details remain visible as follow-up requirements. Income alone is never treated as proof of eligibility.

The existing My Schemes page continues to show its current recommendations. For farmer profiles it also fetches the backend results, merges by stable scheme ID or normalized scheme name, and persists the combined snapshot through the existing `POST /api/schemes/recommendations` endpoint. Recommendations remain scoped to the authenticated citizen and current profile fingerprint.

Private records are always labeled **Potential Match — Verify Availability**. Programme presence on an official website does not prove that applications are currently open or that a specific farmer is accepted. Central programmes similarly remain potential matches until land-record, season, bank, local implementation, and exclusion checks are confirmed.

## Officially documented programme scope

- [Reliance Foundation](https://www.reliancefoundation.org/what-we-do/rural-transformation/enhancing-farming-incomes): farming-income work describes advisory, training, inputs, collectives, market linkages, soil and water support. The page does not list a complete current district intake map.
- [Syngenta Foundation India](https://sf-india.in/our-work/): its official site describes smallholder farmer services and reports activity across multiple states, but the overview does not list all states or open farmer intake.
- [TNS India Foundation](https://tnsindiafoundation.org/programs/farmer-livelihoods): its page lists farmer livelihoods, FPC and sustainable agriculture work, with impact locations Dahanu, Gir, and Nashik. Tamil Nadu coverage is not stated on that programme page.
- [Pasidi Panta Foundation](https://pasidipantafoundation.org/our-programs/): its programme page identifies chilli clusters including Kamudhi, Ramanathapuram (Tamil Nadu), and turmeric/chilli clusters in named districts in other states. Eligibility and current participation are project-specific.
- [Sengodu Foundation](https://www.sengodu.org/agriculture-support-farmers-tamil-nadu): its agriculture page describes small-farmer support in Tamil Nadu, including seeds, training, organic practices, and irrigation support. Current district-level participation must be confirmed.
- [PM-KISAN](https://pmkisan.gov.in/), [PM-KMY guidelines](https://pmkisan.gov.in/Documents/PM-KMY%20-%20Operational%20Guidelines.pdf), [PMFBY](https://pmfby.gov.in/), [KCC guidance from RBI](https://www.rbi.org.in/scripts/FS_Notification.aspx?Id=11325), and the [Soil Health Card portal](https://soilhealth.dac.gov.in/) are the official sources used for published benefits and eligibility summaries. Local implementation, current notifications, enrolment windows, lender decisions, and exclusions still require confirmation.

The NGO/Foundation pages do not publish uniform income thresholds or universal open applications; the app intentionally does not infer cash grants, subsidies, or guaranteed enrollment. Supported crop and location information is stored only where the official programme page stated it.
