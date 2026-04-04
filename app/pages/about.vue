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
    <Grid class="intro">
      <Column span-tablet="3" span-laptop="2">
        <h2 class="pb-tiny section-label">
          <Text color="dimmer">Intro</Text>
        </h2>
      </Column>
      <Column start-laptop="3" span-desktop="8" class="t-paragraph-leading">
        <Text size="body-1" font="times-ten" indent>
          Hello world, I’m Jordan Egstad. A designer, developer, and creative
          partner at Design Business Company. Based in Tulsa, Oklahoma USA, I
          collaborate with teams around the world to create brands, websites,
          apps, typefaces, imagery, and more.
        </Text>
        <Text size="body-1" font="times-ten" indent>
          My practice is equal parts logic and feeling—structured by systems,
          softened by play. I try to make things that don’t just work, but
          belong—clear in form, distinct in voice, true to their source.
        </Text>

        <ClientOnly class="pt-small">
          <Carousel
            v-if="orderedPortraits.length"
            class="portraits"
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

    <Grid class="details mt-bigger">
      <Column span-tablet="3" span-laptop="2">
        <h2 class="pb-tiny section-label">
          <Text color="dimmer">Details</Text>
        </h2>
      </Column>
      <Column span-tablet="9" class="t-paragraph-leading">
        <Text font="times-ten">
          i live in tulsa, oklahoma with my wife emma, our dog tom, and three
          cats: jason waterfalls, minnie, and gene. when i’m not working, i’m
          busy being a professional hobbyist who likely has been living with an
          undiagnosed case of ADHD. i’m playing music or taking a photo walk. a
          hike. a round of magic: the gathering. slowly reading through four
          books at a time. flipping through records.
        </Text>
      </Column>
    </Grid>

    <Grid v-if="clients?.length" class="mt-bigger">
      <Column span-tablet="3" span-laptop="2">
        <h2 class="pb-tiny section-label">
          <Text color="dimmer">Select Clients</Text>
        </h2>
      </Column>
      <Column span-tablet="9">
        <AboutClientList :clients="clients" />
      </Column>
    </Grid>

    <Grid>
      <Column span-tablet="3" span-laptop="2">
        <h2 class="pb-tiny section-label">
          <Text color="dimmer">History</Text>
        </h2>
      </Column>
      <Column span-tablet="9" class="t-paragraph-leading">
        <Text>
          i was eight years old when terry hardy, my first art teacher, asked us
          to draw how we felt that day. it was september 12, 2001, the day after
          the towers fell. i didn’t know it at the time, but that simple
          prompt—an invitation to give shape to something invisible—gave my
          creative life an early direction.
        </Text>
        <Text>
          in middle and high school, jennifer van patten expanded the world of
          materials—drawing, painting, ceramics, mixed media—and modeled a
          quiet, consistent way of seeing. she drank iced tea, played satellite
          radio, and never raised her voice (even when we deserved it). she had
          a wonderful sense of humor, a contagious belly laugh, and was the best
          watercolorist i’ve ever met. she taught us angsty teenagers that
          creating could be light, generous, and joyfully unfussy.
        </Text>
        <Text>
          later, judy mcintosh sharpened my eye and introduced me to three
          mediums that would shape my next few years: photography, ceramics, and
          street art. she was small but commanding, known to suddenly and
          dramatically gasp whenever something struck her as beautiful. new
          students found it jarring, which it was. i found it thrilling. she had
          grit, sass, and a collection of phrases we all came to expect: “every
          day is a school day,” “criticism is water on a duck’s back,” “art
          should take your eye on a ride.” she was fiercely supportive and
          unafraid to push us further than we thought we could go. before i left
          for college to study audio production, she sat me down and told me
          that she was sure music would be a fine path for me, but she felt the
          visual arts is where i belonged. i changed my major that week and am
          so grateful i listened.
        </Text>
        <Text>
          my first college professor, britt stadig, introduced me to the
          structure behind the beauty: color theory, typography, bookbinding.
          she was exacting and generous. she also gave me my first design job,
          making posters around campus. i only stayed in college for two
          quarters. during spring break, i was robbed—my computer, my work,
          childhood photos, back-up hard drives, musical instruments, all gone.
          it was a stupid, devastating loss. but in its wake, i realized two
          things: i didn’t want to be in school, and i didn’t need to be. i had
          already learned the most important thing from these women: how to
          look. how to learn. how to create from that attention.
        </Text>
        <Text>
          after leaving, i decided to take the so-called “self-taught”
          route—though i dislike the term. it erases the thinkers, makers, and
          mentors whose work not only inspired me, but actively shaped how i
          see.
        </Text>
      </Column>
    </Grid>

    <ClientOnly>
      <AboutCarousel v-if="greats?.length" :items="greats" class="my-bigger" />
    </ClientOnly>

    <Grid v-if="workHistory?.length">
      <Column span-tablet="3" span-laptop="2">
        <h2 class="pb-tiny section-label">
          <Text color="dimmer">Work History</Text>
        </h2>
      </Column>
      <Column span-tablet="8" span-laptop="9" span-desktop="8">
        <AboutWorkHistory :items="workHistory" />
      </Column>
    </Grid>

    <Grid class="footprint mt-bigger">
      <Column span-tablet="3" span-laptop="2">
        <h2 class="pb-tiny section-label">
          <Text color="dimmer">Footprint</Text>
        </h2>
      </Column>
      <Column span-tablet="9">
        <Grid>
          <Column class="t-paragraph-leading pb-smaller">
            <Text indent>
              nothing online is weightless. every page, every interaction draws
              power from somewhere. this site keeps that cost low—running on
              services that prioritize renewable energy, with a measured
              footprint of about 0.4 kg co₂ per month (~5 kg per year).
            </Text>
            <Text indent>
              i offset that impact fivefold each year, covering the equivalent
              of ~125 kg co₂ over a five-year window. some of that support goes
              toward removal—through organizations like
              <a href="https://climeworks.com/" target="_blank">climeworks</a>,
              which capture co₂ directly from the air and store it. some goes
              toward systemic change—through groups like
              <a href="https://www.catf.us/" target="_blank"
                >clean air task force</a
              >, focused on long-term climate solutions at scale. it’s one small
              part of a much larger problem, but it’s an intentional effort to
              take responsibility for my share of it.</Text
            >
          </Column>
          <Column span-laptop="9" span-desktop="8" span-ultrawide="7">
            <svg
              width="660"
              height="660"
              viewBox="0 0 660 660"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="offset-graph"
            >
              <rect
                width="660"
                height="660"
                fill="var(--background-tertiary)"
              />
              <circle
                cx="95.5162"
                cy="564.516"
                r="55.5162"
                fill="var(--foreground-tertiary)"
              />
              <circle
                cx="339.581"
                cy="317.581"
                r="277.581"
                fill="var(--foreground-primary)"
              />
              <path
                d="M305.093 324.512C303.535 324.512 302.085 324.128 300.741 323.36C299.418 322.592 298.362 321.557 297.573 320.256C296.783 318.955 296.389 317.536 296.389 316C296.389 314.464 296.783 313.045 297.573 311.744C298.362 310.443 299.418 309.408 300.741 308.64C302.085 307.872 303.535 307.488 305.093 307.488C306.65 307.488 308.09 307.872 309.413 308.64C310.735 309.408 311.791 310.443 312.581 311.744C313.37 313.045 313.765 314.464 313.765 316C313.765 317.536 313.37 318.955 312.581 320.256C311.791 321.557 310.735 322.592 309.413 323.36C308.09 324.128 306.65 324.512 305.093 324.512ZM305.093 322.144C306.138 322.144 307.098 321.867 307.973 321.312C308.869 320.757 309.573 320.011 310.085 319.072C310.618 318.133 310.885 317.109 310.885 316C310.885 314.891 310.618 313.867 310.085 312.928C309.573 311.989 308.869 311.243 307.973 310.688C307.098 310.133 306.138 309.856 305.093 309.856C304.026 309.856 303.045 310.133 302.149 310.688C301.274 311.243 300.57 311.989 300.037 312.928C299.525 313.867 299.269 314.891 299.269 316C299.269 317.109 299.525 318.133 300.037 319.072C300.57 320.011 301.274 320.757 302.149 321.312C303.045 321.867 304.026 322.144 305.093 322.144ZM325.35 300.608C324.71 300.373 324.177 300.256 323.75 300.256C323.046 300.256 322.524 300.533 322.182 301.088C321.884 301.557 321.734 302.453 321.734 303.776H318.982C318.982 299.851 320.54 297.888 323.654 297.888C323.974 297.888 324.241 297.92 324.454 297.984C324.689 298.027 324.988 298.123 325.35 298.272V300.608ZM318.982 303.776H321.734V324H318.982V303.776ZM325.126 308V310.368H316.966V308H325.126ZM336.6 300.608C335.96 300.373 335.427 300.256 335 300.256C334.296 300.256 333.774 300.533 333.432 301.088C333.134 301.557 332.984 302.453 332.984 303.776H330.232C330.232 299.851 331.79 297.888 334.904 297.888C335.224 297.888 335.491 297.92 335.704 297.984C335.939 298.027 336.238 298.123 336.6 298.272V300.608ZM330.232 303.776H332.984V324H330.232V303.776ZM336.376 308V310.368H328.216V308H336.376ZM346.74 324.512C345.652 324.512 344.554 324.181 343.444 323.52C342.335 322.837 341.546 321.973 341.076 320.928L343.444 320.032C343.828 320.715 344.298 321.237 344.852 321.6C345.428 321.941 346.058 322.112 346.74 322.112C347.658 322.112 348.404 321.867 348.98 321.376C349.578 320.864 349.855 320.235 349.812 319.488C349.791 318.827 349.535 318.325 349.044 317.984C348.554 317.621 347.796 317.237 346.772 316.832L346.356 316.672C344.906 316.075 343.796 315.456 343.028 314.816C342.282 314.176 341.908 313.28 341.908 312.128C341.908 311.296 342.132 310.528 342.58 309.824C343.028 309.099 343.636 308.533 344.404 308.128C345.172 307.701 346.036 307.488 346.996 307.488C347.999 307.488 348.895 307.723 349.684 308.192C350.495 308.661 351.167 309.355 351.7 310.272L349.428 311.136C348.916 310.197 348.042 309.728 346.804 309.728C346.1 309.728 345.535 309.92 345.108 310.304C344.682 310.688 344.468 311.179 344.468 311.776C344.468 312.48 344.735 313.024 345.268 313.408C345.823 313.792 346.634 314.187 347.7 314.592C347.871 314.677 348.127 314.784 348.468 314.912C349.791 315.467 350.783 316.085 351.444 316.768C352.106 317.451 352.436 318.368 352.436 319.52C352.436 320.437 352.191 321.28 351.7 322.048C351.21 322.816 350.527 323.424 349.652 323.872C348.799 324.299 347.828 324.512 346.74 324.512ZM371.487 316.48H358.015C358.036 317.568 358.303 318.539 358.815 319.392C359.327 320.224 360.01 320.885 360.863 321.376C361.738 321.845 362.708 322.08 363.775 322.08C364.906 322.08 365.855 321.867 366.623 321.44C367.412 320.992 368.212 320.245 369.023 319.2L370.911 321.056C369.972 322.272 368.927 323.157 367.775 323.712C366.644 324.245 365.322 324.512 363.807 324.512C362.079 324.512 360.575 324.16 359.295 323.456C358.015 322.731 357.023 321.739 356.319 320.48C355.636 319.2 355.295 317.739 355.295 316.096C355.295 314.432 355.647 312.949 356.351 311.648C357.055 310.347 358.015 309.333 359.231 308.608C360.468 307.861 361.844 307.488 363.359 307.488C364.959 307.488 366.378 307.851 367.615 308.576C368.852 309.301 369.802 310.315 370.463 311.616C371.146 312.896 371.487 314.357 371.487 316V316.48ZM368.671 314.112C368.479 312.853 367.924 311.808 367.007 310.976C366.09 310.144 364.959 309.728 363.615 309.728C362.186 309.728 361.012 310.133 360.095 310.944C359.178 311.733 358.538 312.789 358.175 314.112H368.671ZM377.469 302.304H380.221V324H377.469V302.304ZM383.613 308V310.368H374.045V308H383.613Z"
                fill="var(--background-primary)"
              />
              <path
                d="M316.537 353C316.525 352.94 316.519 352.814 316.519 352.622C316.519 351.746 316.615 351.008 316.807 350.408C317.011 349.784 317.383 349.196 317.923 348.644C318.475 348.092 319.255 347.522 320.263 346.934C321.031 346.49 321.601 346.124 321.973 345.836C322.393 345.524 322.705 345.182 322.909 344.81C323.113 344.438 323.215 343.988 323.215 343.46C323.215 342.848 323.011 342.362 322.603 342.002C322.207 341.63 321.679 341.444 321.019 341.444C320.239 341.444 319.645 341.666 319.237 342.11C318.829 342.542 318.607 343.22 318.571 344.144H316.681C316.705 342.8 317.107 341.762 317.887 341.03C318.667 340.298 319.711 339.932 321.019 339.932C321.895 339.932 322.663 340.094 323.323 340.418C323.911 340.73 324.367 341.15 324.691 341.678C325.015 342.194 325.177 342.782 325.177 343.442C325.177 344.198 325.033 344.834 324.745 345.35C324.481 345.854 324.121 346.298 323.665 346.682C323.209 347.054 322.555 347.486 321.703 347.978C320.815 348.494 320.179 348.92 319.795 349.256C319.375 349.616 319.081 349.958 318.913 350.282C318.745 350.606 318.661 350.984 318.661 351.416H325.465V353H316.537ZM332.445 353.252C331.173 353.252 330.153 352.922 329.385 352.262C328.629 351.602 328.251 350.702 328.251 349.562H330.105C330.117 350.21 330.333 350.726 330.753 351.11C331.185 351.482 331.743 351.668 332.427 351.668C333.243 351.668 333.891 351.422 334.371 350.93C334.863 350.426 335.109 349.73 335.109 348.842C335.109 347.978 334.881 347.306 334.425 346.826C333.981 346.334 333.369 346.088 332.589 346.088C331.965 346.088 331.449 346.244 331.041 346.556C330.633 346.856 330.357 347.294 330.213 347.87L328.341 347.744L329.079 340.184H336.405V341.768H330.591L330.213 345.602H330.249C330.537 345.278 330.909 345.02 331.365 344.828C331.833 344.636 332.325 344.54 332.841 344.54C333.669 344.54 334.401 344.714 335.037 345.062C335.673 345.41 336.159 345.908 336.495 346.556C336.843 347.192 337.017 347.93 337.017 348.77C337.017 349.682 336.831 350.474 336.459 351.146C336.075 351.818 335.535 352.34 334.839 352.712C334.155 353.072 333.357 353.252 332.445 353.252ZM347.011 340.184V347.636H347.047L350.629 343.856H352.717L348.703 348.014L353.185 353H350.953L347.047 348.464H347.011V353H345.301V340.184H347.011ZM358.888 356.546C357.712 356.546 356.788 356.288 356.116 355.772C355.444 355.268 355.09 354.56 355.054 353.648H356.782C356.794 354.152 356.986 354.542 357.358 354.818C357.742 355.094 358.258 355.232 358.906 355.232C359.71 355.232 360.298 355.004 360.67 354.548C361.054 354.104 361.246 353.378 361.246 352.37V351.398H361.21C360.886 351.902 360.496 352.28 360.04 352.532C359.596 352.784 359.086 352.91 358.51 352.91C357.742 352.91 357.064 352.718 356.476 352.334C355.9 351.938 355.45 351.392 355.126 350.696C354.814 350 354.658 349.19 354.658 348.266C354.658 347.33 354.82 346.508 355.144 345.8C355.456 345.092 355.9 344.552 356.476 344.18C357.064 343.808 357.748 343.622 358.528 343.622C359.104 343.622 359.62 343.754 360.076 344.018C360.532 344.27 360.922 344.654 361.246 345.17H361.282V343.856H362.938V352.442C362.938 353.798 362.59 354.818 361.894 355.502C361.198 356.198 360.196 356.546 358.888 356.546ZM358.834 351.47C359.59 351.47 360.19 351.182 360.634 350.606C361.078 350.03 361.3 349.25 361.3 348.266C361.3 347.27 361.078 346.484 360.634 345.908C360.19 345.332 359.59 345.044 358.834 345.044C358.102 345.044 357.52 345.338 357.088 345.926C356.668 346.502 356.458 347.282 356.458 348.266C356.458 349.238 356.668 350.018 357.088 350.606C357.52 351.182 358.102 351.47 358.834 351.47Z"
                fill="var(--foreground-tertiary)"
              />
              <path
                d="M67.7298 555.304C67.4098 555.187 67.1431 555.128 66.9298 555.128C66.5778 555.128 66.3165 555.267 66.1458 555.544C65.9965 555.779 65.9218 556.227 65.9218 556.888H64.5458C64.5458 554.925 65.3245 553.944 66.8818 553.944C67.0418 553.944 67.1751 553.96 67.2818 553.992C67.3991 554.013 67.5485 554.061 67.7298 554.136V555.304ZM64.5458 556.888H65.9218V567H64.5458V556.888ZM67.6178 559V560.184H63.5378V559H67.6178ZM73.1948 567.256C72.4161 567.256 71.6908 567.064 71.0188 566.68C70.3575 566.296 69.8295 565.779 69.4348 565.128C69.0401 564.477 68.8428 563.768 68.8428 563C68.8428 562.232 69.0401 561.523 69.4348 560.872C69.8295 560.221 70.3575 559.704 71.0188 559.32C71.6908 558.936 72.4161 558.744 73.1948 558.744C73.9735 558.744 74.6935 558.936 75.3548 559.32C76.0161 559.704 76.5441 560.221 76.9388 560.872C77.3335 561.523 77.5308 562.232 77.5308 563C77.5308 563.768 77.3335 564.477 76.9388 565.128C76.5441 565.779 76.0161 566.296 75.3548 566.68C74.6935 567.064 73.9735 567.256 73.1948 567.256ZM73.1948 566.072C73.7175 566.072 74.1975 565.933 74.6348 565.656C75.0828 565.379 75.4348 565.005 75.6908 564.536C75.9575 564.067 76.0908 563.555 76.0908 563C76.0908 562.445 75.9575 561.933 75.6908 561.464C75.4348 560.995 75.0828 560.621 74.6348 560.344C74.1975 560.067 73.7175 559.928 73.1948 559.928C72.6615 559.928 72.1708 560.067 71.7228 560.344C71.2855 560.621 70.9335 560.995 70.6668 561.464C70.4108 561.933 70.2828 562.445 70.2828 563C70.2828 563.555 70.4108 564.067 70.6668 564.536C70.9335 565.005 71.2855 565.379 71.7228 565.656C72.1708 565.933 72.6615 566.072 73.1948 566.072ZM83.4917 567.256C82.713 567.256 81.9877 567.064 81.3157 566.68C80.6544 566.296 80.1264 565.779 79.7317 565.128C79.337 564.477 79.1397 563.768 79.1397 563C79.1397 562.232 79.337 561.523 79.7317 560.872C80.1264 560.221 80.6544 559.704 81.3157 559.32C81.9877 558.936 82.713 558.744 83.4917 558.744C84.2704 558.744 84.9904 558.936 85.6517 559.32C86.313 559.704 86.841 560.221 87.2357 560.872C87.6304 561.523 87.8277 562.232 87.8277 563C87.8277 563.768 87.6304 564.477 87.2357 565.128C86.841 565.779 86.313 566.296 85.6517 566.68C84.9904 567.064 84.2704 567.256 83.4917 567.256ZM83.4917 566.072C84.0144 566.072 84.4944 565.933 84.9317 565.656C85.3797 565.379 85.7317 565.005 85.9877 564.536C86.2544 564.067 86.3877 563.555 86.3877 563C86.3877 562.445 86.2544 561.933 85.9877 561.464C85.7317 560.995 85.3797 560.621 84.9317 560.344C84.4944 560.067 84.0144 559.928 83.4917 559.928C82.9584 559.928 82.4677 560.067 82.0197 560.344C81.5824 560.621 81.2304 560.995 80.9637 561.464C80.7077 561.933 80.5797 562.445 80.5797 563C80.5797 563.555 80.7077 564.067 80.9637 564.536C81.2304 565.005 81.5824 565.379 82.0197 565.656C82.4677 565.933 82.9584 566.072 83.4917 566.072ZM90.8204 556.152H92.1964V567H90.8204V556.152ZM93.8924 559V560.184H89.1084V559H93.8924ZM99.6669 567.256C99.1443 567.256 98.6269 567.133 98.1149 566.888C97.6136 566.643 97.2243 566.323 96.9469 565.928H96.8669V571H95.4909V559H96.8669V560.28H96.9469C97.6403 559.256 98.5629 558.744 99.7149 558.744C100.451 558.744 101.107 558.936 101.683 559.32C102.259 559.693 102.707 560.205 103.027 560.856C103.347 561.507 103.507 562.216 103.507 562.984C103.507 563.773 103.347 564.493 103.027 565.144C102.718 565.795 102.27 566.312 101.683 566.696C101.107 567.069 100.435 567.256 99.6669 567.256ZM99.5069 566.072C100.019 566.072 100.472 565.939 100.867 565.672C101.272 565.405 101.587 565.037 101.811 564.568C102.035 564.099 102.147 563.571 102.147 562.984C102.147 562.397 102.035 561.869 101.811 561.4C101.587 560.92 101.272 560.547 100.867 560.28C100.472 560.003 100.019 559.864 99.5069 559.864C98.9843 559.864 98.5149 560.008 98.0989 560.296C97.6829 560.584 97.3629 560.968 97.1389 561.448C96.9149 561.917 96.8029 562.429 96.8029 562.984C96.8029 563.56 96.9149 564.088 97.1389 564.568C97.3736 565.037 97.6936 565.405 98.0989 565.672C98.5149 565.939 98.9843 566.072 99.5069 566.072ZM105.428 559H106.804V567H105.428V559ZM109.636 560.2C109.444 560.083 109.146 560.024 108.74 560.024C108.324 560.024 107.94 560.141 107.588 560.376C107.247 560.611 107.028 560.915 106.932 561.288C106.868 561.501 106.831 561.752 106.82 562.04C106.81 562.317 106.804 562.456 106.804 562.456V560.056C107.018 559.672 107.338 559.357 107.764 559.112C108.202 558.867 108.618 558.744 109.012 558.744C109.236 558.744 109.444 558.76 109.636 558.792V560.2ZM111.545 559H112.921V567H111.545V559ZM113.225 556.088C113.225 556.355 113.129 556.584 112.937 556.776C112.745 556.968 112.51 557.064 112.233 557.064C111.956 557.064 111.721 556.968 111.529 556.776C111.337 556.584 111.241 556.355 111.241 556.088C111.241 555.811 111.337 555.576 111.529 555.384C111.721 555.181 111.956 555.08 112.233 555.08C112.51 555.08 112.745 555.181 112.937 555.384C113.129 555.576 113.225 555.811 113.225 556.088ZM115.632 559H117.008V567H115.632V559ZM117.008 560.056C117.253 559.672 117.621 559.357 118.112 559.112C118.602 558.867 119.072 558.744 119.52 558.744C120.544 558.744 121.306 559.037 121.808 559.624C122.309 560.2 122.56 561.016 122.56 562.072V567H121.184V562.168C121.184 560.632 120.528 559.864 119.216 559.864C118.757 559.864 118.325 560.008 117.92 560.296C117.525 560.573 117.269 560.904 117.152 561.288C117.077 561.501 117.034 561.757 117.024 562.056C117.013 562.344 117.008 562.477 117.008 562.456V560.056ZM125.711 556.152H127.087V567H125.711V556.152ZM128.783 559V560.184H123.999V559H128.783Z"
                fill="var(--background-primary)"
              />
              <path
                d="M84.8422 580.208V580.184L80.7982 578.516V577.484L85.9102 579.62V580.772L80.7982 582.908V581.876L84.8422 580.208ZM90.7991 584.168C89.9511 584.168 89.2711 583.948 88.7591 583.508C88.2551 583.068 88.0031 582.468 88.0031 581.708H89.2391C89.2471 582.14 89.3911 582.484 89.6711 582.74C89.9591 582.988 90.3311 583.112 90.7871 583.112C91.3311 583.112 91.7631 582.948 92.0831 582.62C92.4111 582.284 92.5751 581.82 92.5751 581.228C92.5751 580.652 92.4231 580.204 92.1191 579.884C91.8231 579.556 91.4151 579.392 90.8951 579.392C90.4791 579.392 90.1351 579.496 89.8631 579.704C89.5911 579.904 89.4071 580.196 89.3111 580.58L88.0631 580.496L88.5551 575.456H93.4391V576.512H89.5631L89.3111 579.068H89.3351C89.5271 578.852 89.7751 578.68 90.0791 578.552C90.3911 578.424 90.7191 578.36 91.0631 578.36C91.6151 578.36 92.1031 578.476 92.5271 578.708C92.9511 578.94 93.2751 579.272 93.4991 579.704C93.7311 580.128 93.8471 580.62 93.8471 581.18C93.8471 581.788 93.7231 582.316 93.4751 582.764C93.2191 583.212 92.8591 583.56 92.3951 583.808C91.9391 584.048 91.4071 584.168 90.7991 584.168ZM100.51 575.456V580.424H100.534L102.922 577.904H104.314L101.638 580.676L104.626 584H103.138L100.534 580.976H100.51V584H99.3697V575.456H100.51ZM108.428 586.364C107.644 586.364 107.028 586.192 106.58 585.848C106.132 585.512 105.896 585.04 105.872 584.432H107.024C107.032 584.768 107.16 585.028 107.408 585.212C107.664 585.396 108.008 585.488 108.44 585.488C108.976 585.488 109.368 585.336 109.616 585.032C109.872 584.736 110 584.252 110 583.58V582.932H109.976C109.76 583.268 109.5 583.52 109.196 583.688C108.9 583.856 108.56 583.94 108.176 583.94C107.664 583.94 107.212 583.812 106.82 583.556C106.436 583.292 106.136 582.928 105.92 582.464C105.712 582 105.608 581.46 105.608 580.844C105.608 580.22 105.716 579.672 105.932 579.2C106.14 578.728 106.436 578.368 106.82 578.12C107.212 577.872 107.668 577.748 108.188 577.748C108.572 577.748 108.916 577.836 109.22 578.012C109.524 578.18 109.784 578.436 110 578.78H110.024V577.904H111.128V583.628C111.128 584.532 110.896 585.212 110.432 585.668C109.968 586.132 109.3 586.364 108.428 586.364ZM108.392 582.98C108.896 582.98 109.296 582.788 109.592 582.404C109.888 582.02 110.036 581.5 110.036 580.844C110.036 580.18 109.888 579.656 109.592 579.272C109.296 578.888 108.896 578.696 108.392 578.696C107.904 578.696 107.516 578.892 107.228 579.284C106.948 579.668 106.808 580.188 106.808 580.844C106.808 581.492 106.948 582.012 107.228 582.404C107.516 582.788 107.904 582.98 108.392 582.98Z"
                fill="var(--background-quaternary)"
              />
            </svg>
          </Column>
          <Column
            span-laptop="3"
            start-laptop="10"
            span-desktop="2"
            start-desktop="9"
            start-ultrawide="8"
          >
            <Text is="div" size="caption-2" color="dim">
              <ul>
                <li>10.4 gb of data / month</li>
                <li>1.0 kwh of energy / month</li>
                <li>0.4 kg co₂ / month</li>
              </ul>
            </Text>
          </Column>
        </Grid>
      </Column>
    </Grid>

    <Grid class="footprint mt-bigger">
      <Column span-tablet="3" span-laptop="2">
        <h2 class="pb-tiny section-label"><Text color="dimmer">Land</Text></h2>
      </Column>
      <Column span-tablet="9" class="t-paragraph-leading">
        <Text indent>
          i live and work on land within the traditional territory of the osage
          nation. i also live near greenwood, the site of the 1921 tulsa race
          massacre. i try to be mindful of the histories held in this place, and
          to take care in how i live and work here.
        </Text>
      </Column>
    </Grid>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
  padding-top: var(--unit-huger);
  padding-bottom: var(--unit-huger);
}

:deep(.grid:has(.section-label)) {
  align-items: first baseline;
}

.section-label {
  @include tablet {
    position: sticky;
    top: var(--unit-small);
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
</style>
