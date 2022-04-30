<!--
file: MyTable/index.vue
author: Wang, Jian-Zhong
email: jason@gms.ndhu.edu.tw
-->
<template>
  <div class="my-table" :id="_id">
    <!-- toolbar (begin) -->
    <div
      class="toolbar row no-gutters"
      :class="toolbarClass"
      :style="toolbarStyle"
      v-if="showToolbar"
    >
      <div class="toolbar-left col-sm hbox-sm">
        <slot name="toolbar-left-before" :compData="$data"></slot>
        <button
          type="button"
          class="btn btn-primary"
          :class="{ 'btn-sm': smallTable }"
          @click="_onCreate"
          v-if="showCreate"
          :disabled="_inlineCreating"
        >
          <i class="fas fa-plus"></i> 新增
        </button>
        <slot name="toolbar-left-after" :compData="$data"></slot>
      </div>
      <div class="toolbar-right col-sm hbox-sm">
        <slot name="toolbar-right-before" :compData="$data"></slot>
        <div class="form-inline">
          <div class="input-icon-right" v-if="showSearch">
            <input
              class="form-control"
              :class="{ 'form-control-sm': smallTable }"
              type="search"
              placeholder="搜尋"
              v-model="inner.searchTerm"
            />
            <i class="fas fa-search"></i>
          </div>
        </div>
        <slot name="toolbar-right-after" :compData="$data"></slot>
      </div>
    </div>
    <!-- toolbar (end) -->

    <!-- menubar (begin) -->
    <div
      class="menubar row no-gutters border p-2"
      :class="menubarClass"
      :style="menubarStyle"
      v-if="showMenubar"
    >
      <div class="menubar-left col-sm hbox-sm">
        <slot name="menubar-left-before" :compData="$data"></slot>
        <button
          type="button"
          class="btn btn-danger"
          :class="{ 'btn-sm': smallTable }"
          @click="$emit('destroy-items', inner.selected)"
          :disabled="!inner.selected.length"
          v-if="showDestroy"
        >
          <i class="fas fa-trash"></i> 刪除勾選
        </button>
        <div class="dropdown" v-if="showExport">
          <button
            class="btn btn-secondary dropdown-toggle"
            :class="{ 'btn-sm': smallTable }"
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
        <slot name="menubar-left-after" :compData="$data"></slot>
      </div>
      <div class="menubar-right col-sm hbox-sm">
        <slot name="menubar-right-before" :compData="$data"></slot>
        <div class="form-inline">
          <template v-if="showItemsPerPage">
            顯示
            <select
              class="form-control mx-1"
              :class="{ 'form-control-sm': smallTable }"
              v-model="inner.paging.itemsPerPage"
            >
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
          <div class="dropdown ml-2" v-if="showDisplayingColumns">
            <button
              class="btn btn-outline-secondary dropdown-toggle"
              :class="{ 'btn-sm': smallTable }"
              type="button"
              data-toggle="dropdown"
            >
              顯示欄位
            </button>
            <div class="dropdown-menu displaying-columns">
              <form class="px-2 py-1">
                <div class="mb-2">
                  <button
                    type="button"
                    class="btn btn-info btn-sm"
                    @click="
                      inner.displayingColumnKeys = visibleColumns.map(
                        (column) => column.key
                      )
                    "
                  >
                    全選
                  </button>
                  <button
                    type="button"
                    class="btn btn-info btn-sm"
                    @click="inner.displayingColumnKeys = []"
                  >
                    清除
                  </button>
                </div>
                <div
                  class="custom-control custom-checkbox"
                  v-for="column in visibleColumns"
                  :key="column.key"
                >
                  <input
                    type="checkbox"
                    class="custom-control-input"
                    :id="`${_id}_displayingColumnKeys_${column.key}`"
                    :value="column.key"
                    v-model="inner.displayingColumnKeys"
                  />
                  <label
                    class="custom-control-label d-inline-block"
                    :for="`${_id}_displayingColumnKeys_${column.key}`"
                    >{{ column.header }}</label
                  >
                </div>
              </form>
            </div>
          </div>
        </div>
        <slot name="menubar-right-after" :compData="$data"></slot>
      </div>
    </div>
    <!-- menubar (end) -->

    <!-- pagebar(top) (begin) -->
    <div
      ref="paginator"
      class="pagebar row no-gutters border p-2"
      :class="pagebarClass"
      :style="pagebarStyle"
      v-if="showPagebar && pagebarPosition !== 'bottom'"
    >
      <div class="pagebar-left col-sm hbox-sm">
        <slot name="pagebar-left-before" :compData="$data"></slot>
        <my-paginator
          :paging.sync="inner.paging"
          :paginator.sync="inner.paginator"
          :totalItems="totalItems"
          @change-page="(page) => $emit('change-page', page)"
          v-if="showPaginator && inner.paging.itemsPerPage > 0"
          :size="smallTable ? 'sm' : 'md'"
        ></my-paginator>
        <slot name="pagebar-left-after" :compData="$data"></slot>
      </div>
      <div class="pagebar-right col-sm hbox-sm">
        <slot name="pagebar-right-before" :compData="$data"></slot>
        <span v-if="showPageInfo"
          >顯示第 {{ totalItems ? pageFromIndex + 1 : 0 }} 到
          {{ totalItems ? pageToIndex + 1 : 0 }} 項結果，共
          {{ totalItems }} 項。</span
        >
        <slot name="pagebar-right-after" :compData="$data"></slot>
      </div>
    </div>
    <!-- pagebar(top) (end) -->

    <table
      class="main-table table responsive mb-0"
      :class="_tableClass"
      :style="tableStyle"
    >
      <thead>
        <tr class="table-active">
          <th
            class="selections text-center align-middle"
            :class="selectionsThClass"
            :style="selectionsThStyle"
            v-if="showSelection"
          >
            <div class="custom-control custom-checkbox">
              <input
                type="checkbox"
                class="custom-control-input"
                :id="`${_id}_checkAll`"
                v-model="_checkAll"
              />
              <label
                class="custom-control-label"
                :for="`${_id}_checkAll`"
              ></label>
            </div>
          </th>
          <th
            v-for="column in displayingColumns"
            :key="column.key"
            :class="[{ sortable: column.sortable !== false }, column.thClass]"
            :style="column.thStyle"
            @click="column.sortable !== false && doSort(column.key)"
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
          <th
            v-if="showActions"
            class="actions"
            :class="actionsThClass"
            :style="actionsThStyle"
          ></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, itemIndex) in pagedItems" :key="item[rowKey]">
          <td
            class="selections text-center align-middle"
            :class="selectionsTdClass"
            :style="selectionsTdStyle"
            v-if="showSelection"
          >
            <div>
              <div
                class="custom-control custom-checkbox"
                v-if="item[rowKey] != null"
              >
                <input
                  type="checkbox"
                  class="custom-control-input"
                  :id="`${_id}_selected_${item[rowKey]}`"
                  :value="item[rowKey]"
                  v-model="inner.selected"
                />
                <label
                  class="custom-control-label"
                  :for="`${_id}_selected_${item[rowKey]}`"
                ></label>
              </div>
            </div>
          </td>
          <td
            v-for="column in displayingColumns"
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
                      inner.inlineEditItem._myui_itemIndex === itemIndex))
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
                      (value, event) =>
                        _onColumnEditControlModelChange(value, column, event)
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
                <div
                  class="pre-line"
                  v-if="column.allowHtml === true"
                  v-html="
                    $options.filters.nulltext(
                      _formatValue(column.format, column.value(item))
                    )
                  "
                ></div>
                <!-- prettier-ignore -->
                <div class="pre-line" v-else>{{ _formatValue(column.format, column.value(item)) | nulltext(column.nullText) }}</div>
              </slot>
            </div>
          </td>
          <td
            v-if="showActions"
            class="actions"
            :class="actionsTdClass"
            :style="actionsTdStyle"
          >
            <div>
              <div
                v-if="
                  inner.inlineEditItem &&
                  inner.inlineEditItem[rowKey] === item[rowKey]
                "
                class="text-center"
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
              <div v-else class="text-center">
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
                  :disabled="_inlineCreating"
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
      ref="paginator"
      class="pagebar border d-sm-flex align-items-center justify-content-between p-2"
      :class="pagebarClass"
      :style="pagebarStyle"
      v-if="showPagebar && pagebarPosition === 'bottom'"
    >
      <div class="pagebar-left">
        <slot name="pagebar-left-before" :compData="$data"></slot>
        <my-paginator
          :paging.sync="inner.paging"
          :paginator.sync="inner.paginator"
          :totalItems="totalItems"
          @change-paging="
            ({ page, itemsPerPage }) =>
              $emit('change-paging', { page, itemsPerPage })
          "
          v-if="showPaginator && inner.paging.itemsPerPage > 0"
          :size="smallTable ? 'sm' : 'md'"
        ></my-paginator>
        <slot name="pagebar-left-after" :compData="$data"></slot>
      </div>
      <div class="pagebar-right">
        <slot name="pagebar-right-before" :compData="$data"></slot>
        <span v-if="showPageInfo"
          >顯示第 {{ totalItems ? pageFromIndex + 1 : 0 }} 到
          {{ totalItems ? pageToIndex + 1 : 0 }} 項結果，共
          {{ totalItems }} 項。</span
        >
        <slot name="pagebar-right-after" :compData="$data"></slot>
      </div>
    </div>
    <!-- pagebar(bottom) (end) -->
  </div>
</template>

<script>
import MyPaginator from '../MyPaginator';
import '../MyPaginator/style.css';
import ColumnEditControl from '../MyColumnEditControl';
import _normalizeColumn from './_normalizeColumn';
import {
  defaultFiltering,
  defaultSorting,
  defaultPaging,
  defaultPaginator,
  defaultItemsPerPageOptions
} from '../../configs';
import myUtil from '../../utils/myUtil';
import exportUtil from '../../utils/exportUtil';
import columnsUtil from '../../utils/columnsUtil';
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
    /**
     * 資料來源。支持.sync，必填。
     * @type {any[]}
     */
    items: {
      type: Array,
      required: true
    },

    /**
     * 欄位定義。支持.sync，必填，驗證：(columns) => columns.every((column) => column.key)。
     * @type {any[]}
     */
    columns: {
      type: Array,
      required: true,
      validator: (columns) => columns.every((column) => column.key)
    },

    displayingColumnKeys: {
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

    showDisplayingColumns: {
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

    exportColumnKeys: {
      type: Array
    },

    showSelection: {
      type: Boolean,
      default: true
    },

    selectionsThClass: null,

    selectionsThStyle: null,

    selectionsTdClass: null,

    selectionsTdStyle: null,

    showActions: {
      type: Boolean,
      default: true
    },

    actionsThClass: null,

    actionsThStyle: null,

    actionsTdClass: null,

    actionsTdStyle: null,

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
    },

    smallTable: {
      type: Boolean,
      default: false
    },

    tableClass: null,

    tableStyle: null,

    bordered: {
      type: Boolean,
      default: true
    },

    striped: {
      type: Boolean,
      default: true
    },

    hover: {
      type: Boolean,
      default: true
    },

    cloneMode: {
      type: String,
      default: 'shallowcopy',
      validator(value) {
        return (
          ['nocopy', 'shallowcopy', 'deepcopy'].indexOf(
            value?.toLowerCase()
          ) !== -1
        );
      }
    }
  },

  data() {
    return {
      inner: {
        columns: this._normalized_columns(),
        displayingColumnKeys: this._normalized_displayingColumnKeys(),
        selected: this._normalized_selected(),
        searchTerm: this._normalized_searchTerm(),
        searchFilter: this._normalized_searchFilter(),
        filtering: this._normalized_filtering(),
        sorting: this._normalized_sorting(),
        paging: Object.assign({}, defaultPaging, this.paging),
        paginator: Object.assign({}, defaultPaginator, this.paginator),
        itemsPerPageOptions: this._normalized_itemsPerPageOptions(),
        exportColumnKeys: this._normalized_exportColumnKeys(),
        inlineEditItem: this._normalized_inlineEditItem()
      },
      processedItems: [],
      filteredItems: [],
      sortedItems: [],
      pagedItems: []
    };
  },

  computed: {
    _id() {
      return this.$attrs.id ?? myUtil.randomId();
    },

    visibleColumns() {
      return this.inner.columns.filter((column) => column.visible !== false);
    },

    displayingColumns() {
      return this.visibleColumns.filter((column) =>
        this.inner.displayingColumnKeys.includes(column.key)
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
    },

    _inlineCreating() {
      return this.items?.some((item) => item._myui_itemIndex != null) ?? false;
    },

    _tableClass() {
      const props = ['bordered', 'striped', 'hover'];
      const defaultTableClass = {
        'table-sm': this.smallTable
      };
      for (let prop of props) {
        defaultTableClass[`table-${prop}`] = this[prop];
      }

      const tableClassType = Object.prototype.toString.call(this.tableClass);
      if (tableClassType === '[object Object]') {
        return Object.assign({}, this.tableClass, defaultTableClass);
      } else if (tableClassType === '[object Array]') {
        const classArray = [...this.tableClass];
        if (this.smallTable) {
          classArray.push('table-sm');
        }
        for (let prop of props) {
          if (this[prop]) {
            classArray.push(`table-${prop}`);
          }
        }
        return classArray;
      } else if (tableClassType === '[object String]') {
        let classString = this.tableClass;
        if (this.smallTable) {
          classString += ' table-sm';
        }
        for (let prop of props) {
          if (this[prop]) {
            classString += ` table-${prop}`;
          }
        }
        return classString;
      }

      return this.tableClass ?? defaultTableClass;
    }
  },

  methods: {
    _cloneObject(source) {
      try {
        switch (this.cloneMode?.toLowerCase()) {
          case 'shallowcopy':
            return Object.assign({}, source);
          case 'deepcopy':
            return structuredClone(source);
          default:
            return source;
        }
      } catch (err) {
        console.log(
          `[debug] MyTable._cloneObject() 錯誤：${err} 來源物件：${source}`
        );
        return source;
      }
    },

    _normalized_columns() {
      return this.columns.map(_normalizeColumn);
    },

    _normalized_displayingColumnKeys() {
      const keys = this._normalized_columns()
        .filter((column) => column.visible !== false)
        .map((column) => column.key);
      return (
        this.displayingColumnKeys?.filter((key) => keys.includes(key)) ?? keys
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
          .filter((column) => column.visible !== false)
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

    _normalized_exportColumnKeys() {
      const keys = this._normalized_columns()
        .filter((column) => column.visible !== false)
        .map((column) => column.key);
      return this.exportColumnKeys?.filter((key) => keys.includes(key)) ?? keys;
    },

    _normalized_inlineEditItem() {
      if (!this.inlineEditItem) {
        return null;
      }

      const inlineEditItem = { ...this.inlineEditItem };
      for (let column of this._normalized_columns()) {
        if (inlineEditItem[column.key] === undefined) {
          inlineEditItem[column.key] = column.defaultValue ?? null;
        } else {
          const valueToEdit = column.valueToEdit(inlineEditItem);
          if (inlineEditItem[column.key] !== valueToEdit) {
            inlineEditItem[`_${column.key}`] = inlineEditItem[column.key];
            inlineEditItem[column.key] = valueToEdit ?? null;
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

    doFilter(searchTerm, searchFilter) {
      this.inner.searchTerm = searchTerm ?? '';
      Object.assign(this.inner.searchFilter, searchFilter);
      this.$emit('change-filtering', {
        searchTerm: this.inner.searchTerm,
        searchFilter: this.inner.searchFilter
      });
    },

    doSort(key, direction) {
      if (direction != null) {
        this.inner.sorting = {
          key,
          direction
        };
        this.$emit('change-sorting', this.inner.sorting);
        return;
      }

      if (this.inner.sorting.key !== key) {
        this.inner.sorting.direction = 'asc';
        this.inner.sorting.key = key;
        this.$emit('change-sorting', this.inner.sorting);
        return;
      }

      if (this.inner.sorting.direction === 'asc') {
        this.inner.sorting.direction = 'desc';
      } else {
        this.inner.sorting.key = '';
        this.inner.sorting.direction = 'asc';
      }
      this.$emit('change-sorting', this.inner.sorting);
    },

    doPage(page, itemsPerPage) {
      this.$refs.paginator.doPage(page, itemsPerPage);
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
          const passedInfos = [];

          let normalizedSearchTerm = this.inner.searchTerm;
          if (this.inner.filtering.ignoreCase) {
            normalizedSearchTerm = normalizedSearchTerm?.toLowerCase();
          }

          const filterableColumns = this.visibleColumns.filter(
            (column) => column.filterable !== false
          );

          for (let column of filterableColumns) {
            let searchTermPassed = false,
              searchFilterPassed = false;
            let value = column.value ? column.value(item) : item[column.key];
            let valueString = null;

            if (value != null) {
              valueString = myUtil.valueToString(value);
            }

            let normalizedValueString = valueString;
            if (this.inner.filtering.ignoreCase) {
              normalizedValueString = normalizedValueString?.toLowerCase();
            }

            if (normalizedSearchTerm) {
              searchTermPassed = normalizedValueString
                ? normalizedValueString.indexOf(normalizedSearchTerm) !== -1
                : false;
            } else {
              searchTermPassed = true;
            }

            let filterTerm = myUtil.valueToString(
              (this.inner.searchFilter ?? {})[column.key]
            );

            let normalizedFilterTerm = filterTerm;
            if (this.inner.filtering.ignoreCase) {
              normalizedFilterTerm = normalizedFilterTerm?.toLowerCase();
            }

            if (normalizedFilterTerm) {
              searchFilterPassed = normalizedValueString
                ? normalizedValueString.indexOf(normalizedFilterTerm) !== -1
                : false;
            } else {
              searchFilterPassed = true;
            }

            passedInfos.push({
              key: column.key,
              searchTermPassed,
              searchFilterPassed
            });
          }

          //console.log(passedInfos);

          const itemSearchTermPassed = passedInfos.some(
            (info) => info.searchTermPassed
          );

          if (this.inner.filtering.logicOperation?.toLowerCase() === 'or') {
            return (
              itemSearchTermPassed ||
              passedInfos.some((info) => info.searchFilterPassed)
            );
          } else {
            return (
              itemSearchTermPassed &&
              passedInfos.every((info) => info.searchFilterPassed)
            );
          }
        });
      }

      this.filteredItems = items;

      if (this.inner.sorting?.key) {
        items.sort((a, b) => {
          const column = this.visibleColumns.find(
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
      const exportColumns = this.displayingColumns.filter((column) =>
        this.inner.exportColumnKeys.includes(column.key)
      );

      const exportItems = this.processedItems.map((item) => {
        const tmpItem = {};
        exportColumns.forEach((column) => {
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

          tmpItem[column.key] = this._formatValue(column.format, value);
        });

        return tmpItem;
      });

      const _exportColumns = exportColumns.map((column) => ({
        key: column.key,
        header: column.header ?? column.key
      }));

      return {
        exportItems,
        exportColumns: _exportColumns
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

    _onColumnEditControlModelChange(value, column, event) {
      //console.log('(MyTable)_onColumnEditControlModelChange', value, event);

      if (event) {
        columnsUtil.validateColumn(value, column, this.inner.inlineEditItem);
      }
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
        delete inlineEditItem._myui_itemIndex;
        this.$emit('save-create-item', inlineEditItem);
      } else {
        this.$emit('save-update-item', inlineEditItem);
      }
    },

    _onCancel() {
      this.clearErrors();
      const inlineEditItem = Object.assign({}, this.inner.inlineEditItem);
      if (inlineEditItem._myui_itemIndex != null) {
        let items = [...this.items];
        items.splice(inlineEditItem._myui_itemIndex, 1);
        this.$emit('update:items', items);
        delete inlineEditItem._myui_itemIndex;
      }
      this.$emit('cancel-item', inlineEditItem);
      this.inner.inlineEditItem = null;
    },

    _onRead(item) {
      const _clonedItem = this._cloneObject(item);
      this.$emit('read-item', _clonedItem);
    },

    _onUpdate(item) {
      const _clonedItem = this._cloneObject(item);
      this.$emit('update-item', _clonedItem);
    },

    _onDelete(item) {
      const _clonedItem = this._cloneObject(item);
      this.$emit('delete-item', _clonedItem);
    },

    _onCreate() {
      const _myui_itemIndex = 0;
      const item = { _myui_itemIndex };
      for (let column of this.inner.columns) {
        if (column.defaultValue == null) {
          item[column.key] = null;
          continue;
        }

        const defaultValueType = Object.prototype.toString.call(
          column.defaultValue
        );
        if (defaultValueType === '[object Function]') {
          item[column.key] = column.defaultValue();
        } else if (defaultValueType === '[object Array]') {
          item[column.key] = [...column.defaultValue];
        } else if (defaultValueType === '[object Object]') {
          item[column.key] = { ...column.defaultValue };
        } else {
          item[column.key] = column.defaultValue;
        }
      }
      this.$emit('create-item', item, _myui_itemIndex);
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
      },
      immediate: true
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

    'inner.displayingColumnKeys': {
      handler() {
        this.$emit(
          'update:displayingColumnKeys',
          this.inner.displayingColumnKeys
        );
      },
      immediate: true
    },

    displayingColumnKeys: {
      handler() {
        if (this.inner.displayingColumnKeys !== this.displayingColumnKeys) {
          this.inner.displayingColumnKeys =
            this._normalized_displayingColumnKeys();
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

    'inner.exportColumnKeys': {
      handler() {
        this.$emit('update:exportColumnKeys', this.inner.exportColumnKeys);
      },
      immediate: true
    },

    exportColumnKeys: {
      handler() {
        if (this.inner.exportColumnKeys !== this.exportColumnKeys) {
          this.inner.exportColumnKeys = this._normalized_exportColumnKeys();
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
