<!--
MyTable
author: jzwang
-->
<template>
  <div class="my-table">
    <table>
      <thead>
        <tr class="table-active">
          <th></th>
        </tr>
      </thead>
    </table>
  </div>
</template>

<script>
import {
  defaultSorting,
  defaultPaging,
  defaultPaginator,
  defaultItemsPerPageOptions,
  defaultControlTypes
} from '../../configs';
import myUtil from '../../utils/myUtil';

export default {
  name: 'MyTable',

  props: {
    items: {
      type: Array,
      required: true
    },

    columns: {
      type: Array,
      required: true,
      validator: (columns) => columns.every((column) => column.key)
    },

    visibleColumnKeys: {
      type: Array,
      default() {
        return [];
      }
    },

    rowKey: {
      type: String,
      default: 'id'
    },

    selected: {
      type: Array,
      default() {
        return [];
      }
    },

    searchTerm: {
      type: String,
      default: ''
    },

    filter: {
      type: Object,
      defualt() {
        return {};
      }
    },

    sorting: {
      type: Object,
      default() {
        return {};
      }
    },

    paging: {
      type: Object,
      default() {
        return {};
      }
    },

    paginator: {
      type: Object,
      default() {
        return {};
      }
    },

    itemsPerPageOptions: {
      type: Array,
      default() {
        return defaultItemsPerPageOptions;
      },
      validator(options) {
        return options.every((option) => !isNaN(option));
      }
    },

    showItemsPerPage: {
      type: Boolean,
      default: true
    },

    paginatorPosition: {
      type: String,
      default: 'top',
      validator(position) {
        return ['top', 'bottom'].indexOf(position.toLowerCase()) !== -1;
      }
    },

    serverTotalItems: {
      type: Number
    },

    showDestroy: {
      type: Boolean,
      default: true
    },

    showExport: {
      type: Boolean,
      default: true
    },

    exportExcel: {
      type: Function
    },

    exportPdf: {
      type: Function
    },

    exportName: {
      type: String,
      default: 'export'
    },

    showSelection: {
      type: Boolean,
      default: true
    },

    showActions: {
      type: Boolean,
      default: true
    },

    showRead: {
      type: Boolean,
      default: true
    },

    showUpdate: {
      type: Boolean,
      default: true
    },

    showDelete: {
      type: Boolean,
      default: true
    },

    showToolbar: {
      type: Boolean,
      default: true
    },

    emptyText: {
      type: String,
      default: '查無資料！'
    },

    inlineEditItem: {
      type: Object,
      default() {
        return null;
      }
    }
  },

  data() {
    return {
      inner: {
        columns: this._getNormalizedColumns(),
        visibleColumnKeys: this._getNormalizedVisibleColumnKeys(),
        selected: this._getNormalizedSelected(),
        filter: this._getNormalizedFilter(),
        sorting: this._getNormalizedSorting(),
        paging: this._getNormalizedPaging(),
        paginator: this._getNormalizedPaginator(),
        itemsPerPageOptions: this._getNormalizedItemsPerPageOptions(),
        inlineEditItem: this._getNormalizedInlineEditItem()
      },
      processedItems: [],
      filteredItems: [],
      sortedItems: [],
      pagedItems: []
    };
  },

  computed: {
    _checkAll: {
      get() {
        return (
          this.totalItems && this.inner.selected.length === this.totalItems
        );
      },

      set(value) {
        let selected = [];

        if (value) {
          this.processedItem.forEach((item) => {
            selected.push(item[this.rowKey]);
          });
        }

        this.inner.selected = selected;
      }
    },

    totalItems() {
      return this.serverTotalItems ?? this.processedItems.length;
    },

    totalPages() {
      if (this.totalItems === 0) {
        return 0;
      } else if (this.inner.paging.itemsPerPage === 0) {
        return 1;
      }

      return Math.ceil(this.totalItems / this.inner.paging.itemsPerPage);
    },

    pageFromIndex() {
      if (this.totalPages === 0) {
        return -1;
      } else if (this.totalPages === 1) {
        return 0;
      }

      return (this.inner.paging.page - 1) * this.inner.paging.itemsPerPage;
    },

    pageToIndex() {
      if (this.totalPages === 0) {
        return -1;
      } else if (this.totalPages === 1) {
        return this.totalItems - 1;
      }

      return Math.min(
        this.inner.paging.page * this.inner.paging.itemsPerPage - 1,
        this.totalItems - 1
      );
    }
  },

  methods: {
    _getNormalizedColumns() {
      return this.columns.map((column) =>
        Object.assign(
          {
            header: column.key,
            visible: true,
            value: (item) => item[column.key],
            defaultValue: null,
            format: (value) => value,
            sort: null,
            sortable: true,
            thClass: null,
            thStyle: null,
            tdClass: null,
            tdStyle: null,
            exportable: true,
            valueToExport: (item) => item[column.key],
            editable: true,
            valueToEdit: (item) => item[column.key],
            dataType: String,
            control: {
              type: defaultControlTypes[column.dataType ?? String],
              cssClass: null,
              cssStyle: null,
              dataSouce: [],
              dataValueField: 'value',
              dataTextField: 'text',
              showEmptyOption: true,
              emptyOptionValue: '',
              inline: true
            },
            validators: [],
            validationMode: {
              greedy: false,
              lazy: false
            },
            errors: [],
            errorsSeparator: ', '
          },
          column
        )
      );
    },

    _getNormalizedVisibleColumns() {
      return this._getNormalizedColumns().filter((column) => column.visible);
    },

    _getNormalizedVisibleColumnKeys() {
      const keys = this._getNormalizedVisibleColumns().map((col) => col.key);
      return (
        this.visibleColumnKeys?.filter((key) => keys.includes(key)) ?? keys
      );
    },

    _getNormalizedSelected() {
      return this.selected ?? [];
    },

    _getNormalizedFilter() {
      return Object.assign(
        {},
        this._getNormalizedVisibleColumns().reduce(
          (prev, curr) => ({ ...prev, [curr.key]: null }),
          {}
        ),
        this.filter
      );
    },

    _getNormalizedSorting() {
      const sorting = { ...this.sorting };
      if (
        sorting.direction != null &&
        ['desc', 'asc'].indexOf(sorting.direction.toLowerCase()) === -1
      ) {
        sorting.direction = 'asc';
      }
      return Object.assign({}, defaultSorting, this.sorting, sorting);
    },

    _getNormalizedPaging() {
      const paging = { ...this.paging };
      if (paging.itemsPerPage != null && paging.itemsPerPage <= 0) {
        paging.itemsPerPage = 0;
      }
      return Object.assign({}, defaultPaging, this.paging, paging);
    },

    _getNormalizedPaginator() {
      return Object.assign({}, defaultPaginator, this.paginator);
    },

    _getNormalizedItemsPerPageOptions() {
      const options = [
        ...(this.itemsPerPageOptions ?? defaultItemsPerPageOptions)
      ];
      const itemsPerPage = this._getNormalizedPaging().itemsPerPage;
      if (!options.includes(itemsPerPage)) {
        options.push(itemsPerPage);
      }
      options.sort((a, b) => a - b);

      return options;
    },

    _getNormalizedInlineEditItem() {
      if (!this.inlineEditItem) {
        return null;
      }

      const inlineEditItem = { ...this.inlineEditItem };
      for (let column of this._getNormalizedColumns()) {
        if (inlineEditItem[column.key] === undefined) {
          inlineEditItem[column.key] = column.defaultValue;
        } else {
          inlineEditItem[`_${column.key}`] = inlineEditItem[column.key];
          inlineEditItem[column.key] = column.valueToEdit(inlineEditItem);
        }
      }

      return inlineEditItem;
    },

    _onFilteringChange() {
      if (this.inner.paging.page !== 1) {
        this.inner.paging.page = 1;
        return;
      }
      // if (this.inner.selected.length > 0) {
      //   this.inner.selected = [];
      // }

      if (this.filteringTimeoutId) {
        clearTimeout(this.filteringTimeoutId);
      }
      this.filteringTimeoutId = setTimeout(() => {
        this._processItems();
      }, 500);
    },

    _doSort(key) {
      if (this.inner.sorting.key !== key) {
        this.inner.sorting.direction = 'asc';
        this.inner.sorting.key = key;
        return;
      }

      if (this.inner.sorting.direction === 'asc') {
        this.inner.sorting.direction = 'desc';
      } else {
        this.inner.sorting.key = '';
        this.inner.sorting.direction = 'asc';
      }
    },

    _processItems() {
      myUtil.devLog('_processItems');

      if (this.serverTotalItems != null) {
        this.$emit('request', {
          searchTerm: this.searchTerm,
          filter: this.inner.filter,
          sorting: this.inner.sorting,
          paging: this.inner.paging
        });
        return;
      }

      let items = [...this.data];

      this.processedItems =
        this.filteredItems =
        this.sortedItems =
        this.pagedItems =
          items;

      if (
        this.searchTerm ||
        Object.values(this.inner.filter ?? {}).some((val) => val != null)
      ) {
        items = items.filter((item) => {
          const passeds = [];
          for (let column of this.inner.columns) {
            let passed = false;
            let value = column.value ? column.value(item) : item[column.key];
            if (value != null) {
              let valueType = Object.prototype.toString.call(value);
              let valueString = '';
              if (
                valueType === '[object Object]' ||
                valueType === '[object Array]'
              ) {
                valueString = JSON.stringify(value);
              } else {
                valueString = value.toString();
              }
              let filterTerm =
                (this.inner.filter ?? {})[column.key]?.toString() ?? '';
              passed =
                valueString.indexOf(this.searchTerm) !== -1 ||
                valueString.indexOf(filterTerm) !== -1;
            }
            passeds.push(passed);
          }
          return passeds.some((passed) => passed);
        });
      }

      this.filteredItems = items;

      if (this.innner.sorting?.key) {
        items.sort((a, b) => {
          const column = this.innner.columns.find(
            (column) => column.key === this.inner.sorting.key
          );

          let valueA = column?.value
            ? column.value(a)
            : a[this.inner.sorting.key];
          let valueB = column?.value
            ? column.value(b)
            : b[this.inner.sorting.key];

          if (column?.sort) {
            return column.sort(valueA, valueB);
          }

          if (typeof valueA === 'number' && typeof valueB === 'number') {
            valueA = valueA ?? 0;
            valueB = valueB ?? 0;

            return valueA - valueB;
          }

          valueA = valueA?.toString() ?? '';
          valueB = valueB?.toString() ?? '';

          if (valueA < valueB) {
            return -1;
          }
          if (valueA > valueB) {
            return 1;
          }
          return 0;
        });

        if (this.inner.sorting?.direction?.toLowerCase() === 'desc') {
          items.reverse();
        }
      }

      this.sortedItems = items;

      this.processedItems = this.sortedItems;

      this.pagedItems = this.processedItem.filter(
        (item, index) =>
          index >= this.pageFromIndex && index <= this.pageToIndex
      );
    },

    getExportParams() {

      //test
      const visibleColumns = this.innerColumns.filter(
        (col) =>
          this.innerVisibleColumns.includes(col.key) &&
          col.exportVisible !== false
      );

      const exportData = this.processedData.map((item) => {
        const tmpItem = {};
        visibleColumns.forEach((col) => {
          tmpItem[col.key] = '';

          if (col.stringify) {
            try {
              tmpItem[col.key] = col.stringify(item);
            } catch (e) {
              if (process.env.NODE_ENV === 'development') {
                console.log(
                  `[Debug] (column key: ${col.key}) call stringify() function failed!`
                );
                throw e;
              }
            }
          } else if (col.value) {
            try {
              tmpItem[col.key] = col.value(item);
            } catch (e) {
              if (process.env.NODE_ENV === 'development') {
                console.log(
                  `[Debug] (column key: ${col.key}) call value() function failed!`
                );
                throw e;
              }
            }
          } else {
            tmpItem[col.key] = item[col.key];
          }

          if (
            Object.prototype.toString.call(tmpItem[col.key]) !==
            '[object String]'
          ) {
            tmpItem[col.key] = JSON.stringify(tmpItem[col.key]);
          }
        });

        return tmpItem;
      });

      const exportColumns = visibleColumns.map((col) => ({
        key: col.key,
        header: col.header ?? col.key
      }));

      return {
        exportData,
        exportColumns
      };
    }
  },

  watch: {
    items: {
      deep: true,
      handler(items) {
        if (this.serverTotalItems != null) {
          this.processedItems =
            this.filteredItems =
            this.sortedItems =
            this.pagedItems =
              items;
        }

        this._processItems();
      }
    },

    columns: {
      deep: true,
      handler(columns) {
        if (columns === this.inner.columns) {
          return;
        }
        myUtil.devLog('columns', columns);
        this.inner.columns = this._getNormalizedColumns();
      }
    },

    'inner.columns': {
      deep: true,
      handler(innerColumns) {
        if (innerColumns === this.columns) {
          return;
        }
        myUtil.devLog('innerColumns', innerColumns);
        this.$emit('update:columns', innerColumns);
      },
      immediate: true
    },

    visibleColumnKeys: {
      handler(visibleColumnKeys) {
        if (visibleColumnKeys === this.inner.visibleColumnKeys) {
          return;
        }
        myUtil.devLog('visibleColumnKeys', visibleColumnKeys);
        this.inner.visibleColumnKeys = this._getNormalizedVisibleColumnKeys();
      }
    },

    'inner.visibleColumnKeys': {
      handler(innerVisibleColumnKeys) {
        if (innerVisibleColumnKeys === this.visibleColumnKeys) {
          return;
        }
        myUtil.devLog('innerVisibleColumnKeys', innerVisibleColumnKeys);
        this.$emit('update:visibleColumnKeys', innerVisibleColumnKeys);
      },
      immediate: true
    },

    selected: {
      handler(selected) {
        if (selected === this.inner.selected) {
          return;
        }
        myUtil.devLog('selected', selected);
        this.inner.selected = this._getNormalizedSelected();
      }
    },

    'inner.selected': {
      handler(innerSelected) {
        if (innerSelected === this.selected) {
          return;
        }
        myUtil.devLog('innerSelected', innerSelected);
        this.$emit('update:selected', innerSelected);
      },
      immediate: true
    },

    searchTerm: {
      handler() {
        this._onFilteringChange();
      }
    },

    filter: {
      deep: true,
      handler(filter) {
        if (filter === this.inner.filter) {
          return;
        }
        myUtil.devLog('filter', filter);
        this._onFilteringChange();
        this.inner.filter = this._getNormalizedFilter();
      }
    },

    'inner.filter': {
      deep: true,
      handler(innerFilter) {
        if (innerFilter === this.filter) {
          return;
        }
        myUtil.devLog('innerFilter', innerFilter);
        this.$emit('update:filter', innerFilter);
      },
      immediate: true
    },

    sorting: {
      deep: true,
      handler(sorting) {
        if (sorting === this.inner.sorting) {
          return;
        }
        myUtil.devLog('sorting', sorting);
        this._processItems();
        this.inner.sorting = this._getNormalizedSorting();
      }
    },

    'inner.sorting': {
      deep: true,
      handler(innerSorting) {
        if (innerSorting === this.sorting) {
          return;
        }
        myUtil.devLog('innerSorting', innerSorting);
        this.$emit('update:sorting', innerSorting);
      },
      immediate: true
    },

    paging: {
      deep: true,
      handler(paging) {
        if (paging === this.inner.paging) {
          return;
        }
        myUtil.devLog('paging', paging);
        this._processItems();
        this.inner.paging = this._getNormalizedPaging();
      }
    },

    'inner.paging': {
      deep: true,
      handler(innerPaging) {
        if (innerPaging === this.paging) {
          return;
        }
        myUtil.devLog('innerPaging', innerPaging);
        this.$emit('update:paging', innerPaging);
      },
      immediate: true
    },

    paginator: {
      deep: true,
      handler(paginator) {
        if (paginator === this.inner.paginator) {
          return;
        }
        myUtil.devLog('paginator', paginator);
        this.inner.paginator = this._getNormalizedPaginator();
      }
    },

    'inner.paginator': {
      deep: true,
      handler(innerPaginator) {
        if (innerPaginator === this.paginator) {
          return;
        }
        myUtil.devLog('innerPaginator', innerPaginator);
        this.$emit('update:paginator', innerPaginator);
      },
      immediate: true
    },

    itemsPerPageOptions: {
      handler(itemsPerPageOptions) {
        if (itemsPerPageOptions === this.inner.itemsPerPageOptions) {
          return;
        }
        myUtil.devLog('itemsPerPageOptions', itemsPerPageOptions);
        this.inner.itemsPerPageOptions =
          this._getNormalizedItemsPerPageOptions();
      }
    },

    'inner.itemsPerPageOptions': {
      handler(innerItemsPerPageOptions) {
        if (innerItemsPerPageOptions === this.itemsPerPageOptions) {
          return;
        }
        myUtil.devLog('innerItemsPerPageOptions', innerItemsPerPageOptions);
        this.$emit('update:itemsPerPageOptions', innerItemsPerPageOptions);
      },
      immediate: true
    },

    inlineEditItem: {
      handler(inlineEditItem) {
        if (inlineEditItem === this.inner.inlineEditItem) {
          return;
        }
        myUtil.devLog('inlineEditItem', inlineEditItem);
        this.inner.inlineEditItem = this._getNormalizedInlineEditItem();
      }
    },

    'inner.inlineEditItem': {
      handler(innerInlineEditItem) {
        if (innerInlineEditItem === this.inlineEditItem) {
          return;
        }
        myUtil.devLog('innerInlineEditItem', innerInlineEditItem);
        this.$emit('update:inlineEditItem', innerInlineEditItem);
      },
      immediate: true
    }
  }
};
</script>
