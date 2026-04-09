<script setup lang="ts">
import { sanityClient } from "~/utils/sanity";
import type { WorkHistory, Client, Great, Portrait } from "~/types/sanity";
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

PageSetup({ seoMeta: { title: "About" } });

definePageMeta({
  pageTransition: pageTransitionDefault(),
});

const nuxtApp = useNuxtApp();

const [
  { data: workHistory },
  { data: clients },
  { data: greats },
  { data: portraits },
] = await Promise.all([
  useAsyncData(
    "work-history",
    () =>
      sanityClient.fetch<WorkHistory[]>(`
        *[_type == "workHistory"] | order(orderRank) {
          _id,
          employer,
          roles,
          dateRange,
          mediaType,
          "imageUrl": image.asset->url,
          "muxPlaybackId": video.asset->playbackId
        }
      `),
    {
      getCachedData: (key) =>
        nuxtApp.payload.data[key] || nuxtApp.static.data[key],
    },
  ),
  useAsyncData(
    "clients",
    () =>
      sanityClient.fetch<Client[]>(`
        *[_type == "client"] | order(lower(name) asc) {
          _id,
          name,
          slug,
          website,
          featured
        }
      `),
    {
      getCachedData: (key) =>
        nuxtApp.payload.data[key] || nuxtApp.static.data[key],
    },
  ),
  useAsyncData(
    "greats",
    () =>
      sanityClient.fetch<Great[]>(`
        *[_type == "great"] | order(_createdAt asc) {
          _id,
          name,
          "imageUrl": image.asset->url
        }
      `),
    {
      getCachedData: (key) =>
        nuxtApp.payload.data[key] || nuxtApp.static.data[key],
    },
  ),
  useAsyncData(
    "portraits",
    () =>
      sanityClient.fetch<Portrait[]>(`
        *[_type == "portrait"] | order(orderRank) {
          _id,
          mediaType,
          title,
          alt,
          autoplay,
          "imageUrl": image.asset->url,
          "muxPlaybackId": video.asset->playbackId
        }
      `),
    {
      getCachedData: (key) =>
        nuxtApp.payload.data[key] || nuxtApp.static.data[key],
    },
  ),
]);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const orderedPortraits = computed(() => {
  if (!portraits.value?.length) return [];
  const [first, ...rest] = portraits.value;
  return [first!, ...shuffle(rest)];
});
</script>

<template>
  <div class="about-page">
    <Grid id="intro" class="intro">
      <Column span-tablet="3" span-desktop="2">
        <h2 class="section-label t-indent">
          <Text color="dimmer" size="caption-1">Intro</Text>
        </h2>
      </Column>
      <Column
        span-tablet="9"
        start-desktop="3"
        span-desktop="8"
        class="t-paragraph-leading"
      >
        <Text size="body-1" indent>
          Hello, I’m Jordan Egstad. I’m a graphic designer, developer, and a
          partner at
          <a href="https://dbco.online/" target="_blank"
            >Design Business Company</a
          >. I’ve spent the past 16 years creating brands, websites, apps,
          typefaces, imagery, and the systems that hold them together.
        </Text>
        <Text size="body-1" indent>
          Over time, I’ve learned work can only be as strong as the ideas behind
          it. I spend time trying to uncover what those ideas are, then give
          them form. I begin with inquiry and move between research and
          instinct, shaping and reshaping until something feels clear and
          enduring.
        </Text>

        <ClientOnly class="pt-small">
          <Carousel
            v-if="orderedPortraits.length"
            class="portraits"
            :autoplay="true"
            :autoplay-delay="7000"
            :captions="orderedPortraits.map((p) => p.title || '')"
          >
            <div
              v-for="item in orderedPortraits"
              :key="item._id"
              class="carousel__slide"
            >
              <Pic
                v-if="item.mediaType === 'image' && item.imageUrl"
                :src="item.imageUrl"
                :alt="item.alt || ''"
              />
              <Vid
                v-else-if="item.mediaType === 'video' && item.muxPlaybackId"
                :playbackId="item.muxPlaybackId"
                :autoplay="item.autoplay ?? true"
                loading="eager"
              />
            </div>
          </Carousel>
        </ClientOnly>
      </Column>
    </Grid>

    <Grid id="details" class="details mt-biggest">
      <Column span-tablet="3" span-desktop="2">
        <h2 class="section-label t-indent">
          <Text color="dimmer" size="caption-1">Details</Text>
        </h2>
      </Column>
      <Column span-tablet="9" class="t-paragraph-leading">
        <Text font="times-seven" indent>
          I live in Tulsa, Oklahoma with my wife Emma, our dog
          <a href="https://en.wikipedia.org/wiki/Tom_Bombadil" target="_blank"
            >Tom Bombadil</a
          >, and three cats: Jason Waterfalls, Minnie, and
          <a
            href="https://arresteddevelopment.fandom.com/wiki/Gene_Parmesan"
            target="_blank"
            >Gene Parmesan</a
          >. When I’m not working, I’m busy being a professional hobbyist who
          likely has been living with an undiagnosed case of ADHD. Odds are
          you’d find me either playing music or taking a photo walk, a hike, a
          round of Magic: The Gathering, slowly reading through four books at a
          time, or flipping through records.
        </Text>
      </Column>
    </Grid>

    <Grid v-if="clients?.length" id="clients" class="clients mt-biggest">
      <Column span-tablet="3" span-desktop="2">
        <h2 class="section-label t-indent">
          <Text color="dimmer" size="caption-1">Clients</Text>
        </h2>
      </Column>
      <Column span-tablet="9">
        <AboutClientList :clients="clients" />
      </Column>
    </Grid>

    <Grid v-if="workHistory?.length" id="work" class="work mt-biggest">
      <Column span-tablet="3" span-desktop="2">
        <h2 class="section-label t-indent">
          <Text color="dimmer" size="caption-1">Work</Text>
        </h2>
      </Column>
      <Column span-tablet="8" span-laptop="9" span-desktop="8">
        <AboutWorkHistory :items="workHistory" />
      </Column>
    </Grid>

    <Grid id="press" class="press mt-biggest">
      <Column span-tablet="3" span-desktop="2">
        <h2 class="section-label t-indent">
          <Text color="dimmer" size="caption-1">Press</Text>
        </h2>
      </Column>
      <Column span-tablet="9" class="t-paragraph-leading">
        <AboutPress />
      </Column>
    </Grid>

    <Grid id="history" class="history mt-biggest">
      <Column span-tablet="3" span-desktop="2">
        <h2 class="section-label t-indent">
          <Text color="dimmer" size="caption-1">History</Text>
        </h2>
      </Column>
      <Column span-tablet="9" class="t-paragraph-leading">
        <Text font="times-seven" indent>
          I consider myself fortunate to have been put on a creative path early.
          My first real memory of making something with intention is from the
          day after 9/11. My art teacher, Terry Hardy, asked us to draw how we
          felt. I was eight and didn’t understand the complexities of the event,
          only that something was deeply wrong. The assignment, though, was
          clear: take something internal and make it visible. That premise has
          stayed with me.
        </Text>
        <Text font="times-seven" indent>
          In middle and high school, Jennifer Van Patten expanded the world of
          materials—drawing, painting, ceramics, mixed media—and modeled a
          quiet, consistent way of seeing. She drank iced tea, played satellite
          radio, and never raised her voice <em>(even when we deserved it)</em>.
          She had a wonderful sense of humor, a contagious belly laugh, and was
          the best watercolorist I’ve ever met. She taught us angsty teenagers
          that creating could be light, generous, and joyfully unfussy.
        </Text>
        <Text font="times-seven" indent>
          Later, Judy McIntosh sharpened my eye and introduced me to three
          mediums that would shape my next few years: photography, ceramics, and
          street art. She was small but commanding, known to suddenly and
          dramatically gasp whenever something struck her as beautiful. New
          students found it jarring, which it was. I found it thrilling. She had
          grit, sass, and a collection of phrases we all came to expect:
          <em
            >“Every day is a school day,” “Criticism is water on a duck’s back,”
            “Art should take your eye on a ride.”</em
          >
          She was fiercely supportive and unafraid to push us further than we
          thought we could go. Before I left for college to study audio
          production, she sat me down and told me she was sure music would be a
          fine path for me, but she felt the visual arts were where I belonged.
          I changed my major that week. I’m still grateful I listened.
        </Text>
        <Text font="times-seven" indent>
          My first college professor, Britt Stadig, introduced me to the
          structure behind the beauty: color theory, typography, bookbinding.
          She was exacting and generous. She also gave me my first design job,
          making posters around campus. I only stayed in college for two
          quarters. During spring break, I was robbed—my computer, my work,
          childhood photos, back-up hard drives, musical instruments, all gone.
          It was a stupid, devastating loss. But in its wake, I realized two
          things: I didn’t want to be in school, and I didn’t need to be. I had
          already learned the most important thing from these women: how to
          look. How to learn. How to create from that attention.
        </Text>
        <Text font="times-seven" indent>
          After leaving, I decided to take the so-called “self-taught” route,
          though I dislike the term. It erases the thinkers, makers, and mentors
          whose work not only inspired me, but actively shaped how I see. What
          follows is an incomplete and ever-growing gallery of those people.
          Some I’ve learned from at a distance, through their work. Others have
          taught me directly, guided me, challenged me, and, at times, cared for
          me when I needed it most. They are imperfect, as am I, but their
          thoughts and actions have made a meaningful difference in my life.
        </Text>
      </Column>
    </Grid>

    <ClientOnly>
      <AboutCarousel v-if="greats?.length" :items="greats" class="my-bigger" />
    </ClientOnly>

    <Grid id="footprint" class="footprint mt-biggest">
      <Column span-tablet="3" span-desktop="2">
        <h2 class="section-label t-indent">
          <Text color="dimmer" size="caption-1">Footprint</Text>
        </h2>
      </Column>
      <Column span-tablet="9">
        <Grid>
          <Column class="t-paragraph-leading pb-small">
            <Text indent font="times-seven">
              Nothing online is weightless. Every page, every interaction draws
              power from somewhere. This site keeps that cost low—running on
              services that prioritize renewable energy, with a measured
              footprint of about 0.4 kg CO₂ per month (~5 kg per year).
            </Text>
            <Text indent font="times-seven">
              I offset that impact fivefold each year, covering the equivalent
              of ~125 kg CO₂ over a five-year window. Some of that support goes
              toward removal—through organizations like
              <a href="https://climeworks.com/" target="_blank">Climeworks</a>,
              which capture CO₂ directly from the air and store it. Some goes
              toward systemic change—through groups like
              <a href="https://www.catf.us/" target="_blank"
                >Clean Air Task Force</a
              >, focused on long-term climate solutions at scale. It’s one small
              part of a much larger problem, but it’s an intentional effort to
              take responsibility for my share of it.</Text
            >
          </Column>
          <Column span-laptop="8" span-desktop="6" span-ultrawide="6">
            <svg
              width="660"
              height="660"
              viewBox="0 0 660 660"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="offset-graph"
            >
              <rect width="660" height="660" fill="#2451A2" />
              <circle cx="374" cy="286" r="255" fill="#00B25E" />
              <path
                d="M337.093 298.512C335.535 298.512 334.085 298.128 332.741 297.36C331.418 296.592 330.362 295.557 329.573 294.256C328.783 292.955 328.389 291.536 328.389 290C328.389 288.464 328.783 287.045 329.573 285.744C330.362 284.443 331.418 283.408 332.741 282.64C334.085 281.872 335.535 281.488 337.093 281.488C338.65 281.488 340.09 281.872 341.413 282.64C342.735 283.408 343.791 284.443 344.581 285.744C345.37 287.045 345.765 288.464 345.765 290C345.765 291.536 345.37 292.955 344.581 294.256C343.791 295.557 342.735 296.592 341.413 297.36C340.09 298.128 338.65 298.512 337.093 298.512ZM337.093 296.144C338.138 296.144 339.098 295.867 339.973 295.312C340.869 294.757 341.573 294.011 342.085 293.072C342.618 292.133 342.885 291.109 342.885 290C342.885 288.891 342.618 287.867 342.085 286.928C341.573 285.989 340.869 285.243 339.973 284.688C339.098 284.133 338.138 283.856 337.093 283.856C336.026 283.856 335.045 284.133 334.149 284.688C333.274 285.243 332.57 285.989 332.037 286.928C331.525 287.867 331.269 288.891 331.269 290C331.269 291.109 331.525 292.133 332.037 293.072C332.57 294.011 333.274 294.757 334.149 295.312C335.045 295.867 336.026 296.144 337.093 296.144ZM357.35 274.608C356.71 274.373 356.177 274.256 355.75 274.256C355.046 274.256 354.524 274.533 354.182 275.088C353.884 275.557 353.734 276.453 353.734 277.776H350.982C350.982 273.851 352.54 271.888 355.654 271.888C355.974 271.888 356.241 271.92 356.454 271.984C356.689 272.027 356.988 272.123 357.35 272.272V274.608ZM350.982 277.776H353.734V298H350.982V277.776ZM357.126 282V284.368H348.966V282H357.126ZM368.6 274.608C367.96 274.373 367.427 274.256 367 274.256C366.296 274.256 365.774 274.533 365.432 275.088C365.134 275.557 364.984 276.453 364.984 277.776H362.232C362.232 273.851 363.79 271.888 366.904 271.888C367.224 271.888 367.491 271.92 367.704 271.984C367.939 272.027 368.238 272.123 368.6 272.272V274.608ZM362.232 277.776H364.984V298H362.232V277.776ZM368.376 282V284.368H360.216V282H368.376ZM378.74 298.512C377.652 298.512 376.554 298.181 375.444 297.52C374.335 296.837 373.546 295.973 373.076 294.928L375.444 294.032C375.828 294.715 376.298 295.237 376.852 295.6C377.428 295.941 378.058 296.112 378.74 296.112C379.658 296.112 380.404 295.867 380.98 295.376C381.578 294.864 381.855 294.235 381.812 293.488C381.791 292.827 381.535 292.325 381.044 291.984C380.554 291.621 379.796 291.237 378.772 290.832L378.356 290.672C376.906 290.075 375.796 289.456 375.028 288.816C374.282 288.176 373.908 287.28 373.908 286.128C373.908 285.296 374.132 284.528 374.58 283.824C375.028 283.099 375.636 282.533 376.404 282.128C377.172 281.701 378.036 281.488 378.996 281.488C379.999 281.488 380.895 281.723 381.684 282.192C382.495 282.661 383.167 283.355 383.7 284.272L381.428 285.136C380.916 284.197 380.042 283.728 378.804 283.728C378.1 283.728 377.535 283.92 377.108 284.304C376.682 284.688 376.468 285.179 376.468 285.776C376.468 286.48 376.735 287.024 377.268 287.408C377.823 287.792 378.634 288.187 379.7 288.592C379.871 288.677 380.127 288.784 380.468 288.912C381.791 289.467 382.783 290.085 383.444 290.768C384.106 291.451 384.436 292.368 384.436 293.52C384.436 294.437 384.191 295.28 383.7 296.048C383.21 296.816 382.527 297.424 381.652 297.872C380.799 298.299 379.828 298.512 378.74 298.512ZM403.487 290.48H390.015C390.036 291.568 390.303 292.539 390.815 293.392C391.327 294.224 392.01 294.885 392.863 295.376C393.738 295.845 394.708 296.08 395.775 296.08C396.906 296.08 397.855 295.867 398.623 295.44C399.412 294.992 400.212 294.245 401.023 293.2L402.911 295.056C401.972 296.272 400.927 297.157 399.775 297.712C398.644 298.245 397.322 298.512 395.807 298.512C394.079 298.512 392.575 298.16 391.295 297.456C390.015 296.731 389.023 295.739 388.319 294.48C387.636 293.2 387.295 291.739 387.295 290.096C387.295 288.432 387.647 286.949 388.351 285.648C389.055 284.347 390.015 283.333 391.231 282.608C392.468 281.861 393.844 281.488 395.359 281.488C396.959 281.488 398.378 281.851 399.615 282.576C400.852 283.301 401.802 284.315 402.463 285.616C403.146 286.896 403.487 288.357 403.487 290V290.48ZM400.671 288.112C400.479 286.853 399.924 285.808 399.007 284.976C398.09 284.144 396.959 283.728 395.615 283.728C394.186 283.728 393.012 284.133 392.095 284.944C391.178 285.733 390.538 286.789 390.175 288.112H400.671ZM409.469 276.304H412.221V298H409.469V276.304ZM415.613 282V284.368H406.045V282H415.613Z"
                fill="white"
              />
              <path
                opacity="0.7"
                d="M348.537 327C348.525 326.94 348.519 326.814 348.519 326.622C348.519 325.746 348.615 325.008 348.807 324.408C349.011 323.784 349.383 323.196 349.923 322.644C350.475 322.092 351.255 321.522 352.263 320.934C353.031 320.49 353.601 320.124 353.973 319.836C354.393 319.524 354.705 319.182 354.909 318.81C355.113 318.438 355.215 317.988 355.215 317.46C355.215 316.848 355.011 316.362 354.603 316.002C354.207 315.63 353.679 315.444 353.019 315.444C352.239 315.444 351.645 315.666 351.237 316.11C350.829 316.542 350.607 317.22 350.571 318.144H348.681C348.705 316.8 349.107 315.762 349.887 315.03C350.667 314.298 351.711 313.932 353.019 313.932C353.895 313.932 354.663 314.094 355.323 314.418C355.911 314.73 356.367 315.15 356.691 315.678C357.015 316.194 357.177 316.782 357.177 317.442C357.177 318.198 357.033 318.834 356.745 319.35C356.481 319.854 356.121 320.298 355.665 320.682C355.209 321.054 354.555 321.486 353.703 321.978C352.815 322.494 352.179 322.92 351.795 323.256C351.375 323.616 351.081 323.958 350.913 324.282C350.745 324.606 350.661 324.984 350.661 325.416H357.465V327H348.537ZM364.445 327.252C363.173 327.252 362.153 326.922 361.385 326.262C360.629 325.602 360.251 324.702 360.251 323.562H362.105C362.117 324.21 362.333 324.726 362.753 325.11C363.185 325.482 363.743 325.668 364.427 325.668C365.243 325.668 365.891 325.422 366.371 324.93C366.863 324.426 367.109 323.73 367.109 322.842C367.109 321.978 366.881 321.306 366.425 320.826C365.981 320.334 365.369 320.088 364.589 320.088C363.965 320.088 363.449 320.244 363.041 320.556C362.633 320.856 362.357 321.294 362.213 321.87L360.341 321.744L361.079 314.184H368.405V315.768H362.591L362.213 319.602H362.249C362.537 319.278 362.909 319.02 363.365 318.828C363.833 318.636 364.325 318.54 364.841 318.54C365.669 318.54 366.401 318.714 367.037 319.062C367.673 319.41 368.159 319.908 368.495 320.556C368.843 321.192 369.017 321.93 369.017 322.77C369.017 323.682 368.831 324.474 368.459 325.146C368.075 325.818 367.535 326.34 366.839 326.712C366.155 327.072 365.357 327.252 364.445 327.252ZM379.011 314.184V321.636H379.047L382.629 317.856H384.717L380.703 322.014L385.185 327H382.953L379.047 322.464H379.011V327H377.301V314.184H379.011ZM390.888 330.546C389.712 330.546 388.788 330.288 388.116 329.772C387.444 329.268 387.09 328.56 387.054 327.648H388.782C388.794 328.152 388.986 328.542 389.358 328.818C389.742 329.094 390.258 329.232 390.906 329.232C391.71 329.232 392.298 329.004 392.67 328.548C393.054 328.104 393.246 327.378 393.246 326.37V325.398H393.21C392.886 325.902 392.496 326.28 392.04 326.532C391.596 326.784 391.086 326.91 390.51 326.91C389.742 326.91 389.064 326.718 388.476 326.334C387.9 325.938 387.45 325.392 387.126 324.696C386.814 324 386.658 323.19 386.658 322.266C386.658 321.33 386.82 320.508 387.144 319.8C387.456 319.092 387.9 318.552 388.476 318.18C389.064 317.808 389.748 317.622 390.528 317.622C391.104 317.622 391.62 317.754 392.076 318.018C392.532 318.27 392.922 318.654 393.246 319.17H393.282V317.856H394.938V326.442C394.938 327.798 394.59 328.818 393.894 329.502C393.198 330.198 392.196 330.546 390.888 330.546ZM390.834 325.47C391.59 325.47 392.19 325.182 392.634 324.606C393.078 324.03 393.3 323.25 393.3 322.266C393.3 321.27 393.078 320.484 392.634 319.908C392.19 319.332 391.59 319.044 390.834 319.044C390.102 319.044 389.52 319.338 389.088 319.926C388.668 320.502 388.458 321.282 388.458 322.266C388.458 323.238 388.668 324.018 389.088 324.606C389.52 325.182 390.102 325.47 390.834 325.47Z"
                fill="white"
              />
              <circle cx="115" cy="545" r="84" fill="#00A0DA" />
              <path
                d="M81.6623 529.38C81.2623 529.233 80.9289 529.16 80.6623 529.16C80.2223 529.16 79.8956 529.333 79.6823 529.68C79.4956 529.973 79.4023 530.533 79.4023 531.36H77.6823C77.6823 528.907 78.6556 527.68 80.6023 527.68C80.8023 527.68 80.9689 527.7 81.1023 527.74C81.2489 527.767 81.4356 527.827 81.6623 527.92V529.38ZM77.6823 531.36H79.4023V544H77.6823V531.36ZM81.5223 534V535.48H76.4223V534H81.5223ZM88.4935 544.32C87.5202 544.32 86.6135 544.08 85.7735 543.6C84.9468 543.12 84.2868 542.473 83.7935 541.66C83.3002 540.847 83.0535 539.96 83.0535 539C83.0535 538.04 83.3002 537.153 83.7935 536.34C84.2868 535.527 84.9468 534.88 85.7735 534.4C86.6135 533.92 87.5202 533.68 88.4935 533.68C89.4668 533.68 90.3668 533.92 91.1935 534.4C92.0202 534.88 92.6802 535.527 93.1735 536.34C93.6668 537.153 93.9135 538.04 93.9135 539C93.9135 539.96 93.6668 540.847 93.1735 541.66C92.6802 542.473 92.0202 543.12 91.1935 543.6C90.3668 544.08 89.4668 544.32 88.4935 544.32ZM88.4935 542.84C89.1468 542.84 89.7468 542.667 90.2935 542.32C90.8535 541.973 91.2935 541.507 91.6135 540.92C91.9468 540.333 92.1135 539.693 92.1135 539C92.1135 538.307 91.9468 537.667 91.6135 537.08C91.2935 536.493 90.8535 536.027 90.2935 535.68C89.7468 535.333 89.1468 535.16 88.4935 535.16C87.8268 535.16 87.2135 535.333 86.6535 535.68C86.1068 536.027 85.6668 536.493 85.3335 537.08C85.0135 537.667 84.8535 538.307 84.8535 539C84.8535 539.693 85.0135 540.333 85.3335 540.92C85.6668 541.507 86.1068 541.973 86.6535 542.32C87.2135 542.667 87.8268 542.84 88.4935 542.84ZM101.365 544.32C100.391 544.32 99.4846 544.08 98.6446 543.6C97.8179 543.12 97.1579 542.473 96.6646 541.66C96.1713 540.847 95.9246 539.96 95.9246 539C95.9246 538.04 96.1713 537.153 96.6646 536.34C97.1579 535.527 97.8179 534.88 98.6446 534.4C99.4846 533.92 100.391 533.68 101.365 533.68C102.338 533.68 103.238 533.92 104.065 534.4C104.891 534.88 105.551 535.527 106.045 536.34C106.538 537.153 106.785 538.04 106.785 539C106.785 539.96 106.538 540.847 106.045 541.66C105.551 542.473 104.891 543.12 104.065 543.6C103.238 544.08 102.338 544.32 101.365 544.32ZM101.365 542.84C102.018 542.84 102.618 542.667 103.165 542.32C103.725 541.973 104.165 541.507 104.485 540.92C104.818 540.333 104.985 539.693 104.985 539C104.985 538.307 104.818 537.667 104.485 537.08C104.165 536.493 103.725 536.027 103.165 535.68C102.618 535.333 102.018 535.16 101.365 535.16C100.698 535.16 100.085 535.333 99.5246 535.68C98.9779 536.027 98.5379 536.493 98.2046 537.08C97.8846 537.667 97.7246 538.307 97.7246 539C97.7246 539.693 97.8846 540.333 98.2046 540.92C98.5379 541.507 98.9779 541.973 99.5246 542.32C100.085 542.667 100.698 542.84 101.365 542.84ZM110.526 530.44H112.246V544H110.526V530.44ZM114.366 534V535.48H108.386V534H114.366ZM121.584 544.32C120.93 544.32 120.284 544.167 119.644 543.86C119.017 543.553 118.53 543.153 118.184 542.66H118.084V549H116.364V534H118.084V535.6H118.184C119.05 534.32 120.204 533.68 121.644 533.68C122.564 533.68 123.384 533.92 124.104 534.4C124.824 534.867 125.384 535.507 125.784 536.32C126.184 537.133 126.384 538.02 126.384 538.98C126.384 539.967 126.184 540.867 125.784 541.68C125.397 542.493 124.837 543.14 124.104 543.62C123.384 544.087 122.544 544.32 121.584 544.32ZM121.384 542.84C122.024 542.84 122.59 542.673 123.084 542.34C123.59 542.007 123.984 541.547 124.264 540.96C124.544 540.373 124.684 539.713 124.684 538.98C124.684 538.247 124.544 537.587 124.264 537C123.984 536.4 123.59 535.933 123.084 535.6C122.59 535.253 122.024 535.08 121.384 535.08C120.73 535.08 120.144 535.26 119.624 535.62C119.104 535.98 118.704 536.46 118.424 537.06C118.144 537.647 118.004 538.287 118.004 538.98C118.004 539.7 118.144 540.36 118.424 540.96C118.717 541.547 119.117 542.007 119.624 542.34C120.144 542.673 120.73 542.84 121.384 542.84ZM128.786 534H130.506V544H128.786V534ZM134.046 535.5C133.806 535.353 133.432 535.28 132.926 535.28C132.406 535.28 131.926 535.427 131.486 535.72C131.059 536.013 130.786 536.393 130.666 536.86C130.586 537.127 130.539 537.44 130.526 537.8C130.512 538.147 130.506 538.32 130.506 538.32V535.32C130.772 534.84 131.172 534.447 131.706 534.14C132.252 533.833 132.772 533.68 133.266 533.68C133.546 533.68 133.806 533.7 134.046 533.74V535.5ZM136.431 534H138.151V544H136.431V534ZM138.531 530.36C138.531 530.693 138.411 530.98 138.171 531.22C137.931 531.46 137.638 531.58 137.291 531.58C136.945 531.58 136.651 531.46 136.411 531.22C136.171 530.98 136.051 530.693 136.051 530.36C136.051 530.013 136.171 529.72 136.411 529.48C136.651 529.227 136.945 529.1 137.291 529.1C137.638 529.1 137.931 529.227 138.171 529.48C138.411 529.72 138.531 530.013 138.531 530.36ZM141.539 534H143.259V544H141.539V534ZM143.259 535.32C143.566 534.84 144.026 534.447 144.639 534.14C145.253 533.833 145.839 533.68 146.399 533.68C147.679 533.68 148.633 534.047 149.259 534.78C149.886 535.5 150.199 536.52 150.199 537.84V544H148.479V537.96C148.479 536.04 147.659 535.08 146.019 535.08C145.446 535.08 144.906 535.26 144.399 535.62C143.906 535.967 143.586 536.38 143.439 536.86C143.346 537.127 143.293 537.447 143.279 537.82C143.266 538.18 143.259 538.347 143.259 538.32V535.32ZM154.139 530.44H155.859V544H154.139V530.44ZM157.979 534V535.48H151.999V534H157.979Z"
                fill="white"
              />
              <path
                opacity="0.7"
                d="M102.123 564.944V564.912L96.7309 562.688V561.312L103.547 564.16V565.696L96.7309 568.544V567.168L102.123 564.944ZM110.065 570.224C108.935 570.224 108.028 569.931 107.345 569.344C106.673 568.757 106.337 567.957 106.337 566.944H107.985C107.996 567.52 108.188 567.979 108.561 568.32C108.945 568.651 109.441 568.816 110.049 568.816C110.775 568.816 111.351 568.597 111.777 568.16C112.215 567.712 112.433 567.093 112.433 566.304C112.433 565.536 112.231 564.939 111.825 564.512C111.431 564.075 110.887 563.856 110.193 563.856C109.639 563.856 109.18 563.995 108.817 564.272C108.455 564.539 108.209 564.928 108.081 565.44L106.417 565.328L107.073 558.608H113.585V560.016H108.417L108.081 563.424H108.113C108.369 563.136 108.7 562.907 109.105 562.736C109.521 562.565 109.959 562.48 110.417 562.48C111.153 562.48 111.804 562.635 112.369 562.944C112.935 563.253 113.367 563.696 113.665 564.272C113.975 564.837 114.129 565.493 114.129 566.24C114.129 567.051 113.964 567.755 113.633 568.352C113.292 568.949 112.812 569.413 112.193 569.744C111.585 570.064 110.876 570.224 110.065 570.224ZM123.013 558.608V565.232H123.045L126.229 561.872H128.085L124.517 565.568L128.501 570H126.517L123.045 565.968H123.013V570H121.493V558.608H123.013ZM133.57 573.152C132.525 573.152 131.704 572.923 131.106 572.464C130.509 572.016 130.194 571.387 130.162 570.576H131.698C131.709 571.024 131.88 571.371 132.21 571.616C132.552 571.861 133.01 571.984 133.586 571.984C134.301 571.984 134.824 571.781 135.154 571.376C135.496 570.981 135.666 570.336 135.666 569.44V568.576H135.634C135.346 569.024 135 569.36 134.594 569.584C134.2 569.808 133.746 569.92 133.234 569.92C132.552 569.92 131.949 569.749 131.426 569.408C130.914 569.056 130.514 568.571 130.226 567.952C129.949 567.333 129.81 566.613 129.81 565.792C129.81 564.96 129.954 564.229 130.242 563.6C130.52 562.971 130.914 562.491 131.426 562.16C131.949 561.829 132.557 561.664 133.25 561.664C133.762 561.664 134.221 561.781 134.626 562.016C135.032 562.24 135.378 562.581 135.666 563.04H135.698V561.872H137.17V569.504C137.17 570.709 136.861 571.616 136.242 572.224C135.624 572.843 134.733 573.152 133.57 573.152ZM133.522 568.64C134.194 568.64 134.728 568.384 135.122 567.872C135.517 567.36 135.714 566.667 135.714 565.792C135.714 564.907 135.517 564.208 135.122 563.696C134.728 563.184 134.194 562.928 133.522 562.928C132.872 562.928 132.354 563.189 131.97 563.712C131.597 564.224 131.41 564.917 131.41 565.792C131.41 566.656 131.597 567.349 131.97 567.872C132.354 568.384 132.872 568.64 133.522 568.64Z"
                fill="white"
              />
            </svg>
          </Column>
          <Column
            span-laptop="3"
            start-laptop="9"
            span-desktop="4"
            start-desktop="7"
            start-ultrawide="7"
          >
            <Text is="div" size="caption-2" color="dim">
              <ul>
                <li>• 10.4 gb of data / month</li>
                <li>• 1.0 kwh of energy / month</li>
                <li>• 0.4 kg CO₂ / month</li>
              </ul>
            </Text>
          </Column>
        </Grid>
      </Column>
    </Grid>

    <Grid id="colophon" class="colophon mt-biggest">
      <Column span-tablet="3" span-desktop="2">
        <h2 class="section-label t-indent">
          <Text color="dimmer" size="caption-1">Colophon</Text>
        </h2>
      </Column>
      <Column span-tablet="9" class="t-paragraph-leading">
        <Text font="times-seven" indent>
          This site is set in <Text is="span" class="metaphor">Metaphor</Text>,
          <Text is="span" font="times-seven">Times Seven</Text>, and
          <Text is="span" font="times-ten">Times Ten</Text>.Metaphor is a
          sans-serif I drew from scratch, shaped by the grotesques I return to
          most, designed to hold up at both small and large sizes. Times seven
          is a custom modification of Times, with adjusted characters and
          tightened kerning, used for smaller body copy. Times Ten is set for
          larger passages, with a lower x-height and more generous
          tracking.</Text
        >
        <Text font="times-seven" indent>
          Content is managed through
          <a href="https://sanity.io/" target="_blank">Sanity</a>, video is
          powered by <a href="https://www.mux.com/" target="_blank">Mux</a>, and
          the code lives on
          <a href="https://github.com/egstad/2026-frontend" target="_blank"
            >GitHub</a
          >. Built with Nuxt on a small library I developed, and hosted on
          <a href="https://www.netlify.com/" target="_blank">Netlify</a>. If
          you’re curious how it came together, there’s also a
          <a
            href="https://www.youtube.com/watch?v=jGi_asaPhtk&list=PLbw_V9qYEOKKTJlc_BjH6WwpcHSeKUn8K"
            target="_blank"
            >YouTube playlist</a
          >
          documenting the process.
        </Text>
      </Column>
    </Grid>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
  padding: var(--unit-big) 0;
  @include laptop {
    padding: var(--unit-bigger) 0;
  }

  // background: url(https://www.geocities.ws/lotsanimations/images/4-tile.jpg);

  .--indent {
    @media screen and (max-width: $tablet) {
      text-indent: 0;
    }
  }
}

.section-label {
  padding-bottom: var(--unit-smaller);

  @include tablet {
    text-indent: 0;
    position: sticky;
    top: 0;
    padding-top: var(--grid-margin);
  }
}

// Match the label's top offset so content aligns when scrolled to
@include tablet {
  :deep(.column + .column) {
    padding-top: var(--grid-margin);
  }
}

.offset-graph {
  width: 100%;
  height: auto;
  // border-radius: var(--radii-tiny);
  border-radius: var(--unit-tiny);
  overflow: hidden;
}

.portraits {
  max-width: calc(var(--unit-hugest) * 2);
}

.intro {
  --link-color: var(--red-300);
  --link-color-hover: var(--red-150);

  .--indent {
    @media screen and (max-width: $tablet) {
      text-indent: 0;
    }
  }

  :deep(.t-body-1) {
    font-family: "Times Seven";
    font-size: var(--t-body-2-size);
    line-height: var(--t-body-2-leading);

    @include tablet {
      font-family: "Times Ten";
      font-size: var(--t-body-1-size);
      line-height: var(--t-body-1-leading);
    }

    @include fluidScale(t-size("body-1"), t-leading("body-1"));
  }
}

.colophon {
  .metaphor {
    font-family: "DBC Metaphor" !important;
    font-variation-settings: "wght" 550;
  }
}
</style>
