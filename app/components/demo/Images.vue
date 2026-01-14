<template>
  <Grid is="ul">
    <!-- Normal loading images -->
    <Column is="li" span-phablet="6" span-laptop="3">
      <Text size="caption-1" class="type-info">Default</Text>
      <Pic
        src="/images/construct.jpg"
        width="320"
        height="160"
        alt="normal image"
      />
    </Column>

    <!-- Normal loading images -->
    <Column is="li" span-phablet="6" span-laptop="3">
      <Text size="caption-1" class="type-info">External</Text>
      <Pic
        :src="`https://placehold.co/320x160`"
        width="320"
        height="160"
        alt="external image"
        external
      />
    </Column>

    <!-- Loading state example -->
    <Column is="li" span-phablet="6" span-laptop="3">
      <Text size="caption-1" class="type-info">Loading</Text>
      <Pic
        src="https://httpstat.us/200?sleep=999999"
        width="320"
        height="160"
        alt="loading image"
        external
      />
    </Column>

    <!-- Error state examples -->
    <Column is="li" span-phablet="6" span-laptop="3">
      <Text size="caption-1" class="type-info">Error</Text>
      <Pic
        src="/broken-url-that-will-fail.jpg"
        width="320"
        height="160"
        alt="error image"
      />
    </Column>
  </Grid>
</template>
