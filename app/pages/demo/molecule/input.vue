<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>inputs</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid>
      <!-- Component Overview -->
      <GridSliceCenter>
        <Text class="mb-tinier">Component Overview</Text>
        <Text size="body-2" color="dim">
          Form input components including text inputs, search fields, select
          dropdowns, and textarea elements. Built with consistent styling from
          the design system and supporting various states like disabled, error,
          and focused states.
        </Text>
        <Code
          class="py-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Basic usage with v-model -->
<BaseInput v-model='inputValue' placeholder='Enter text...' />
<BaseSearch v-model='searchQuery' :results='searchResults' />
<BaseSelect v-model='selectedValue' :options='options' />
<BaseTextarea v-model='message' placeholder='Type message...' />`"
        />
      </GridSliceCenter>

      <!-- Base Input -->
      <GridSliceCenter class="mt-bigger">
        <Text class="mb-tinier">Base Input</Text>
        <Text size="body-2" color="dim" class="mb-small">
          Standard text input component with different sizes and states.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<BaseInput
  v-model='name'
  label='Full Name'
  placeholder='Enter your name...'
  required
/></BaseInput>

<BaseInput
  v-model='email'
  type='email'
  label='Email Address'
  placeholder='Enter email...'
  error='Please enter a valid email'
/></BaseInput>

<BaseInput
  v-model='disabled'
  placeholder='This input is disabled'
  disabled
/></BaseInput>`"
        />

        <div class="my-bigger">
          <table class="input-table">
            <tbody>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">Default</Text>
                </td>
                <td class="input-example">
                  <BaseInput
                    v-model="inputDefault"
                    placeholder="Enter text..."
                  />
                </td>
              </tr>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">With Label</Text>
                </td>
                <td class="input-example">
                  <BaseInput
                    v-model="inputWithLabel"
                    label="Name"
                    placeholder="Enter your name..."
                  />
                </td>
              </tr>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">Disabled</Text>
                </td>
                <td class="input-example">
                  <BaseInput
                    v-model="inputDisabled"
                    placeholder="Disabled input..."
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">Error State</Text>
                </td>
                <td class="input-example">
                  <BaseInput
                    v-model="inputError"
                    placeholder="Invalid input..."
                    error="This field is required"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GridSliceCenter>

      <!-- Base Search -->
      <GridSliceCenter>
        <Text class="mb-tinier">Base Search</Text>
        <Text size="body-2" color="dim" class="mb-small">
          Search input component with built-in search functionality and styling.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<BaseSearch
  v-model='searchQuery'
  :results='searchResults'
  placeholder='Search products...'
  @search='handleSearch'
  @select='handleSelect'
  @clear='handleClear'
/></BaseSearch>

<script setup>
const searchQuery = ref('')
const searchResults = ref([
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' }
])

const handleSearch = (query) => {
  // Filter results based on query
  searchResults.value = allResults.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )
}
</script>`"
        />

        <div class="my-bigger">
          <table class="input-table">
            <tbody>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">Default</Text>
                </td>
                <td class="input-example">
                  <BaseSearch
                    v-model="searchDefault"
                    :results="searchResults"
                    placeholder="Search..."
                  />
                </td>
              </tr>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">With Label</Text>
                </td>
                <td class="input-example">
                  <BaseSearch
                    v-model="searchWithLabel"
                    :results="searchResults"
                    label="Search"
                    placeholder="Search products..."
                  />
                </td>
              </tr>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">Disabled</Text>
                </td>
                <td class="input-example">
                  <BaseSearch
                    v-model="searchDisabled"
                    :results="searchResults"
                    placeholder="Disabled search..."
                    disabled
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GridSliceCenter>

      <!-- Base Select -->
      <GridSliceCenter>
        <Text class="mb-tinier">Base Select</Text>
        <Text size="body-2" color="dim" class="mb-small">
          Select dropdown component with multiple options and states.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Base Select Examples -->
<BaseSelect
  v-model='selectedCategory'
  label='Category'
  :options='categoryOptions'
  placeholder='Choose a category...'
  @change='handleCategoryChange'
/>

<script setup>
const selectedCategory = ref('')
const categoryOptions = ref([
  { label: 'Design', value: 'design' },
  { label: 'Development', value: 'development' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' }
])

const handleCategoryChange = (value) => {
  console.log('Selected category:', value)
}
</script>`"
        />

        <div class="my-bigger">
          <table class="input-table">
            <tbody>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">Default</Text>
                </td>
                <td class="input-example">
                  <BaseSelect
                    v-model="selectDefault"
                    :options="[
                      { label: 'Option 1', value: '1' },
                      { label: 'Option 2', value: '2' },
                      { label: 'Option 3', value: '3' },
                    ]"
                    placeholder="Select an option..."
                  />
                </td>
              </tr>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">With Label</Text>
                </td>
                <td class="input-example">
                  <BaseSelect
                    v-model="selectWithLabel"
                    label="Category"
                    :options="[
                      { label: 'Design', value: 'design' },
                      { label: 'Development', value: 'dev' },
                      { label: 'Marketing', value: 'marketing' },
                    ]"
                    placeholder="Choose category..."
                  />
                </td>
              </tr>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">Disabled</Text>
                </td>
                <td class="input-example">
                  <BaseSelect
                    v-model="selectDisabled"
                    :options="[
                      { label: 'Option 1', value: '1' },
                      { label: 'Option 2', value: '2' },
                    ]"
                    placeholder="Disabled select..."
                    disabled
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GridSliceCenter>

      <!-- Base Textarea -->
      <GridSliceCenter>
        <Text class="mb-tinier">Base Textarea</Text>
        <Text size="body-2" color="dim" class="mb-small">
          Multi-line text input component for longer content entry.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Base Textarea Examples -->
<BaseTextarea
  v-model='message'
  label='Message'
  placeholder='Type your message here...'
  rows='4'
  maxlength='500'
/>

<BaseTextarea
  v-model='feedback'
  label='Feedback'
  placeholder='Share your feedback...'
  error='Please provide your feedback'
  required
/>

<BaseTextarea
  v-model='notes'
  placeholder='Additional notes...'
  rows='6'
  resize='vertical'
/>`"
        />

        <div class="my-bigger">
          <table class="input-table">
            <tbody>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">Default</Text>
                </td>
                <td class="input-example">
                  <BaseTextarea
                    v-model="textareaDefault"
                    placeholder="Enter your message..."
                  />
                </td>
              </tr>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">With Label</Text>
                </td>
                <td class="input-example">
                  <BaseTextarea
                    v-model="textareaWithLabel"
                    label="Message"
                    placeholder="Type your message here..."
                  />
                </td>
              </tr>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">Disabled</Text>
                </td>
                <td class="input-example">
                  <BaseTextarea
                    v-model="textareaDisabled"
                    placeholder="Disabled textarea..."
                    disabled
                  />
                </td>
              </tr>
              <tr>
                <td class="input-name">
                  <Text size="micro-1">Error State</Text>
                </td>
                <td class="input-example">
                  <BaseTextarea
                    v-model="textareaError"
                    placeholder="Invalid textarea..."
                    error="Message is required"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GridSliceCenter>
    </Grid>

    <DemoSectionNav />
  </section>
</template>

<script setup>
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";
import DemoPageHeader from "~/components/demo/PageHeader.vue";
import GridSliceCenter from "~/components/demo/PageBody.vue";
import DemoSectionNav from "~/components/demo/SectionNav.vue";

// Run common mount/unmount scripts. Setup SEO, etc.
PageSetup({
  seoMeta: { title: "Input Components Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Reactive data for input examples
const inputDefault = ref("");
const inputWithLabel = ref("");
const inputDisabled = ref("");
const inputError = ref("");

const searchDefault = ref("");
const searchWithLabel = ref("");
const searchDisabled = ref("");

// Sample search results
const searchResults = ref([
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
]);

const selectDefault = ref("");
const selectWithLabel = ref("");
const selectDisabled = ref("");

const textareaDefault = ref("");
const textareaWithLabel = ref("");
const textareaDisabled = ref("");
const textareaError = ref("");
</script>

<style lang="scss" scoped>
.input-table {
  width: 100%;
  border-collapse: collapse;

  tr {
    border-top: 1px solid var(--border-primary);

    &:last-child {
      border-bottom: 1px solid var(--border-primary);
    }
  }

  td {
    padding: var(--unit-small) 0;
    vertical-align: middle;

    &:last-child {
      padding-left: var(--unit-smaller);
    }

    &.input-name {
      width: 140px;
    }

    &.input-example {
      text-align: left;

      // Ensure inputs have consistent width
      :deep(input),
      :deep(select),
      :deep(textarea) {
        min-width: 280px;
      }
    }
  }
}
</style>
