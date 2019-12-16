<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
    >
      <v-list dense>
        <router-link class="remove-underline" to="/all">
          <v-list-item @click="handleViewChange">
            <v-list-item-action>
              <v-icon>mdi-alpha-m-circle-outline</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>All</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
        <router-link class="remove-underline" to="/archive">
          <v-list-item @click="handleViewChange">
            <v-list-item-action>
              <v-icon>mdi-alpha-y-circle-outline</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Archive</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
        <router-link class="remove-underline" to="/resume">
          <v-list-item @click="handleViewChange">
            <v-list-item-action>
              <v-icon>mdi-alpha-d-circle-outline</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Resume</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>It‘s blog</v-toolbar-title>
      <v-spacer />
      <v-spacer />
      <v-spacer />
      <v-text-field dense solo rounded hide-details append-icon="mdi-magnify" />
    </v-app-bar>
    <v-content>
      <v-container fill-height>
        <v-layout
          justify-center
          align-center
        >
          <router-view :key="routeKey"/>
        </v-layout>
      </v-container>
    </v-content>

    <v-footer app>
      <span><a v-if="false" href="http://www.beian.miit.gov.cn">湘ICP备19019513号-1</a></span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'Dashboard',
  data: () => ({
    drawer: null
  }),
  created() {
    this.$vuetify.theme.dark = true
  },
  computed: {
    routeKey() {
      console.log('this.$route.path', this.$route.path)
      return this.$route.path
    }
  },
  methods: {
    handleViewChange(e) {
      console.log('e', e)
    }
  }
}

</script>

<style lang="scss" scoped>
.remove-underline {
  text-decoration: none;
}
</style>
