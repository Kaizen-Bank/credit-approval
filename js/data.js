/* ---------------------------------------------------------------
   data.js
   Defines every section of the Credit Approval Sheet as data —
   no markup here. Two kinds of sections:

   1. "field"  — a Field / Details table. The Field column is a
      static, locked label (not editable) for the default rows;
      Details (and any columns the user adds) are blank and
      fillable. Users can still add a brand new row for a field
      that isn't listed — that row's Field cell becomes editable
      so they can name it.

   2. "grid"   — a normal data table (e.g. a 6-month salary table)
      where every column is a fillable data column, not a fixed
      row-label. Locked columns just can't be removed; their cells
      are still editable and start blank.

   Both kinds support "+ Add Column" and "+ Add Row" via the same
   table-engine.js.
------------------------------------------------------------------*/

const CAM_SECTIONS = [
  {
    id: 'identity',
    type: 'field',
    fields: ['Name of Borrower', 'Location', 'Product']
  },
  {
    // Distinct from the Field/Details tables above and below: every
    // header AND every row here is editable, not just the blank
    // value cells — this mirrors the original facility grid, where
    // the columns themselves (e.g. "Personal Loan") name the
    // facility type and can vary per request.
    id: 'facilityTable',
    title: 'Facility Request',
    type: 'grid',
    variant: 'facility',
    columns: ['Facility Type', 'Others (₦)', 'Total (₦)'],
    rowCount: 1
  },
  {
    id: 'loanTerms',
    type: 'field',
    fields: [
      'Purpose', 'Tenure', 'Pricing', 'Yield',
      'Repayment', 'Repayment Source', 'Security'
    ]
  },
  {
    id: 'sectionA',
    title: 'Section A — Introduction',
    type: 'field',
    fields: [
      'Customer', 'Employer', 'Date Employed', 'Date of Last Promotion',
      'Position', 'Request Date', 'Amount Required', 'Tenor',
      'Repayment Amount', 'Source of Repayment', 'Purpose', 'Security'
    ]
  },
  {
    // Narrative, not a table: each guarantor is one flowing paragraph
    // (like the source document), with blank fillable spans dropped
    // into fixed connector text. "+ Add Guarantor" adds another
    // paragraph using the same template.
    id: 'sectionB',
    title: 'Section B — Guarantors',
    type: 'narrative',
    count: 2,
    template: [
      { text: 'Personal guarantee: ' },
      { key: 'name', placeholder: 'Guarantor name' },
      { text: ' — ' },
      { key: 'role', placeholder: 'employer / occupation' },
      { text: '. Office/business address: ' },
      { key: 'officeAddress', placeholder: 'office or business address' },
      { text: '. Residential address: ' },
      { key: 'residentialAddress', placeholder: 'residential address' },
      { text: '. Phone number: ' },
      { key: 'phone', placeholder: 'phone number' },
      { text: '.' }
    ]
  },
  {
    id: 'sectionC',
    title: 'Section C — Yield Analysis',
    type: 'field',
    fields: [
      'Interest @ 3.5% per month (flat rate) × Tenor',
      'Management Fee @ 1.0% (flat, upfront)',
      'Processing Fee @ 1.5% (flat, upfront)',
      'Insurance Fee @ 1.5% (flat, upfront)',
      'Total Yield'
    ]
  },
  {
    id: 'sectionD',
    title: "Section D — 6 Months' Salary Analysis",
    type: 'grid',
    columns: ['Month', 'Salary'],
    rowCount: 6,
    totalRows: ['Total', 'Average']
  },
  {
    id: 'sectionE',
    title: 'Section E — Bank Statement Analysis',
    type: 'field',
    fields: ['Monthly Salary', 'Allowances (monthly)', 'Other Obligation', 'Net']
  },
  {
    id: 'sectionF',
    title: 'Section F — Credit Bureau Report',
    type: 'grid',
    columns: ['Name of Customer', 'Bureau', 'Indebted'],
    rowCount: 2,
    remarksPlaceholder: 'Write the credit bureau findings / narrative here — which facilities were found, their status, and any notes on settlement…'
  },
  {
    id: 'sectionG',
    title: 'Section G — Budget Planner Analysis',
    type: 'field',
    fields: ['Monthly Salary', 'Allowances (monthly)', 'Other Obligation', 'Net']
  },
  {
    id: 'sectionH',
    title: 'Section H — Transaction Analysis',
    type: 'field',
    fields: [
      'Current Salary (6-month average)', 'Other Obligation', 'Total',
      '1/3 of Disposable Income', 'Repayment Amount with Interest'
    ]
  },
  {
    // Sections I & J are fixed boilerplate — shown as static, non-editable
    // text exactly as they appear in the source Credit Approval Sheet.
    id: 'sectionI',
    title: 'Section I — Conditions Precedent to Disbursement',
    type: 'static',
    lines: [
      'Acceptance of offer letter.',
      'Submission of a valid Letter of Non-Indebtedness from Branch International Financial Services Limited, confirming that the customer has fully settled the outstanding obligation.'
    ]
  },
  {
    id: 'sectionJ',
    title: 'Section J — Justification for Approval',
    type: 'static',
    lines: [
      "Obligor's salary is adequate to repay the loan.",
      'Obligor is a new customer of the bank.',
      'Obligor is aware of the implication of default, as they can be reported to their employer and that would put their job at risk.'
    ]
  },
  {
    // Static signature block — "Please kindly approve." line, role
    // label, blank signature line, and a fillable name field.
    id: 'officerBlock',
    title: 'Account Officer',
    type: 'signature'
  },
  {
    id: 'approval',
    title: 'Approval Chain',
    type: 'grid',
    columns: ['Designation', 'Comments', 'Signature', 'Date'],
    staticColumns: ['Designation'],
    rows: [
      ['Team Lead, Business Development', '', '', ''],
      ['Head, Audit, Risk & Compliance', '', '', ''],
      ['Head, Credit Admin', '', '', ''],
      ['Chief Operating Officer', '', '', '']
    ]
  }
];
