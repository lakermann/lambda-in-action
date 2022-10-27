<script setup lang="ts">
import ContentItem from "./ContentItem.vue";
import ToolingIcon from "./icons/IconConfiguration.vue";
import CommunityIcon from "./icons/IconVideo.vue";
import Videos from "@/components/Video.vue";
</script>

<template>
  <div>
    <ContentItem>
      <template #icon>
        <ToolingIcon />
      </template>
      <template #heading>Configuration</template>
      <p>
        URL Endpoint:<br />
        <input
          v-model="urlEndpoint"
          placeholder="edit me"
          size="55"
        /><br /><br />
        API Key: <br />
        <input
          v-model="apiKey"
          placeholder="edit me"
          type="password"
          size="15"
        />
      </p>
    </ContentItem>
    <ContentItem>
      <template #icon>
        <ToolingIcon />
      </template>
      <template #heading>Videos watched: {{ videoswatched }}</template>
    </ContentItem>

    <ContentItem v-for="(video, index) in videos" :key="index">
      <template #icon>
        <CommunityIcon />
      </template>
      <template #heading>{{ video.title }}</template>
      {{ video.description }}
      <br /><br />
      <Videos
        :youtubeId="video.youtubeId"
        :videoId="video.id"
        :urlEndpoint="urlEndpoint"
        :apiKey="apiKey"
      />
    </ContentItem>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

interface Videos {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
}
export default defineComponent({
  name: "Content",
  data() {
    return {
      videos: [] as Videos[],
      urlEndpoint: "",
      apiKey: "",
      videoswatched: "n/a"
    };
  },

  async mounted() {
    setInterval(async () => {
      try {
        console.log(`${this.urlEndpoint}/pages/home`)
        const reqInstance = axios.create({
          headers: {
            //Authorization : `Bearer ${localStorage.getItem("access_token")}`
            traceId: `test-trace-id`,
            userId: `test-user-id`,
            "X-Api-Key": this.apiKey,
          },
        });
        const {data, status} = await reqInstance.get(`${this.urlEndpoint}/pages/home`);
        console.log(data.Item.page_data.videoswatched)

        this.videoswatched = data.Item.page_data.videoswatched
      } catch (error) {
        console.log('unexpected error: ', error);
      }
    }, 10000)


    this.videos = [
      {
        id: "1",
        title: "Design Patterns Revisited in Modern Java",
        description:
          "Design Patterns are common ways to solve problems that developers have discovered over time. They often fill the gaps between the language capabilities and the design goals. When languages mature, sometimes patterns become natural features of languages and blend in to the natural way of writing code instead of a special effort. Java has evolved significantly over the years. In this session we'll revisit some common design problems and see how patterns are realized to solve those problems with the modern capabilities in Java.",
        youtubeId: "yTuwi--LFsM",
      },
      {
        id: "2",
        title: "Why We Switched to Serverless Containers",
        description:
          "ZITADEL is globally deployed to reduce the latency for our customers, and we want to shed some light into the story why we switched to serverless and how our journey went.\n" +
          "This talk has the goal to give the audience a sensation of where serverless can help and where it has some pitfalls. We will explain in depth how our journey from Kubernetes to Google Cloud Run went and what we needed to change in ZITADEL and our tooling to make that happen.\n",
        youtubeId: "v-PYY83CABg",
      },
    ];
  },
});
</script>
