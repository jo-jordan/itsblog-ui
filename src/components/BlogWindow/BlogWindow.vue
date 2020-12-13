<template>
  <div @mousedown="bringWindowToTop">
    <div v-show="visible" class="window-backgound" :style="afterDragStyle" ref="mContainer">
      <div class="window-top-action-bar" @mousedown="startDrag">
        <div class="window-top-action-bar-item-outter-common">
          <div class="window-top-action-bar-close-inner window-top-action-bar-item-common">
            <div class="window-top-action-bar-inner-text" @click="unload">x</div>
          </div>
        </div>
        <div class="window-top-action-bar-item-outter-common">
          <div class="window-top-action-bar-min-inner window-top-action-bar-item-common">
            <div class="window-top-action-bar-inner-text" @click="fold">-</div>
          </div>
        </div>
        <div class="window-top-action-bar-item-outter-common">
          <div class="window-top-action-bar-max-inner window-top-action-bar-item-common">
            <div class="window-top-action-bar-inner-text">+</div>
          </div>
        </div>

        <div class="window-top-title">
          <img style="height: 100%;vertical-align: middle;" :src="finderIcon" alt="Blog Viewer" width="14px">
          Blog Viewer
        </div>
      </div>
      <div class="window-content">
        <div class="content-common content-categories">
          <ul style="list-style-type:none;width:100%">
            <li v-for="(cate, index) in blogData" :key="index" class="category-cell" :style="curCate.Name==cate.Name ? 'background:#00000044;' : ''" @click="onCategoryClick(cate)">
              
              <span class="category-cell-title">
                <img class="category-cell-icon" src="../../assets/logo.png" :alt="cate.Name">
                {{ cate.Name }}
              </span>
              
            </li>
          </ul>
        </div>
        <div class="content-common content-blogs">
          <ul style="list-style-type:none;width:100%">
            <li v-for="(blog, index) in blogList" :key="index" class="blogs-cell" :style="curBlog.Name==blog.Name ? 'background:#00000044;' : ''" @click="onBlogClick(blog)">
              
              <span class="blogs-cell-title">
                <img class="blogs-cell-icon" src="../../assets/logo.png" :alt="blog.Name">
                {{ blog.Name }}
              </span>
              
            </li>
          </ul>
        </div>
        <div class="content-common content-details">
          <div v-if="isBlogLoading" class="loading"></div>
          <article v-else class="markdown-body" v-html="markedText"></article>
        </div>
      </div>
    </div>
    <canvas></canvas>
  </div>
</template>

<script>
import store from '../../store'
import Event from '../../main'
import finderIcon from '../../assets/macos-x-finder.png'
import { bringWindowToTop, fold, unfold, unload, draw, clearRect, scale, stopDrag, startDrag, doDrag, resize } from '../../common/Window'
import { readJSONFile, readMarkDownFile } from '../../utils/fileHelper'
import { getCategories, getBlogs, getBlog } from '../../api/blog'
import marked from 'marked'
import 'github-markdown-css'

export default {
  name: 'BlogWindow',
  data () {
    return {
      finderIcon: finderIcon,
      afterDragStyle: {},
      visible: false,
      canvasVisible: false,
      dragging: false,
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      lastTop: 0,
      lastLeft: 0,

      maxLeft:0,
      maxTop:0,
      minLeft:0,
      minTop:0,
      canvas: null,
      ctx: null,
      p1:0,
      p2:0,
      itemName: '',

      style: {
        zIndex: 10
      },
      blogData: [],
      blogList: [],
      markedText: '',
      curCate: {},
      curBlog: {},
      isBlogLoading: false
    }
  },
  mounted() {
    // Calculate center left and top value
    this.$nextTick(() => {
      var width = window.getComputedStyle(this.$refs.mContainer).width
      width = Number(width.substring(0, width.indexOf('px')))

      var height = window.getComputedStyle(this.$refs.mContainer).height
      height = Number(height.substring(0, height.indexOf('px')))

      var centerLeft = window.innerWidth / 2 - width / 2
      var centerTop = window.innerHeight / 2 - height / 2

      this.afterDragStyle = {
        left: centerLeft + 'px',
        top: centerTop + 'px'
      }

      this.canvas = document.querySelector("canvas");
      this.ctx = this.canvas.getContext("2d");
      Event.$on('window-unfold', (data) => {
        if (data.itemName === this.itemName && this.visible === false) {
          this.unfold()
          this.p1 = data.p1
          this.p2 = data.p2
        }
      })

      Event.$on('window-load', (data) => {
        if (data.itemName === this.itemName) {
          this.p1 = data.p1
          this.p2 = data.p2
        }
      })
    })

    window.addEventListener('mouseup', this.stopDrag)
    window.addEventListener('mousemove', this.doDrag)

    this.loadJSONFile()
    this.fetchCategories()
  },
  methods: {
    onCategoryClick(cate) {
      getBlogs(cate.ID).then(res => {
        this.blogList = []
        this.blogList = res
      })
      this.curCate = cate
    },

    onBlogClick(blog) {
      this.isBlogLoading = true
      getBlog(this.curCate.ID, blog.ID).then(res => {

        readMarkDownFile(res.URL, data => {
          if (data && data != {} && data.length > 0) {
            this.markedText = marked(data)
          } else {
            this.markedText = marked('# 🥶')
          }
          this.isBlogLoading = false
        })
      })
      
      this.curBlog = blog
    },

    fetchCategories() {
      getCategories().then(res => {
        this.blogData = res
      })
    },
    
    loadJSONFile() {
      
    },
    bringWindowToTop, fold, unfold, unload, draw, clearRect, scale, stopDrag, startDrag, doDrag, resize
  }
}
</script>

<style lang="scss" scoped>
@import url('../../style/Window.scss');

.blog-fade-enter-active, .blog-fade-leave-active {
  transition: opacity .38s;
}

.blog-fade-enter, .blog-fade-leave-to {
  opacity: 0;
}

ul {
  display: block;
  list-style-type: none;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: 0px;
  padding-inline-end: 0px;
}

.window-backgound {
  height: 800px;
  width: 1400px;
}
.content-common {
  height: 100%;
  float: left;

  overflow: auto;
}

.content-categories {
  width: 240px;
  background: white;
  margin: 0 14px 0 0;
  box-shadow: 8px 0px 10px 2px rgba(1, 1, 1, 0.2);

  .category-cell:hover {
    background: #00000022;
    cursor: pointer;
  }

  .category-cell {
    width: 100%;

    .category-cell-icon {
      width: 28px;
      height: 28px;
      display: inline-block;
      vertical-align: middle;
    }
    .category-cell-title {
      width: 100%;
      white-space: nowrap;
      display: inline-block;
      vertical-align: middle;
      padding: 16px 8px;
      text-align: left;
      font-size: 20px;
    }
  }
}

.content-blogs {
  width: 240px;
  background: white;
  margin: 0 14px 0 0;
  box-shadow: 8px 0px 10px 2px rgba(1, 1, 1, 0.2);

  .blogs-cell:hover {
    background: #00000022;
    cursor: pointer;
  }
  .blogs-cell {
    width: 100%;

    .blogs-cell-icon {
      width: 20px;
      height: 20px;
      display: inline-block;
      vertical-align: middle;
    }
    .blogs-cell-title {
      width: 100%;
      white-space: nowrap;
      display: inline-block;
      vertical-align: middle;
      padding: 8px;
      text-align: left;
    }
  }
}

.content-details {
  width: calc(100% - 480px - 28px - 32px);
  height: calc(100% - 32px);
  background: white;
  padding: 16px 16px;
}

.loading {
  width: 100%;
  height: 100%;
  background-size: 10%;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url("../../assets/apple-loading.gif");
}

.window-top-action-bar:hover {
  .window-top-action-bar-inner-text {
    color: rgba(0,0,0, 0.6);
  }
}
</style>