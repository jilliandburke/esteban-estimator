<script setup lang="ts">
import { useUserSessionStore } from '@/stores/userSession'

const userSessionStore = useUserSessionStore()
const isAdmin = userSessionStore?.currentUser?.roles[0]?.name === 'admin'
</script>

<template>
  <div class="flex h-full p-10 mx-6 justify-center">
    <div class="flex flex-col gap-10 flex-1 w-full max-w-7xl">
      <h3 class="font-bold text-2xl pl-4">Settings</h3>
      <Tabs value="0" scrollable>
        <TabList>
          <Tab value="0">Acccount</Tab>
          <Tab value="1" v-if="isAdmin">App Settings</Tab>
          <Tab value="2" v-if="isAdmin">Teams and Users</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <SettingsAccount />
          </TabPanel>
          <TabPanel value="1">
            <SettingsApp />
          </TabPanel>
          <TabPanel value="2">
            <SettingsTeamsAndUsers />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>
