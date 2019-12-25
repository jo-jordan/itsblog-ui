<template>
  <v-container v-if="routeKey='/'">
    <v-row align="center">
      <v-item-group
        v-model="window"
        class="shrink mr-6"
        mandatory
        tag="v-flex"
      >
        <v-item
          v-for="blog in blogs"
          :key="blog.id"
          v-slot:default="{ active, toggle }"
        >
          <div>
            <v-btn
              :input-value="active"
              icon
              @click="toggle"
            >
              <v-icon>mdi-record</v-icon>
            </v-btn>
          </div>
        </v-item>
      </v-item-group>
  
      <v-col>
        <v-window
          continuous
          v-model="window"
          class="elevation-1"
          vertical
        >
          <v-window-item
            v-for="blog in blogs"
            :key="blog.id"
          >
            <v-card flat>
              <v-card-text>
                <v-row class="mb-4" align="center">
                  <v-avatar color="grey" class="mr-4">
                    <img :src="blog.icon" alt="ICON">
                  </v-avatar>
                  <strong class="title">Title {{ blog.title }}</strong>
                  <v-spacer></v-spacer>
                  <v-btn icon>
                    <v-icon>mdi-account</v-icon>
                  </v-btn>
                </v-row>
  
                <article class="markdown-body limit-height">
                  <div class="over-flow limit-height" v-html="blogSourceMap.get(blog.blogSourceId)"></div>
                </article>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getDashboard, findById } from '../api/blog'

export default {
  name: 'Dashboard',
  data: () => ({
    length: 3,
    window: 0,
    blogs: [],
    blogSourceMap: new Map()
  }),
  created() {
    this.getDashboard()
  },
  methods: {
    getDashboard() {
      getDashboard().then(res => {
        this.blogs = res.data
        this.blogSourceMap = new Map()
        this.blogs.forEach(item => {
          this.findById(item.blogSourceId)
        })
      })
    },
    findById(id) {
      findById({id}).then(res => {
        const obj = { id: id, data: res.data }
        
        this.blogSourceMap.set(id, decodeURIComponent(escape(window.atob(res.data.blogHtml))))
        console.log(this.blogSourceMap)
      })
    }
  }
}

</script>

<style lang="scss" scoped>
.remove-underline {
  text-decoration: none;
}
.limit-height {
  height: 400px;
}
.over-flow {
  overflow-y: hidden;
}
</style>
