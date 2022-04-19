<!--
MyTable
author: jzwang
-->
<template>
  <div class="my-table">
    <!-- toolbar (begin) -->
    <div
      class="toolbar d-sm-flex align-items-center justify-content-between"
      :class="toolbarClass"
      :style="toolbarStyle"
      v-if="showToolbar"
    >
      <div class="toolbar-left">
        <slot name="toolbar-left-before" :vmData="$data"></slot>
        <button
          type="button"
          class="btn btn-primary"
          @click="_onCreate"
          v-if="showCreate"
        >
          <i class="fas fa-plus"></i> 新增
        </button>
        <slot name="toolbar-left-after" :vmData="$data"></slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right-before" :vmData="$data"></slot>
        <div class="input-icon-right" v-if="showSearch">
          <input
            class="form-control"
            type="search"
            placeholder="搜尋"
            v-model="inner.searchTerm"
          />
          <i class="fas fa-search"></i>
        </div>
        <slot name="toolbar-right-after" :vmData="$data"></slot>
      </div>
    </div>
    <!-- toolbar (end) -->

    <!-- menubar (begin) -->
    <div
      class="menubar border d-sm-flex align-items-center justify-content-between p-2"
      :class="menubarClass"
      :style="menubarStyle"
      v-if="showMenubar"
    >
      <div class="menubar-left d-sm-flex align-items-center">
        <slot name="menubar-left-before" :vmData="$data"></slot>
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
        <slot name="menubar-left-after" :vmData="$data"></slot>
      </div>
      <div class="menubar-right form-inline">
        <slot name="menubar-right-before" :vmData="$data"></slot>
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
        <div class="dropdown ml-1" v-if="showVisibleColumns">
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
        <slot name="menubar-right-after" :vmData="$data"></slot>
      </div>
    </div>
    <!-- menubar (end) -->

    <!-- pagebar(top) (begin) -->
    <div
      class="pagebar border d-sm-flex align-items-center justify-content-between p-2"
      :class="pagebarClass"
      :style="pagebarStyle"
      v-if="showPagebar && pagebarPosition !== 'bottom'"
    >
      <div class="pagebar-left">
        <slot name="pagebar-left-before" :vmData="$data"></slot>
        <my-paginator
          :paging.sync="inner.paging"
          :paginator.sync="inner.paginator"
          :totalItems="totalItems"
          @change-page="(page) => $emit('change-page', page)"
          v-if="showPaginator && inner.paging.itemsPerPage > 0"
        ></my-paginator>
        <slot name="pagebar-left-after" :vmData="$data"></slot>
      </div>
      <div class="pagebar-right">
        <slot name="pagebar-right-before" :vmData="$data"></slot>
        <span v-if="showPageInfo"
          >顯示第 {{ totalItems ? pageFromIndex + 1 : 0 }} 到
          {{ totalItems ? pageToIndex + 1 : 0 }} 項結果，共
          {{ totalItems }} 項。</span
        >
        <slot name="pagebar-right-after" :vmData="$data"></slot>
      </div>
    </div>
    <!-- pagebar(top) (end) -->

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
        <tr v-for="(item, itemIndex) in pagedItems" :key="item[rowKey]">
          <td class="text-center align-middle" v-if="showSelection">
            <div>
              <div
                class="custom-control custom-checkbox"
                v-if="item[rowKey] != null"
              >
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
                  (inner.inlineEditItem[rowKey] === item[rowKey] ||
                    (inner.inlineEditItem[rowKey] == null &&
                      inner.inlineEditItem._itemIndex === itemIndex))
                "
              >
                <div
                  class="inline-edit-item"
                  :class="{ 'is-invalid': column.errors.length }"
                >
                  <column-edit-control
                    :column="column"
                    :editItem.sync="inner.inlineEditItem"
                    :idPrefix="'inline-edit-'"
                    @model-change="
                      (value, column) =>
                        _onColumnEditControlModelChange(value, column)
                    "
                    :disabled="column.editable === false"
                  />
                </div>
                <div class="invalid-feedback">
                  {{ column.errors.join(column.errorsSeparator || ', ') }}
                </div>
              </slot>
              <slot
                v-else
                :name="`item-${column.key}`"
                :item="item"
                :column="column"
              >
                <!-- prettier-ignore -->
                <div class="pre-line">{{ _formatValue(column.format, column.value(item)) | nulltext(column.nullText) }}</div>
              </slot>
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
                  class="btn btn-primary btn-sm mr-1"
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
                  class="btn btn-primary btn-sm mr-1"
                  @click="_onRead(item)"
                  v-if="showRead"
                >
                  檢視
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm mr-1"
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

    <!-- pagebar(bottom) (begin) -->
    <div
      class="pagebar border d-sm-flex align-items-center justify-content-between p-2"
      :class="pagebarClass"
      :style="pagebarStyle"
      v-if="showPagebar && pagebarPosition === 'bottom'"
    >
      <div class="pagebar-left">
        <slot name="pagebar-left-before" :vmData="$data"></slot>
        <my-paginator
          :paging.sync="inner.paging"
          :paginator.sync="inner.paginator"
          :totalItems="totalItems"
          @change-page="(page) => $emit('change-page', page)"
          v-if="showPaginator && inner.paging.itemsPerPage > 0"
        ></my-paginator>
        <slot name="pagebar-left-after" :vmData="$data"></slot>
      </div>
      <div class="pagebar-right">
        <slot name="pagebar-right-before" :vmData="$data"></slot>
        <span v-if="showPageInfo"
          >顯示第 {{ totalItems ? pageFromIndex + 1 : 0 }} 到
          {{ totalItems ? pageToIndex + 1 : 0 }} 項結果，共
          {{ totalItems }} 項。</span
        >
        <slot name="pagebar-right-after" :vmData="$data"></slot>
      </div>
    </div>
    <!-- pagebar(bottom) (end) -->
  </div>
</template>

<script>
import MyPaginator from '../MyPaginator';
import ColumnEditControl from './components/_ColumnEditControl.vue';
import _normalizeColumn from './_normalizeColumn';
import columnsUtil from './utils/columnsUtil';
import {
  defaultFiltering,
  defaultSorting,
  defaultPaging,
  defaultPaginator,
  defaultItemsPerPageOptions
} from '../../configs';
import myUtil from '../../utils/myUtil';
import exportUtil from '../../utils/exportUtil';
import { nulltext } from '../../filters';

export default {
  name: 'MyTable',

  components: {
    MyPaginator,
    ColumnEditControl
  },

  filters: {
    nulltext
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

    searchFilter: {
      type: Object,
      defualt() {
        return {};
      }
    },

    filtering: {
      type: Object,
      default() {
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

    serverTotalItems: {
      type: Number
    },

    showToolbar: {
      type: Boolean,
      default: true
    },

    showCreate: {
      type: Boolean,
      default: true
    },

    showSearch: {
      type: Boolean,
      default: true
    },

    showMenubar: {
      type: Boolean,
      default: true
    },

    showDestroy: {
      type: Boolean,
      default: true
    },

    showExport: {
      type: Boolean,
      default: true
    },

    showItemsPerPage: {
      type: Boolean,
      default: true
    },

    showVisibleColumns: {
      type: Boolean,
      default: true
    },

    showPagebar: {
      type: Boolean,
      default: true
    },

    showPaginator: {
      type: Boolean,
      default: true
    },

    showPageInfo: {
      type: Boolean,
      default: true
    },

    pagebarPosition: {
      type: String,
      default: 'top',
      validator(position) {
        return ['top', 'bottom'].indexOf(position.toLowerCase()) !== -1;
      }
    },

    toolbarClass: null,

    toolbarStyle: null,

    menubarClass: null,

    menubarStyle: null,

    pagebarClass: null,

    pagebarStyle: null,

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
        searchFilter: this._normalized_searchFilter(),
        filtering: this._normalized_filtering(),
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
      return this.columns.map(_normalizeColumn);
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

    _normalized_searchFilter() {
      return Object.assign(
        {},
        this._normalized_columns()
          .filter((column) => column.displayable !== false)
          .reduce((prev, curr) => ({ ...prev, [curr.key]: null }), {}),
        this.searchFilter
      );
    },

    _normalized_filtering() {
      return Object.assign({}, defaultFiltering, this.filtering);
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
          const valueToEdit = column.valueToEdit(inlineEditItem);
          if (inlineEditItem[column.key] !== valueToEdit) {
            inlineEditItem[`_${column.key}`] = inlineEditItem[column.key];
            inlineEditItem[column.key] = valueToEdit;
          }
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
        //console.log('_onFilteringChange:_processItems');
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
          searchTerm: this.inner.searchTerm,
          searchFilter: this.inner.searchFilter,
          filtering: this.inner.filtering,
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
        this.inner.searchTerm ||
        Object.values(this.inner.searchFilter ?? {}).some((val) => val != null)
      ) {
        items = items.filter((item) => {
          const passeds = [];
          let normalizedSearchTerm = this.inner.searchTerm;
          if (this.inner.filtering.ignoreCase) {
            normalizedSearchTerm = normalizedSearchTerm.toLowerCase();
          }

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

              let normalizedValueString = valueString;
              if (this.inner.filtering.ignoreCase) {
                normalizedValueString = normalizedValueString.toLowerCase();
              }

              let filterTerm =
                (this.inner.searchFilter ?? {})[column.key]?.toString() ?? '';

              let normalizedFilterTerm = filterTerm;
              if (this.inner.filtering.ignoreCase) {
                normalizedFilterTerm = normalizedFilterTerm.toLowerCase();
              }

              passed =
                normalizedValueString.indexOf(normalizedSearchTerm) !== -1;

              if (normalizedFilterTerm) {
                if (
                  this.inner.filtering.logicOperation?.toLowerCase() === 'and'
                ) {
                  passed =
                    passed &&
                    normalizedValueString.indexOf(normalizedFilterTerm) !== -1;
                } else {
                  passed =
                    passed ||
                    normalizedValueString.indexOf(normalizedFilterTerm) !== -1;
                }
              }
            }
            passeds.push(passed);
          }

          if (this.inner.filtering.logicOperation?.toLowerCase() === 'and') {
            return passeds.every((passed) => passed);
          } else {
            return passeds.some((passed) => passed);
          }
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

          value = value ?? '';

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
        this.exportExcel(exportItems, exportColumns, this.exportName);
        return;
      }
      exportUtil.exportExcel(exportItems, exportColumns, this.exportName);
    },

    doExportPdf() {
      const { exportItems, exportColumns } = this.getExportParams();
      if (this.exportPdf) {
        this.exportPdf(exportItems, exportColumns, this.exportName);
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

    _validateInlineEditItemField(value, column) {
      return columnsUtil.validateItemField(
        value,
        column,
        this.inner.inlineEditItem
      );
    },

    validateInlineEditItem() {
      return columnsUtil.validateItem(
        this.inner.columns,
        this.inner.inlineEditItem
      );
    },

    clearErrors() {
      columnsUtil.clearErrors(this.inner.columns);
    },

    getErrors() {
      return columnsUtil.getErrors(this.inner.columns);
    },

    _onColumnEditControlModelChange(value, column) {
      //console.log('_onColumnEditControlModelChange', value);

      columnsUtil.handleColumnModelChange(
        value,
        column,
        this.inner.inlineEditItem
      );
    },

    _onSave() {
      if (!this.validateInlineEditItem()) {
        this.$emit('validate-item-failed', {
          errors: this.getErrors(),
          item: this.inner.inlineEditItem
        });
        return;
      }

      const inlineEditItem = Object.assign({}, this.inner.inlineEditItem);

      if (!inlineEditItem[this.rowKey]) {
        delete inlineEditItem._itemIndex;
        this.$emit('save-create-item', inlineEditItem);
      } else {
        this.$emit('save-update-item', inlineEditItem);
      }
    },

    _onCancel() {
      this.clearErrors();
      const inlineEditItem = Object.assign({}, this.inner.inlineEditItem);
      if (inlineEditItem._itemIndex != null) {
        let items = [...this.items];
        items.splice(inlineEditItem._itemIndex, 1);
        this.$emit('update:items', items);
        delete inlineEditItem._itemIndex;
      }
      this.$emit('cancel-item', inlineEditItem);
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
    },

    _onCreate() {
      const _itemIndex = 0;
      const item = { _itemIndex };
      for (let column of this.inner.columns) {
        item[column.key] = column.defaultValue ?? null;
      }
      this.$emit('create-item', item, _itemIndex);
    },

    _formatValue(format, value) {
      return myUtil.formatValue(format, value);
    }
  },

  created() {
    this.$emit('update:searchTerm', this.inner.searchTerm);
    this.$emit('update:searchFilter', this.inner.searchFilter);
    this.$emit('update:filtering', this.inner.filtering);
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

        //console.log('items:_processItems');
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
      deep: true,
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

    'inner.searchFilter': {
      deep: true,
      handler() {
        this._onFilteringChange();
        this.$emit('update:searchFilter', this.inner.searchFilter);
      }
    },

    searchFilter: {
      handler() {
        if (this.inner.searchFilter !== this.searchFilter) {
          this.inner.searchFilter = this._normalized_searchFilter();
        }
      }
    },

    'inner.filtering': {
      deep: true,
      handler() {
        this._onFilteringChange();
        this.$emit('update:filtering', this.inner.filtering);
      }
    },

    filtering: {
      handler() {
        if (this.inner.filtering !== this.filtering) {
          this.inner.filtering = this._normalized_filtering();
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

        //console.log('inner.sorting:_processItems');
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
        //console.log('inner.paging.page:_processItems');
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

        //console.log('inner.paging.itemsPerPage:_processItems');
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
