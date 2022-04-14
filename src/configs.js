export const defaultSorting = {
  key: '',
  direction: 'asc'
};

export const defaultPaging = {
  page: 1,
  itemsPerPage: 100
};

export const defaultPaginator = {
  showFirst: false,
  showPrev: true,
  showPrevGrp: true,
  showPages: true,
  showNextGrp: true,
  showNext: true,
  showLast: false,
  pageLinks: 5
};

export const defaultItemsPerPageOptions = [10, 25, 50, 100];

export const defaultControlTypes = {
  [String]: 'input',
  [Number]: 'input',
  [Boolean]: 'checkbox',
  [Array]: 'checkboxlist',
  [Date]: 'input'
};

export const controlAllowedDataTypes = {
  input: [String, Number, Date],
  select: [String, Number],
  radiobuttonlist: [String, Number],
  checkbox: [Boolean, String, Number],
  checkboxlist: [Array],
  textarea: [String]
};
