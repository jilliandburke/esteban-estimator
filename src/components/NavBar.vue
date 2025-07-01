<script setup lang="ts">
import { ref } from 'vue'
import { useUserSessionStore } from '@/stores/userSession'
import logo from '@/assets/logo.svg'

const userSessionStore = useUserSessionStore()
const avatarLink =
  userSessionStore.currentUser?.avatar_url ||
  'https://static1.personalitydatabase.net/2/pdb-images-prod/b805995f/profile_images/c192170f01b245a1a180eb77aa6bb40f.png'

const navItems = ref([
  {
    label: 'Estimations',
    route: '/',
  },
  {
    label: 'Stats',
    icon: 'pi pi-search',
  },
])

const menu = ref()
const profileItems = ref([
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    route: '/settings',
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    route: '/logout',
  },
])

const toggle = (event: unknown) => {
  menu.value.toggle(event)
}
</script>

<template>
  <Menubar :model="navItems" class="px-10">
    <template #start>
      <Image :src="logo" alt="Image" width="100" />
    </template>
    <template #item="{ item, props }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span class="font-bold">{{ item.label }}</span>
        </a>
      </router-link>
    </template>
    <template #end>
      <div class="flex items-center gap-2">
        <Avatar :image="avatarLink" shape="circle" size="large" @click="toggle" />
        <Menu ref="menu" id="overlay_menu" :model="profileItems" :popup="true">
          <template #item="{ item, props }">
            <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
              <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                <span :class="item.icon" />
                <span>{{ item.label }}</span>
              </a>
            </router-link>
          </template>
        </Menu>
      </div>
    </template>
  </Menubar>
</template>
