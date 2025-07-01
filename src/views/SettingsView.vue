<script setup lang="ts"></script>

<template>
  <div class="flex h-full p-10 mx-6 justify-center">
    <div class="flex flex-col gap-10 flex-0 min-w-7xl">
      <h3 class="font-bold text-2xl pl-4">Settings</h3>
      <Tabs value="0">
        <TabList>
          <Tab value="0">Acccount</Tab>
          <Tab value="1">App Settings</Tab>
          <Tab value="2">Teams and Users</Tab>
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
