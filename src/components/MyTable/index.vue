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

    <div class="border p-2 text-center" v-if="totalItems === 0">
      {{ emptyText }}
    </div>

    <!-- bottom pagingbar(begin) -->
    <div
      class="border d-sm-flex align-items-center justify-content-between p-2"
      v-if="paginatorPosition === 'bottom'"
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
    <!-- bottom pagingbar(end) -->
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
        columns: this._normalized_columns(),
        visibleColumnKeys: this._normalized_visibleColumnKeys(),
        selected: this._normalized_selected(),
        searchTerm: this._normalized_searchTerm(),
        filter: this._normalized_filter(),
        sorting: this._normalized_sorting(),
        paging: Object.assign({}, defaultPaging, this.paging),
        paginator: Object.assign({}, defaultPaginator, this.paginator),
        itemsPerPageOptions: this._normalized_itemsPerPageOptions(),
        inlineEditItem: this._normalized_inlineEditItem()
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
    _normalized_columns() {
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

    _normalized_visibleColumnKeys() {
      const keys = this._normalized_columns()
        .filter((column) => column.displayable !== false)
        .map((column) => column.key);
      return (
        this.visibleColumnKeys?.filter((key) => keys.includes(key)) ?? keys
      );
    },

    _normalized_selected() {
      return this.selected ?? [];
    },

    _normalized_searchTerm() {
      return this.searchTerm ?? '';
    },

    _normalized_filter() {
      return Object.assign(
        {},
        this._normalized_columns()
          .filter((column) => column.displayable !== false)
          .reduce((prev, curr) => ({ ...prev, [curr.key]: null }), {}),
        this.filter
      );
    },

    _normalized_sorting() {
      const sorting = { ...this.sorting };
      if (
        sorting.direction != null &&
        ['desc', 'asc'].indexOf(sorting.direction.toLowerCase()) === -1
      ) {
        sorting.direction = 'asc';
      }
      return Object.assign({}, defaultSorting, this.sorting, sorting);
    },

    _normalized_itemsPerPageOptions() {
      const options = [
        ...(this.itemsPerPageOptions ?? defaultItemsPerPageOptions)
      ];
      const itemsPerPage = this.paging?.itemsPerPage;
      if (itemsPerPage != null && !options.includes(itemsPerPage)) {
        options.push(itemsPerPage);
      }
      options.sort((a, b) => a - b);

      return options;
    },

    _normalized_inlineEditItem() {
      if (!this.inlineEditItem) {
        return null;
      }

      const inlineEditItem = { ...this.inlineEditItem };
      for (let column of this._normalized_columns()) {
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
        console.log('_onFilteringChange:_processItems');
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

  created() {
    this.$emit('update:searchTerm', this.inner.searchTerm);
    this.$emit('update:filter', this.inner.filter);
    this.$emit('update:sorting', this.inner.sorting);
    this.$emit('update:paging', this.inner.paging);
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

        console.log('items:_processItems');
        this._processItems();
      }
    },

    'inner.columns': {
      deep: true,
      handler() {
        this.$emit('update:columns', this.inner.columns);
      },
      immediate: true
    },

    columns: {
      handler() {
        if (this.inner.columns !== this.columns) {
          this.inner.columns = this._normalized_columns();
        }
      }
    },

    'inner.visibleColumnKeys': {
      handler() {
        this.$emit('update:visibleColumnKeys', this.inner.visibleColumnKeys);
      },
      immediate: true
    },

    visibleColumnKeys: {
      handler() {
        if (this.inner.visibleColumnKeys !== this.visibleColumnKeys) {
          this.inner.visibleColumnKeys = this._normalized_visibleColumnKeys();
        }
      }
    },

    'inner.selected': {
      handler() {
        this.$emit('update:selected', this.inner.selected);
      },
      immediate: true
    },

    selected: {
      handler() {
        if (this.inner.selected !== this.selected) {
          this.inner.selected = this._normalized_selected();
        }
      }
    },

    'inner.searchTerm': {
      handler() {
        this._onFilteringChange();
        this.$emit('update:searchTerm', this.inner.searchTerm);
      }
    },

    searchTerm: {
      handler() {
        if (this.inner.searchTerm !== this.searchTerm) {
          this.inner.searchTerm = this._normalized_searchTerm();
        }
      }
    },

    'inner.filter': {
      deep: true,
      handler() {
        this._onFilteringChange();
        this.$emit('update:filter', this.inner.filter);
      }
    },

    filter: {
      handler() {
        if (this.inner.filter !== this.filter) {
          this.inner.filter = this._normalized_filter();
        }
      }
    },

    'inner.sorting': {
      deep: true,
      handler() {
        // if (this.inner.paging.page !== 1) {
        //   this.inner.paging.page = 1;
        //   return;
        // }
        // if (this.inner.selected.length > 0) {
        //   this.inner.selected = [];
        // }

        console.log('inner.sorting:_processItems');
        this._processItems();
        this.$emit('update:sorting', this.inner.sorting);
      }
    },

    sorting: {
      handler() {
        if (this.inner.sorting !== this.sorting) {
          this.inner.sorting = this._normalized_sorting();
        }
      }
    },

    'inner.paging': {
      handler() {
        this.$emit('update:paging', this.inner.paging);
      }
    },

    'inner.paging.page': {
      handler() {
        console.log('inner.paging.page:_processItems');
        this._processItems();
      }
    },

    'inner.paging.itemsPerPage': {
      handler() {
        if (this.inner.paging.page !== 1) {
          this.inner.paging.page = 1;
          return;
        }
        // if (this.inner.selected.length > 0) {
        //   this.inner.selected = [];
        // }

        console.log('inner.paging.itemsPerPage:_processItems');
        this._processItems();
      }
    },

    'inner.paginator': {
      handler() {
        this.$emit('update:paginator', this.inner.paginator);
      }
    },

    'inner.itemsPerPageOptions': {
      handler() {
        this.$emit(
          'update:itemsPerPageOptions',
          this.inner.itemsPerPageOptions
        );
      },
      immediate: true
    },

    itemsPerPageOptions: {
      handler() {
        if (this.inner.itemsPerPageOptions !== this.itemsPerPageOptions) {
          this.inner.itemsPerPageOptions =
            this._normalized_itemsPerPageOptions();
        }
      }
    },

    'inner.inlineEditItem': {
      deep: true,
      handler() {
        this.$emit('update:inlineEditItem', this.inner.inlineEditItem);
      },
      immediate: true
    },

    inlineEditItem: {
      handler() {
        if (this.inner.inlineEditItem !== this.inlineEditItem) {
          this.inner.inlineEditItem = this._normalized_inlineEditItem();
        }
      }
    }
  }
};
</script>
