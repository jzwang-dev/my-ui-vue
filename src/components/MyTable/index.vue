<!--
MyTable
author: jzwang
-->
<template>
  <div class="my-table">
    <!-- toolbar(begin) -->
    <div
      class="border d-sm-flex align-items-center justify-content-between p-2"
      v-if="showToolbar"
    >
      <div class="d-sm-flex align-items-center">
        <slot name="before-toolbuttons" :vmData="$data"></slot>
        <button
          type="button"
          class="btn btn-danger mr-1"
          @click="$emit('destroy-items', inner.selected)"
          :disabled="!inner.selected.length"
          v-if="showDestroy"
        >
          <i class="fas fa-trash"></i> 刪除勾選
        </button>
        <div class="dropdown" v-if="showExport">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            data-toggle="dropdown"
          >
            <i class="fas fa-file-export"></i> 匯出
          </button>
          <div class="dropdown-menu">
            <a
              class="dropdown-item border-0"
              href="#"
              @click.prevent="doExportExcel"
              >匯出Excel</a
            >
            <a
              class="dropdown-item border-0"
              href="#"
              @click.prevent="doExportPdf"
              >匯出Pdf</a
            >
          </div>
        </div>
        <slot name="after-toolbuttons" :vmData="$data"></slot>
      </div>
      <div class="form-inline">
        <template v-if="showItemsPerPage">
          顯示
          <select class="form-control mx-1" v-model="inner.paging.itemsPerPage">
            <option
              v-for="option in inner.itemsPerPageOptions"
              :key="option"
              :value="option"
            >
              {{ option === 0 ? '-不限-' : option }}
            </option>
          </select>
          項結果
        </template>
        <div class="dropdown ml-1">
          <button
            class="btn btn-outline-secondary dropdown-toggle"
            type="button"
            data-toggle="dropdown"
          >
            顯示欄位
          </button>
          <div class="dropdown-menu">
            <form class="px-4 py-3">
              <div
                class="custom-control custom-checkbox"
                v-for="column in displayableColumns"
                :key="column.key"
              >
                <input
                  type="checkbox"
                  class="custom-control-input"
                  :id="`visibleColumnKeys_${column.key}`"
                  :value="column.key"
                  v-model="inner.visibleColumnKeys"
                />
                <label
                  class="custom-control-label d-inline-block"
                  :for="`visibleColumnKeys_${column.key}`"
                  >{{ column.header }}</label
                >
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- toolbar(end) -->

    <!-- top pagingbar(begin) -->
    <div
      class="border d-sm-flex align-items-center justify-content-between p-2"
      v-if="paginatorPosition !== 'bottom'"
    >
      <div>
        <my-paginator
          :paging.sync="inner.paging"
          :paginator.sync="inner.paginator"
          :totalItems="totalItems"
          @change-page="(page) => $emit('change-page', page)"
          v-if="inner.paging.itemsPerPage > 0"
        ></my-paginator>
      </div>
      <div>
        顯示第 {{ totalItems ? pageFromIndex + 1 : 0 }} 到
        {{ totalItems ? pageToIndex + 1 : 0 }} 項結果，共 {{ totalItems }} 項。
      </div>
    </div>
    <!-- top pagingbar(end) -->

    <table
      class="table table-bordered table-striped table-hover table-sm responsive mb-0"
    >
      <thead>
        <tr class="table-active">
          <th class="text-center align-middle" v-if="showSelection">
            <div class="custom-control custom-checkbox">
              <input
                type="checkbox"
                class="custom-control-input"
                id="checkAll"
                v-model="_checkAll"
              />
              <label class="custom-control-label" for="checkAll"></label>
            </div>
          </th>
          <th
            v-for="column in visibleColumns"
            :key="column.key"
            :class="[{ sortable: column.sortable !== false }, column.thClass]"
            :style="column.thStyle"
            @click="column.sortable !== false && _doSort(column.key)"
          >
            {{ column.header }}
            <i
              class="fas"
              :class="[
                (inner.sorting.direction &&
                  inner.sorting.direction.toLowerCase()) === 'desc'
                  ? 'fa-sort-down'
                  : 'fa-sort-up'
              ]"
              v-show="inner.sorting && inner.sorting.key === column.key"
            ></i>
          </th>
          <th v-if="showActions"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pagedItems" :key="item[rowKey]">
          <td class="text-center align-middle" v-if="showSelection">
            <div>
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  :id="`selected_${item[rowKey]}`"
                  :value="item[rowKey]"
                  v-model="inner.selected"
                />
                <label
                  class="custom-control-label"
                  :for="`selected_${item[rowKey]}`"
                ></label>
              </div>
            </div>
          </td>
          <td
            v-for="column in visibleColumns"
            :key="column.key"
            :data-title="column.header"
          >
            <div>
              <slot
                :name="`edit-${column.key}`"
                :item="inner.inlineEditItem"
                :column="column"
                v-if="
                  column.editable !== false &&
                  inner.inlineEditItem &&
                  inner.inlineEditItem[rowKey] === item[rowKey]
                "
              >
              </slot>
              <slot
                v-else
                :name="`item-${column.key}`"
                :item="item"
                :column="column"
                >{{
                  (column.format
                    ? column.format(column.value(item), item)
                    : column.value(item)) | nil
                }}</slot
              >
            </div>
          </td>
          <td v-if="showActions" class="actions">
            <div>
              <div
                v-if="
                  inner.inlineEditItem &&
                  inner.inlineEditItem[rowKey] === item[rowKey]
                "
              >
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  @click="_onSave"
                >
                  儲存
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  @click="_onCancel"
                >
                  取消
                </button>
              </div>
              <div v-else>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  @click="_onRead(item)"
                  v-if="showRead"
                >
                  檢視
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  @click="_onUpdate(item)"
                  v-if="showUpdate"
                >
                  編輯
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="_onDelete(item)"
                  v-if="showDelete"
                >
                  刪除
                </button>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import MyPaginator from '../MyPaginator';
import {
  defaultSorting,
  defaultPaging,
  defaultPaginator,
  defaultItemsPerPageOptions,
  defaultControlTypes
} from '../../configs';
import myUtil from '../../utils/myUtil';
import exportUtil from '../../utils/exportUtil';

export default {
  name: 'MyTable',

  components: {
    MyPaginator
  },

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
      type: Array
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
      default: 'export_data'
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
        searchTerm: this._getNormalizedSearchTerm(),
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
    displayableColumns() {
      return this.inner.columns.filter(
        (column) => column.displayable !== false
      );
    },

    visibleColumns() {
      return this.displayableColumns.filter((column) =>
        this.inner.visibleColumnKeys.includes(column.key)
      );
    },

    _checkAll: {
      get() {
        return (
          this.totalItems && this.inner.selected.length === this.totalItems
        );
      },

      set(value) {
        let selected = [];

        if (value) {
          this.processedItems.forEach((item) => {
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
            displayable: true,
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
              emptyOptionText: '-請選擇-',
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

    _getNormalizedDisplayableColumns() {
      return this._getNormalizedColumns().filter(
        (column) => column.displayable !== false
      );
    },

    _getNormalizedVisibleColumnKeys() {
      const keys = this._getNormalizedDisplayableColumns().map(
        (col) => col.key
      );
      return (
        this.visibleColumnKeys?.filter((key) => keys.includes(key)) ?? keys
      );
    },

    _getNormalizedSelected() {
      return this.selected ?? [];
    },

    _getNormalizedSearchTerm() {
      return this.searchTerm ?? '';
    },

    _getNormalizedFilter() {
      return Object.assign(
        {},
        this._getNormalizedDisplayableColumns().reduce(
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

      let items = [...this.items];

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
          for (let column of this.displayableColumns) {
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

      if (this.inner.sorting?.key) {
        items.sort((a, b) => {
          const column = this.displayableColumns.find(
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

      this.pagedItems = this.processedItems.filter(
        (item, index) =>
          index >= this.pageFromIndex && index <= this.pageToIndex
      );
    },

    getExportParams() {
      const exportableColumns = this.visibleColumns.filter(
        (column) => column.exportable !== false
      );

      const exportItems = this.processedItems.map((item) => {
        const tmpItem = {};
        exportableColumns.forEach((column) => {
          let value = '';

          if (column.valueToExport) {
            value = column.valueToExport(item);
          } else if (column.value) {
            value = column.value(item);
          } else {
            value = item[column.key] ?? '';
          }

          if (Object.prototype.toString.call(value) !== '[object String]') {
            value = JSON.stringify(value);
          }

          tmpItem[column.key] = value;
        });

        return tmpItem;
      });

      const exportColumns = exportableColumns.map((column) => ({
        key: column.key,
        header: column.header ?? column.key
      }));

      return {
        exportItems,
        exportColumns
      };
    },

    doExportExcel() {
      const { exportItems, exportColumns } = this.getExportParams();
      if (this.exportExcel) {
        this.exportExcel({ exportItems, exportColumns });
        return;
      }
      exportUtil.exportExcel(exportItems, exportColumns, this.exportName);
    },

    doExportPdf() {
      const { exportItems, exportColumns } = this.getExportParams();
      if (this.exportPdf) {
        this.exportPdf({ exportItems, exportColumns });
        return;
      }
      exportUtil.exportPdf(exportItems, exportColumns, this.exportName);
    },

    getProcessedItems() {
      return this.processedItems;
    },

    getPagedItems() {
      return this.pagedItems;
    },

    validateInlineEditItem() {
      this.clearErrors();
      if (!this.inner.inlineEditItem) {
        return true;
      }
      let valid = true;
      for (let column of this.inner.columns) {
        for (let validator of column.validators ?? []) {
          const result = validator(
            this.inner.inlineEditItem[column.key],
            this.inner.inlineEditItem
          );
          if (result !== true) {
            column.errors.push(result);
            valid = false;
            if (column.validation.greedy !== true) {
              break;
            }
          }
        }
      }
      return valid;
    },

    clearErrors() {
      for (let column of this.inner.columns) {
        column.errors = [];
      }
    },

    getErrors() {
      return this.inner.columns.map((column) => {
        const errors = column.errors ?? [];
        return {
          key: column.key,
          errors,
          errMsg: errors.join(column.errorsSeparator || ', ')
        };
      });
    },

    _onSave() {
      if (!this.validateInlineEditItem()) {
        this.$emit('validate-item-failed', {
          errors: this.getErrors(),
          item: this.inner.inlineEditItem
        });
        return;
      }
      this.$emit('save-item', this.inner.inlineEditItem);
    },

    _onCancel() {
      this.clearErrors();
      this.$emit('cancel-item', this.inner.inlineEditItem);
      this.inner.inlineEditItem = null;
    },

    _onRead(item) {
      this.$emit('read-item', item);
    },

    _onUpdate(item) {
      this.$emit('update-item', item);
    },

    _onDelete(item) {
      this.$emit('delete-item', item);
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
      handler(searchTerm) {
        if (searchTerm === this.inner.searchTerm) {
          return;
        }
        myUtil.devLog('searchTerm', searchTerm);
        this._onFilteringChange();
        this.inner.searchTerm = this._getNormalizedSearchTerm();
      }
    },

    'inner.searchTerm': {
      handler(innerSearchTerm) {
        if (innerSearchTerm === this.searchTerm) {
          return;
        }
        myUtil.devLog('innerSearchTerm', innerSearchTerm);
        this.$emit('update:searchTerm', innerSearchTerm);
      },
      immediate: true
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
