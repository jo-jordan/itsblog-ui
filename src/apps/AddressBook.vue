<template>
  <div class="address-book">
    <aside class="address-book__groups">
      <h3>组</h3>
      <div class="aqua-row is-selected">全部</div>
    </aside>
    <aside class="address-book__names">
      <h3>名字</h3>
      <div class="aqua-row is-selected">{{ owner.name }}</div>
    </aside>
    <section class="address-book__card selectable">
      <header class="address-book__person">
        <img :src="avatar" alt="" class="address-book__avatar">
        <div>
          <h2>{{ owner.name }}</h2>
          <p>{{ owner.tagline }}</p>
        </div>
      </header>
      <dl class="address-book__fields">
        <dt>电子邮件</dt>
        <dd><a :href="`mailto:${email}`" @click.prevent="compose">{{ email }}</a></dd>
        <template v-for="link in links">
          <dt :key="`${link.label}-label`">{{ link.label }}</dt>
          <dd :key="link.label"><a :href="link.href" target="_blank" rel="noopener">{{ link.value }}</a></dd>
        </template>
      </dl>
    </section>
  </div>
</template>

<script>
import site from '../config/site'
import avatar from '../assets/logo.png'

export default {
  name: 'AddressBook',
  props: {
    win: { type: Object, required: true }
  },
  data() {
    return {
      avatar,
      owner: site.owner,
      email: site.email,
      links: site.links
    }
  },
  methods: {
    compose() {
      this.$store.dispatch('windows/open', { appId: 'mail' })
    }
  }
}
</script>

<style lang="scss">
.address-book {
  flex: 1;
  display: grid;
  grid-template-columns: 110px 150px 1fr;
  min-height: 0;
  border-top: 1px solid #9c9c9c;

  h3 {
    margin: 0;
    padding: 2px 8px;
    border-bottom: 1px solid #b5b5b5;
    font-size: 11px;
    font-weight: normal;
    background: linear-gradient(to bottom, #fdfdfd, #dedede);
  }
}

.address-book__groups,
.address-book__names {
  border-right: 1px solid #9c9c9c;
  background: #fff;
}

.address-book__card {
  padding: 20px 24px;
  overflow: auto;
  background: #fff;
}

.address-book__person {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;

  h2 {
    margin: 0;
    font-size: 20px;
  }

  p {
    margin: 4px 0 0;
    color: #666;
  }
}

.address-book__avatar {
  width: 72px;
  height: 72px;
  padding: 4px;
  border: 1px solid #b5b5b5;
  border-radius: 4px;
  object-fit: contain;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.address-book__fields {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 8px 12px;
  margin: 0;

  dt {
    font-weight: bold;
    text-align: right;
    color: #6a6a6a;
  }

  dd {
    margin: 0;
  }

  a {
    color: var(--aqua-selection);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

@media (max-width: 767px) {
  .address-book {
    grid-template-columns: 1fr;
  }

  .address-book__groups,
  .address-book__names {
    display: none;
  }
}
</style>
