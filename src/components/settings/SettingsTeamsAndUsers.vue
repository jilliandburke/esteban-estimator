<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useTeamsStore } from '@/stores/teams'

const userStore = useUserStore()
const teamsStore = useTeamsStore()
const showCreateUserDialog = ref(false)
const showNewTeamDialog = ref(false)

function closeUserCreateDialog() {
  showCreateUserDialog.value = false
}

function closeNewTeamDialog() {
  showNewTeamDialog.value = false
}
</script>

<template>
  <div class="flex p-6 gap-20">
    <div class="flex flex-col flex-wrap w-full gap-14">
      <div class="flex flex-col gap-8 w-full">
        <div class="flex gap-8 items-center">
          <h3 class="font-bold text-xl">Users</h3>
          <Button
            label="Create User"
            icon="pi pi-user-plus"
            size="small"
            @click="showCreateUserDialog = true"
          />
          <CreateUser
            :showCreateUserDialog="showCreateUserDialog"
            @closeDialog="closeUserCreateDialog"
          />
        </div>
        <DataTable
          :value="userStore.listAllUsers"
          scrollable
          resizableColumns
          columnResizeMode="expand"
          tableStyle="min-width: 50rem"
        >
          <Column field="full_name" header="Name"></Column>
          <Column field="email" header="Email"></Column>
          <Column field="roles" header="Role">
            <template #body="slotProps">
              <span class="capitalize">
                {{ slotProps.data?.roles[0]?.name ?? 'No role' }}
              </span>
            </template>
          </Column>
          <Column field="teams" header="Team">
            <template #body="slotProps">
              <span class="capitalize">
                {{ slotProps.data?.teams[0]?.name ?? 'No team' }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>

      <div class="flex flex-col gap-8 w-full">
        <div class="flex gap-8 items-center">
          <h3 class="font-bold text-xl">Teams</h3>
          <Button
            label="New Team"
            icon="pi pi-plus"
            size="small"
            @click="showNewTeamDialog = true"
          />
          <NewTeam :showNewTeamDialog="showNewTeamDialog" @closeDialog="closeNewTeamDialog" />
        </div>
        <DataTable :value="teamsStore.teamList" scrollable tableStyle="min-width: 50rem">
          <Column field="name" header="Name">
            <template #body="slotProps">
              <span class="capitalize">
                {{ slotProps.data?.name }}
              </span>
            </template>
          </Column>
          <Column field="member_count" header="Member Count">
            <template #body="slotProps">
              <span class="capitalize">
                {{ slotProps.data?.member_count || 0 }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
