<!--
MyPaginator
author: jzwang
-->
<template>
  <div class="my-paginator">
    <nav>
      <ul class="pagination m-0">
        <li
          class="page-item"
          :class="{ disabled: !totalPages }"
          v-if="inner.paginator.showFirst"
        >
          <a class="page-link" href="#" @click.prevent="_doPage(1)">首頁</a>
        </li>
        <li
          class="page-item"
          :class="{ disabled: prevPage == 0 }"
          v-if="inner.paginator.showPrev"
        >
          <a class="page-link" href="#" @click.prevent="_doPage(prevPage)"
            >上頁</a
          >
        </li>
        <li
          class="page-item"
          v-if="prevGrpPage != 0 && inner.paginator.showPrevGrp"
        >
          <a class="page-link" href="#" @click.prevent="_doPage(prevGrpPage)"
            >...</a
          >
        </li>
        <template v-if="inner.paginator.showPages">
          <li
            class="page-item pages-page"
            :class="{ active: page == inner.paging.page }"
            v-for="page in pages"
            :key="page"
          >
            <a class="page-link" href="#" @click.prevent="_doPage(page)">{{
              page
            }}</a>
          </li>
        </template>
        <li
          class="page-item"
          v-if="nextGrpPage != 0 && inner.paginator.showNextGrp"
        >
          <a class="page-link" href="#" @click.prevent="_doPage(nextGrpPage)"
            >...</a
          >
        </li>
        <li
          class="page-item"
          :class="{ disabled: nextPage == 0 }"
          v-if="inner.paginator.showNext"
        >
          <a class="page-link" href="#" @click.prevent="_doPage(nextPage)"
            >下頁</a
          >
        </li>
        <li
          class="page-item"
          :class="{ disabled: !totalPages }"
          v-if="inner.paginator.showLast"
        >
          <a class="page-link" href="#" @click.prevent="_doPage(totalPages)"
            >末頁</a
          >
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { defaultPaging, defaultPaginator } from '../../configs';
import myUtil from '../../utils/myUtil';

export default {
  name: 'MyPaginator',

  props: {
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

    totalItems: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      inner: {
        paging: this._normalize_paging(),
        paginator: this._normalize_paginator()
      }
    };
  },

  computed: {
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

    pages() {
      if (!this.totalPages) {
        return [];
      }

      const arr = [];
      const pagerIndex =
        Math.ceil(this.inner.paging.page / this.inner.paginator.pageLinks) - 1;
      let start = pagerIndex * this.inner.paginator.pageLinks + 1;
      let end =
        pagerIndex * this.inner.paginator.pageLinks +
        this.inner.paginator.pageLinks;
      end = Math.min(end, this.totalPages);

      for (let i = start; i <= end; i++) {
        arr.push(i);
      }

      return arr;
    },

    prevPage() {
      if (!this.totalPages) {
        return 0;
      }

      const prevPageNum = this.inner.paging.page - 1;
      return prevPageNum < 1 ? 0 : prevPageNum;
    },

    nextPage() {
      if (!this.totalPages) {
        return 0;
      }

      const nextPageNum = this.inner.paging.page + 1;
      return nextPageNum > this.totalPages ? 0 : nextPageNum;
    },

    prevGrpPage() {
      if (!this.totalPages) {
        return 0;
      }

      const prevPagerIndex =
        Math.ceil(this.inner.paging.page / this.inner.paginator.pageLinks) -
        1 -
        1;
      if (prevPagerIndex < 0) {
        return 0;
      }

      const prevEnd =
        prevPagerIndex * this.inner.paginator.pageLinks +
        this.inner.paginator.pageLinks;
      return prevEnd;
    },

    nextGrpPage() {
      if (!this.totalPages) {
        return 0;
      }

      const nextPagerIndex =
        Math.ceil(this.inner.paging.page / this.inner.paginator.pageLinks) -
        1 +
        1;
      if (
        nextPagerIndex >
        Math.ceil(this.totalPages / this.inner.paginator.pageLinks) - 1
      ) {
        return 0;
      }

      const nextStart = nextPagerIndex * this.inner.paginator.pageLinks + 1;
      return nextStart;
    }
  },

  methods: {
    _normalize_paging() {
      const paging = { ...this.paging };
      if (paging.itemsPerPage != null && paging.itemsPerPage <= 0) {
        paging.itemsPerPage = 0;
      }
      return Object.assign({}, defaultPaging, this.paging, paging);
    },

    _normalize_paginator() {
      return Object.assign({}, defaultPaginator, this.paginator);
    },

    _doPage(page) {
      this.inner.paging.page = page;
      this.$emit('change-page', page);
    }
  },

  watch: {
    'inner.paging': {
      deep: true,
      handler() {
        this.$emit('update:paging', this.inner.paging);
      },
      immediate: true
    },

    paging: {
      handler() {
        if (this.inner.paging !== this.paging) {
          this.inner.paging = this._normalize_paging();
        }
      }
    },

    'inner.paginator': {
      deep: true,
      handler() {
        this.$emit('update:paginator', this.inner.paginator);
      },
      immediate: true
    },

    paginator: {
      handler() {
        if (this.inner.paginator !== this.paginator) {
          this.inner.paginator = this._normalize_paginator();
        }
      }
    }
  }
};
</script>
