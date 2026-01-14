<template>
  <div :class="['icon', size]">
    <!-- Original icons -->
    <ChevronDownIcon v-if="name === 'arrow'" />
    <CheckIcon v-else-if="name === 'check'" />
    <DocumentIcon v-else-if="name === 'document'" />
    <MagnifyingGlassIcon v-else-if="name === 'search'" />
    <ArrowPathIcon v-else-if="name === 'loading'" class="animate-spin" />
    <XMarkIcon v-else-if="name === 'close'" />
    <ChevronUpDownIcon v-else-if="name === 'chevron-up-down'" />

    <!-- Navigation & Actions -->
    <Bars3Icon v-else-if="name === 'menu'" />
    <HomeIcon v-else-if="name === 'home'" />
    <PlusIcon v-else-if="name === 'plus'" />
    <PencilIcon v-else-if="name === 'edit'" />
    <TrashIcon v-else-if="name === 'trash'" />
    <CogIcon v-else-if="name === 'settings'" />
    <ArrowTopRightOnSquareIcon v-else-if="name === 'external-link'" />

    <!-- Status & Feedback -->
    <ExclamationTriangleIcon v-else-if="name === 'warning'" />
    <XCircleIcon v-else-if="name === 'error'" />
    <InformationCircleIcon v-else-if="name === 'info'" />
    <EyeIcon v-else-if="name === 'eye'" />
    <EyeSlashIcon v-else-if="name === 'eye-slash'" />

    <!-- User & Account -->
    <UserIcon v-else-if="name === 'user'" />
    <UsersIcon v-else-if="name === 'users'" />
    <BellIcon v-else-if="name === 'bell'" />

    <!-- Content & Media -->
    <PhotoIcon v-else-if="name === 'image'" />
    <FolderIcon v-else-if="name === 'folder'" />
    <CalendarIcon v-else-if="name === 'calendar'" />
    <ClockIcon v-else-if="name === 'clock'" />
    <EnvelopeIcon v-else-if="name === 'mail'" />
    <HeartIcon v-else-if="name === 'heart'" />
    <StarIcon v-else-if="name === 'star'" />

    <!-- Interface Controls -->
    <AdjustmentsHorizontalIcon v-else-if="name === 'filter'" />
    <ArrowPathIcon v-else-if="name === 'refresh'" />
    <ArrowDownTrayIcon v-else-if="name === 'download'" />
    <ArrowUpTrayIcon v-else-if="name === 'upload'" />
    <ShareIcon v-else-if="name === 'share'" />
    <ClipboardIcon v-else-if="name === 'copy'" />
    <EllipsisHorizontalIcon v-else-if="name === 'more'" />
  </div>
</template>

<script setup lang="ts">
import {
  // Original icons
  ChevronDownIcon,
  CheckIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  ChevronUpDownIcon,
  // Navigation & Actions
  Bars3Icon,
  HomeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  ArrowTopRightOnSquareIcon,
  // Status & Feedback
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  // User & Account
  UserIcon,
  UsersIcon,
  BellIcon,
  // Content & Media
  PhotoIcon,
  FolderIcon,
  CalendarIcon,
  ClockIcon,
  EnvelopeIcon,
  HeartIcon,
  StarIcon,
  // Interface Controls
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ShareIcon,
  ClipboardIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/vue/24/solid";

const props = defineProps<{
  name: // Original icons
  | "arrow"
    | "check"
    | "document"
    | "search"
    | "loading"
    | "close"
    | "chevron-up-down"
    // Navigation & Actions
    | "menu"
    | "home"
    | "plus"
    | "edit"
    | "trash"
    | "settings"
    | "external-link"
    // Status & Feedback
    | "warning"
    | "error"
    | "info"
    | "eye"
    | "eye-slash"
    // User & Account
    | "user"
    | "users"
    | "bell"
    // Content & Media
    | "image"
    | "folder"
    | "calendar"
    | "clock"
    | "mail"
    | "heart"
    | "star"
    // Interface Controls
    | "filter"
    | "refresh"
    | "download"
    | "upload"
    | "share"
    | "copy"
    | "more";
  size?: "small" | "medium" | "large";
}>();
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.icon.small :deep(svg) {
  width: 12px;
  height: 12px;
}

.icon.medium :deep(svg) {
  width: 16px;
  height: 16px;
}

.icon.large :deep(svg) {
  width: 24px;
  height: 24px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
