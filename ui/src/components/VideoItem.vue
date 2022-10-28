<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  props: {
    youtubeId: String,
    videoId: String,
    urlEndpoint: String,
    apiKey: String,
  },
  methods: {
    async playing() {
      try {
        await axios.post(`/videos/${this.videoId}`);
      } catch (error) {
        console.log("unexpected error: ", error);
      }
    },
  },
});
</script>

<template>
  <div>
    <youtube :video-id="youtubeId" ref="youtube" @playing="playing"></youtube>
  </div>
</template>
