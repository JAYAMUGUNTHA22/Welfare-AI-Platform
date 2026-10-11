import dataset from './dataset_with_all_categories.json';

// ── Dataset-derived maps ────────────────────────────────────────────────────
// Maps scheme name (lowercase) → primary category id
const schemeCategoryMap = {};
// Maps scheme name (lowercase) → all category ids
const schemeTagsMap = {};
// Maps dataset category label → frontend category id
const datasetCatToId = {
  'Agriculture':        'agriculture',
  'Education':          'education',
  'Employment':         'employment',
  'Entrepreneurship':   'entrepreneurship',
  'Financial Assistance': 'financial-assistance',
  'Healthcare':         'healthcare',
  'Housing':            'housing',
  'Scholarships':       'scholarships',
  'Senior Citizens':    'senior-citizens',
};

dataset.forEach(item => {
  if (item.Eligible_Scheme && item.Scheme_Category) {
    const cats = Array.isArray(item.Scheme_Category) ? item.Scheme_Category : [item.Scheme_Category];
    const ids  = cats.map(c => datasetCatToId[c] || c.toLowerCase().replace(/\s+/g, '-'));
    const key  = item.Eligible_Scheme.toLowerCase();
    schemeCategoryMap[key] = ids[0];
    schemeTagsMap[key]     = ids;
  }
});

// ── Count dataset ROWS per category (each row = one scheme entry) ────────────
const categorySchemeCounts = {};

dataset.forEach(item => {
  if (!item.Eligible_Scheme || !item.Scheme_Category) return;
  const cats = Array.isArray(item.Scheme_Category) ? item.Scheme_Category : [item.Scheme_Category];
  cats.forEach(cat => {
    const id = datasetCatToId[cat];
    if (!id) return;
    categorySchemeCounts[id] = (categorySchemeCounts[id] || 0) + 1;
  });
});

// ── Build rich scheme objects from unique dataset entries ───────────────────
const schemeDetailMap = {
  'atal pension yojana': {
    id: 'atal-pension-yojana', schemeId: 'atal-pension-yojana',
    provider: 'PFRDA / Ministry of Finance', providerType: 'government', verification: 'government_verified',
    matchScore: 95,
    benefitSummary: 'Guaranteed pension of ₹1,000 to ₹5,000/month after age 60',
    benefitAmount: '₹1,000 - ₹5,000/month', deadline: 'Rolling enrollment',
    applicationMethod: 'Bank Branch / Online', processingTime: '7-15 days',
    shortExplanation: 'Guaranteed pension scheme for workers to secure post-retirement income.',
    overview: 'APY provides financial security in old age, offering guaranteed monthly pensions depending on contributions made between ages 18 and 40.',
    eligibility: ['Indian citizen aged 18 to 40 years', 'Active savings bank account', 'Not a beneficiary of any statutory social security scheme'],
    benefits: ['Guaranteed pension of ₹1,000–₹5,000/month', 'Same pension to spouse after subscriber death', 'Accumulated wealth returned to nominee'],
    documentsRequired: ['Aadhaar Card', 'Savings Bank Account details', 'Mobile Number'],
    applicationProcess: ['Visit your bank branch or access net banking', 'Fill in the APY registration form', 'Set up auto-debit for monthly contribution'],
    matchReasons: [{ label: 'Age criteria met (18-40 years)', status: 'match' }, { label: 'Salaried / unorganized sector', status: 'match' }],
  },
  'ayushman bharat': {
    id: 'ayushman-bharat', schemeId: 'ayushman-bharat',
    provider: 'National Health Authority', providerType: 'government', verification: 'government_verified',
    matchScore: 91,
    benefitSummary: 'Health coverage up to ₹5 lakh per family per year',
    benefitAmount: '₹5 lakh/year', deadline: 'Rolling enrollment',
    applicationMethod: 'Online + CSC', processingTime: 'Same day',
    shortExplanation: 'Free health insurance coverage for eligible families at empaneled hospitals nationwide.',
    overview: "Ayushman Bharat PM-JAY provides a health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
    eligibility: ['Listed in SECC 2011 database or eligible state-specific criteria', 'Family from rural or urban deprived category'],
    benefits: ['Cashless treatment up to ₹5 lakh/year', 'Coverage for 1,500+ medical procedures', 'Pre and post-hospitalization expenses covered'],
    documentsRequired: ['Aadhaar Card', 'Ration Card', 'Mobile number linked with Aadhaar'],
    applicationProcess: ['Visit nearest CSC or empaneled hospital', 'Provide Aadhaar and family details', 'Golden Card issued on the spot'],
    matchReasons: [{ label: 'Income bracket matches', status: 'match' }],
  },
  'pm awas yojana': {
    id: 'pmay-housing', schemeId: 'pmay-housing',
    provider: 'Ministry of Housing and Urban Affairs', providerType: 'government', verification: 'government_verified',
    matchScore: 86,
    benefitSummary: 'Subsidized home loan up to ₹2.67 lakh interest subsidy',
    benefitAmount: '₹2.67 lakh subsidy', deadline: '31 Dec 2026',
    applicationMethod: 'Online portal', processingTime: '90-120 days',
    shortExplanation: 'Interest subsidy on home loans for economically weaker and low-income groups.',
    overview: 'PMAY-U provides interest subsidy on home loans to eligible urban poor families.',
    eligibility: ['Annual family income up to ₹6 lakh (EWS/LIG)', 'No pucca house in family name', 'First-time home buyer'],
    benefits: ['Interest subsidy up to ₹2.67 lakh', 'Reduced EMI burden', 'Loan tenure up to 20 years'],
    documentsRequired: ['Aadhaar Card', 'Income proof', 'Property documents'],
    applicationProcess: ['Check eligibility on PMAY-U portal', 'Apply online with Aadhaar', 'Subsidy disbursed to loan account'],
    matchReasons: [{ label: 'Urban residential status match', status: 'match' }],
  },
  'mudra loan': {
    id: 'mudra-loan', schemeId: 'mudra-loan',
    provider: 'Ministry of Finance / MUDRA', providerType: 'government', verification: 'government_verified',
    matchScore: 83,
    benefitSummary: 'Loans up to ₹10 lakh for small micro-enterprises',
    benefitAmount: 'Up to ₹10 lakh', deadline: 'Rolling',
    applicationMethod: 'Bank / Online', processingTime: '15-30 days',
    shortExplanation: 'Collateral-free credit facility for setting up or expanding small businesses.',
    overview: 'MUDRA scheme provides collateral-free loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises.',
    eligibility: ['Any Indian citizen with a business plan for non-farm income generating activity', 'No prior loan defaults'],
    benefits: ['No collateral required', 'Low interest rates', 'Flexible repayment up to 5 years', 'MUDRA Card for working capital'],
    documentsRequired: ['Aadhaar & PAN Card', 'Business proposal', 'Bank account statement'],
    applicationProcess: ['Prepare business plan', 'Apply at any commercial bank or MUDRA portal', 'Bank verifies and sanctions loan'],
    matchReasons: [{ label: 'Micro-enterprise eligible', status: 'match' }],
  },
  'stand up india': {
    id: 'stand-up-india', schemeId: 'stand-up-india',
    provider: 'Department of Financial Services', providerType: 'government', verification: 'government_verified',
    matchScore: 80,
    benefitSummary: 'Bank loans between ₹10 lakh and ₹1 Crore for greenfield enterprises',
    benefitAmount: '₹10L - ₹1Cr', deadline: 'Rolling',
    applicationMethod: 'Online portal', processingTime: '30 days',
    shortExplanation: 'Facilitates bank loans for SC/ST and women entrepreneurs to establish greenfield ventures.',
    overview: 'Stand Up India facilitates loans from ₹10 lakh to ₹1 Crore per bank branch for SC/ST/Women entrepreneurs.',
    eligibility: ['SC/ST and/or Women entrepreneurs aged 18+', 'Greenfield project in manufacturing, services, or trading'],
    benefits: ['Loan facility from ₹10 lakh to ₹1 Crore', 'Composite loan covering capital & working capital', 'Repayable in 7 years'],
    documentsRequired: ['Identity proof', 'Category/Caste Certificate', 'Project report'],
    applicationProcess: ['Register on standupmitra.in', 'Choose partner bank', 'Bank evaluates and approves sanction'],
    matchReasons: [{ label: 'SC/ST or Women entrepreneur', status: 'match' }],
  },
  'national scholarship': {
    id: 'pm-scholarship', schemeId: 'pm-scholarship',
    provider: 'Ministry of Social Justice', providerType: 'government', verification: 'government_verified',
    matchScore: 92,
    benefitSummary: 'Up to ₹50,000 per year for tuition and maintenance',
    benefitAmount: '₹50,000/year', deadline: '31 Oct 2026',
    applicationMethod: 'Online portal', processingTime: '60-90 days',
    shortExplanation: 'Financial support for higher education of students from target communities.',
    overview: 'The National Scholarship provides financial assistance for post-matriculation studies.',
    eligibility: ['Must belong to targeted category', 'Annual family income below ₹2.5 lakh', 'Studying in recognized post-matriculation course'],
    benefits: ['Tuition fee coverage up to ₹50,000/year', 'Maintenance allowance of ₹1,200/month'],
    documentsRequired: ['Category Certificate', 'Income Certificate', 'Mark sheets', 'Aadhaar Card'],
    applicationProcess: ['Register on National Scholarship Portal', 'Upload documents and submit to institution'],
    matchReasons: [{ label: 'Student category eligible', status: 'match' }],
  },
  'pm kisan': {
    id: 'pm-kisan', schemeId: 'pm-kisan',
    provider: 'Ministry of Agriculture', providerType: 'government', verification: 'government_verified',
    matchScore: 85,
    benefitSummary: '₹6,000 per year in three installments for farmers',
    benefitAmount: '₹6,000/year', deadline: 'Rolling enrollment',
    applicationMethod: 'Online portal / CSC', processingTime: '30-45 days',
    shortExplanation: 'Direct income support for small and marginal farmers.',
    overview: 'PM-KISAN provides income support of ₹6,000/year to all landholding farmer families.',
    eligibility: ['Must be a landholding farmer', 'Land ownership in own name'],
    benefits: ['₹2,000 every 4 months (₹6,000/year)', 'Direct Benefit Transfer to bank account'],
    documentsRequired: ['Aadhaar Card', 'Land ownership documents', 'Bank account details'],
    applicationProcess: ['Visit PM-KISAN portal or nearest CSC', 'Enter Aadhaar and land details'],
    matchReasons: [{ label: 'Farmer occupation match', status: 'match' }],
  },
};

// Build dataset-sourced scheme objects — ONE entry per dataset ROW so that
// each category shows its real count (agriculture:160, education:197, etc.)
// Each row carries unique State / Age / Category / Income eligibility data.
export const datasetSchemes = dataset
  .filter(item => item.Eligible_Scheme && item.Scheme_Category)
  .map((item, idx) => {
    const key  = item.Eligible_Scheme.toLowerCase();
    const cats = Array.isArray(item.Scheme_Category) ? item.Scheme_Category : [item.Scheme_Category];
    const ids  = cats.map(c => datasetCatToId[c] || c.toLowerCase().replace(/\s+/g, '-'));
    const extra = schemeDetailMap[key] || {};

    // Format income nicely
    const incomeNum = parseInt(item.Annual_Income_INR, 10);
    const incomeFmt = isNaN(incomeNum)
      ? item.Annual_Income_INR
      : `₹${(incomeNum / 100000).toFixed(1)}L/yr`;

    // Build a unique id per row so every card is distinct
    const rowId = `${(extra.id || key.replace(/\s+/g, '-'))}-${idx}`;

    // Row-specific eligibility from dataset columns
    const rowEligibility = [
      `State: ${item.State}`,
      `Age: ${item.Age} years`,
      `Social Category: ${item.Category}`,
      `Annual Income: ${incomeFmt}`,
    ];

    return {
      id:       rowId,
      schemeId: extra.schemeId || key.replace(/\s+/g, '-'),
      name:     item.Eligible_Scheme,
      state:    item.State,
      age:      item.Age,
      socialCategory: item.Category,
      annualIncome:   item.Annual_Income_INR,
      provider: extra.provider || 'Government of India',
      providerType: extra.providerType || 'government',
      verification: extra.verification || 'government_verified',
      category: ids[0],
      tags:     ids,
      matchScore:        extra.matchScore        || 80,
      benefitSummary:    extra.benefitSummary    || `Government welfare scheme under ${cats[0]}`,
      benefitAmount:     extra.benefitAmount     || 'As per scheme norms',
      deadline:          extra.deadline          || 'Rolling enrollment',
      applicationMethod: extra.applicationMethod || 'Online Portal / CSC',
      processingTime:    extra.processingTime    || '15-30 days',
      shortExplanation:  extra.shortExplanation  || `${item.Eligible_Scheme} is an official government welfare program.`,
      overview:          extra.overview          || `${item.Eligible_Scheme} offers direct financial benefits to eligible citizens across India.`,
      eligibility:       rowEligibility,
      benefits:          extra.benefits          || ['Financial assistance as per scheme norms', 'Direct Benefit Transfer'],
      documentsRequired: extra.documentsRequired || ['Aadhaar Card', 'Bank Account details'],
      applicationProcess: extra.applicationProcess || ['Apply online at official portal', 'Submit required documents'],
      matchReasons: [
        { label: `State: ${item.State}`, status: 'match' },
        { label: `Category: ${item.Category}`, status: 'match' },
        { label: `Age ${item.Age} meets criteria`, status: 'match' },
      ],
    };
  });

const baseSchemes = [
  {
    id: 'atal-pension-yojana',
    schemeId: 'atal-pension-yojana',
    name: 'Atal Pension Yojana',
    provider: 'PFRDA / Ministry of Finance',
    providerType: 'government',
    verification: 'government_verified',
    category: schemeCategoryMap['atal pension yojana'] || 'financial-assistance',
    tags: schemeTagsMap['atal pension yojana'] || [],
    matchScore: 95,
    benefitSummary: 'Guaranteed pension of ₹1,000 to ₹5,000/month after age 60',
    benefitAmount: '₹1,000 - ₹5,000/month',
    deadline: 'Rolling enrollment',
    applicationMethod: 'Bank Branch / Online',
    processingTime: '7-15 days',
    shortExplanation: 'Guaranteed pension scheme for salaried and unorganized sector workers to secure post-retirement income.',
    overview: 'Atal Pension Yojana (APY) provides financial security in old age for citizens, offering guaranteed monthly pensions depending on contributions made between ages 18 and 40.',
    eligibility: [
      'Indian citizen aged 18 to 40 years',
      'Salaried, self-employed, or unorganized sector worker',
      'Active savings bank account',
      'Not a beneficiary of any statutory social security scheme',
    ],
    benefits: [
      'Guaranteed pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 per month',
      'Same pension amount to spouse after subscriber death',
      'Accumulated pension wealth returned to nominee after both spouse & subscriber pass away',
    ],
    documentsRequired: [
      'Aadhaar Card', 'Savings Bank Account details', 'Mobile Number',
    ],
    applicationProcess: [
      'Visit your bank branch or access net banking portal',
      'Fill in the APY registration form',
      'Provide Aadhaar and bank account details',
      'Set up auto-debit facility for monthly contribution',
    ],
    matchReasons: [
      { label: 'Location matches (Tamil Nadu)', status: 'match' },
      { label: 'Occupation matches (Salaried Employee)', status: 'match' },
      { label: 'Age criteria met (18-40 years)', status: 'match' },
    ],
  },
  {
    id: 'ayushman-bharat',
    schemeId: 'ayushman-bharat',
    name: 'Ayushman Bharat',
    provider: 'National Health Authority',
    providerType: 'government',
    verification: 'government_verified',
    category: schemeCategoryMap['ayushman bharat'] || 'healthcare',
    tags: schemeTagsMap['ayushman bharat'] || [],
    matchScore: 91,
    benefitSummary: 'Health coverage up to ₹5 lakh per family per year',
    benefitAmount: '₹5 lakh/year',
    deadline: 'Rolling enrollment',
    applicationMethod: 'Online + CSC',
    processingTime: 'Same day',
    shortExplanation: 'Free health insurance coverage for eligible families at empaneled hospitals nationwide.',
    overview: 'Ayushman Bharat PM-JAY is the world\'s largest government-funded health insurance program. It provides a health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    eligibility: [
      'Listed in SECC 2011 database or eligible state-specific criteria',
      'Family from rural or urban deprived category',
      'No income-based exclusion for listed categories',
      'Must not be covered by any other government health scheme',
    ],
    benefits: [
      'Cashless treatment up to ₹5 lakh per year',
      'Coverage for 1,500+ medical procedures',
      'Pre and post-hospitalization expenses covered',
      'Free at empaneled public and private hospitals',
    ],
    documentsRequired: [
      'Aadhaar Card', 'Ration Card', 'Mobile number linked with Aadhaar', 'Family ID (if applicable)',
    ],
    applicationProcess: [
      'Visit nearest Common Service Center (CSC) or empaneled hospital',
      'Provide Aadhaar and family details',
      'Officer verifies eligibility in the system',
      'Golden Card (e-card) is issued on the spot',
      'Use card at any empaneled hospital for cashless treatment',
    ],
    matchReasons: [
      { label: 'Location matches (Tamil Nadu)', status: 'match' },
      { label: 'Occupation matches (Salaried Employee)', status: 'match' },
      { label: 'Income bracket matches', status: 'match' },
    ],
  },
  {
    id: 'pmay-housing',
    schemeId: 'pmay-housing',
    name: 'PM Awas Yojana',
    provider: 'Ministry of Housing and Urban Affairs',
    providerType: 'government',
    verification: 'government_verified',
    category: schemeCategoryMap['pm awas yojana'] || 'housing',
    tags: schemeTagsMap['pm awas yojana'] || [],
    matchScore: 86,
    benefitSummary: 'Subsidized home loan up to ₹2.67 lakh interest subsidy',
    benefitAmount: '₹2.67 lakh subsidy',
    deadline: '31 Dec 2026',
    applicationMethod: 'Online portal',
    processingTime: '90-120 days',
    shortExplanation: 'Interest subsidy on home loans for economically weaker and low-income groups to own a house.',
    overview: 'PMAY-U provides interest subsidy on home loans to eligible urban poor families, making home ownership affordable through credit-linked subsidy.',
    eligibility: [
      'Annual family income up to ₹6 lakh (EWS/LIG)',
      'No pucca house in family name',
      'First-time home buyer',
      'Resident of an urban area',
    ],
    benefits: [
      'Interest subsidy up to ₹2.67 lakh',
      'Reduced EMI burden',
      'Loan tenure up to 20 years',
      'No collateral required for subsidy',
    ],
    documentsRequired: [
      'Aadhaar Card of all family members', 'Income proof', 'Residence proof',
      'Bank account details', 'Property documents',
    ],
    applicationProcess: [
      'Check eligibility on PMAY-U portal',
      'Apply online with Aadhaar and income details',
      'Get approved for subsidy',
      'Apply for home loan at a listed bank',
      'Bank processes subsidy and loan',
      'Subsidy disbursed to loan account',
    ],
    matchReasons: [
      { label: 'Location matches (Tamil Nadu)', status: 'match' },
      { label: 'Occupation matches (Salaried Employee)', status: 'match' },
      { label: 'Urban residential status match', status: 'match' },
    ],
  },
  {
    id: 'mudra-loan',
    schemeId: 'mudra-loan',
    name: 'Mudra Loan',
    provider: 'Ministry of Finance / MUDRA',
    providerType: 'government',
    verification: 'government_verified',
    category: schemeCategoryMap['mudra loan'] || 'entrepreneurship',
    tags: schemeTagsMap['mudra loan'] || [],
    matchScore: 83,
    benefitSummary: 'Loans up to ₹10 lakh for small micro-enterprises and entrepreneurs',
    benefitAmount: 'Up to ₹10 lakh',
    deadline: 'Rolling',
    applicationMethod: 'Bank / Online',
    processingTime: '15-30 days',
    shortExplanation: 'Collateral-free credit facility for setting up or expanding small businesses and micro-units.',
    overview: 'MUDRA scheme provides collateral-free loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises across Shishu, Kishor, and Tarun categories.',
    eligibility: [
      'Any Indian citizen with a business plan for non-farm income-generating activity',
      'Salaried workers setting up side/new enterprises or business units',
      'No prior loan defaults with any bank or financial institution',
    ],
    benefits: [
      'No collateral required',
      'Low interest rates',
      'Flexible repayment tenure up to 5 years',
      'MUDRA Card for working capital needs',
    ],
    documentsRequired: [
      'Aadhaar & PAN Card', 'Business proposal', 'Bank account statement', 'Applicant photograph',
    ],
    applicationProcess: [
      'Prepare business plan & loan requirement',
      'Apply at any commercial bank, RRB, or MUDRA portal',
      'Submit identity and business proof',
      'Bank verifies and sanctions loan',
    ],
    matchReasons: [
      { label: 'Location matches (Tamil Nadu)', status: 'match' },
      { label: 'Occupation matches (Salaried Employee)', status: 'match' },
    ],
  },
  {
    id: 'stand-up-india',
    schemeId: 'stand-up-india',
    name: 'Stand Up India',
    provider: 'Department of Financial Services',
    providerType: 'government',
    verification: 'government_verified',
    category: schemeCategoryMap['stand up india'] || 'entrepreneurship',
    tags: schemeTagsMap['stand up india'] || [],
    matchScore: 80,
    benefitSummary: 'Bank loans between ₹10 lakh and ₹1 Crore for greenfield enterprises',
    benefitAmount: '₹10L - ₹1Cr',
    deadline: 'Rolling',
    applicationMethod: 'Online portal',
    processingTime: '30 days',
    shortExplanation: 'Facilitates bank loans for SC/ST and women entrepreneurs to establish greenfield ventures.',
    overview: 'Stand Up India scheme facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one SC or ST borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise.',
    eligibility: [
      'SC/ST and/or Women entrepreneurs aged 18+',
      'Greenfield project in manufacturing, services, or trading sector',
      'If non-individual enterprise, 51% shareholding held by SC/ST/Woman',
    ],
    benefits: [
      'Loan facility from ₹10 lakh to ₹1 Crore',
      'Composite loan covering capital & working capital',
      'Repayable in 7 years with maximum moratorium of 18 months',
    ],
    documentsRequired: [
      'Identity proof', 'Category/Caste Certificate (if applicable)', 'Project report', 'Bank statements',
    ],
    applicationProcess: [
      'Register on Stand Up India portal (standupmitra.in)',
      'Fill application form and choose partner bank',
      'Nodal agency provides handholding support',
      'Bank evaluates proposal and approves sanction',
    ],
    matchReasons: [
      { label: 'Location matches (Tamil Nadu)', status: 'match' },
      { label: 'Occupation matches (Salaried Employee)', status: 'match' },
    ],
  },
  {
    id: 'pm-scholarship',
    schemeId: 'pm-scholarship',
    name: 'National Scholarship',
    provider: 'Ministry of Social Justice',
    providerType: 'government',
    verification: 'government_verified',
    category: schemeCategoryMap['national scholarship'] || 'scholarships',
    tags: schemeTagsMap['national scholarship'] || [],
    matchScore: 92,
    benefitSummary: 'Up to ₹50,000 per year for tuition and maintenance',
    benefitAmount: '₹50,000/year',
    deadline: '31 Oct 2026',
    applicationMethod: 'Online portal',
    processingTime: '60-90 days',
    shortExplanation: 'Financial support for higher education of students from target communities.',
    overview: 'The National Scholarship provides financial assistance to students belonging to targeted communities for pursuing post-matriculation studies.',
    eligibility: [
      'Must belong to targeted category',
      'Annual family income below ₹2.5 lakh',
      'Studying in a recognized post-matriculation course',
    ],
    benefits: [
      'Tuition fee coverage up to ₹50,000 per year',
      'Maintenance allowance of ₹1,200/month',
    ],
    documentsRequired: [
      'Category Certificate', 'Income Certificate', 'Mark sheets', 'Aadhaar Card',
    ],
    applicationProcess: [
      'Register on National Scholarship Portal',
      'Upload documents and submit to institution',
    ],
    matchReasons: [
      { label: 'Location matches', status: 'match' },
      { label: 'Occupation matches (Student)', status: 'match' },
    ],
  },
  {
    id: 'pm-kisan',
    schemeId: 'pm-kisan',
    name: 'PM Kisan',
    provider: 'Ministry of Agriculture',
    providerType: 'government',
    verification: 'government_verified',
    category: schemeCategoryMap['pm kisan'] || 'agriculture',
    tags: schemeTagsMap['pm kisan'] || [],
    matchScore: 85,
    benefitSummary: '₹6,000 per year in three installments for farmers',
    benefitAmount: '₹6,000/year',
    deadline: 'Rolling enrollment',
    applicationMethod: 'Online portal / CSC',
    processingTime: '30-45 days',
    shortExplanation: 'Direct income support for small and marginal farmers to supplement financial needs.',
    overview: 'PM-KISAN provides income support to all landholding farmer families with cultivable land.',
    eligibility: [
      'Must be a landholding farmer',
      'Land ownership in own name',
    ],
    benefits: [
      '₹2,000 every 4 months (₹6,000/year)',
      'Direct Benefit Transfer to bank account',
    ],
    documentsRequired: [
      'Aadhaar Card', 'Land ownership documents', 'Bank account details',
    ],
    applicationProcess: [
      'Visit PM-KISAN portal or nearest CSC',
      'Enter Aadhaar and land details',
    ],
    matchReasons: [
      { label: 'Location matches', status: 'match' },
      { label: 'Occupation matches (Farmer)', status: 'match' },
    ],
  }
];

// Keep baseSchemes export for any legacy consumers
export const schemes = baseSchemes;

// Categories with scheme counts sourced directly from the dataset
export const categories = [
  { id: 'education',          name: 'Education',          description: 'Scholarships, fee waivers, and education support',          icon: 'GraduationCap', schemeCount: categorySchemeCounts['education']          || 0 },
  { id: 'women',              name: 'Women',              description: 'Welfare and empowerment programs for women',                  icon: 'Heart',         schemeCount: categorySchemeCounts['women']              || 0 },
  { id: 'children',           name: 'Children',           description: 'Child nutrition, protection, and development',               icon: 'Baby',          schemeCount: categorySchemeCounts['children']           || 0 },
  { id: 'senior-citizens',    name: 'Senior Citizens',    description: 'Pension and healthcare for elderly citizens',                icon: 'Users',         schemeCount: categorySchemeCounts['senior-citizens']    || 0 },
  { id: 'healthcare',         name: 'Healthcare',         description: 'Health insurance and medical assistance',                   icon: 'Stethoscope',   schemeCount: categorySchemeCounts['healthcare']         || 0 },
  { id: 'disability-support', name: 'Disability Support', description: 'Disability pensions and accessibility programs',            icon: 'Accessibility', schemeCount: categorySchemeCounts['disability-support'] || 0 },
  { id: 'agriculture',        name: 'Agriculture',        description: 'Farmer support, crop insurance, and subsidies',             icon: 'Wheat',         schemeCount: categorySchemeCounts['agriculture']        || 0 },
  { id: 'employment',         name: 'Employment',         description: 'Job training and employment guarantee schemes',             icon: 'Briefcase',     schemeCount: categorySchemeCounts['employment']         || 0 },
  { id: 'housing',            name: 'Housing',            description: 'Affordable housing and shelter programs',                   icon: 'Home',          schemeCount: categorySchemeCounts['housing']            || 0 },
  { id: 'financial-assistance', name: 'Financial Assistance', description: 'Direct benefit transfers and financial aid',           icon: 'Wallet',        schemeCount: categorySchemeCounts['financial-assistance'] || 0 },
  { id: 'entrepreneurship',   name: 'Entrepreneurship',   description: 'Startup loans and business development support',           icon: 'Rocket',        schemeCount: categorySchemeCounts['entrepreneurship']   || 0 },
  { id: 'scholarships',       name: 'Scholarships',       description: 'Merit and need-based scholarship programs',                icon: 'Award',         schemeCount: categorySchemeCounts['scholarships']       || 0 },
];

// We replaced the entire block below down to extraSchemes.
// I need to keep applications, documents, benefits, etc.
export const applications = [
  {
    id: 'app-001',
    schemeId: 'pm-scholarship',
    schemeName: 'National Scholarship',
    provider: 'Ministry of Social Justice',
    providerType: 'government',
    verification: 'government_verified',
    status: 'eligibility_review',
    submittedDate: '2 Aug 2026',
    currentStage: 'Eligibility Review',
    deadline: '15 Sep 2026',
    timeline: [
      { stage: 'Submitted', status: 'completed', date: '2 Aug 2026' },
      { stage: 'Document Verification', status: 'completed', date: '8 Aug 2026' },
      { stage: 'Eligibility Review', status: 'current', date: 'In progress' },
      { stage: 'Department Review', status: 'pending' },
      { stage: 'Approved', status: 'pending' },
      { stage: 'Benefit Disbursed', status: 'pending' },
    ],
  },
  {
    id: 'app-002',
    schemeId: 'ayushman-bharat',
    schemeName: 'Ayushman Bharat PM-JAY',
    provider: 'National Health Authority',
    providerType: 'government',
    verification: 'government_verified',
    status: 'approved',
    submittedDate: '15 Jul 2026',
    currentStage: 'Approved',
    deadline: '—',
    timeline: [
      { stage: 'Submitted', status: 'completed', date: '15 Jul 2026' },
      { stage: 'Document Verification', status: 'completed', date: '18 Jul 2026' },
      { stage: 'Eligibility Review', status: 'completed', date: '22 Jul 2026' },
      { stage: 'Department Review', status: 'completed', date: '28 Jul 2026' },
      { stage: 'Approved', status: 'completed', date: '1 Aug 2026' },
      { stage: 'Benefit Disbursed', status: 'pending' },
    ],
  },
];

export const documents = [
  { id: 'doc-1', name: 'Aadhaar Card', category: 'identity', uploadDate: '5 Jan 2026', status: 'verified' },
  { id: 'doc-2', name: 'PAN Card', category: 'identity', uploadDate: '5 Jan 2026', status: 'verified' },
  { id: 'doc-3', name: 'Income Certificate', category: 'income', uploadDate: '12 Feb 2026', expiryDate: '8 Sep 2026', status: 'expiring' },
];

export const benefits = [
  {
    id: 'ben-1',
    schemeId: 'pm-scholarship',
    schemeName: 'Post-Matric Scholarship',
    expectedAmount: 50000,
    receivedAmount: 25000,
    expectedDate: '15 Sep 2026',
    status: 'processing',
  },
];

export const eligibilityFactors = [
  { label: 'Age', score: 100, status: 'match' },
  { label: 'Income', score: 75, status: 'partial' },
  { label: 'Location', score: 100, status: 'match' },
  { label: 'Occupation', score: 100, status: 'match' },
];

export const adminStats = {
  totalApplications: 12847,
  approvedApplications: 8932,
  pendingApplications: 3120,
  rejectedApplications: 795,
  totalBenefitsDisbursed: 427500000,
  beneficiarySatisfaction: 87,
};

export const adminCharts = {
  applicationBottlenecks: [],
  regionalUptake: [],
  recommendationAccuracy: [],
  satisfactionScores: [],
};

export const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir',
];

export const occupations = [
  'Student', 'Farmer', 'Daily Wage Worker', 'Self-employed', 'Salaried Employee',
  'Business Owner', 'Homemaker', 'Retired', 'Unemployed', 'Other',
];

export const incomeBrackets = [
  'Below ₹1 lakh', '₹1-2.5 lakh', '₹2.5-5 lakh', '₹5-10 lakh', 'Above ₹10 lakh',
];

export const languages = ['English', 'हिंदी', 'மராঠি', 'தமிழ்', 'తెలుగు', 'বাংলা', 'ગુજરાતી', 'ಕನ್ನಡ'];
