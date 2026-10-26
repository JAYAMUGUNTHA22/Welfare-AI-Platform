# Scheme recommendation coverage and rules

## Current catalogue

The bundled catalogue is `frontend/src/data/myscheme_eligibility_detailed.json`. It contains 3,400 records: 2,859 marked State and 541 marked Central. It contains no records marked private, corporate, foundation, or NGO, so the dashboard shows an honest empty state for that section. The application does not manufacture private recommendations.

Records are grouped using their source level and categorized using the catalogue's scheme categories. Current categories include agriculture and rural support, education, business, social welfare, women and child, skills and employment, banking and insurance, health, housing, and other public services. An empty category or source section means there were no records in the current catalogue that matched the available profile, not that no such support exists elsewhere.

## How recommendations are selected

1. The signed-in profile is loaded from the account, with the local saved profile used if the account request is unavailable.
2. The recommendation engine classifies each record as State, Central, private, or other from its source metadata. It excludes a record when the profile definitively conflicts with a recognized mandatory criterion or known state jurisdiction. Unknown or unfilled profile details do not count as a mismatch.
3. The engine compares available profile details with parsed eligibility text: age, income, social category, occupation, gender, residence type, marital/family circumstances, and state applicability. Category affinity can help order relevant records but does not establish eligibility.
4. Recommendations with relevant profile matches rank higher. The dashboard displays up to four records per source group so a large State catalogue cannot hide Central results. It can show State and Central recommendations from the current catalogue; the private section remains empty until verified records are added.
5. Each result is labeled “Potentially eligible” or “Needs more information.” The profile-fit percentage is the proportion of comparable criteria that matched; partial matches contribute half credit. It is not an official eligibility decision or a probability of approval. The UI also identifies profile fields or scheme conditions that need confirmation.

## Profile information

Basic details (state, age, occupation, income, and social category) remain available. Gender, education/course, employment status, family size/dependants, rural/urban residence, farmer status, first-generation graduate status, disability, widowhood, and special circumstances are optional. Missing values are kept unknown instead of being treated as “No.” Saving a profile and returning to the dashboard recalculates recommendations from its latest details.

The catalogue's eligibility text is keyword-classified and has not been independently checked against every official scheme rule. In particular, its normalized rule fields are unset. Results are therefore guidance to investigate; users should confirm criteria, dates, documents, and application routes with the scheme's official source.

## Coverage gaps and adding data

- There are currently no verified private/corporate/NGO records. Add a reviewed record with its provider, source type, official URL, geography, benefit, and eligibility text before it can appear in that dashboard section.
- The catalogue has State/Central counts but does not guarantee complete coverage of every scheme, location, or applicant group. State-level applicability should be reviewed against official sources.
- Keyword extraction can miss, misread, or overgeneralize requirements. To improve reliability, verify and populate structured criteria for age, income, residence, education, occupation, category, and special circumstances.
- Official open/closed status, deadlines, required documents, and application links need ongoing validation; this dataset alone is not a current-status feed.
