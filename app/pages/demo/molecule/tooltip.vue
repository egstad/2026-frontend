<template>
  <Grid class="mt-big">
    <Column>
      <Text is="h1" size="headline-2">Tooltip</Text>
    </Column>

    <!-- Text only -->
    <Column class="mt-big">
      <Text size="caption-1" color="dimmer">Text only</Text>
      <Text font="times-seven" class="mt-tiny">
        The quick brown fox jumped over the
        <Tooltip html="The laziest of all dogs, renowned throughout the land for their remarkable ability to nap in any position, on any surface, at any time.">
          <span style="text-decoration: underline dotted; text-underline-offset: 3px; cursor: default">lazy dog</span>
        </Tooltip>
        and kept on running.
      </Text>
    </Column>

    <!-- With image -->
    <Column class="mt-big">
      <Text size="caption-1" color="dimmer">With image</Text>
      <Text font="times-seven" class="mt-tiny">
        They roamed the land of
        <Tooltip
          html="A vast, ancient forest described in the works of J.R.R. Tolkien. Home to the Ents — tree-like shepherds who rarely act in haste."
          image="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Fangorn.jpg/640px-Fangorn.jpg"
          image-alt="Fangorn Forest"
        >
          <span style="text-decoration: underline dotted; text-underline-offset: 3px; cursor: default">Fangorn</span>
        </Tooltip>
        for many years.
      </Text>
    </Column>

    <!-- Inside a link -->
    <Column class="mt-big">
      <Text size="caption-1" color="dimmer">Wrapping a link (hover shows tooltip, click navigates)</Text>
      <Text font="times-seven" class="mt-tiny">
        Read more about
        <Tooltip html="The world's largest collaborative encyclopedia. Anyone can edit it — yes, even you.">
          <a href="https://wikipedia.org" target="_blank">Wikipedia</a>
        </Tooltip>
        to learn more.
      </Text>
    </Column>

    <!-- Rich slot content -->
    <Column class="mt-big">
      <Text size="caption-1" color="dimmer">Custom slot content</Text>
      <Text font="times-seven" class="mt-tiny">
        This uses a
        <Tooltip>
          <span style="text-decoration: underline dotted; text-underline-offset: 3px; cursor: default">custom slot</span>
          <template #content>
            <Text size="caption-1" color="dim">You can pass <em>any</em> Vue content here, including portable text renderers.</Text>
          </template>
        </Tooltip>
        for its content.
      </Text>
    </Column>
  </Grid>
</template>
