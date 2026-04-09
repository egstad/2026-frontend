<template>
  <div>
    <Text is="p" font="times-seven">
      My work has moved through
      <button v-if="phase === 'idle'" class="toggle" @click="animate">
        the usual channels</button
      ><span v-else aria-live="polite"
        ><span>{{ deletingText }}</span
        ><template v-for="(item, i) in galleries" :key="item.publisher"
          ><Transition name="gallery-item"
            ><template v-if="displayMap[item.publisher]"
              ><a
                v-if="item.link"
                :href="item.link"
                target="_blank"
                class="gallery-name"
                >{{ item.publisher }}</a
              ><span v-else class="gallery-name">{{
                item.publisher
              }}</span></template
            ></Transition
          ><template v-if="displayMap[item.publisher] && i < shownCount - 1"
            >,
          </template></template
        ><template v-if="phase === 'done'">
          (<button class="toggle" @click="reset">see less</button>)</template
        ></span
      >
      — publications, galleries, and award platforms where digital work tends to
      surface and recirculate. For interviews, articles, and conversations
      around it, a selection of links is included below.
    </Text>

    <ul class="interviews">
      <li v-for="item in interviews" :key="item.publisher + item.title">
        <a v-if="item.link" :href="item.link" target="_blank">
          <Text font="times-seven">
            <em>"{{ item.title }}" </em></Text
          >
        </a>
        <Text is="div" size="caption-1" indent>
          <em>{{ item.publisher }}</em
          ><template v-if="item.date">, {{ item.date }}.</template>
        </Text>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import gsap from "gsap";

interface PressItem {
  title?: string;
  publisher: string;
  date?: string;
  link?: string;
}

type Phase = "idle" | "deleting" | "typing" | "done";

const ITEM_SPEED = 0.12; // seconds between each item appearing
const SOURCE_WORDS = "the usual channels".split(" ");
const WORD_SPEED = 0.1;

const phase = ref<Phase>("idle");
const deletingText = ref("the usual channels");
const displayMap = reactive<Record<string, boolean>>({});
const shownCount = computed(
  () => Object.values(displayMap).filter(Boolean).length,
);

function tweenSourceWords(from: number, to: number): Promise<void> {
  return new Promise((resolve) => {
    const proxy = { n: from };
    gsap.to(proxy, {
      n: to,
      duration: Math.abs(to - from) * WORD_SPEED,
      ease: "none",
      onUpdate() {
        const n = to > from ? Math.ceil(proxy.n) : Math.floor(proxy.n);
        deletingText.value = SOURCE_WORDS.slice(0, n).join(" ");
      },
      onComplete() {
        deletingText.value = SOURCE_WORDS.slice(0, to).join(" ");
        resolve();
      },
    });
  });
}

function buildItemTimeline(list: PressItem[], show: boolean): Promise<void> {
  return new Promise((resolve) => {
    const tl = gsap.timeline({ onComplete: resolve });
    list.forEach((item, i) => {
      tl.call(
        () => {
          displayMap[item.publisher] = show;
        },
        [],
        i * ITEM_SPEED,
      );
    });
  });
}

async function animate() {
  if (phase.value !== "idle") return;
  phase.value = "deleting";

  await tweenSourceWords(SOURCE_WORDS.length, 0);
  deletingText.value = "";
  phase.value = "typing";

  await buildItemTimeline(galleries, true);
  phase.value = "done";
}

async function reset() {
  if (phase.value !== "done") return;
  phase.value = "deleting";

  await buildItemTimeline([...galleries].reverse(), false);
  Object.keys(displayMap).forEach((k) => delete displayMap[k]);
  deletingText.value = "";

  await tweenSourceWords(0, SOURCE_WORDS.length);
  deletingText.value = "the usual channels";
  phase.value = "idle";
}

const interviews: PressItem[] = [
  {
    title: "How Political Design Trends Defined the Chaos of 2025 in the US",
    publisher: "Fast Company",
    date: "3 Jan. 2026",
    link: "https://fastcompany.co.za/co-design/2026-01-03-how-political-design-trends-defined-the-chaos-of-2025-in-the-us/",
  },
  {
    title: "The Trump Administration Frames Its Second Term in Serif Fonts",
    publisher: "Bloomberg",
    date: "14 Dec. 2025",
    link: "https://www.bloomberg.com/news/newsletters/2025-12-14/the-trump-administration-frames-its-second-term-in-serif-fonts",
  },
  {
    title:
      "Type Artist Who Created the Font the White House Now Uses Says 'Fuck Trump'",
    publisher: "Jezebel",
    date: "5 Dec. 2025",
    link: "https://www.jezebel.com/type-artist-who-created-the-font-the-white-house-now-uses-says-fuck-trump",
  },
  {
    title: "Jordan Egstad AMA: Building for Frontier Brands like Claude",
    publisher: "YouTube",
    date: "21 Nov. 2025",
    link: "https://www.youtube.com/watch?v=pun87BX2cHI",
  },
  {
    title: "The Skinny Font Taking Over Tech Companies and the White House",
    publisher: "The Wall Street Journal",
    date: "13 Nov. 2025",
    link: "https://www.wsj.com/lifestyle/serif-instrument-skinny-font-e22b8054",
  },
  {
    title: "The Old Brand Temple Is Collapsing",
    publisher: "Touch Grass",
    date: "29 Jul. 2025",
    link: "https://youneedtotouchgrass.substack.com/p/the-old-brand-temple-is-collapsing",
  },
  {
    title: "In Good Company: Retailers",
    publisher: "Figma Blog",
    date: "11 Jul. 2025",
    link: "https://www.figma.com/blog/in-good-company-retailers/",
  },
  {
    title: "In Good Company: Agencies & Freelancers",
    publisher: "Figma Blog",
    date: "24 Jun. 2025",
    link: "https://www.figma.com/blog/in-good-company-agencies-freelancers/",
  },
  {
    title: "Purposefully Integrating AI",
    publisher: "The Yondr Studio Podcast",
    date: "24 Jun. 2025",
    link: "https://podcasts.apple.com/us/podcast/003-jordan-egstad-purposefully-integrating-ai/id1815393784?i=1000714356334",
  },
  {
    title: "From Old to Bold",
    publisher: "Instrument",
    date: "31 May 2025",
    link: "https://www.instrument.com/latest/from-old-to-bold-instrument-rebrand-signals-energetic-shift",
  },
  {
    title:
      "Design Business Company: Blending In-House Smarts with Studio Agility",
    publisher: "Creative Boom",
    date: "11 Feb. 2025",
    link: "https://www.creativeboom.com/inspiration/design-business-company-studio-of-the-week/",
  },
  {
    title:
      "Interview with Jordan Egstad, Freelance Graphic Designer & Frontend Developer",
    publisher: "Lovers Magazine by Spaces",
    date: "1 Apr. 2022",
    link: "https://spaces.is/loversmagazine/interviews/jordan-egstad",
  },
];

const galleries: PressItem[] = [
  {
    publisher: "Bloomberg",
  },
  {
    publisher: "Fast Company",
  },
  {
    publisher: "Wall Street Journal",
  },
  {
    publisher: "Brand New",
    // link: "https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_front_by_design_business_company.php#disqus_thread",
  },
  {
    publisher: "Figma Blog",
  },
  { publisher: "Awwwards" },

  {
    publisher: "The Webby Awards",
    // link: "https://www.underconsideration.com/brandnew/archives/new_logo_and_identity_for_front_by_design_business_company.php#disqus_thread",
  },
  { publisher: "Siteinspire" },

  {
    publisher: "Klikkentheke",
    // link: "https://klikkentheke.com/catalogue/egstad/",
  },
  {
    publisher: "Another Graphic",
    // link: "https://anothergraphic.org/jordan-egstad/",
  },
  { publisher: "Httpster" },

  {
    publisher: "Fonts In Use",
    // link: "https://fontsinuse.com/type_designers/9055/jordan-egstad",
  },
  {
    publisher: "Hover States",
    // link: "https://www.hoverstat.es/features/jordan-egstad/",
  },
  {
    publisher: "One Page Love",
    // link: "https://onepagelove.com/egstad"
  },
  {
    publisher: "Maxi Best Of",
    // link: "https://maxibestof.one/websites/27015-jordan-egstad",
  },
  {
    publisher: "FolioInspo",
    // link: "https://www.folioinspo.com/submissions/jordan-egstad",
  },
  {
    publisher: "Graphics Library",
    // link: "https://graphics-library.net/websites/jordan-egstad",
  },

  {
    publisher: "Curated",
    // link: "https://curated-site.webflow.io/nominees/jordan-egstad",
  },
];
</script>

<style lang="scss" scoped>
.gallery-name {
  display: inline;
}

.gallery-item-enter-active {
  transition: clip-path 0.15s ease-out;
}

.gallery-item-enter-from {
  clip-path: inset(0 100% 0 0);
}

.gallery-item-enter-to {
  clip-path: inset(0 0% 0 0);
}

.toggle {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--link-color, var(--interactive-primary));
  text-underline-offset: 0.175em;
  text-decoration-thickness: 0.06em;
  text-decoration-line: underline;
  text-decoration-color: transparent;
  transition:
    text-decoration-color var(--transition-fast),
    color var(--transition-fast);
  font: inherit;

  &:hover {
    color: var(--foreground-primary);
    text-decoration-color: var(--link-color, var(--interactive-primary));
  }
}

.interviews {
  li {
    margin-top: var(--unit-small);
  }

  .--indent {
    @media screen and (max-width: $tablet) {
      text-indent: 0;
    }
  }
}
</style>
